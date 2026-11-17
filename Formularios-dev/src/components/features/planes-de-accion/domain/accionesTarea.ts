/**
 * Qué acciones de la tabla de tareas ve cada quien. TypeScript puro: se prueba
 * con `yarn test`.
 */

export interface TareaParaAcciones {
  aprobado?: boolean;
  /** Presente si la tarea salió de una inspección (IRO/ISOP). */
  instanceId?: string;
}

/**
 * «Continuar» (avanzar la tarea): quien no es admin, mientras la tarea no esté
 * aprobada. El admin tiene «Editar» en su lugar.
 *
 * No depende de dónde salió la tarea. Antes solo aparecía en los planes
 * generados desde una inspección, y en un plan manual el supervisor no tenía
 * cómo avanzar sus tareas (el backend sí lo permitía). Lo que cambia con el
 * origen es qué campos se pueden tocar, y eso lo resuelve el formulario.
 */
export const puedeContinuarTarea = (tarea: TareaParaAcciones, esAdmin: boolean): boolean =>
  !esAdmin && tarea.aprobado !== true;
