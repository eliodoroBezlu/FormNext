/**
 * Qué datos exige cada estado de una tarea. Es la misma regla que aplica el
 * backend (`planes-accion/domain/requisitos-tarea.ts`): aquí sirve para decir
 * antes de guardar qué falta, y para no pedir un avance que el servidor va a
 * rechazar. Si cambia una, cambia la otra.
 *
 * TypeScript puro: se prueba con `yarn test`.
 */

export const LARGO_MINIMO_DE_ACCION = 10;

export const NOMBRE_DEL_ESTADO: Record<string, string> = {
  abierto: "Abierto",
  "en-progreso": "En progreso",
  cerrado: "Cerrado",
};

export interface TareaConRequisitos {
  familiaPeligro?: string;
  accionPropuesta?: string;
  responsableAreaCierre?: string;
  fechaHallazgo?: Date | string;
  fechaCumplimientoAcordada?: Date | string;
  fechaCumplimientoEfectiva?: Date | string;
  evidencias?: { nombre?: string; url?: string }[];
}

const vacio = (texto?: string) => !texto || texto.trim() === "";

const dia = (fecha?: Date | string): number | null => {
  if (!fecha) return null;
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return null;
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
};

/** Lo que le falta a la tarea para estar en `destino`. Vacío: puede. */
export function faltantesParaEstado(
  tarea: TareaConRequisitos,
  destino: string,
  hoy: Date = new Date(),
): string[] {
  if (destino !== "en-progreso" && destino !== "cerrado") return [];

  const faltan: string[] = [];
  if (vacio(tarea.familiaPeligro)) faltan.push("la familia de peligro");
  if (vacio(tarea.accionPropuesta)) {
    faltan.push("la acción propuesta");
  } else if (tarea.accionPropuesta!.trim().length < LARGO_MINIMO_DE_ACCION) {
    faltan.push(
      `una acción propuesta más completa (al menos ${LARGO_MINIMO_DE_ACCION} caracteres)`,
    );
  }
  if (vacio(tarea.responsableAreaCierre)) {
    faltan.push("el responsable de área para el cierre");
  }

  const hallazgo = dia(tarea.fechaHallazgo);
  const acordada = dia(tarea.fechaCumplimientoAcordada);
  if (acordada === null) {
    faltan.push("la fecha de cumplimiento acordada");
  } else if (hallazgo !== null && acordada < hallazgo) {
    faltan.push("una fecha acordada que no sea anterior al hallazgo");
  }

  if (destino === "cerrado") {
    const efectiva = dia(tarea.fechaCumplimientoEfectiva);
    if (efectiva === null) {
      faltan.push("la fecha de cumplimiento efectiva");
    } else {
      if (hallazgo !== null && efectiva < hallazgo) {
        faltan.push("una fecha efectiva que no sea anterior al hallazgo");
      }
      if (efectiva > dia(hoy)!) {
        faltan.push("una fecha efectiva que no sea futura");
      }
    }
    if (!(tarea.evidencias ?? []).some((e) => e && !vacio(e.url))) {
      faltan.push("al menos una evidencia del cierre");
    }
  }

  return faltan;
}

/** El estado al que se puede avanzar desde `actual` en el flujo normal. */
export const siguienteEstado = (actual?: string): string | null =>
  actual === "abierto" ? "en-progreso" : actual === "en-progreso" ? "cerrado" : null;

/** Cómo se llama cada campo en el historial (las claves vienen del backend). */
export const NOMBRE_DEL_CAMPO: Record<string, string> = {
  estado: "Estado",
  familiaPeligro: "Familia de peligro",
  accionPropuesta: "Acción propuesta",
  responsableAreaCierre: "Responsable de área",
  fechaCumplimientoAcordada: "Fecha acordada",
  fechaCumplimientoEfectiva: "Fecha efectiva",
  evidencias: "Evidencias",
  aprobado: "Aprobada",
};

/** El valor de un campo del historial, como se lee: estados con su nombre, vacío como «—». */
export const valorDelHistorial = (campo: string, valor: string): string => {
  if (!valor) return "—";
  if (campo === "estado") return NOMBRE_DEL_ESTADO[valor] ?? valor;
  return valor;
};
