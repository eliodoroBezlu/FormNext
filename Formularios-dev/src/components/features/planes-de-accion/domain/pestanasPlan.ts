/**
 * En qué pestaña de «Planes de acción» cae cada plan.
 *
 * Vive aquí, y no repetida en las pestañas y en el hook, para que el número
 * del contador y la lista que se muestra nunca digan cosas distintas.
 *
 * TypeScript puro: se prueba con `yarn test`.
 */

export type TabValue =
  | "abierto"
  | "en-progreso"
  | "cerrado"
  | "aprobado"
  | "sin-observaciones";

/** Lo mínimo del plan que decide su pestaña. */
export interface PlanConPestana {
  estado: string;
  sinObservaciones?: boolean;
  tareas: { aprobado?: boolean }[];
}

/**
 * Un plan «sin observaciones» va solo a su pestaña: nace cerrado, pero nadie
 * cerró nada, y contarlo en «Cerradas» inflaría la tasa de cierre.
 */
export function estaEnPestana(plan: PlanConPestana, pestana: TabValue): boolean {
  if (plan.sinObservaciones) return pestana === "sin-observaciones";
  if (pestana === "sin-observaciones") return false;
  if (pestana === "aprobado") {
    return plan.tareas.length > 0 && plan.tareas.every((t) => t.aprobado === true);
  }
  return plan.estado === pestana;
}

/** Los planes que cuentan para el resumen y la tasa de cierre. */
export const conTareasQueSeguir = <T extends PlanConPestana>(planes: readonly T[]): T[] =>
  planes.filter((p) => !p.sinObservaciones);

const claveDeCampo = (etiqueta: string) =>
  etiqueta
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/:\s*$/, "")
    .trim()
    .toLowerCase();

/** Cómo llaman al área las plantillas, en orden de preferencia. */
const CAMPOS_DE_AREA = ["area", "area fisica", "lugar"];

/**
 * El área de una inspección. Cada plantilla nombra el campo a su manera
 * («Área», «Area Física», «Área Física:», «Lugar»): se busca sin tildes ni
 * los dos puntos del final, igual que al generar el plan en el backend.
 */
export function areaDeLaInspeccion(
  verificationList?: Record<string, string> | null,
): string {
  const porClave = new Map(
    Object.entries(verificationList ?? {}).map(([k, v]) => [claveDeCampo(k), v]),
  );
  for (const campo of CAMPOS_DE_AREA) {
    const valor = nombreDeArea(porClave.get(campo));
    if (valor) return valor;
  }
  return "";
}

/** El área como la escribió el inspector, sin espacios de más: «Chancado » es «Chancado». */
export const nombreDeArea = (area?: string | null): string => String(area ?? "").trim();
