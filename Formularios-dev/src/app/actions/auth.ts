// 'use server'

// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';
// // 👇 Importamos tus helpers para reutilizar la lógica de headers y refresh
// import { getAuthHeaders, handleApiResponse } from '@/lib/actions/helpers';

// const API_URL = process.env.API_URL || 'http://localhost:3002';

// export interface ActionResult {
//   success: boolean;
//   message?: string;
//   data?: any;
//   error?: string;
// }

// // ============================================
// // 1. HELPER INTERNO: SINCRONIZAR COOKIES
// // ============================================
// // Este helper toma las cookies que envía NestJS y las establece en Next.js
// async function proxyCookies(response: Response) {
//   const cookieStore = await cookies();
//   const setCookieHeader = response.headers.getSetCookie();

//   if (setCookieHeader && setCookieHeader.length > 0) {
//     for (const cookieStr of setCookieHeader) {
//       const parts = cookieStr.split(';').map(p => p.trim());
//       const [nameValue] = parts;
//       const [name, value] = nameValue.split('=');

//       const maxAgePart = parts.find(p => p.toLowerCase().startsWith('max-age='));
//       const maxAge = maxAgePart ? parseInt(maxAgePart.split('=')[1]) : undefined;
      
//       // Forzamos configuraciones seguras por si el backend no las envía
//       cookieStore.set(name.trim(), value.trim(), {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'lax',
//         path: '/',
//         maxAge,
//       });
//     }
//   }
// }

// // ============================================
// // 2. HELPER INTERNO: DESTRUIR SESIÓN
// // ============================================
// async function destroySession() {
//   const cookieStore = await cookies();
//   cookieStore.delete("access_token");
//   cookieStore.delete("refresh_token");
//   console.log("🗑️ [SESSION] Cookies eliminadas");
// }

// // ============================================
// // LOGIN
// // ============================================
// export async function loginAction(formData: FormData): Promise<ActionResult> {
//   const username = formData.get('username') as string;
//   const password = formData.get('password') as string;

