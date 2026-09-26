/**
 * Proxy de FormNext (antes `middleware.ts`, renombrado en Next.js 16)
 * ──────────────────────────────────────────────────────────────────
 * Autenticación centralizada vía IAM Portal (SSO).
 *
 * Corre siempre en el runtime de Node (no configurable en Next 16), lo
 * cual encaja con este código: usa `Buffer` para decodificar el JWT y
 * hace `fetch` server-to-server contra IAM Core.
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
import { sessionCookieOptions } from '@/lib/cookies';
import { refrescarUnaVez } from '@/lib/refrescoCompartido';
import { puedeAccederARuta } from '@/lib/routePermissions';

// ── Configuración ──────────────────────────────────────────────────
const IAM_CORE_URL = process.env.IAM_CORE_URL || 'http://localhost:4000';

/**
 * Traza de autenticación.
 *
 * El `middleware.ts` anterior registraba cada decisión y al reescribirlo se
 * quedó mudo, que es justo lo que hace falta para entender por qué falla un
 * guardado tras quince minutos de formulario: sin esto no hay manera de saber
 * si el refresco ocurrió, porque el único síntoma visible es el error de la
 * Server Action.
 *
 * En desarrollo está siempre encendida. En producción se enciende con
 * `AUTH_DEBUG=true`, para poder diagnosticar en el entorno de pruebas sin
 * llenar de ruido el entorno real.
 *
 * **Nunca se escribe el valor de un token**, ni recortado: el `access_token`
 * viaja en una cookie httpOnly precisamente para que no acabe en ningún sitio
 * legible, y un log es un sitio legible. Solo se registra si está o no, y
 * cuánta vida le queda.
 */
const DEPURAR =
  process.env.AUTH_DEBUG === 'true' || process.env.NODE_ENV !== 'production';

function registrar(mensaje: string, datos?: Record<string, unknown>): void {
  if (!DEPURAR) return;
  console.log(`[proxy] ${mensaje}`, datos ?? '');
}

// ── Helpers ────────────────────────────────────────────────────────

function decodeJWT(token: string): { exp?: number; roles?: string[] } | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8'),
    );
  } catch {
    return null;
  }
}

/** Roles del usuario según el access token, o `[]` si no se puede leer. */
function rolesDesdeToken(token: string): string[] {
  const payload = decodeJWT(token);
  return Array.isArray(payload?.roles) ? payload.roles : [];
}

function isExpiringSoon(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 - Date.now() < 3 * 60 * 1000; // < 3 min restantes
}

/**
 * Vida que le queda al token, en segundos. Negativo si ya venció.
 *
 * Solo para la traza. Un valor negativo aquí con la cookie todavía presente
 * significa que la cookie vive más que el JWT que contiene, que es un
 * desajuste propio y merece mirarse.
 */
function segundosRestantes(token: string): number | null {
  const payload = decodeJWT(token);
  if (!payload?.exp) return null;
  return Math.round((payload.exp * 1000 - Date.now()) / 1000);
}

/**
 * URL de la pantalla selectora de acceso de forms (/).
 * Ofrece "Acceso Inspector Técnico" + "Iniciar Sesión con Cuenta".
 * Se preserva el destino original en ?redirect= para volver tras el login.
 *
 * Nota: mientras exista el acceso legacy de inspector, el gate es esta
 * pantalla. Cuando se elimine, cambiar este helper para ir directo al
 * login de IAM Portal (process.env.IAM_PORTAL_URL).
 */
function buildAccessSelectorUrl(request: NextRequest): URL {
  const url = new URL('/', request.url);
  url.searchParams.set('redirect', request.url);
  return url;
}

/**
 * Rota el refresh token contra IAM Core, **una sola vez por ráfaga**.
 *
 * Una pantalla dispara más de una docena de Server Actions a la vez y todas
 * pasan por aquí con el mismo token. Sin `refrescarUnaVez` cada una pedía su
 * propia rotación: se agotaba el límite de IAM y las que llegaban tarde
 * presentaban un token que la primera ya había invalidado. Ver
 * `src/lib/refrescoCompartido.ts`.
 */
