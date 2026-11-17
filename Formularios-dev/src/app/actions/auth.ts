'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionCookieOptions, clearSessionCookies } from '@/lib/cookies';

const API_URL = process.env.API_URL || 'http://localhost:3002';

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
}

// ============================================
// HELPER: SINCRONIZAR COOKIES DEL BACKEND
// ============================================
async function proxyCookies(response: Response) {
  const cookieStore = await cookies();
  const setCookieHeader = response.headers.getSetCookie();

  if (!setCookieHeader || setCookieHeader.length === 0) {
    console.warn('⚠️ [PROXY] La respuesta del backend no trae Set-Cookie');
    return;
  }

  for (const cookieStr of setCookieHeader) {
    const parts = cookieStr.split(';').map(p => p.trim());
    const [nameValue] = parts;
    const [name, value] = nameValue.split('=');

    const maxAgePart = parts.find(p => p.toLowerCase().startsWith('max-age='));
    const maxAge = maxAgePart ? parseInt(maxAgePart.split('=')[1]) : undefined;

    cookieStore.set(name.trim(), value.trim(), sessionCookieOptions(maxAge));
  }
}

// ============================================
// REFRESCO DE SESIÓN (solo para getMeAction)
// ============================================
/**
 * No se exporta: en un archivo `'use server'` toda función exportada queda
 * expuesta como Server Action, y el refresco de las peticiones normales ya lo
 * hace `src/proxy.ts`. Aquí solo cubre el caso de `getMeAction`.
 */
async function refrescarSesion(): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return { success: false, error: 'No refresh token' };
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`❌ [REFRESH] El backend rechazó el refresco (HTTP ${response.status})`);
      clearSessionCookies(cookieStore);
      return { success: false, error: 'Sesión expirada' };
    }

    const data = await response.json();
    await proxyCookies(response);

    return { success: true, data: { user: data.user } };
  } catch (error) {
    console.error('💥 [REFRESH] Error:', error instanceof Error ? error.message : 'Unknown');
    return { success: false, error: 'Error de red' };
  }
}

// ============================================
// GET ME (con refresco integrado)
// ============================================
export async function getMeAction() {
  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    // Sin access token pero con refresh token: intentar refrescar
    if (!accessToken && refreshToken) {
      const refreshResult = await refrescarSesion();
      if (!refreshResult.success) return null;

      const updatedCookies = await cookies();
      accessToken = updatedCookies.get('access_token')?.value;
    }

    if (!accessToken) return null;

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `access_token=${accessToken}`,
      },
      cache: 'no-store',
    });

    if (response.status === 401) {
      // Último intento con refresco
      const refreshResult = await refrescarSesion();

      if (!refreshResult.success) {
        const cookieStore = await cookies();
        clearSessionCookies(cookieStore);
        return null;
      }

      const updatedCookies = await cookies();
      const newAccessToken = updatedCookies.get('access_token')?.value;
      if (!newAccessToken) return null;

      const retryResponse = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `access_token=${newAccessToken}`,
        },
        cache: 'no-store',
      });

      if (!retryResponse.ok) {
        console.warn(`❌ [ME] El reintento tras refrescar falló (HTTP ${retryResponse.status})`);
        return null;
      }

      return await retryResponse.json();
    }

    if (!response.ok) {
      console.error(`❌ [ME] Error HTTP ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('💥 [ME] Error:', error instanceof Error ? error.message : 'Unknown');
    return null;
  }
}

// ============================================
// LOGOUT
// ============================================
export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (refreshToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Cookie: `access_token=${accessToken}; refresh_token=${refreshToken}`,
        },
        cache: 'no-store',
      });
    }
  } catch (error) {
    console.error('⚠️ [LOGOUT] Error en backend (continuando):', error);
  } finally {
    // Siempre eliminar cookies locales
    const cookieStore = await cookies();
    clearSessionCookies(cookieStore);
    // Volver a la pantalla selectora de acceso de forms (inspector + cuenta),
    // no directo a IAM Portal — coherente con el gate del middleware.
    redirect('/');
  }
}

// ============================================
// CAMBIAR CONTRASEÑA PROPIA
// ============================================
/**
 * Cambia la contraseña del usuario en el IAM (la misma de forms, Sync y el
 * portal). El IAM cierra todas sus sesiones, así que al salir bien se borran
 * también las cookies de aquí: quien llama tiene que llevarlo a iniciar sesión.
 *
 * `data.status` devuelve el código HTTP del fallo para que el hook distinga
 * un límite de intentos (429) de una contraseña rechazada (400).
 */
export async function cambiarClaveAction(
  currentPassword: string,
  newPassword: string,
): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    if (!accessToken) {
      return { success: false, error: 'La sesión expiró. Inicia sesión de nuevo.', data: { status: 401 } };
    }

    const response = await fetch(`${API_URL}/auth/me/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // El refresh_token hace que el IAM cuente el límite de intentos por
        // sesión y no por la IP del servidor, que es la misma para todos.
        Cookie: `access_token=${accessToken}${refreshToken ? `; refresh_token=${refreshToken}` : ''}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
      cache: 'no-store',
    });

    const data = (await response.json().catch(() => ({}))) as { message?: unknown };

    if (!response.ok) {
      const mensaje = Array.isArray(data.message) ? data.message.join('. ') : data.message;
      return {
        success: false,
        error: typeof mensaje === 'string' && mensaje ? mensaje : 'No se pudo cambiar la contraseña',
        data: { status: response.status },
      };
    }

    clearSessionCookies(cookieStore);
    return { success: true, message: 'Contraseña actualizada' };
  } catch (error) {
    console.error('💥 [CAMBIAR CLAVE] Error:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

// ============================================
// LOGIN DE INSPECTOR (acceso de campo sin credenciales)
// ============================================
export async function inspectorLoginAction(): Promise<ActionResult> {
  try {
    const response = await fetch(`${API_URL}/auth/inspector`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inspectorKey: process.env.NEXT_PUBLIC_INSPECTOR_API_KEY,
      }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ [INSPECTOR] HTTP ${response.status}:`, data.message);
      return {
        success: false,
        error: data.message || 'Error al iniciar sesión como inspector',
      };
    }

    await proxyCookies(response);

    return {
      success: true,
      message: 'Sesión de inspector iniciada',
      data: { user: data.user },
    };
  } catch (error) {
    console.error('💥 [INSPECTOR] Error de red:', error);
    return {
      success: false,
      error: 'Error de conexión con el servidor',
    };
  }
}
