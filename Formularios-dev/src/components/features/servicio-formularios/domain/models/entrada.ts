/**
 * Cómo forms abre la web del servicio de formularios dentro de un iframe
 * (servicio-formularios/docs/integracion.md §5).
 *
 * TypeScript puro: se prueba con `yarn test`.
 */

/** Lo que manda la web cuando su token está por vencer. */
export const PEDIDO_DE_TOKEN = "formularios:token-pedido";
/** Lo que forms le contesta, con el token nuevo. */
export const RESPUESTA_DE_TOKEN = "formularios:token";

/** El origen de una URL (`http://localhost:3201`), o null si no es http(s). */
export function origenDe(url?: string | null): string | null {
  if (!url?.trim()) return null;
  try {
    const u = new URL(url.trim());
    return u.protocol === "http:" || u.protocol === "https:" ? u.origin : null;
  } catch {
    return null;
  }
}

/**
 * La dirección de entrada: el token va en el fragmento (`#`), que el
 * navegador nunca manda al servidor ni deja en los registros de acceso.
 */
export function urlDeEntrada(web: string, token: string, volver?: string): string {
  const fragmento = new URLSearchParams({ token });
  if (volver) fragmento.set("volver", volver);
  return `${web.replace(/\/+$/, "")}/entrar#${fragmento.toString()}`;
}

/** ¿Este mensaje es el pedido de token de la web del servicio? */
export function esPedidoDeToken(
  origenDelMensaje: string,
  datos: unknown,
  origenDeLaWeb: string,
): boolean {
  return (
    origenDelMensaje === origenDeLaWeb &&
    typeof datos === "object" &&
    datos !== null &&
    (datos as { tipo?: unknown }).tipo === PEDIDO_DE_TOKEN
  );
}
