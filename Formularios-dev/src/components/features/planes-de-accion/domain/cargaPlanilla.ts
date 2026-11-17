/**
 * La carga de la planilla de seguimiento (la misma que se descarga, editada)
 * vista desde la pantalla: qué respondió el backend y cómo se cuenta.
 *
 * Las reglas de cada fila viven en el backend
 * (`planes-accion/domain/carga-planilla.ts`); aquí solo se muestran.
 *
 * TypeScript puro: se prueba con `yarn test`.
 */

export type ResultadoDeFila =
  | "actualiza"
  | "sin-cambios"
  | "rechazada"
  | "conflicto"
  | "ignorada";

export interface CambioDeFila {
  campo: string;
  antes: string;
  despues: string;
}

export interface FilaDeCarga {
  fila: number;
  item?: number;
  tareaId?: string;
  resultado: ResultadoDeFila;
  motivo?: string;
  avisos: string[];
  cambios: CambioDeFila[];
}

export interface ResultadoCargaPlanilla {
  aplicado: boolean;
  resumen: Record<ResultadoDeFila, number>;
  filas: FilaDeCarga[];
}

/** El tope que acepta la acción de servidor (`bodySizeLimit` en next.config). */
export const TAMANO_MAXIMO_PLANILLA = 10 * 1024 * 1024;

export const RESULTADO_DE_FILA: Record<
  ResultadoDeFila,
  { etiqueta: string; color: "success" | "default" | "error" | "warning" }
> = {
  actualiza: { etiqueta: "Se actualiza", color: "success" },
  "sin-cambios": { etiqueta: "Sin cambios", color: "default" },
  rechazada: { etiqueta: "Rechazada", color: "error" },
  conflicto: { etiqueta: "Cambió en el sistema", color: "warning" },
  ignorada: { etiqueta: "No se aplica", color: "default" },
};

/** Primero lo que pide atención, después lo que se aplica, al final lo demás. */
const ORDEN: ResultadoDeFila[] = [
  "rechazada",
  "conflicto",
  "actualiza",
  "ignorada",
  "sin-cambios",
];

/** Si el archivo no puede ser la planilla, por qué; si puede, `null`. */
export function problemaDelArchivo(archivo: {
  name: string;
  size: number;
}): string | null {
  if (!/\.xlsx$/i.test(archivo.name)) {
    return "Tiene que ser la planilla .xlsx que se descarga del plan.";
  }
  if (archivo.size > TAMANO_MAXIMO_PLANILLA) {
    return "La planilla pesa más de 10 MB. Borre las fotos de la columna L (no se leen al subirla) y vuelva a intentarlo.";
  }
  return null;
}

/**
 * Las filas que vale la pena mostrar, en el orden en que se revisan. Una fila
 * sin cambios y sin nada que decir no se lista.
 */
export function filasParaRevisar(filas: FilaDeCarga[]): FilaDeCarga[] {
  return filas
    .filter((f) => f.resultado !== "sin-cambios" || f.avisos.length > 0)
    .sort(
      (a, b) =>
        ORDEN.indexOf(a.resultado) - ORDEN.indexOf(b.resultado) || a.fila - b.fila,
    );
}

const plural = (n: number, uno: string, varios: string) =>
  `${n} ${n === 1 ? uno : varios}`;

/** «3 tareas se actualizan · 1 rechazada · 1 cambió en el sistema». */
export function textoDelResumen(
  resumen: Record<ResultadoDeFila, number>,
  aplicado: boolean,
): string {
  const partes = [
    resumen.actualiza > 0 &&
      (aplicado
        ? plural(resumen.actualiza, "tarea actualizada", "tareas actualizadas")
        : plural(resumen.actualiza, "tarea se actualiza", "tareas se actualizan")),
    resumen.rechazada > 0 &&
      plural(resumen.rechazada, "fila rechazada", "filas rechazadas"),
    resumen.conflicto > 0 &&
      plural(resumen.conflicto, "cambió en el sistema", "cambiaron en el sistema"),
    resumen.ignorada > 0 &&
      plural(resumen.ignorada, "fila no se aplica", "filas no se aplican"),
    resumen["sin-cambios"] > 0 &&
      plural(resumen["sin-cambios"], "sin cambios", "sin cambios"),
  ].filter(Boolean);
  return partes.length > 0 ? partes.join(" · ") : "La planilla no trae tareas.";
}
