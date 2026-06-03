/**
 * Middleware de FormNext
 * ──────────────────────────────────────────────────────────────────
 * Autenticación centralizada vía IAM Portal (SSO).
 *
 * Flujo:
 *  1. Sin tokens → redirect a IAM Portal /login?redirect=<url-actual>
 *  2. Token expirando → refresh silencioso directo contra IAM Core
 *  3. Token válido → continuar
 *
 * FormNext NO tiene login propio. El login vive en IAM Portal (:3005).
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Configuración ──────────────────────────────────────────────────
const IAM_PORTAL_URL = process.env.IAM_PORTAL_URL || 'http://localhost:3005';
const IAM_CORE_URL   = process.env.IAM_CORE_URL   || 'http://localhost:4000';

// ── Helpers ────────────────────────────────────────────────────────

function decodeJWT(token: string): { exp?: number } | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8'),
    );
  } catch {
    return null;
  }
}

function isExpiringSoon(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 - Date.now() < 3 * 60 * 1000; // < 3 min restantes
}

/** URL del IAM Portal con el redirect de vuelta al path actual. */
function buildIamLoginUrl(request: NextRequest): URL {
  const returnTo = encodeURIComponent(request.url);
  return new URL(`${IAM_PORTAL_URL}/login?redirect=${returnTo}`);
}

/** Rota el refresh token directamente contra IAM Core. */
async function refreshFromIamCore(refreshToken: string): Promise<Response> {
  return fetch(`${IAM_CORE_URL}/api/auth/refresh`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `refresh_token=${refreshToken}`,
    },
  });
}

/** Copia las cookies del response de IAM Core al response de Next.js. */
function applyCookies(source: Response, target: NextResponse): void {
  for (const raw of source.headers.getSetCookie()) {
    const [nameVal]  = raw.split(';');
    const [name, value] = nameVal.split('=');
    const maxAgePart = raw.split(';').find((p) =>
      p.trim().toLowerCase().startsWith('max-age='),
    );
    const maxAge = maxAgePart ? parseInt(maxAgePart.split('=')[1]) : undefined;
    target.cookies.set(name.trim(), value.trim(), {
      path:     '/',
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
    });
  }
}

// ── Middleware ─────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas — no requieren autenticación
  // /inspeccion/login → acceso legacy de inspector técnico (temporal)
  const isPublic = ['/', '/login', '/register', '/inspeccion/login'].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  const accessToken  = request.cookies.get('access_token');
  const refreshToken = request.cookies.get('refresh_token');

  // ── Usuario autenticado en zona pública → redirigir al dashboard ─
  if (isPublic && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ── Zona pública sin auth → pasar sin restricción ────────────────
  if (isPublic) {
    return NextResponse.next();
  }

  // ── Zona protegida ───────────────────────────────────────────────

  // A) Sin ningún token → IAM Portal login con redirect de vuelta
  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(buildIamLoginUrl(request));
  }

  // B) Sin access token pero con refresh → renovar silenciosamente
  if (!accessToken && refreshToken) {
    try {
      const res = await refreshFromIamCore(refreshToken.value);
      if (res.ok) {
        const response = NextResponse.next();
        applyCookies(res, response);
        return response;
      }
    } catch { /* ignorar error de red */ }

    // Refresh falló → re-login en IAM Portal
    return NextResponse.redirect(buildIamLoginUrl(request));
  }

  // C) Access token por expirar → refresh proactivo
  if (accessToken && refreshToken && isExpiringSoon(accessToken.value)) {
    try {
      const res = await refreshFromIamCore(refreshToken.value);
      if (res.ok) {
        const response = NextResponse.next();
        applyCookies(res, response);
        return response;
      }
      // Si falla, continuar con el token actual (expirará pronto pero es válido ahora)
    } catch { /* continuar normalmente */ }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)$).*)',
  ],
};
