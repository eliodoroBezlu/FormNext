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
  AntecedentesReporte,
  EstructuraDeMedicion,
  ImagenReporte,
  PiezaDelReporte,
  ReporteMonitoreo,
  ReportePayload,
  TareaReporte,
  ValoresDeMedicion,
} from "./models/Monitoreo";

/** Las cuatro piezas de desgaste del formato (las mismas que el backend). */
export const PIEZAS_BOMBA = ["Voluta", "Impulsor", "Disco prensa", "Disco succión"] as const;

/** Emisividad de la cámara FLIR: el valor de casi siempre, editable. */
export const EMISIVIDAD_POR_DEFECTO = "0,95";

/** Una fila de la tabla de piezas del reporte, como texto. */
export interface PiezaValores {
  pieza: string;
  /** `aaaa-mm-dd` */
  fecha_instalacion: string;
  proveedor: string;
  condicion_inicial: string;
  material: string;
  /** Vacío: se calcula con las horas del día. */
  horas_trabajo: string;
}

export interface TareaValores {
  descripcion: string;
  grupo_trabajo: string;
  ot: string;
  prioridad: string;
  comunicado_con: string;
  semana: string;
}

/** La grilla de espesores como texto: `[pieza][zona][anillo][punto]`, `""` sin medir. */
export type GrillaDeTexto = string[][][][];

