import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

    // Pedimos el perfil al backend en vez de decodificar el JWT nosotros:
    // el JWT de IAM Core no trae un claim de permisos — los permisos del
    // servicio "forms" se calculan dinámicamente en /auth/me a partir de
    // los roles (ver JwtStrategy + RbacCacheService en BackendForm).
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Token inválido o sesión expirada' },
        { status: response.status === 401 ? 401 : 500 }
      );
    }

    const data = await response.json();

    const user = {
      id: data.id,
      username: data.username,
      email: data.email,
      roles: data.roles || [],
      permissions: data.permissions || [],
      fullName: data.fullName,
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
