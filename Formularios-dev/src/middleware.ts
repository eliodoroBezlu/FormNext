import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3002';

/**
 * Decodifica el payload de un JWT sin verificar la firma
 * (seguro porque ya fue validado por el backend)
 */
function decodeJWT(token: string): { exp: number } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('❌ [Middleware] Error decodificando JWT:', error);
    return null;
  }
}

/**
 * Verifica si el token está por expirar (menos de 3 minutos restantes)
 */
function isTokenExpiringSoon(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;

  const expiresAt = payload.exp * 1000; // Convertir a milisegundos
  const now = Date.now();
  const timeLeft = expiresAt - now;
  const threeMinutes = 3 * 60 * 1000;

  return timeLeft < threeMinutes && timeLeft > 0;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas
  const publicPaths = ['/login', '/register', '/'];
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );

  const accessToken = request.cookies.get('access_token');
  const refreshToken = request.cookies.get('refresh_token');

  // ==========================================
  // CASO 1: Usuario logueado en zona pública
  // ==========================================
  if (isPublicPath && accessToken && pathname !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ==========================================
  // CASO 2: Ruta privada
  // ==========================================
  if (!isPublicPath) {
    
    // A) Sin access token pero con refresh → Intentar renovar
    if (!accessToken && refreshToken) {
      console.log('🔄 [Middleware] Sin access token, renovando...');
      
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Cookie': `refresh_token=${refreshToken.value}`,
            'Content-Type': 'application/json',
          },
        });

        if (refreshResponse.ok) {
          console.log('✅ [Middleware] Refresh exitoso');
          const response = NextResponse.next();
          
          // Copiar cookies del backend
          const setCookieHeaders = refreshResponse.headers.getSetCookie();
          for (const cookieStr of setCookieHeaders) {
            const [nameValue] = cookieStr.split(';');
            const [name, value] = nameValue.split('=');
            
            // Extraer maxAge si existe
            const maxAgePart = cookieStr.split(';')
              .find(p => p.trim().toLowerCase().startsWith('max-age='));
            const maxAge = maxAgePart 
              ? parseInt(maxAgePart.split('=')[1]) 
              : undefined;

            response.cookies.set(name.trim(), value.trim(), {
              path: '/',
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              httpOnly: true,
              maxAge,
            });
          }
          
          return response;
        } else {
          console.log('❌ [Middleware] Refresh falló');
        }
      } catch (e) {
        console.error('💥 [Middleware] Error en refresh:', e);
      }
      
      // Si falló, redirigir a login
      return NextResponse.redirect(new URL('/login?session_expired=true', request.url));
    }

    // B) Sin ningún token
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // C) 🔥 NUEVO: Tiene access token, pero está por expirar
    if (accessToken && refreshToken) {
      const tokenValue = accessToken.value;
      
      if (isTokenExpiringSoon(tokenValue)) {
        console.log('⏰ [Middleware] Token expira pronto, renovando proactivamente...');
        
        try {
          const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Cookie': `refresh_token=${refreshToken.value}`,
              'Content-Type': 'application/json',
            },
          });

          if (refreshResponse.ok) {
            console.log('✅ [Middleware] Renovación proactiva exitosa');
            const response = NextResponse.next();
            
            // Copiar nuevas cookies
            const setCookieHeaders = refreshResponse.headers.getSetCookie();
            for (const cookieStr of setCookieHeaders) {
              const [nameValue] = cookieStr.split(';');
              const [name, value] = nameValue.split('=');
              
              const maxAgePart = cookieStr.split(';')
                .find(p => p.trim().toLowerCase().startsWith('max-age='));
              const maxAge = maxAgePart 
                ? parseInt(maxAgePart.split('=')[1]) 
                : undefined;

              response.cookies.set(name.trim(), value.trim(), {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                httpOnly: true,
                maxAge,
              });
            }
            
            return response;
          } else {
            console.warn('⚠️ [Middleware] Renovación proactiva falló (continuando con token actual)');
            // No redirigir, dejar que el token expire naturalmente
          }
        } catch (error) {
          console.error('💥 [Middleware] Error en renovación proactiva:', error);
          // Continuar sin bloquear la request
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};