/**
 * Qué tareas se iluminan un momento en la tabla después de un cambio, para
 * que se vea dónde cayó: la que se guardó, se corrigió o se aprobó, las que
 * se agregaron y las que actualizó la planilla.
 *
 * TypeScript puro: se prueba con `yarn test`.
 */

interface ConId {
  _id?: string;
}

/** Las tareas que están después y no estaban antes (las recién agregadas). */
export function idsNuevos(antes: readonly ConId[], despues: readonly ConId[]): string[] {
  const previos = new Set(antes.map((t) => t._id).filter(Boolean));
  return despues
    .map((t) => t._id)
    .filter((id): id is string => !!id && !previos.has(id));
}

/** Las tareas que la carga de la planilla actualizó de verdad. */
export function idsActualizados(
  filas: readonly { resultado: string; tareaId?: string }[],
): string[] {
  return filas
    .filter((f) => f.resultado === "actualiza" && f.tareaId)
    .map((f) => f.tareaId as string);
}
