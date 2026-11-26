/**
 * Modelos del monitoreo de equipos (formato 2.03.P01.R09), tal como los
 * devuelve el backend (`BackendForm/src/modules/monitoreo-equipos`).
 *
 * Las fechas llegan como texto ISO: una Server Action serializa a JSON.
 */

export type EstadoReporte = "borrador" | "pendiente_revision" | "emitido";

export const ETIQUETA_ESTADO: Record<EstadoReporte, string> = {
  borrador: "Borrador",
  pendiente_revision: "Pendiente de revisión",
  emitido: "Emitido",
};

export type TipoCatalogo =
  | "tecnica"
  | "grupo_trabajo"
  | "prioridad_jde"
  | "severidad"
  | "fabricante"
  | "proveedor"
  | "condicion_inicial"
  | "tipo_intervencion"
  | "instrumento"
  | "punto_referencia";

export interface EntradaCatalogo {
  _id: string;
  tipo: TipoCatalogo;
  valor: string;
  codigo?: string;
  color?: string;
  orden: number;
  activo?: boolean;
}

/** Los catálogos activos agrupados por tipo, listos para los selectores. */
export type Catalogos = Record<TipoCatalogo, EntradaCatalogo[]>;

export interface LecturasReporte {
  horas?: number;
  fecha_horas?: string;
  temp_referencia_c?: number;
  punto_referencia?: string;
  instrumento?: string;
  emisividad?: number;
  /** Ultrasonido: velocidad del sonido en m/s (5920). */
  velocidad_ms?: number;
  /** Ultrasonido: frecuencia del sensor en MHz (7,5). */
  frecuencia_mhz?: number;
}

export interface ImagenReporte {
  archivo: string;
  descripcion: string;
  referencia: boolean;
  /** Medidas en píxeles: fijan la caja común de las fotos (`proporcionDeCaja`). */
  ancho?: number;
  alto?: number;
}

export interface TareaReporte {
  descripcion: string;
  grupo_trabajo?: string;
  ot?: string;
  prioridad?: string;
  comunicado_con?: string;
  semana?: string;
}

export interface FichaAntecedentes {
  fabricante?: string;
  modelo?: string;
  /** El alcance de la bomba: el reporte nuevo arranca con él. */
  alcance?: string;
  /** No sale en el reporte: queda para leer las horas de PI cuando se pueda. */
  tag_pi?: string;
  ot_modelo?: string;
  frecuencia_dias?: number;
}

/**
 * Una pieza como la completa el analista en el reporte. Lo vacío toma el dato
 * de la ficha de la bomba; las horas vacías se calculan.
 */
export interface PiezaDelReporte {
  pieza: string;
  fecha_instalacion?: string;
  proveedor?: string;
  condicion_inicial?: string;
  material?: string;
  horas_trabajo?: number;
}

export interface PiezaAntecedentes {
  pieza: string;
  proveedor?: string;
  material?: string;
  dureza_hb?: number;
  condicion_inicial?: string;
  espesor_nominal_mm?: number;
  espesor_precaucion_mm?: number;
  fecha_instalacion?: string;
  horas_trabajo?: number;
}

export interface IntervencionAntecedentes {
  fecha: string;
  tipo?: string;
  ot?: string;
  horas?: number;
  piezas: string[];
}

// ── Medición de espesores (ultrasonido) ───────────────────────────────────

export interface ZonaDeMedicion {
  /** «Lado Oeste». Vacío cuando la pieza tiene una sola zona. */
  nombre: string;
  anillos: number;
  puntos: number;
}

export interface PiezaDeMedicion {
  nombre: string;
  zonas: ZonaDeMedicion[];
  espesor_nominal_mm?: number;
  /** Por debajo de esto el valor se marca en rojo. */
  espesor_alerta_mm?: number;
}

export interface EstructuraDeMedicion {
  titulo: string;
  piezas: PiezaDeMedicion[];
}

/** `[pieza][zona][anillo][punto]`; `null` es «no se midió». */
export type ValoresDeMedicion = (number | null)[][][][];

export interface DiagramaDeMedicion {
  archivo: string;
  descripcion: string;
  ancho?: number;
  alto?: number;
}

/** La grilla con que se mide un tag con una técnica. */
export interface PlantillaMedicion extends EstructuraDeMedicion {
  _id: string;
  tag: string;
  tecnica: string;
  diagramas: DiagramaDeMedicion[];
  actualizadoPor?: string;
  updatedAt?: string;
}

/** Lo que se envía al crear o editar una plantilla de medición. */
export interface PlantillaMedicionPayload extends EstructuraDeMedicion {
  tag: string;
  tecnica: string;
  diagramas: DiagramaDeMedicion[];
}

/** La medición de un reporte: copia de la grilla y los diagramas, más los valores. */
export interface MedicionDelReporte {
  plantilla_id?: string;
  estructura: EstructuraDeMedicion;
  diagramas: DiagramaDeMedicion[];
  valores: ValoresDeMedicion;
}

export interface MinimoDeZona {
  pieza: string;
  zona: string;
  minimo?: number;
}

export interface AntecedentesReporte {
  tomados_en: string;
  ficha: FichaAntecedentes;
  componentes: PiezaAntecedentes[];
  ultima_intervencion?: IntervencionAntecedentes;
  informe_anterior?: { id: string; codigo_interno?: string; fecha: string };
  /** Los mínimos por zona de la última medición emitida del tag. */
  medicion_anterior?: {
    id: string;
    codigo_interno?: string;
    fecha: string;
    minimos: MinimoDeZona[];
  };
}

export interface MovimientoReporte {
  accion: "creado" | "enviado" | "devuelto" | "emitido";
  por: string;
  en: string;
  motivo?: string;
}

