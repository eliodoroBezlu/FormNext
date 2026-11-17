/**
 * Cómo se ve cada estado de un plan y de una tarea: su etiqueta y su color
 * semántico del tema. Una sola tabla para la tarjeta, la tabla de tareas y lo
 * que venga, así «Abierto» no vuelve a ser azul en un lugar y rojo en otro.
 *
 * Los colores son los de `docs/SISTEMA_DE_DISENO.md`, sección 1.3.
 * TypeScript puro: se prueba con `yarn test`.
 */

export type ColorSemantico = "default" | "info" | "warning" | "success" | "error";

export interface EstadoVisual {
  etiqueta: string;
  color: ColorSemantico;
}

const SIN_ESTADO: EstadoVisual = { etiqueta: "—", color: "default" };

export const ESTADO_DE_TAREA: Record<string, EstadoVisual> = {
  abierto: { etiqueta: "Abierto", color: "info" },
  "en-progreso": { etiqueta: "En Progreso", color: "warning" },
  cerrado: { etiqueta: "Cerrado", color: "success" },
};

export const ESTADO_DE_PLAN: Record<string, EstadoVisual> = {
  ...ESTADO_DE_TAREA,
  aprobado: { etiqueta: "Aprobado", color: "success" },
  "sin-observaciones": { etiqueta: "Sin observaciones", color: "default" },
};

/** El estado de una tarea; uno desconocido se muestra tal cual, en gris. */
export const estadoDeTarea = (estado?: string): EstadoVisual =>
  (estado && ESTADO_DE_TAREA[estado]) || (estado ? { etiqueta: estado, color: "default" } : SIN_ESTADO);

/** El estado de un plan, ya resuelto («aprobado» y «sin observaciones» incluidos). */
export const estadoDePlan = (estado?: string): EstadoVisual =>
  (estado && ESTADO_DE_PLAN[estado]) || (estado ? { etiqueta: estado, color: "default" } : SIN_ESTADO);
