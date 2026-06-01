/**
 * Register page — FormNext
 * ─────────────────────────────────────────────────────────────────
 * El registro de usuarios está centralizado en IAM Portal.
 * Los usuarios los crea el administrador del sistema, no por auto-registro.
 * Esta página redirige al IAM Portal.
 */
import { redirect } from 'next/navigation';
import { cookies as nextCookies } from 'next/headers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registro de usuarios',
  description: 'Gestión centralizada de usuarios',
};

export default async function RegisterPage() {
  // Si ya tiene sesión → dashboard
  const cookieStore = await nextCookies();
  if (cookieStore.get('access_token') || cookieStore.get('refresh_token')) {
    redirect('/dashboard');
  }

  // El registro es solo a través del administrador en IAM Portal
  const iamPortalUrl = process.env.IAM_PORTAL_URL ?? 'http://localhost:3005';
  redirect(`${iamPortalUrl}/login`);
}