export interface ValoresReporte {
  tag: string;
  /** `aaaa-mm-dd` */
  fecha: string;
  tecnica: string;
  ot: string;
  alcance: string;
  /** Enlace al informe anterior (SharePoint, carpeta compartida…). */
  informe_anterior_url: string;
  /** ANTECEDENTES en texto libre (reportes con medición de espesores). */
  antecedentes_texto: string;
  piezas: PiezaValores[];
  lecturas: {
    horas: string;
    fecha_horas: string;
    temp_referencia_c: string;
    punto_referencia: string;
    instrumento: string;
    emisividad: string;
    velocidad_ms: string;
    frecuencia_mhz: string;
  };
  descripcion_proceso: string;
  /** Vacía si el reporte no tiene plantilla de medición. */
  medicion_valores: GrillaDeTexto;
  fotos: ImagenReporte[];
  grafico: ImagenReporte | null;
  anexos: ImagenReporte[];
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

/** Para el N° de OT y las horas: lo que no es dígito no entra. */
export const soloDigitos = (escrito: string): string => escrito.replace(/\D/g, "");

const piezaVacia = (pieza: string): PiezaValores => ({
  pieza,
  fecha_instalacion: "",
  proveedor: "",
  condicion_inicial: "",
  material: "",
  horas_trabajo: "",
});

/**
 * Las cuatro piezas con lo que la bomba ya tiene cargado. Las horas quedan
 * vacías: así se siguen calculando con las horas del día.
 */
export function piezasDesdeAntecedentes(a: AntecedentesReporte | null): PiezaValores[] {
  return PIEZAS_BOMBA.map((pieza) => {
    const c = a?.componentes.find((x) => x.pieza === pieza);
    return {
      ...piezaVacia(pieza),
      fecha_instalacion: soloDia(c?.fecha_instalacion),
      proveedor: texto(c?.proveedor),
      condicion_inicial: texto(c?.condicion_inicial),
      material: texto(c?.material),
    };
  });
}

/** ¿El analista todavía no escribió nada en la tabla de piezas? */
export const piezasSinTocar = (piezas: PiezaValores[]): boolean =>
  piezas.every(
    (p) =>
      !p.fecha_instalacion && !p.proveedor && !p.condicion_inicial && !p.material && !p.horas_trabajo,
  );

/** `2026-10-06T00:00:00.000Z` → `2026-10-06`. Las fechas del reporte son días, en UTC. */
export const soloDia = (iso?: string): string => (iso ? iso.slice(0, 10) : "");

/** Un número con coma decimal, como se escribe aquí: 5.7 → «5,7». */
const conComa = (n: number): string => String(n).replace(".", ",");

/** La grilla para el formulario: vacía, o con los valores que ya tiene el reporte. */
export function grillaDeTexto(e: EstructuraDeMedicion, valores?: ValoresDeMedicion): GrillaDeTexto {
  return e.piezas.map((p, i) =>
    p.zonas.map((z, j) =>
      Array.from({ length: z.anillos }, (_, k) =>
        Array.from({ length: z.puntos }, (_, n) => {
          const v = valores?.[i]?.[j]?.[k]?.[n];
          return typeof v === "number" ? conComa(v) : "";
        }),
      ),
    ),
  );
}

/**
 * ¿La grilla del formulario tiene la forma de esta plantilla? Si la tiene, lo
 * escrito se conserva aunque la plantilla vuelva a llegar del servidor.
 */
export const grillaCalza = (g: GrillaDeTexto, e: EstructuraDeMedicion): boolean =>
  g.length === e.piezas.length &&
  e.piezas.every(
    (p, i) =>
      g[i]?.length === p.zonas.length &&
      p.zonas.every(
        (z, j) =>
          g[i][j]?.length === z.anillos && g[i][j].every((fila) => fila.length === z.puntos),
      ),
  );

/** Para enviar: cada celda como número, o `null` si está vacía o no es un número. */
export const valoresDeGrilla = (g: GrillaDeTexto): ValoresDeMedicion =>
  g.map((zonas) => zonas.map((filas) => filas.map((fila) => fila.map((t) => numero(t) ?? null))));

/** Para la grilla: dígitos y una sola coma o punto decimal. */
export const soloEspesor = (escrito: string): string => {
  const limpio = escrito.replace(/[^\d.,]/g, "").replace(/\./g, ",");
  const [entero, ...resto] = limpio.split(",");
  return resto.length ? `${entero},${resto.join("")}` : entero;
};

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
    informe_anterior_url: "",
    antecedentes_texto: "",
    piezas: PIEZAS_BOMBA.map(piezaVacia),
    lecturas: {
      horas: "",
      fecha_horas: "",
      temp_referencia_c: "",
      punto_referencia: "",
      instrumento: "",
      emisividad: EMISIVIDAD_POR_DEFECTO,
      velocidad_ms: "",
      frecuencia_mhz: "",
    },
    descripcion_proceso: "",
    medicion_valores: [],
    fotos: [],
    grafico: null,
    anexos: [],
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
    informe_anterior_url: texto(r.informe_anterior_url),
    antecedentes_texto: texto(r.antecedentes_texto),
    // Lo que el reporte guardó; si es anterior a la tabla editable, lo que mostraba.
    piezas: r.piezas?.length
      ? PIEZAS_BOMBA.map((pieza) => {
          const p = r.piezas?.find((x) => x.pieza === pieza);
          return {
            pieza,
            fecha_instalacion: soloDia(p?.fecha_instalacion),
            proveedor: texto(p?.proveedor),
            condicion_inicial: texto(p?.condicion_inicial),
            material: texto(p?.material),
            horas_trabajo: texto(p?.horas_trabajo),
          };
        })
      : piezasDesdeAntecedentes(r.antecedentes),
    lecturas: {
      horas: texto(l.horas),
      fecha_horas: soloDia(l.fecha_horas),
      temp_referencia_c: texto(l.temp_referencia_c),
      punto_referencia: texto(l.punto_referencia),
      instrumento: texto(l.instrumento),
      emisividad: texto(l.emisividad),
      velocidad_ms: texto(l.velocidad_ms),
      frecuencia_mhz: texto(l.frecuencia_mhz),
    },
    descripcion_proceso: texto(r.descripcion_proceso),
    medicion_valores: r.medicion
      ? grillaDeTexto(r.medicion.estructura, r.medicion.valores)
      : [],
    fotos: r.fotos ?? [],
    grafico: r.grafico ?? null,
    anexos: r.anexos ?? [],
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
 *
 * Con medición de espesores van los valores de la grilla y no la emisividad
 * (es de la cámara térmica).
 */
export function payloadDesdeValores(v: ValoresReporte, conMedicion = false): ReportePayload {
  const l = v.lecturas;
  return {
    tag: v.tag.trim().toUpperCase(),
    fecha: v.fecha,
    tecnica: v.tecnica.trim(),
    ot: soloDigitos(v.ot),
    alcance: v.alcance.trim(),
    informe_anterior_url: v.informe_anterior_url.trim(),
    antecedentes_texto: v.antecedentes_texto.trim(),
    piezas: v.piezas.map(
      (p) =>
        ({
          ...sinVacios({
            fecha_instalacion: p.fecha_instalacion || undefined,
            proveedor: p.proveedor.trim(),
            condicion_inicial: p.condicion_inicial.trim(),
            material: p.material.trim(),
            horas_trabajo: numero(p.horas_trabajo),
          }),
          pieza: p.pieza,
        }) as PiezaDelReporte,
    ),
    lecturas: sinVacios({
      horas: numero(l.horas),
      fecha_horas: l.fecha_horas || undefined,
      temp_referencia_c: numero(l.temp_referencia_c),
      punto_referencia: l.punto_referencia.trim(),
      instrumento: l.instrumento.trim(),
      emisividad: conMedicion ? undefined : numero(l.emisividad),
      velocidad_ms: numero(l.velocidad_ms),
      frecuencia_mhz: numero(l.frecuencia_mhz),
    }),
    descripcion_proceso: v.descripcion_proceso.trim(),
    ...(conMedicion && { medicion_valores: valoresDeGrilla(v.medicion_valores) }),
    fotos: v.fotos.map((f) => ({ ...f, descripcion: f.descripcion.trim() })),
    grafico: v.grafico
      ? { ...v.grafico, descripcion: v.grafico.descripcion.trim() }
      : null,
    anexos: v.anexos.map((f) => ({ ...f, descripcion: f.descripcion.trim() })),
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
 *
 * Con medición de espesores se pide al menos un espesor en vez de la
 * emisividad.
 */
export function faltantesParaEnviar(v: ValoresReporte, conMedicion = false): Faltante[] {
  const faltan: Faltante[] = [];
  if (vacio(v.tecnica)) faltan.push({ campo: "tecnica", mensaje: "Elija la técnica" });
  if (vacio(v.alcance)) faltan.push({ campo: "alcance", mensaje: "Escriba el alcance" });
  if (conMedicion) {
    if (!v.medicion_valores.flat(3).some((t) => numero(t) !== undefined)) {
      faltan.push({ campo: "medicion_valores", mensaje: "Cargue las mediciones de espesores" });
    }
  } else if (numero(v.lecturas.emisividad) === undefined) {
    faltan.push({ campo: "lecturas.emisividad", mensaje: "Escriba la emisividad (p. ej. 0,95)" });
  }
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
