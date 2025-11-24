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
  fechaCumplimientoAcordada: Date;
  fechaCumplimientoEfectiva?: Date;
  diasRetraso: number;
  estado: 'abierto' | 'en-progreso' | 'cerrado';
  aprobado: boolean;
  evidencias?: EvidenciaDto[];
  
  // Trazabilidad con la inspección (se llenan automáticamente al generar desde inspección)
  instanceId?: string;
  sectionId?: string;
  sectionTitle?: string;
  questionText?: string;
  puntajeObtenido?: number;
  puntajeMaximo?: number;
}

export interface FormTareaData extends AddTareaDTO {
  estado?: string;
}

export interface PlanDeAccion {
  _id: string;
  
  // Datos organizacionales que agrupan las tareas
  vicepresidencia: string;
  superintendenciaSenior: string;
  superintendencia: string;
  areaFisica: string;
  
  // Lista de tareas/observaciones del plan
  tareas: TareaObservacion[];
  
  // Metadatos calculados automáticamente
  totalTareas: number;
  tareasAbiertas: number;
  tareasEnProgreso: number;
  tareasCerradas: number;
  porcentajeCierre: number;
  
  // Estado general del plan (derivado de las tareas)
  estado: 'abierto' | 'en-progreso' | 'cerrado';
  
  // Fechas
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
  
  // Opcional: crear con tareas iniciales
  tareas?: Omit<TareaObservacion, '_id' | 'numeroItem' | 'diasRetraso' | 'estado' | 'aprobado'>[];
}

export interface UpdatePlanDeAccionDTO {
  vicepresidencia?: string;
  superintendenciaSenior?: string;
  superintendencia?: string;
  areaFisica?: string;
}

// DTO simplificado para crear/editar tareas manualmente
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
  fechaCumplimientoAcordada: Date | string;
  fechaCumplimientoEfectiva?: Date | string;
}

export interface EvidenciaDto {
  nombre: string;
  url: string;
}
export interface UpdateTareaDTO extends Partial<Omit<TareaObservacion, '_id' | 'numeroItem' | 'fechaHallazgo' | 'fechaCumplimientoAcordada' | 'fechaCumplimientoEfectiva'>> {
  // 🔥 Permitir que las fechas sean string o Date (el backend las convierte)
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

// 🔥 NUEVO: Resumen de PLANES (no tareas)
export interface PlanSummary {
  planesAbiertos: number;
  planesCerrados: number;
  planesEnProgreso: number;
  totalPlanes: number;
  porcentajeCierre: number; // Promedio ponderado de cierre de todos los planes
}

export interface OrganizationalInfo {
  vicepresidencia: string;
  superintendenciaSenior: string;
  superintendencia: string;
  areaFisica: string;
}

// Para generación automática desde inspecciones
export interface GenerarPlanesOptions {
  incluirPuntaje3?: boolean;
  incluirSoloConComentario?: boolean;
  // Ya NO se piden aquí, se extraen de la inspección
}

export interface MLMetadata {
  fue_recomendacion_ml: boolean;
  indice_recomendacion?: number;
  recomendaciones_originales?: string[];
}