//   try {
//     const response = await fetch(`${API_URL}/auth/login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ username, password }),
//       cache: 'no-store',
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       return {
//         success: false,
//         error: data.message || 'Credenciales inválidas',
//       };
//     }

//     // Caso 2FA
//     if (data.requires2FA) {
//       return {
//         success: true,
//         data: {
//           requires2FA: true,
//           tempToken: data.tempToken,
//           message: data.message,
//         },
//       };
//     }

//     // Caso Éxito: Guardar cookies del backend
//     await proxyCookies(response);

//     return {
//       success: true,
//       message: 'Login exitoso',
//       data: { user: data.user },
//     };

//   } catch (error) {
//     console.error('Error en login:', error);
//     return { success: false, error: 'Error de conexión' };
//   }
// }

// // ============================================
// // OBTENER USUARIO ACTUAL (OPTIMIZADO)
// // ============================================
// export async function getMeAction() {
//   console.log('👤 [ME] Obteniendo usuario...');

//   try {
//     // 🔥 MAGIA: getAuthHeaders ya maneja el refresh automático si el token expiró.
//     // Si falla el refresh, lanzará un error que capturamos abajo.
//     const headers = await getAuthHeaders();

//     const response = await fetch(`${API_URL}/auth/me`, {
//       method: 'GET',
//       headers, 
//       cache: 'no-store',
//     });

//     // Usamos el helper para respuesta estandarizada
//     const user = await handleApiResponse<any>(response);
    
//     // console.log('✅ [ME] OK:', user.username);
//     return user;

//   } catch (error) {
//     // Si llegamos aquí es porque no hay sesión válida o expiró todo.
//     // Retornamos null para que el frontend redirija.
//     console.log('ℹ️ [ME] Sin sesión activa:', error instanceof Error ? error.message : 'Unknown');
//     return null;
//   }
// }

// // ============================================
// // REFRESH TOKEN (CORE)
// // ============================================

// export async function refreshTokenAction(): Promise<ActionResult> {
//   console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//   console.log("🔄 [REFRESH] Iniciando renovación...");

//   try {
//     const cookieStore = await cookies();
//     const refreshToken = cookieStore.get("refresh_token")?.value;

//     if (!refreshToken) {
//       console.log("❌ [REFRESH] Sin refresh token");
//       return { success: false, error: "No refresh token" };
//     }

//     const response = await fetch(`${API_URL}/auth/refresh`, {
//       method: "POST",
//       headers: {
//         Cookie: `refresh_token=${refreshToken}`,
//         "Content-Type": "application/json",
//       },
//       cache: "no-store",
//     });

//     console.log("📨 [REFRESH] Respuesta:", { status: response.status });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       console.log("❌ [REFRESH] Rechazado:", errorData.message);
//       // 🔥 NO llamar destroySession aquí, solo retornar failure
//       return { success: false, error: "Sesión expirada" };
//     }

//     const data = await response.json();
//     await proxyCookies(response);

//     console.log("✅ [REFRESH] Renovado para:", data.user?.username);
//     console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

//     return { success: true, data: { user: data.user } };

//   } catch (error: any) {
//     console.error("💥 [REFRESH] Error:", error.message);
//     console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//     return { success: false, error: "Error de red" };
//   }
// }

// // ============================================
// // LOGOUT
// // ============================================
// export async function logoutAction() {
//   try {
//     const cookieStore = await cookies();
//     const accessToken = cookieStore.get("access_token")?.value;
//     const refreshToken = cookieStore.get("refresh_token")?.value;

//     if (refreshToken) {
//       await fetch(`${API_URL}/auth/logout`, {
//         method: "POST",
//         headers: {
//           Cookie: `access_token=${accessToken}; refresh_token=${refreshToken}`,
//         },
//         cache: "no-store",
//       });
//     }
//   } catch (error) {
//     console.error("Error logout backend:", error);
//   } finally {
//     const cookieStore = await cookies();
//     cookieStore.delete("access_token");
//     cookieStore.delete("refresh_token");
//     redirect("/login");
//   }
// }

// // ============================================
// // VERIFICAR 2FA
// // ============================================
// export async function verify2FAAction(tempToken: string, code: string): Promise<ActionResult> {
//   try {
//     const response = await fetch(`${API_URL}/auth/verify-2fa`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ tempToken, code }),
//       cache: 'no-store',
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       return { success: false, error: data.message || 'Código inválido' };
//     }

//     // Login completado -> Guardar cookies
//     await proxyCookies(response);

//     return { success: true, message: 'Autenticación correcta', data: { user: data.user } };

//   } catch (error) {
//     return { success: false, error: 'Error de conexión' };
//   }
// }

// // ============================================
// // REGISTRO
// // ============================================
// export async function registerAction(formData: FormData): Promise<ActionResult> {
//   // ... tu lógica de registro existente ...
//   // (El registro usualmente no setea cookies de login, solo crea el usuario)
//   const username = formData.get('username') as string;
//   const email = formData.get('email') as string;
//   const password = formData.get('password') as string;
//   const fullName = formData.get('fullName') as string;

//   try {
//     const response = await fetch(`${API_URL}/auth/register`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ username, email, password, fullName }),
//       cache: 'no-store',
//     });
    
//     const data = await response.json();
//     if (!response.ok) return { success: false, error: data.message };
    
//     return { success: true, message: 'Usuario registrado', data };
//   } catch (error) {
//     return { success: false, error: 'Error de conexión' };
//   }
// }

'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.API_URL || 'http://localhost:3002';

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: unknown; // ✅ Mejor que 'any'
  error?: string;
}

// ============================================
// HELPER: SINCRONIZAR COOKIES (Server Action)
// ============================================
async function proxyCookies(response: Response) {
  console.log('🍪 [PROXY] Sincronizando cookies desde backend...');
  
  const cookieStore = await cookies();
  const setCookieHeader = response.headers.getSetCookie();

  if (!setCookieHeader || setCookieHeader.length === 0) {
    console.log('⚠️ [PROXY] No hay Set-Cookie headers en la respuesta');
    return;
  }

  console.log(`🍪 [PROXY] Encontrados ${setCookieHeader.length} Set-Cookie headers`);

  for (const cookieStr of setCookieHeader) {
    const parts = cookieStr.split(';').map(p => p.trim());
    const [nameValue] = parts;
    const [name, value] = nameValue.split('=');

    const maxAgePart = parts.find(p => p.toLowerCase().startsWith('max-age='));
    const maxAge = maxAgePart ? parseInt(maxAgePart.split('=')[1]) : undefined;
    
    console.log(`🍪 [PROXY] Estableciendo: ${name} = ${value.slice(0, 20)}... (maxAge: ${maxAge}s)`);
    
    cookieStore.set(name.trim(), value.trim(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });
  }
  
  console.log('✅ [PROXY] Cookies sincronizadas correctamente');
}