async function refrescarSesion(refreshToken: string): Promise<string[] | null> {
  const { resultado, reutilizado } = await refrescarUnaVez(
    refreshToken,
    async () => {
      const inicio = Date.now();
      const res = await fetch(`${IAM_CORE_URL}/api/auth/refresh`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `refresh_token=${refreshToken}`,
        },
      });
      registrar('refresco contra IAM', {
        estado: res.status,
        ok: res.ok,
        ms: Date.now() - inicio,
      });
      return { ok: res.ok, cookies: res.headers.getSetCookie() };
    },
  );

  if (reutilizado) {
    registrar('refresco reutilizado (no se pidió otro a IAM)', {
      ok: resultado.ok,
    });
  }

  return resultado.ok ? resultado.cookies : null;
}

/**
 * Nombre y valor de una cabecera `Set-Cookie`.
 *
 * Se corta por el **primer** `=` y no con `split('=')`: el valor es un JWT y
 * puede llevar `=` de relleno al final, que un `split` dejaría fuera.
 */
function partirCookie(raw: string): { nombre: string; valor: string } | null {
  const [nameVal] = raw.split(';');
  const corte = nameVal.indexOf('=');
  if (corte < 0) return null;
  return {
    nombre: nameVal.slice(0, corte).trim(),
    valor:  nameVal.slice(corte + 1).trim(),
  };
}

function maxAgeDe(raw: string): number | undefined {
  const parte = raw
    .split(';')
    .find((p) => p.trim().toLowerCase().startsWith('max-age='));
  return parte ? parseInt(parte.split('=')[1], 10) : undefined;
}

/**
 * Cabeceras de la petición con las cookies recién emitidas ya dentro.
 *
 * Esto es lo que hace que el refresco sirva de algo **en la misma petición**.
 * Antes las cookies nuevas se escribían solo en el response, así que llegaban
 * al navegador pero no al handler de abajo: la Server Action leía `cookies()`,
 * encontraba la vieja o ninguna, y el guardado moría con «Sesión expirada»
 * justo cuando el refresco acababa de funcionar.
 */
function cabecerasConCookiesNuevas(
  request: NextRequest,
  setCookies: string[],
): Headers {
  const cookies = new Map(
    request.cookies.getAll().map((c) => [c.name, c.value] as const),
  );

  for (const raw of setCookies) {
    const cookie = partirCookie(raw);
    if (cookie) cookies.set(cookie.nombre, cookie.valor);
  }

  const headers = new Headers(request.headers);
  headers.set(
    'cookie',
    [...cookies].map(([nombre, valor]) => `${nombre}=${valor}`).join('; '),
  );
  return headers;
}

/** Copia las cookies emitidas por IAM Core al response que va al navegador. */
function applyCookies(setCookies: string[], target: NextResponse): void {
  const puestas: string[] = [];

  for (const raw of setCookies) {
    const cookie = partirCookie(raw);
    if (!cookie) continue;
    const maxAge = maxAgeDe(raw);
    // domain compartido si COOKIE_DOMAIN está definido → SSO cross-subdominio
    target.cookies.set(cookie.nombre, cookie.valor, sessionCookieOptions(maxAge));
    puestas.push(`${cookie.nombre}(maxAge=${maxAge ?? 'sesión'})`);
  }

  registrar('cookies nuevas aplicadas', {
    cookies: puestas.join(', ') || 'ninguna',
  });
}

/**
 * Continúa la petición con la sesión ya renovada: el token nuevo entra tanto
 * en las cabeceras que ve el handler como en el response que va al navegador.
 */
function continuarConSesionRenovada(
  request: NextRequest,
  setCookies: string[],
): NextResponse {
  const response = NextResponse.next({
    request: { headers: cabecerasConCookiesNuevas(request, setCookies) },
  });
  applyCookies(setCookies, response);
  return response;
}

