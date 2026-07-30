export interface TareaObservacion {
  _id?: string;
  numeroItem: number;
  fechaHallazgo: Date;
  responsableObservacion: string;
  empresa: string;
  lugarFisico: string;
  actividad: string;
  familiaPeligro: string;
  descripcionObservacion: string;
  accionPropuesta: string;
  responsableAreaCierre: string;
  responsableAreaCierreUsername?: string;
  fechaCumplimientoAcordada: Date;
  fechaCumplimientoEfectiva?: Date;
  diasRetraso: number;
  estado: "abierto" | "en-progreso" | "cerrado";
  aprobado: boolean;
  evidencias?: EvidenciaDto[];

  sectionId?: string;
  sectionTitle?: string;
  questionText?: string;
  puntajeObtenido?: number;
  puntajeMaximo?: number;
}

export interface FormTareaData extends AddTareaDTO {
  estado?: string;
}

export interface HistorialAprobacion {
  usuario: string;
  fecha: Date;
  estadoAnterior: string;
  estadoNuevo: string;
  observaciones?: string;
}

export interface PlanDeAccion {
  _id: string;
  instanceId?: string;
  vicepresidencia: string;
  superintendenciaSenior: string;
  superintendencia: string;
  areaFisica: string;

  tareas: TareaObservacion[];

  totalTareas: number;
  tareasAbiertas: number;
  tareasEnProgreso: number;
  tareasCerradas: number;
  porcentajeCierre: number;

  estado: "abierto" | "en-progreso" | "cerrado";

  // Aprobación global del Superintendente — eje independiente del
  // `aprobado` por tarea. Mientras no sea 'aprobado', el Supervisor
  // no debe ver este plan (reforzado también en el backend).
  estadoAprobacion: "pendiente" | "aprobado";
  aprobadoPor?: string;
  fechaAprobacion?: Date;
  observacionesAprobacion?: string;
  historialAprobacion?: HistorialAprobacion[];

  fechaCreacion: Date;
  fechaUltimaActualizacion: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlanDeAccionDTO {
  vicepresidencia: string;
  superintendenciaSenior: string;
  superintendencia: string;
  areaFisica: string;

  tareas?: Omit<
    TareaObservacion,
    "_id" | "numeroItem" | "diasRetraso" | "estado" | "aprobado"
  >[];
}

export interface UpdatePlanDeAccionDTO {
  vicepresidencia?: string;
  superintendenciaSenior?: string;
  superintendencia?: string;
  areaFisica?: string;
}

export interface AddTareaDTO {
  fechaHallazgo: Date | string;
  responsableObservacion: string;
  empresa: string;
  lugarFisico: string;
  actividad: string;
  familiaPeligro: string;
  descripcionObservacion: string;
  accionPropuesta: string;
  responsableAreaCierre: string;
  responsableAreaCierreUsername?: string;
  fechaCumplimientoAcordada: Date | string;
  fechaCumplimientoEfectiva?: Date | string;
}

export interface EvidenciaDto {
  nombre: string;
  url: string;
}

export interface UpdateTareaDTO extends Partial<
  Omit<
    TareaObservacion,
    | "_id"
    | "numeroItem"
    | "fechaHallazgo"
    | "fechaCumplimientoAcordada"
    | "fechaCumplimientoEfectiva"
  >
> {
  fechaHallazgo?: Date | string;
  fechaCumplimientoAcordada?: Date | string;
  fechaCumplimientoEfectiva?: Date | string;
  evidencias?: EvidenciaDto[];

  mlMetadata?: MLMetadata;
}

export interface TaskSummary {
  tareasAbiertas: number;
  tareasCerradas: number;
  tareasEnProgreso: number;
  totalTareas: number;
  porcentajeCierre: number;
}

export interface PlanSummary {
  planesAbiertos: number;
  planesCerrados: number;
  planesEnProgreso: number;
  totalPlanes: number;
  porcentajeCierre: number;
}

export interface OrganizationalInfo {
  vicepresidencia: string;
  superintendenciaSenior: string;
  superintendencia: string;
  areaFisica: string;
}

export interface GenerarPlanesOptions {
  incluirPuntaje3?: boolean;
  incluirSoloConComentario?: boolean;
}

export interface MLMetadata {
  fue_recomendacion_ml: boolean;
  indice_recomendacion?: number;
  recomendaciones_originales?: string[];
}
