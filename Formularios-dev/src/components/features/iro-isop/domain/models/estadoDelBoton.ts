/**
 * En qué estado se muestra cada botón de guardar de la IRO: el que se pulsó
 * dice «Guardando…» y después «✓ Guardado» (durante la pausa antes de la
 * pantalla de «listo»); el otro queda en reposo.
 *
 * TypeScript puro: se prueba con `yarn test`.
 */

export type BotonDeGuardado = "avance" | "terminar";
export type EstadoDelBoton = "inactivo" | "guardando" | "guardado";

export function estadoDelBoton(
  boton: BotonDeGuardado,
  { accion, guardando, guardado }: { accion: BotonDeGuardado | null; guardando: boolean; guardado: boolean },
): EstadoDelBoton {
  if (accion !== boton) return "inactivo";
  if (guardando) return "guardando";
  return guardado ? "guardado" : "inactivo";
}
