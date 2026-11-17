/**
 * El mensaje de un error tal como lo debe leer quien usa el sistema.
 *
 * Los errores de red llegan con textos técnicos y en inglés que cambian según
 * el navegador y el lado que falló: «Failed to fetch» (Chrome, sin señal),
 * «Load failed» (Safari), «NetworkError when attempting…» (Firefox) o «fetch
 * failed» (el servidor de Next sin poder llegar al backend). En planta, con
 * poca señal, es el error más común; aquí se traducen a algo que dice qué
 * pasó y qué hacer. El resto de los mensajes (los del backend, ya en español)
 * pasan tal cual.
 *
 * TypeScript puro: se prueba con `yarn test`.
 */

export const SIN_CONEXION =
  "No se pudo conectar con el servidor. Revise su conexión e intente de nuevo; lo que cargó sigue en pantalla.";

export const FALLA_DEL_SERVIDOR =
  "El servidor tuvo un problema y no pudo completar la acción. Intente de nuevo en unos minutos.";

const DE_RED = [
  /failed to fetch/i,
  /fetch failed/i,
  /load failed/i,
  /networkerror/i,
  /network error/i,
  /network request failed/i,
  /econnrefused|econnreset|enotfound|etimedout|und_err/i,
  /(operation|request|user)( was)? aborted/i,
  /timeout|timed out/i,
];

/** «HTTP 500», «HTTP 502»… sin explicación del servidor. */
const HTTP_PELADO = /^HTTP 5\d\d$/;

/** «Path `familiaPeligro` is required.» (validación de Mongoose sin traducir). */
const CAMPO_REQUERIDO = /^Path `([^`]+)` is required\.?$/;

/** El mensaje para el usuario; `porDefecto` cuando el error no trae uno. */
export function mensajeParaUsuario(error: unknown, porDefecto: string): string {
  const texto =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  const limpio = texto.trim();
  if (!limpio) return porDefecto;
  if (DE_RED.some((patron) => patron.test(limpio))) return SIN_CONEXION;
  if (HTTP_PELADO.test(limpio)) return FALLA_DEL_SERVIDOR;
  const requerido = CAMPO_REQUERIDO.exec(limpio);
  if (requerido) return `Falta un dato obligatorio (${requerido[1]}). Complételo e intente de nuevo.`;
  return limpio;
}
