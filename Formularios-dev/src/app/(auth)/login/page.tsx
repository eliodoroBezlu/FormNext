/**
 * Login page — FormNext
 * ─────────────────────────────────────────────────────────────────
 * FormNext no tiene login propio.
 * El login centralizado vive en IAM Portal.
 * Esta página simplemente redirige allí, pasando la URL de retorno.
 */
import { redirect } from 'next/navigation';
import { cookies as nextCookies } from 'next/headers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciando sesión…',
  description: 'Redirigiendo al sistema de autenticación',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  // Si ya tiene token → ir al dashboard directamente
  const cookieStore = await nextCookies();
  if (cookieStore.get('access_token') || cookieStore.get('refresh_token')) {
    redirect('/dashboard');
  }

  // Resolver la URL de retorno:
  // 1) Si viene del middleware con ?redirect=... usarla directamente
  // 2) Si no, volver al dashboard de FormNext
  const params       = await searchParams;
  const returnTarget = params.redirect ?? `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'}/dashboard`;
  const iamPortalUrl = process.env.IAM_PORTAL_URL ?? 'http://localhost:3005';

  const iamLoginUrl  = `${iamPortalUrl}/login?redirect=${encodeURIComponent(returnTarget)}`;

  redirect(iamLoginUrl);
}