// ============================================
// LOGIN
// ============================================
export async function loginAction(formData: FormData): Promise<ActionResult> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 [LOGIN] Iniciando login para:', username);

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    });

    console.log('📨 [LOGIN] Respuesta backend:', {
      status: response.status,
      ok: response.ok,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [LOGIN] Error:', data.message);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return {
        success: false,
        error: data.message || 'Credenciales inválidas',
      };
    }

    // Caso 2FA
    if (data.requires2FA) {
      console.log('🔒 [LOGIN] 2FA requerido');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return {
        success: true,
        data: {
          requires2FA: true,
          tempToken: data.tempToken,
          message: data.message,
        },
      };
    }

    // Caso Éxito: Guardar cookies
    console.log('✅ [LOGIN] Login exitoso, guardando cookies...');
    await proxyCookies(response);
    
    // Verificación: Leer cookies después de guardarlas
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    
    console.log('🔍 [LOGIN] Cookies guardadas:', {
      accessToken: accessToken ? `✅ ${accessToken.slice(0, 20)}...` : '❌ AUSENTE',
      refreshToken: refreshToken ? `✅ ${refreshToken.slice(0, 20)}...` : '❌ AUSENTE',
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      success: true,
      message: 'Login exitoso',
      data: { user: data.user },
    };

  } catch (error) {
    console.error('💥 [LOGIN] Error de red:', error);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { success: false, error: 'Error de conexión' };
  }
}

// ============================================
// REFRESH TOKEN
// ============================================
export async function refreshTokenAction(): Promise<ActionResult> {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔄 [REFRESH] Iniciando renovación...");

  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      console.log("❌ [REFRESH] Sin refresh token en cookies");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      return { success: false, error: "No refresh token" };
    }

    console.log("🔍 [REFRESH] Refresh token:", refreshToken.slice(0, 30) + '...');

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log("📨 [REFRESH] Respuesta backend:", { 
      status: response.status,
      ok: response.ok 
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ [REFRESH] Error:", errorData.message || `HTTP ${response.status}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      
      // Eliminar cookies inválidas
      console.log("🗑️ [REFRESH] Eliminando cookies inválidas...");
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");
      
      return { success: false, error: "Sesión expirada" };
    }

    const data = await response.json();
    
    console.log("✅ [REFRESH] Renovación exitosa, guardando cookies...");
    await proxyCookies(response);

    // Verificación: Leer cookies después de guardarlas
    const updatedCookies = await cookies();
    const newAccessToken = updatedCookies.get('access_token')?.value;
    const newRefreshToken = updatedCookies.get('refresh_token')?.value;
    
    console.log('🔍 [REFRESH] Nuevas cookies:', {
      accessToken: newAccessToken ? `✅ ${newAccessToken.slice(0, 20)}...` : '❌ AUSENTE',
      refreshToken: newRefreshToken ? `✅ ${newRefreshToken.slice(0, 20)}...` : '❌ AUSENTE',
    });

    console.log("✅ [REFRESH] Renovado para:", data.user?.username);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return { success: true, data: { user: data.user } };

  } catch (error) {
  console.error('💥 [ME] Error:', error instanceof Error ? error.message : 'Unknown');
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return { success: false, error: "Error de red" };
  }
}

// ============================================
// GET ME (con refresh automático integrado)
// ============================================
export async function getMeAction() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 [ME] Obteniendo usuario...');

  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;

    console.log('🔍 [ME] Estado inicial:', {
      accessToken: accessToken ? `✅ ${accessToken.slice(0, 20)}...` : '❌ AUSENTE',
      refreshToken: refreshToken ? `✅ ${refreshToken.slice(0, 20)}...` : '❌ AUSENTE',
    });

    // Si no hay access token, intentar refresh
    if (!accessToken && refreshToken) {
      console.log('🔄 [ME] Sin access token, intentando refresh...');
      
      const refreshResult = await refreshTokenAction();
      
      if (!refreshResult.success) {
        console.log('❌ [ME] Refresh falló, sin sesión');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return null;
      }
      
      // Leer el nuevo access token
      const updatedCookies = await cookies();
      accessToken = updatedCookies.get("access_token")?.value;
      
      console.log('✅ [ME] Refresh exitoso, nuevo access token:', 
        accessToken ? accessToken.slice(0, 20) + '...' : 'AUSENTE');
    }

    if (!accessToken) {
      console.log('❌ [ME] Sin access token después de refresh');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return null;
    }

    // Hacer request con access token
    console.log('📡 [ME] Llamando a /auth/me con access token...');
    
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `access_token=${accessToken}`,
      },
      cache: 'no-store',
    });

    console.log('📨 [ME] Respuesta:', {
      status: response.status,
      ok: response.ok,
    });

    if (response.status === 401) {
      console.log('🔒 [ME] 401 - Token inválido, intentando refresh una vez más...');
      
      // Último intento con refresh
      const refreshResult = await refreshTokenAction();
      
      if (!refreshResult.success) {
        console.log('❌ [ME] Refresh final falló, eliminando cookies');
        const cookieStore = await cookies();
        cookieStore.delete("access_token");
        cookieStore.delete("refresh_token");
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return null;
      }
      
      // Reintentar con el nuevo token
      const updatedCookies = await cookies();
      const newAccessToken = updatedCookies.get("access_token")?.value;
      
      if (!newAccessToken) {
        console.log('❌ [ME] No se obtuvo nuevo access token');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return null;
      }
      
      const retryResponse = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `access_token=${newAccessToken}`,
        },
        cache: 'no-store',
      });
      
      if (!retryResponse.ok) {
        console.log('❌ [ME] Reintento falló');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return null;
      }
      
      const user = await retryResponse.json();
      console.log('✅ [ME] Usuario obtenido (después de refresh):', user.username);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return user;
    }

    if (!response.ok) {
      console.error('❌ [ME] Error HTTP:', response.status);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return null;
    }

    const user = await response.json();
    console.log('✅ [ME] Usuario obtenido:', user.username);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return user;

  } catch (error) {
    console.error('💥 [ME] Error:', error instanceof Error ? error.message : 'Unknown');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return null;
  }
}

