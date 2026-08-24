/**
 * Permiso puntual para abandonar la página sin el aviso de «tienes cambios sin
 * guardar».
 *
 * El guardián de salida (`beforeunload`) tiene que avisar cuando el usuario se
 * va con el formulario a medias, pero **no** cuando la propia aplicación
 * navega tras guardar. Ese permiso se comunicaba escribiendo directamente en
 * `window`, con un `(window as any)` repetido en quince sitios:
 *
 * ```ts
 * (window as any).bypassBeforeUnload = true;   // ← antes
 * ```
 *
 * Aquí queda en un solo lugar, con nombre y sin castos.
 *
 * ## El permiso se consume al usarlo
 *
 * Antes se ponía a `true` y **nunca volvía a `false`**: bastaba guardar una
 * inspección para que el aviso quedara desactivado durante el resto de la
 * sesión. Si después empezabas otra y salías con cambios sin guardar, nadie te
 * avisaba.
 *
 * Ahora es un permiso de un solo uso: `salidaEstaAutorizada()` lo consume, así
 * que autoriza exactamente la salida para la que se pidió.
 */

let salidaAutorizada = false;

/**
 * Declara que la siguiente salida de la página es deliberada.
 *
 * Se llama justo antes de navegar tras guardar o cancelar.
 */
export const autorizarSalida = (): void => {
  salidaAutorizada = true;
};

/**
 * ¿Está autorizada esta salida? Consume el permiso: la siguiente vuelve a
 * avisar.
 */
export const salidaEstaAutorizada = (): boolean => {
  if (!salidaAutorizada) return false;
  salidaAutorizada = false;
  return true;
};

/** Revoca el permiso sin consumirlo (por ejemplo, si se cancela la salida). */
export const revocarSalida = (): void => {
  salidaAutorizada = false;
};
