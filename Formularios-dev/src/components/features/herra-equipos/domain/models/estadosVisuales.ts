/**
 * Cómo se ve cada estado de una inspección de herramientas y equipos: su
 * etiqueta y su color semántico del tema. Una sola tabla para el chip del
 * formulario, el reporte y las notificaciones del panel, así «Aprobada» no
 * vuelve a ser verde en un lugar y azul en otro.
 *
 * Las claves son los valores de `InspectionStatus` (`Inspection.ts`) escritos
 * como texto: así este archivo se prueba sin transpilar el `enum`.
 * Colores: `docs/SISTEMA_DE_DISENO.md`, sección 1.3. TypeScript puro.
 */

export type ColorSemantico = "default" | "info" | "warning" | "success" | "error";

export interface EstadoVisual {
  etiqueta: string;
  color: ColorSemantico;
}

export const ESTADO_DE_INSPECCION: Record<string, EstadoVisual> = {
  draft: { etiqueta: "Borrador", color: "default" },
  in_progress: { etiqueta: "En progreso", color: "warning" },
  pending_approval: { etiqueta: "Pendiente de aprobación", color: "info" },
  approved: { etiqueta: "Aprobada", color: "success" },
  rejected: { etiqueta: "Rechazada", color: "error" },
  completed: { etiqueta: "Completada", color: "success" },
};

/** El estado de una inspección; uno desconocido se muestra tal cual, en gris. */
export const estadoDeInspeccion = (estado?: string | null): EstadoVisual =>
  (estado && ESTADO_DE_INSPECCION[estado]) || { etiqueta: estado || "—", color: "default" };
