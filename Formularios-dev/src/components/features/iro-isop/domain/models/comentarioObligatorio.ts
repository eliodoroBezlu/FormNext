/**
 * Cuándo una respuesta de IRO/ISOP exige comentario.
 *
 * - Un puntaje 0, 1 o 2 se justifica **siempre**, en cualquier pregunta
 *   (roja o no): es una observación, y sin comentario no se sabe qué se vio.
 *   Es además lo que el plan de acción usa como descripción de la tarea.
 * - «No aplica» se justifica solo en las preguntas obligatorias (las rojas),
 *   salvo que toda la sección esté en «No aplica»: entonces se justifica una
 *   vez, en el comentario de la sección.
 *
 * Misma regla que exige el backend al terminar la inspección
 * (`instances/domain/terminar-inspeccion.ts`).
 *
 * TypeScript puro: se prueba con `yarn test`.
 */

export const PUNTAJES_QUE_SE_JUSTIFICAN = ["0", "1", "2"];

export interface PreguntaConComentario {
  respuesta: string | number | null | undefined;
  obligatoria: boolean;
  /** Toda la sección está en «No aplica». */
  seccionEnteraNoAplica: boolean;
}

/** El mensaje si el comentario hace falta; `null` si no. */
export function motivoDelComentario({
  respuesta,
  obligatoria,
  seccionEnteraNoAplica,
}: PreguntaConComentario): string | null {
  const valor = respuesta === null || respuesta === undefined ? "" : String(respuesta);
  if (PUNTAJES_QUE_SE_JUSTIFICAN.includes(valor)) {
    return "Justifica en el comentario por qué el puntaje es 0, 1 o 2";
  }
  if (valor === "N/A" && obligatoria && !seccionEnteraNoAplica) {
    return "Se debe justificar en los comentarios el motivo por el cual NO APLICA";
  }
  return null;
}