// ============================================
// LOGOUT
// ============================================
export async function logoutAction() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚪 [LOGOUT] Cerrando sesión...');
  
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (refreshToken) {
      console.log('📡 [LOGOUT] Notificando al backend...');
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Cookie: `access_token=${accessToken}; refresh_token=${refreshToken}`,
        },
        cache: "no-store",
      });
    }
  } catch (error) {
    console.error("⚠️ [LOGOUT] Error en backend (continuando):", error);
  } finally {
    // Siempre eliminar cookies locales
    console.log('🗑️ [LOGOUT] Eliminando cookies...');
    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    console.log('✅ [LOGOUT] Sesión cerrada');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    redirect("/login");
  }
}

// ============================================
// VERIFY 2FA
// ============================================
export async function verify2FAAction(tempToken: string, code: string): Promise<ActionResult> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 [2FA] Verificando código...');
  
  try {
    const response = await fetch(`${API_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken, code }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [2FA] Error:', data.message);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return { success: false, error: data.message || 'Código inválido' };
    }

    console.log('✅ [2FA] Código válido, guardando cookies...');
    await proxyCookies(response);

    console.log('✅ [2FA] Autenticación completada');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return { success: true, message: 'Autenticación correcta', data: { user: data.user } };

  } catch (error) {
    console.error('💥 [2FA] Error:', error);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { success: false, error: 'Error de conexión' };
  }
}

// ============================================
// REGISTRO
// ============================================
export async function registerAction(formData: FormData): Promise<ActionResult> {
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 [REGISTER] Registrando usuario:', username);

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, fullName }),
      cache: 'no-store',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ [REGISTER] Error:', data.message);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return { success: false, error: data.message };
    }
    
    console.log('✅ [REGISTER] Usuario registrado:', data.username);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return { success: true, message: 'Usuario registrado', data };
  } catch (error) {
    console.error('💥 [REGISTER] Error:', error);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { success: false, error: 'Error de conexión' };
  }

  
}

export async function inspectorLoginAction(): Promise<ActionResult> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 [INSPECTOR] Iniciando login automático...');

  try {
    const response = await fetch(`${API_URL}/auth/inspector`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inspectorKey: process.env.NEXT_PUBLIC_INSPECTOR_API_KEY,
        deviceId: undefined, // Opcional: obtener del navegador
      }),
      cache: 'no-store',
    });

    console.log('📨 [INSPECTOR] Respuesta backend:', {
      status: response.status,
      ok: response.ok,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [INSPECTOR] Error:', data.message);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return {
        success: false,
        error: data.message || 'Error al iniciar sesión como inspector',
      };
    }

    console.log('✅ [INSPECTOR] Login exitoso, guardando cookies...');
    await proxyCookies(response);

    // Verificación
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    console.log('🔍 [INSPECTOR] Cookies guardadas:', {
      accessToken: accessToken ? `✅ ${accessToken.slice(0, 20)}...` : '❌ AUSENTE',
      refreshToken: refreshToken ? `✅ ${refreshToken.slice(0, 20)}...` : '❌ AUSENTE',
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      success: true,
      message: 'Sesión de inspector iniciada',
      data: { user: data.user },
    };

  } catch (error) {
    console.error('💥 [INSPECTOR] Error de red:', error);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return {
      success: false,
      error: 'Error de conexión con el servidor',
    };
  }
}