/**
 * Login page — FormNext
 * ─────────────────────────────────────────────────────────────────
 * FormNext no tiene login propio. Inicia el flujo OIDC contra IAM Core
 * (que muestra el login de IAM Portal si no hay sesión SSO).
 * Esta página solo redirige al iniciador OIDC en /api/auth/login.
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

  // Destino de retorno tras el login (path same-origin)
  const params  = await searchParams;
  const destino = params.redirect && params.redirect.startsWith('/') ? params.redirect : '/dashboard';

  // Iniciar el flujo OIDC (Authorization Code + PKCE)
  redirect(`/api/auth/login?redirect=${encodeURIComponent(destino)}`);
}
