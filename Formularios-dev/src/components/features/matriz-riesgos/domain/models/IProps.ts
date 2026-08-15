/**
 * Modelos de la Matriz de Identificación y Evaluación de Riesgos
 * (formulario 1.02.P06.F01).
 *
 * TypeScript puro: sin React, sin MUI. Espejo de los DTOs del backend
 * (`BackendForm/src/modules/matriz-riesgos/dto/`).
 */

/** Los 5 niveles, en orden ascendente de gravedad. */
export const ESCALA_NIVELES = [
  "ACEPTABLE",
  "BAJA",
  "ACEPTABLE CON REVISIÓN",
  "SUSTANCIAL",
  "INACEPTABLE",
] as const;

export type NivelRiesgo = (typeof ESCALA_NIVELES)[number];

/**
 * Niveles que obligan a gestionar el riesgo mediante actividades del PGR.
 * Confirmado con Seguridad: son los que alimentan el programa anual.
 */
export const NIVELES_QUE_REQUIEREN_PGR: readonly NivelRiesgo[] = [
  "SUSTANCIAL",
  "INACEPTABLE",
];

export type EstadoMatriz =
  | "BORRADOR"
  | "EN_REVISION"
  | "APROBADA"
  | "SUPERADA";

// ────────────────────────────────────────────────────────────────────────────
// Matriz persistida
// ────────────────────────────────────────────────────────────────────────────

export interface ControlRiesgo {
  familiaControl: string;
  medida: string;
  familiaVerificador?: string;
  /** Puente hacia las actividades del PGR. */
  verificador: string;
  calidadControl: string;
  jerarquiaControl: string;
  /** Derivada de calidad × jerarquía; la calcula el servidor. */
  eficacia?: string;
}

export interface RiesgoIdentificado {
  /** Correlativo **global** de la matriz; el PGR lo referencia. */
  numero: number;
  familiaPeligro: string;
  descripcionPeligro: string;
  familiaRiesgo: string;
  descripcionRiesgo: string;
  /** Los tres únicos valores que ingresa el evaluador. */
  exposicion: number;
  posibilidad: number;
  severidad: number;
  /** Derivados; siempre los calcula el servidor. */
  probabilidad?: number;
  resultado?: number;
  nivelInicial?: NivelRiesgo;
  nivelActual?: NivelRiesgo;
  controles: ControlRiesgo[];
  incidentesOcurridos?: string;
  trazabilidad?: string;
}

/**
 * Una tarea con los riesgos que se le identificaron.
 *
 * Los cuatro campos del encabezado la **identifican**: la misma tarea con otra
 * categoría es otra actividad, igual que en el Excel. Los controles cuelgan del
 * riesgo, no de la actividad.
 */
export interface ActividadRiesgo {
  numero: number;
  areaProcesoAlcance: string;
  actividadTarea: string;
  condicion: string;
  categoria: string;
  riesgos: RiesgoIdentificado[];
}

export interface HistorialMatriz {
  usuario: string;
  fecha: string;
  estadoAnterior: string;
  estadoNuevo: string;
  observaciones?: string;
}

