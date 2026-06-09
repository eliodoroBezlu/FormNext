import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sessionCookieOptions } from '@/lib/cookies';

const API_URL = process.env.API_URL || 'http://localhost:3002';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  // 1. Si tenemos Access Token, todo bien.
  if (accessToken) {
    return NextResponse.json({ authenticated: true }, { status: 200 });
  }

  // 2. Si no hay Access pero hay Refresh, intentamos renovar.
  if (!accessToken && refreshToken) {
    try {
      console.log('🔄 [API] Refrescando token...');
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Cookie': `refresh_token=${refreshToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        
        // Creamos la respuesta exitosa
        const res = NextResponse.json({ authenticated: true, user: data.user }, { status: 200 });

        // 🔥 CLAVE: Copiamos las cookies que nos dio NestJS hacia el navegador
        const setCookieHeader = response.headers.getSetCookie();
        if (setCookieHeader) {
          for (const cookieStr of setCookieHeader) {
            const maxAgePart = cookieStr.split(';').find((p) =>
              p.trim().toLowerCase().startsWith('max-age='),
            );
            const maxAge = maxAgePart ? parseInt(maxAgePart.split('=')[1], 10) : undefined;
            const [nameValue] = cookieStr.split(';');
            const [name, value] = nameValue.split('=');
            res.cookies.set(name.trim(), value.trim(), sessionCookieOptions(maxAge));
          }
        }
        return res;
      }
    } catch (error) {
      console.error('💥 [API] Error refresh:', error);
    }
  }

  // 3. Si llegamos aquí, no hay sesión válida.
  return NextResponse.json({ authenticated: false }, { status: 401 });
}