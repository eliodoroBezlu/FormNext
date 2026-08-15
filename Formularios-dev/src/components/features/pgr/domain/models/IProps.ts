// Modelos de dominio puros del módulo PGR (Plan de Gestión de Riesgos).
// TypeScript puro — sin React, sin MUI. Mirrors backend `pgr.schema.ts` y sus DTOs.

export enum PgrEstado {
  BORRADOR = "BORRADOR",
  EN_REVISION = "EN_REVISION",
  APROBADO = "APROBADO",
  CORREGIR = "CORREGIR",
}

export enum ActividadEstado {
  PENDIENTE = "PENDIENTE",
  APROBADO = "APROBADO",
  RECHAZADO = "RECHAZADO",
}

/**
 * Programación y ejecución de una actividad en un mes.
 *
 * Refleja la planilla oficial: `Prog.` es una celda combinada (un número por
 * mes) y `Real` son tres celdas cuyo color indica *cuándo* se ejecutó:
 * rojo = con retraso, blanco = a tiempo, verde = adelantado.
 * Solo «a tiempo» y «adelantado» cuentan para eficiencia.
 */
export interface ProgramacionMes {
  mes: number; // 1-12
  programado: number;
  realMesPasado: number; // rojo   — con retraso
  realDelMes: number; // blanco — a tiempo
  realMesAdelantado: number; // verde  — adelantado
}

/** Indicadores de una ventana (periodo o gestión), calculados en el backend. */
export interface IndicadoresVentana {
  programado: number;
  eficacia: number;
  eficiencia: number;
  porcentajeEficacia: number | null;
  porcentajeEficiencia: number | null;
}

export interface IndicadoresPgr {
  periodo: IndicadoresVentana;
  gestion: IndicadoresVentana;
}

/** Las 3 sub-columnas de la fila `Real` del PGR en Excel. */
export type CategoriaEjecucionKey =
  | "realMesPasado"
  | "realDelMes"
  | "realMesAdelantado";

/**
 * Quién responde por una actividad: un **grupo** que se resuelve contra el
 * roster, o un **trabajador** suelto cuando no hay grupo que lo cubra.
 */
export interface ResponsableActividad {
  tipo: "grupo" | "trabajador";
  /** `_id` del grupo, o `ci` del trabajador. */
  referencia: string;
  nombre: string;
}

/** Cantidad y unidad. Hoy la única unidad en uso es `HH` (horas hombre). */
export interface RecursoActividad {
  cantidad: number;
  /** Código del catálogo de unidades, no una constante del código. */
  unidad: string;
}

export interface ActividadPgr {
  _id: string;
  descripcion: string;
  /**
   * Áreas de la superintendencia a las que aplica. **Vacío = todas.**
   * Es un dato interno para acotar y filtrar; no viaja al Excel, donde el
   * alcance se sigue leyendo del texto de la actividad.
   */
  areas?: string[];
  responsables?: ResponsableActividad[];
  verificador: string;
  recursos?: RecursoActividad[];
  entregables?: string[];

  /** Fuente de verdad de la programación. */
  programacion?: ProgramacionMes[];
  historialTrazabilidad?: string;

  /** @deprecated Se derivan de `programacion[]`. */
  frecuencia?: string;
  /** @deprecated Se derivan de `programacion[]`. */
  mesesProgramados?: string[];

  estadoAprobacion?: ActividadEstado;
  motivoRechazo?: string;
  semaforoTiempo?: string;
  fechaEjecucion?: string;
  observaciones?: string;
  evidencias?: string[];

  /** Calculados por el backend; no se persisten. */
  indicadores?: IndicadoresPgr;
}

export interface Pgr {
  _id: string;
  empresa: string;
  vicepresidencia: string;
  gerencia: string;
  superintendencia: string;
  gestion: string;
  areas?: string[];
  estado: PgrEstado;
  codigoAutogenerado: string;
  aprobadoPor?: string;
  fechaAprobacion?: string;
  activo?: boolean;
  actividades: ActividadPgr[];
  createdAt?: string;
  updatedAt?: string;

  /** Código del documento origen (`V04-G02-...`) cuando vino de un import. */
  codigoExterno?: string;

  /** Mes de corte del periodo (`$J$4` del Excel). */
  mesCorte?: number;
  /** Ventana de la gestión completa, en meses (`$W$4`). */
  ventanaGestion?: number;

  /** Calculados por el backend; no se persisten. */
  indicadores?: IndicadoresPgr;
}

