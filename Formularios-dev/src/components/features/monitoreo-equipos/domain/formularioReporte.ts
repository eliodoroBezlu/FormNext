/**
 * Los valores del formulario del reporte y su traducción al backend y desde él.
 *
 * El formulario trabaja con texto (un campo numérico vacío es `""`, no `0`), y
 * el backend con números y fechas. Esta traducción vive aquí, sin React, para
 * poder probarla.
 *
 * TypeScript «borrable» (sin enums; solo imports de tipos): sus pruebas
 * corren con `yarn test`.
 */
import type {
  ImagenReporte,
  ReporteMonitoreo,
  ReportePayload,
  TareaReporte,
} from "./models/Monitoreo";

export interface TareaValores {
  descripcion: string;
  grupo_trabajo: string;
  ot: string;
  prioridad: string;
  comunicado_con: string;
  semana: string;
}

export interface ValoresReporte {
  tag: string;
  /** `aaaa-mm-dd` */
  fecha: string;
  tecnica: string;
  ot: string;
  alcance: string;
  lecturas: {
    horas: string;
    fecha_horas: string;
    temp_referencia_c: string;
    punto_referencia: string;
    instrumento: string;
    emisividad: string;
  };
  descripcion_proceso: string;
  fotos: ImagenReporte[];
  grafico: ImagenReporte | null;
  analisis: string;
  /** Objetos y no texto suelto: `useFieldArray` necesita un objeto por fila. */
  recomendaciones: { texto: string }[];
  tecnica_apoyo: string;
  resultado: string;
  tareas: TareaValores[];
}

export const TAREA_VACIA: TareaValores = {
  descripcion: "",
  grupo_trabajo: "",
  ot: "",
  prioridad: "",
  comunicado_con: "",
  semana: "",
};

const texto = (v: string | number | undefined | null): string =>
  v === undefined || v === null ? "" : String(v);

/** `2026-10-06T00:00:00.000Z` → `2026-10-06`. Las fechas del reporte son días, en UTC. */
export const soloDia = (iso?: string): string => (iso ? iso.slice(0, 10) : "");

/** Un número escrito a mano: admite coma decimal. Vacío o inválido → `undefined`. */
export function numero(escrito: string): number | undefined {
  const limpio = escrito.trim().replace(",", ".");
  if (limpio === "") return undefined;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : undefined;
}

export function valoresVacios(hoy: string): ValoresReporte {
  return {
    tag: "",
    fecha: hoy,
    tecnica: "",
    ot: "",
    alcance: "",
    lecturas: {
      horas: "",
      fecha_horas: "",
      temp_referencia_c: "",
      punto_referencia: "",
      instrumento: "",
      emisividad: "",
    },
    descripcion_proceso: "",
    fotos: [],
    grafico: null,
    analisis: "",
    recomendaciones: [],
    tecnica_apoyo: "",
    resultado: "",
    tareas: [],
  };
}

export function valoresDesdeReporte(r: ReporteMonitoreo): ValoresReporte {
  const l = r.lecturas ?? {};
  return {
    tag: r.tag,
    fecha: soloDia(r.fecha),
    tecnica: texto(r.tecnica),
    ot: texto(r.ot),
    alcance: texto(r.alcance),
    lecturas: {
      horas: texto(l.horas),
      fecha_horas: soloDia(l.fecha_horas),
      temp_referencia_c: texto(l.temp_referencia_c),
      punto_referencia: texto(l.punto_referencia),
      instrumento: texto(l.instrumento),
      emisividad: texto(l.emisividad),
    },
    descripcion_proceso: texto(r.descripcion_proceso),
    fotos: r.fotos ?? [],
    grafico: r.grafico ?? null,
    analisis: texto(r.analisis),
    recomendaciones: (r.recomendaciones ?? []).map((t) => ({ texto: t })),
    tecnica_apoyo: texto(r.tecnica_apoyo),
    resultado: texto(r.resultado),
    tareas: (r.tareas ?? []).map((t) => ({
      descripcion: texto(t.descripcion),
      grupo_trabajo: texto(t.grupo_trabajo),
      ot: texto(t.ot),
      prioridad: texto(t.prioridad),
      comunicado_con: texto(t.comunicado_con),
      semana: texto(t.semana),
    })),
  };
}

