// /app/api/auth/inspector/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // 1. Obtener token de Keycloak usando Client Credentials
    const tokenResponse = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.KEYCLOAK_ID!,
          client_secret: process.env.KEYCLOAK_SECRET!,
          grant_type: 'client_credentials',
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to get inspector token');
    }

    const tokens = await tokenResponse.json();

    // 2. Crear una "sesión simulada" (sin JWT real de usuario)
    const inspectorSession = {
      accessToken: tokens.access_token,
      user: {
        name: 'Inspector',
        email: 'inspector@tecnico.com',
        image: null,
      },
      roles: ['inspector'], // Asegúrate que el cliente tenga este rol
      expires: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    };

    // 3. Guardar en una cookie temporal (opcional, mejor usar contexto)
    (await cookies()).set('inspector_session', JSON.stringify(inspectorSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
      path: '/',
    });

    // 4. Redirigir al formulario de inspección
    return NextResponse.redirect(new URL('/dashboard', process.env.NEXTAUTH_URL));
  } catch (error) {
    console.error('Inspector login error:', error);
    return NextResponse.redirect(new URL('/?error=inspector-login-failed'));
  }
}