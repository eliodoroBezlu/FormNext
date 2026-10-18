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
  servicio?: string;
  tmef_hrs?: number;
  tag_pi?: string;
  pares?: string;
  ot_modelo?: string;
  frecuencia_dias?: number;
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

export interface AntecedentesReporte {
  tomados_en: string;
  ficha: FichaAntecedentes;
  componentes: PiezaAntecedentes[];
  ultima_intervencion?: IntervencionAntecedentes;
  informe_anterior?: { id: string; codigo_interno?: string; fecha: string };
  horas_restantes?: number;
  fecha_tentativa?: string;
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
  lecturas: LecturasReporte;
  descripcion_proceso?: string;
  fotos: ImagenReporte[];
  grafico?: ImagenReporte;
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
  lecturas?: LecturasReporte;
  descripcion_proceso?: string;
  fotos?: ImagenReporte[];
  /** `null` quita el gráfico. */
  grafico?: ImagenReporte | null;
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
  equipo_id: string;
  tag: string;
  antecedentes: AntecedentesReporte;
}

export type Alerta = "vencida" | "proxima" | "al_dia" | "sin_datos";

/** Cuándo toca medir y cuándo intervenir, según el último reporte emitido. */
export interface SituacionBomba {
  ultimo_reporte?: {
    id: string;
    codigo_interno?: string;
    fecha: string;
    resultado?: string;
    fecha_tentativa?: string;
    horas_restantes?: number;
  };
  /** Último reporte emitido + la frecuencia de su OT modelo. */
  proximo_monitoreo?: string;
  dias_para_monitoreo?: number;
  dias_para_intervencion?: number;
  alerta_monitoreo: Alerta;
  alerta_intervencion: Alerta;
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
  antecedentes?: { fecha_tentativa?: string; horas_restantes?: number };
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