const sinVacios = <T extends object>(o: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined && v !== ""),
  ) as Partial<T>;

/**
 * Lo que se envía al guardar. Los textos van aunque estén vacíos: para el
 * backend `""` es «vaciar el campo». Las lecturas y las tareas se reemplazan
 * enteras, así que lo vacío dentro de ellas simplemente no va.
 */
export function payloadDesdeValores(v: ValoresReporte): ReportePayload {
  const l = v.lecturas;
  return {
    tag: v.tag.trim().toUpperCase(),
    fecha: v.fecha,
    tecnica: v.tecnica.trim(),
    ot: v.ot.trim(),
    alcance: v.alcance.trim(),
    lecturas: sinVacios({
      horas: numero(l.horas),
      fecha_horas: l.fecha_horas || undefined,
      temp_referencia_c: numero(l.temp_referencia_c),
      punto_referencia: l.punto_referencia.trim(),
      instrumento: l.instrumento.trim(),
      emisividad: numero(l.emisividad),
    }),
    descripcion_proceso: v.descripcion_proceso.trim(),
    fotos: v.fotos.map((f) => ({ ...f, descripcion: f.descripcion.trim() })),
    grafico: v.grafico
      ? { ...v.grafico, descripcion: v.grafico.descripcion.trim() }
      : null,
    analisis: v.analisis.trim(),
    recomendaciones: v.recomendaciones.map((r) => r.texto.trim()).filter(Boolean),
    tecnica_apoyo: v.tecnica_apoyo.trim(),
    resultado: v.resultado.trim(),
    tareas: v.tareas.map(
      (t) => ({ ...sinVacios(t), descripcion: t.descripcion.trim() }) as TareaReporte,
    ),
  };
}

export interface Faltante {
  /** Ruta del campo en el formulario, para marcarlo y llevar el foco. */
  campo: string;
  mensaje: string;
}

const vacio = (t: string) => t.trim() === "";

/**
 * Lo que falta para enviar a revisión. **Es la misma regla que aplica el
 * backend** (`faltantesParaEnviar` en su `domain/reporte.ts`): aquí solo sirve
 * para marcar los campos antes de ir al servidor, que vuelve a revisarlo.
 */
export function faltantesParaEnviar(v: ValoresReporte): Faltante[] {
  const faltan: Faltante[] = [];
  if (vacio(v.tecnica)) faltan.push({ campo: "tecnica", mensaje: "Elija la técnica" });
  if (vacio(v.alcance)) faltan.push({ campo: "alcance", mensaje: "Escriba el alcance" });
  if (vacio(v.analisis)) {
    faltan.push({ campo: "analisis", mensaje: "Escriba el análisis y diagnóstico" });
  }
  if (vacio(v.resultado)) {
    faltan.push({ campo: "resultado", mensaje: "Elija el resultado del análisis" });
  }

  const hayRecomendaciones = v.recomendaciones.some((r) => !vacio(r.texto));
  if (hayRecomendaciones) {
    if (v.tareas.length === 0) {
      faltan.push({
        campo: "tareas",
        mensaje: "Hay recomendaciones: agregue al menos una tarea",
      });
    }
    v.tareas.forEach((t, i) => {
      if (vacio(t.descripcion)) {
        faltan.push({ campo: `tareas.${i}.descripcion`, mensaje: "Describa la tarea" });
      }
      if (vacio(t.comunicado_con)) {
        faltan.push({
          campo: `tareas.${i}.comunicado_con`,
          mensaje: "Indique con quién se comunicó o coordinó",
        });
      }
    });
  }
  return faltan;
}
