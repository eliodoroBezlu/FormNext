// app/api/auth/callback/route.ts
// Callback OIDC: valida state, canjea el código por tokens (PKCE) y setea
// las cookies de sesión en el dominio de FormNext.
import { NextRequest, NextResponse } from 'next/server';
import { getOidcClient, OIDC_REDIRECT_URI } from '@/lib/oidc';
import { sessionCookieOptions } from '@/lib/cookies';
import { getPublicOrigin } from '@/lib/public-url';

export const runtime = 'nodejs';

const TX_COOKIE = 'oidc_tx';
const REFRESH_MAX_AGE = 8 * 60 * 60; // 8h — alinea con JWT_REFRESH_EXPIRY del IAM

interface OidcTx {
  codeVerifier: string;
  state:        string;
  nonce:        string;
  redirect:     string;
}

function fail(request: NextRequest, reason: string): NextResponse {
  console.error('💥 [OIDC callback]', reason);
  const url = new URL('/', getPublicOrigin(request));
  url.searchParams.set('auth_error', '1');
  const res = NextResponse.redirect(url);
  res.cookies.delete(TX_COOKIE);
  return res;
}

export async function GET(request: NextRequest) {
  const txRaw = request.cookies.get(TX_COOKIE)?.value;
  if (!txRaw) return fail(request, 'oidc_tx ausente');

  let tx: OidcTx;
  try {
    tx = JSON.parse(txRaw) as OidcTx;
  } catch {
    return fail(request, 'oidc_tx inválido');
  }

  const client = getOidcClient();
  const params = client.callbackParams(request.url);

  let tokenSet;
  try {
    tokenSet = await client.callback(OIDC_REDIRECT_URI, params, {
      state:        tx.state,
      nonce:        tx.nonce,
      code_verifier: tx.codeVerifier,
    });
  } catch (err) {
    return fail(request, `canje fallido: ${(err as Error).message}`);
  }

  if (!tokenSet.access_token || !tokenSet.refresh_token) {
    return fail(request, 'token set incompleto');
  }

  // Destino final (validado al iniciar el flujo). Usa el origen público
  // (no request.nextUrl.origin, que tras el proxy de Railway es localhost).
  const dest = tx.redirect && tx.redirect.startsWith('/') ? tx.redirect : '/dashboard';
  const res  = NextResponse.redirect(new URL(dest, getPublicOrigin(request)));

  const accessMaxAge = tokenSet.expires_in ?? 15 * 60;
  res.cookies.set('access_token',  tokenSet.access_token,  sessionCookieOptions(accessMaxAge));
  res.cookies.set('refresh_token', tokenSet.refresh_token, sessionCookieOptions(REFRESH_MAX_AGE));
  res.cookies.delete(TX_COOKIE);

  return res;
}