export interface ReporteMonitoreo {
  _id: string;
  tipo_equipo: string;
  tag: string;
  fecha: string;
  tecnica?: string;
  ot?: string;
  alcance?: string;
  /** Enlace al informe anterior, pegado por el analista. */
  informe_anterior_url?: string;
  /** ANTECEDENTES en texto (reportes con medición de espesores). */
  antecedentes_texto?: string;
  piezas?: PiezaDelReporte[];
  lecturas: LecturasReporte;
  medicion?: MedicionDelReporte;
  descripcion_proceso?: string;
  fotos: ImagenReporte[];
  grafico?: ImagenReporte;
  /** Imágenes que no entran en la recopilación: van en ANEXOS. */
  anexos?: ImagenReporte[];
  fotos_por_fila: number;
  analisis?: string;
  recomendaciones: string[];
  tecnica_apoyo?: string;
  resultado?: string;
  tareas: TareaReporte[];
  antecedentes: AntecedentesReporte;
  estado: EstadoReporte;
  elaboradoPor: string;
  revisadoPor?: string;
  emitidoEn?: string;
  codigo_interno?: string;
  historial: MovimientoReporte[];
  createdAt?: string;
  updatedAt?: string;
}

/** Lo que se envía al guardar: el servidor arma antecedentes, estado y código. */
export interface ReportePayload {
  tag?: string;
  fecha?: string;
  tecnica?: string;
  ot?: string;
  alcance?: string;
  informe_anterior_url?: string;
  antecedentes_texto?: string;
  piezas?: PiezaDelReporte[];
  lecturas?: LecturasReporte;
  medicion_valores?: ValoresDeMedicion;
  descripcion_proceso?: string;
  fotos?: ImagenReporte[];
  /** `null` quita el gráfico. */
  grafico?: ImagenReporte | null;
  anexos?: ImagenReporte[];
  analisis?: string;
  recomendaciones?: string[];
  tecnica_apoyo?: string;
  resultado?: string;
  tareas?: TareaReporte[];
}

export interface FiltrosReportes {
  tag?: string;
  estado?: EstadoReporte | "";
  tecnica?: string;
  resultado?: string;
  desde?: string;
  hasta?: string;
}

export interface Prellenado {
  /** Falta si el tag no está en el inventario (se habilitó por su plantilla). */
  equipo_id?: string;
  tag: string;
  antecedentes: AntecedentesReporte;
  /** La grilla del tag con esa técnica, si la tiene. */
  plantilla_medicion: PlantillaMedicion | null;
}

/** Quien puede figurar en «Comunicado / coordinado con» de una tarea. */
export interface Coordinador {
  nombre: string;
  puesto: string;
  rol: "supervisor" | "superintendente";
}

export type Alerta = "vencida" | "proxima" | "al_dia" | "sin_datos";

/** Cuándo toca medir, según el último reporte emitido. */
export interface SituacionBomba {
  ultimo_reporte?: {
    id: string;
    codigo_interno?: string;
    fecha: string;
    resultado?: string;
  };
  /** Último reporte emitido + la frecuencia de su OT modelo. */
  proximo_monitoreo?: string;
  dias_para_monitoreo?: number;
  alerta_monitoreo: Alerta;
  alerta: Alerta;
}

export interface EquipoBomba {
  _id: string;
  codigo: string;
  marca?: string;
  modelo?: string;
  especificaciones?: Record<string, string | number>;
}

export interface BombaResumen {
  equipo: EquipoBomba;
  componentes: PiezaAntecedentes[];
  ultimaIntervencion?: IntervencionAntecedentes;
  situacion: SituacionBomba;
}

export interface ComponenteBomba extends PiezaAntecedentes {
  _id: string;
  vigente: boolean;
  retirado_en?: string;
}

/** Lo que el historial muestra de cada reporte (sin los antecedentes completos). */
export interface ReporteDeBomba {
  _id: string;
  fecha: string;
  tecnica?: string;
  resultado?: string;
  estado: EstadoReporte;
  codigo_interno?: string;
  elaboradoPor: string;
  revisadoPor?: string;
}

export interface FichaBomba {
  equipo: EquipoBomba;
  componentes: ComponenteBomba[];
  intervenciones: (IntervencionAntecedentes & { _id: string; nota?: string })[];
  reportes: ReporteDeBomba[];
  situacion: SituacionBomba;
}

export interface ProblemaDePlanilla {
  hoja: string;
  fila?: number;
  mensaje: string;
  grave: boolean;
}

export interface ResultadoImportacion {
  aplicado: boolean;
  problemas: ProblemaDePlanilla[];
  bombas: { nuevas: string[]; actualizadas: string[] };
  componentes: { nuevos: number; reemplazados: number; actualizados: number };
  intervenciones: { nuevas: number; actualizadas: number };
  catalogosAgregados: Partial<Record<TipoCatalogo, string[]>>;
}

export interface Correlativo {
  _id: string;
  tecnica_codigo: string;
  anio: number;
  ultimo: number;
}

export interface PlantillaMonitoreo {
  tipo_equipo: string;
  fotos_por_fila: number;
}

export type UsoDeImagen = "foto" | "grafico";

export interface ImagenSubida {
  archivo: string;
  ancho: number;
  alto: number;
}

/**
 * Resultado de una Server Action de este módulo. Se devuelve en vez de
 * lanzar: en producción Next borra el mensaje de un error lanzado en el
 * servidor, y aquí el mensaje es justo lo que el usuario necesita leer
 * («Falta: el alcance»).
 */
export type Resultado<T> = { ok: true; datos: T } | { ok: false; errores: string[] };
