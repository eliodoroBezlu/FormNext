/**
 * Cuando alguien corrige la descripción de una tarea en el plan de acción, el
 * backend la escribe en el comentario de su pregunta en la IRO y anota quién
 * lo hizo. Esto encuentra la última de esas notas para una pregunta.
 *
 * La pregunta se reconoce por el título de su sección y su texto (sin tildes,
 * mayúsculas ni espacios de más), igual que en el backend.
 */

export interface NotaDesdePlan {
  fecha: string;
  usuario: string;
  seccion: string;
  pregunta: string;
}

const normalizar = (texto?: string) =>
  (texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export function ultimoCambioDesdePlan<T extends NotaDesdePlan>(
  cambios: T[] | undefined,
  seccion: string | undefined,
  pregunta: string | undefined,
): T | undefined {
  const s = normalizar(seccion);
  const p = normalizar(pregunta);
  let ultimo: T | undefined;
  for (const cambio of cambios ?? []) {
    if (normalizar(cambio.seccion) !== s || normalizar(cambio.pregunta) !== p) continue;
    if (!ultimo || new Date(cambio.fecha) >= new Date(ultimo.fecha)) ultimo = cambio;
  }
  return ultimo;
}

/** «Corregido desde el plan de acción por eliodoro el 05/11/2026». */
export function textoDelCambio(cambio: NotaDesdePlan): string {
  const fecha = new Date(cambio.fecha).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `Corregido desde el plan de acción por ${cambio.usuario} el ${fecha}`;
}
