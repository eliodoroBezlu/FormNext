import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Decodifica JWT sin verificar firma (solo lectura del payload)
 * Seguro porque el Middleware ya validó el token
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch (error) {
  console.error('💥 [ME] Error:', error instanceof Error ? error.message : 'Unknown');
    return null;
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Decodificar token para obtener info del usuario
    const payload = decodeJWT(accessToken);

    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Extraer información del usuario
    const user = {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      roles: payload.roles || [],
      fullName: payload.fullName,
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[API /auth/user] Error:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}