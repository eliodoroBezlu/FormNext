// ============================================
// lib/auth/server.ts - Solo lectura (Server Component)
// ============================================

import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'http://localhost:3002';

export async function getServerUser() {
  console.log('👤 [SERVER USER] Obteniendo usuario (solo lectura)...');

  try {
    // ✅ Solo leemos las cookies, no las modificamos
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    console.log('🍪 [SERVER USER] Access Token:', 
      accessToken ? `✅ ${accessToken.slice(0, 20)}...` : '❌ AUSENTE'
    );

    // ❌ No intentamos refresh aquí (solo lectura en Server Component)
    if (!accessToken) {
      console.log('❌ [SERVER USER] Sin access token');
      return null;
    }

    // Obtener usuario con el token existente
    const userResponse = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    console.log('📨 [SERVER USER] Respuesta /auth/me:', {
      status: userResponse.status,
      ok: userResponse.ok,
    });

    if (!userResponse.ok) {
      console.log('❌ [SERVER USER] Token inválido o expirado');
      return null;
    }

    const user = await userResponse.json();
    console.log('✅ [SERVER USER] Usuario:', user.username);
    return user;

  } catch (error) {
    console.error('💥 [SERVER USER] Error:', error);
    return null;
  }
}