// ==========================================
// DTOs — mirrors backend `src/modules/pgr/dto/*`
// ==========================================

export interface ProgramacionMesDto {
  mes: number;
  programado: number;
  realMesPasado?: number;
  realDelMes?: number;
  realMesAdelantado?: number;
}

export interface CreateActividadDto {
  _id?: string;
  descripcion: string;
  areas?: string[];
  responsables?: ResponsableActividad[];
  verificador: string;
  recursos?: RecursoActividad[];
  entregables?: string[];
  programacion?: ProgramacionMesDto[];
  historialTrazabilidad?: string;
  evidencias?: string[];
  estadoAprobacion?: string;
  motivoRechazo?: string;
  /** @deprecated Se deriva de `programacion[]`. */
  frecuencia?: string;
  /** @deprecated Se deriva de `programacion[]`. */
  mesesProgramados?: string[];
}

export interface CreatePgrDto {
  empresa: string;
  vicepresidencia: string;
  gerencia: string;
  superintendencia: string;
  gestion: string;
  estado?: PgrEstado;
  areas?: string[];
  // `supervisor` y `responsable` se retiraron: la responsabilidad se declara
  // por actividad, no en la cabecera del plan.
  codigoExterno?: string;
  mesCorte?: number;
  ventanaGestion?: number;
  actividades?: CreateActividadDto[];
  activo?: boolean;
}

export type UpdatePgrDto = Partial<CreatePgrDto>;

export interface AprobarActividadItem {
  _id: string;
  estadoAprobacion: ActividadEstado;
  motivoRechazo?: string;
}

export interface AprobarPgrDto {
  aprobadoPor: string;
  actividadesAprobacion: AprobarActividadItem[];
}

export interface SeguimientoPgrDto {
  fechaEjecucion?: string;
  observaciones?: string;
  semaforoTiempo?: string;
  evidencias?: string[];
  /** Programación actualizada con las cantidades ejecutadas por categoría. */
  programacion?: ProgramacionMesDto[];
}

export interface SeguimientoBatchItem extends SeguimientoPgrDto {
  actividadId: string;
}

export interface SeguimientoBatchDto {
  seguimientos: SeguimientoBatchItem[];
}

// ==========================================
// Estado local (client-side) usado por los hooks de la feature
// ==========================================

export interface AprobacionRespuesta {
  estado: ActividadEstado;
  motivo?: string;
}

export interface SeguimientoActividadState {
  semaforoTiempo?: string;
  fechaEjecucion?: string;
  observaciones?: string;
  evidencias?: string[];
  /** Cantidades ejecutadas por mes y categoría, editadas en la vista. */
  programacion?: ProgramacionMes[];
}

export interface PendingFile {
  file: File;
  previewUrl: string;
  isImage: boolean;
  name: string;
}

export interface PgrFilters {
  codigo: string;
  empresa: string;
  estado: string;
  activo: string;
}

// ==========================================
// Consolidación desde matrices de riesgo
// ==========================================

/** Riesgo de la matriz que quedó cubierto por una actividad del PGR. */
export interface RiesgoCubierto {
  matrizCodigo: string;
  matrizVersion: number;
  areaCodigo: string;
  areaNombre: string;
  riesgoNumero: number;
  descripcionRiesgo: string;
  categoria?: string;
  nivelActual: string;
}

/** Qué le pasaría a la actividad si se consolida. */
export type EfectoConsolidacion =
  | "nueva"
  | "acumula"
  | "sube-nivel"
  | "sin-cambios";

export interface ActividadPropuesta {
  clave: string;
  verificador: string;
  /** Sale de la medida de control; es editable después de consolidar. */
  descripcion: string;
  riesgosCubiertos: RiesgoCubierto[];
  nivelRiesgoMaximo: string;
  areas: string[];
  efecto: EfectoConsolidacion;
}

export interface VistaPreviaConsolidacion {
  superintendencia: string;
  gestion: string;
  pgrId?: string;
  pgrCodigo?: string;
  areasConMatriz: { areaCodigo: string; areaNombre: string; matriz: string }[];
  areasYaConsolidadas: string[];
  propuestas: ActividadPropuesta[];
  advertencias: string[];
}

export interface ResultadoConsolidacion {
  pgrId: string;
  actividadesNuevas: number;
  actividadesActualizadas: number;
  areasConsolidadas: string[];
  advertencias: string[];
}
