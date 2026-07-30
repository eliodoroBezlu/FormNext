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

export interface ActividadPgr {
  _id: string;
  descripcion: string;
  responsable: string;
  verificador: string;
  recurso: string;
  entregable: string;

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

  supervisor?: string;
  responsable?: string;
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
  responsable: string;
  verificador: string;
  recurso: string;
  entregable: string;
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
  supervisor?: string;
  responsable?: string;
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