export interface MatrizRiesgo {
  _id: string;
  codigo: string;
  areaCodigo: string;
  areaNombre: string;
  /** El PGR es por superintendencia: de aquí depende dónde se consolida. */
  superintendencia: string;
  gerencia?: string;
  anio: number;
  version: number;
  estado: EstadoMatriz;
  elaboradoPor?: string;
  revisadoAprobadoPor?: string;
  fechaElaboracion?: string;
  fechaAprobacion?: string;
  metodologiaVersion: string;
  actividades: ActividadRiesgo[];
  historial: HistorialMatriz[];
  archivoOrigen?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** El listado llega sin las actividades, para no arrastrar cientos de subdocumentos. */
export type MatrizRiesgoResumen = Omit<
  MatrizRiesgo,
  "actividades" | "historial"
>;

// ────────────────────────────────────────────────────────────────────────────
// Análisis de importación
// ────────────────────────────────────────────────────────────────────────────

export interface Discrepancia {
  fila: number;
  campo:
    | "probabilidad"
    | "resultado"
    | "nivelInicial"
    | "nivelActual"
    | "eficacia";
  enExcel: string | number | null;
  calculado: string | number | null;
}

/**
 * Los tipos del análisis usan `null` donde los persistidos usan `undefined`:
 * `null` significa «el motor no lo pudo calcular» y hay que poder mostrarlo
 * junto al valor del Excel, mientras que en Mongo el campo simplemente no
 * existe. Por eso se omiten los campos derivados en vez de heredarlos.
 */
export interface ControlAnalizado extends Omit<ControlRiesgo, "eficacia"> {
  fila: number;
  eficacia: string | null;
  /** Lo que traía el archivo, para poder compararlo. */
  eficaciaExcel: string | null;
}

/**
 * Un riesgo tal como sale del análisis del Excel: **plano**.
 *
 * Repite el encabezado en cada fila porque así viene el archivo —las columnas
 * A–O están combinadas por riesgo, no por actividad—. El agrupado en
 * actividades lo hace el servidor recién al persistir, así que la pantalla de
 * previsualización sigue mostrando las filas como en la planilla.
 */
export interface RiesgoAnalizado
  extends Omit<
    RiesgoIdentificado,
    | "controles"
    | "nivelInicial"
    | "nivelActual"
    | "probabilidad"
    | "resultado"
  > {
  fila: number;
  areaProcesoAlcance: string;
  actividadTarea: string;
  condicion: string;
  categoria: string;
  probabilidad: number | null;
  resultado: number | null;
  nivelInicial: NivelRiesgo | null;
  nivelActual: NivelRiesgo | null;
  /** Lo que traía el archivo. */
  probabilidadExcel: number | null;
  resultadoExcel: number | null;
  nivelInicialExcel: string | null;
  nivelActualExcel: string | null;
  controles: ControlAnalizado[];
  requierePgr: boolean;
  discrepancias: Discrepancia[];
  advertencias: string[];
}

export interface CabeceraAnalizada {
  gerencia?: string;
  superintendencia?: string;
  area?: string;
  elaboradoPor?: string;
  revisadoAprobadoPor?: string;
  fechaElaboracion?: string;
  fechaAprobacion?: string;
  anio?: number;
}

export interface AreaCandidata {
  codigo?: string;
  nombre: string;
  superintendencia: string;
  coincidencia: "exacta" | "parcial";
}

export interface ResumenImportacion {
  totalRiesgos: number;
  totalControles: number;
  riesgosConDiscrepancias: number;
  totalDiscrepancias: number;
  porNivel: Record<string, number>;
  requierenPgr: number;
  categorias: string[];
}

export interface ResultadoAnalisis {
  archivo: string;
  hoja: string;
  cabecera: CabeceraAnalizada;
  riesgos: RiesgoAnalizado[];
  resumen: ResumenImportacion;
  /**
   * Áreas del maestro compatibles con la cabecera.
   *
   * Los nombres no coinciden literalmente —el Excel dice "Mantenimiento
   * Chancado" y el maestro "Chancado"—, así que hay que ofrecer un selector
   * en vez de dar por buena una coincidencia automática.
   */
  areasCandidatas?: AreaCandidata[];
  /** Impiden importar. */
  errores: string[];
  /** No impiden importar, pero hay que leerlas. */
  advertencias: string[];
}

export interface ResumenImportacionGuardada {
  matrizId: string;
  codigo: string;
  version: number;
  riesgosImportados: number;
  controlesImportados: number;
  requierenPgr: number;
  advertencias: string[];
}

/**
 * Acciones habilitadas sobre una matriz, resueltas por el servidor.
 *
 * La UI no recalcula las reglas: se limita a mostrar lo que el backend
 * habilita, y a explicar los impedimentos cuando no habilita nada.
 */
export interface AccionesMatriz {
  puedeEnviarARevision: boolean;
  puedeAprobar: boolean;
  puedeDevolver: boolean;
  /** Por qué no se puede aprobar. Vacío si sí se puede. */
  impedimentosParaAprobar: string[];
}

export interface FiltrosMatriz {
  areaCodigo?: string;
  superintendencia?: string;
  anio?: number;
  estado?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Alta y edición sin Excel
// ────────────────────────────────────────────────────────────────────────────

/**
 * Categorías de riesgo del formulario 1.02.P06.F01.
 *
 * Es el discriminador maestro: determina qué catálogos se ofrecen y qué
 * etiquetas de jerarquía de control aplican.
 */
export const CATEGORIAS = [
  "Seguridad",
  "Salud",
  "Medio Ambiente",
  "Operacional",
  "Legal",
  "DSRC/Estratégico",
  "DSRC/Operativo",
  "Rel. Gubernamentales",
  "Financiero",
] as const;

export type CategoriaRiesgo = (typeof CATEGORIAS)[number];

/** Condiciones de operación bajo las que se materializa el riesgo (col D). */
export const CONDICIONES = [
  "Normal",
  "Anormal",
  "Emergencia",
  "Social",
  "Ambiental",
  "Económico",
  "Político",
] as const;

export type CondicionRiesgo = (typeof CONDICIONES)[number];

/** Área del maestro que puede tener matriz (tiene código sincronizado). */
export interface AreaDisponible {
  codigo: string;
  nombre: string;
  superintendencia: string;
}

/** Opciones del formulario para una categoría de riesgo. */
export interface OpcionesDeCategoria {
  categoria: string;
  condiciones: string[];
  calidades: string[];
  /** De 6 (más efectiva) a 1: el orden es semántico, no alfabético. */
  jerarquias: string[];
  peligros: string[];
  riesgos: string[];
  controles: string[];
  familiasVerificador: string[];
  verificadores: string[];
  /** La categoría no tiene catálogo: hay que dejar escribir a mano. */
  sinCatalogo: boolean;
}

/**
 * Nivel calculado por **el servidor** mientras se llena el formulario.
 *
 * La evaluación se pide por API en vez de replicar la metodología acá: la
 * tabla 6×6, la de eficacia y las ramas del nivel residual —con la excepción
 * de BAJA— viven en un solo lugar. Si el navegador las copiara, una corrección
 * en el motor dejaría esta vista mintiendo hasta el siguiente despliegue.
 */
export interface PreviaRiesgo {
  probabilidad: number | null;
  resultado: number | null;
  nivelInicial: NivelRiesgo | null;
  nivelActual: NivelRiesgo | null;
  /** Eficacia de cada control, en el mismo orden que se enviaron. */
  eficacias: (string | null)[];
  /** Con este nivel el riesgo obliga a programar actividades en el PGR. */
  requierePgr: boolean;
}

/** Lo mínimo para pedir la vista previa: el resto del form puede estar a medias. */
export interface PrevisualizarRiesgoDto {
  exposicion: number;
  posibilidad: number;
  severidad: number;
  controles: { calidadControl?: string; jerarquiaControl?: string }[];
}

export interface CrearMatrizDto {
  areaCodigo: string;
  anio: number;
  gerencia?: string;
  elaboradoPor?: string;
}

/** Un control tal como lo escribe el formulario. Sin `eficacia`: la calcula el servidor. */
export type ControlDto = Omit<ControlRiesgo, "eficacia">;

/** El encabezado de una actividad. Los 4 campos juntos la identifican. */
export interface ActividadDto {
  areaProcesoAlcance: string;
  actividadTarea: string;
  condicion: string;
  categoria: string;
}

/**
 * Un riesgo con sus controles.
 *
 * Sin encabezado —es de la actividad— y sin derivados: los calcula el servidor.
 */
export interface RiesgoDto {
  familiaPeligro: string;
  descripcionPeligro: string;
  familiaRiesgo: string;
  descripcionRiesgo: string;
  exposicion: number;
  posibilidad: number;
  severidad: number;
  controles: ControlDto[];
  incidentesOcurridos?: string;
  trazabilidad?: string;
}