// ── Proxy ──────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas — no requieren autenticación
  // /inspeccion/login → acceso legacy de inspector técnico (temporal)
  const isPublic = ['/', '/login', '/register', '/inspeccion/login'].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  const accessToken  = request.cookies.get('access_token');
  const refreshToken = request.cookies.get('refresh_token');

  // Una Server Action llega como POST a la URL de la propia página, con la
  // cabecera `Next-Action`. Distinguirla de una navegación es lo que permite
  // leer la traza: el guardado de un formulario y un clic en el menú se ven
  // igual en el log si no se marca cuál es cuál.
  const esServerAction = request.headers.has('next-action');

  registrar(esServerAction ? '── SERVER ACTION ──' : '── navegación ──', {
    ruta: pathname,
    metodo: request.method,
    access: accessToken
      ? `presente (le quedan ${segundosRestantes(accessToken.value)} s)`
      : 'AUSENTE',
    refresh: refreshToken ? 'presente' : 'AUSENTE',
  });

  // ── Usuario autenticado en zona pública → redirigir al dashboard ─
  if (isPublic && accessToken) {
    registrar('zona pública con sesión → /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ── Zona pública sin auth → pasar sin restricción ────────────────
  if (isPublic) {
    registrar('zona pública sin sesión → pasa');
    return NextResponse.next();
  }

  // ── Zona protegida ───────────────────────────────────────────────

  // A) Sin ningún token → IAM Portal login con redirect de vuelta
  if (!accessToken && !refreshToken) {
    registrar('CASO A · sin tokens → selector de acceso', {
      // Una redirección sobre una Server Action saca al usuario de la página
      // y se lleva por delante el formulario que estuviera rellenando.
      aviso: esServerAction ? 'esto aborta el guardado en curso' : undefined,
    });
    return NextResponse.redirect(buildAccessSelectorUrl(request));
  }

  // B) Sin access token pero con refresh → renovar silenciosamente
  if (!accessToken && refreshToken) {
    registrar('CASO B · sin access token, se intenta refrescar');
    try {
      const cookies = await refrescarSesion(refreshToken.value);
      if (cookies) {
        registrar('CASO B · refresco OK → pasa con el token nuevo', {
          consecuencia: esServerAction
            ? 'la acción ya ve el token nuevo en esta misma petición'
            : undefined,
        });
        return continuarConSesionRenovada(request, cookies);
      }
      registrar('CASO B · refresco rechazado por IAM');
    } catch (e) {
      registrar('CASO B · error de red al refrescar', {
        error: e instanceof Error ? e.message : String(e),
      });
    }

    // Refresh falló → re-login en IAM Portal
    registrar('CASO B · sin refresco → selector de acceso');
    return NextResponse.redirect(buildAccessSelectorUrl(request));
  }

  // C) Access token por expirar → refresh proactivo
  if (accessToken && refreshToken && isExpiringSoon(accessToken.value)) {
    const restantes = segundosRestantes(accessToken.value);
    registrar('CASO C · token por expirar, refresco proactivo', {
      restantes: `${restantes} s`,
      // Cookie viva con el JWT ya vencido: significa que el maxAge de la
      // cookie es más largo que la caducidad del token que lleva dentro.
      nota: restantes !== null && restantes <= 0 ? 'el JWT YA venció' : undefined,
    });
    try {
      const cookies = await refrescarSesion(refreshToken.value);
      if (cookies) {
        registrar('CASO C · refresco OK → pasa con el token nuevo');
        return continuarConSesionRenovada(request, cookies);
      }
      // Si falla, continuar con el token actual (expirará pronto pero es válido ahora)
      registrar('CASO C · refresco falló → se sigue con el token actual');
    } catch (e) {
      registrar('CASO C · error de red → se sigue con el token actual', {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  // ── D) Autorización por rol ──────────────────────────────────────
  // Hasta ahora `ROUTE_PERMISSIONS` estaba declarado pero no se aplicaba
  // en ningún sitio: el único control real vivía en los guards del
  // backend, así que una URL escrita a mano entraba a cualquier pantalla.
  // Aquí es donde deja de ser cosmético.
  if (accessToken && pathname.startsWith('/dashboard')) {
    const roles = rolesDesdeToken(accessToken.value);
    if (!puedeAccederARuta(pathname, roles)) {
      registrar('rol sin permiso para la ruta → access-denied', { roles });
      return NextResponse.redirect(
        new URL('/dashboard/access-denied', request.url),
      );
    }
  }

  registrar('token válido → pasa sin tocar nada');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)$).*)',
  ],
};
