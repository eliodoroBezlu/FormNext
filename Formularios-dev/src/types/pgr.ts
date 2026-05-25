export interface ActividadPgr {
  _id: string;
  descripcion: string;
  responsable: string;
  verificador: string;
  recurso: string;
  entregable: string;
  frecuencia: string;
  mesesProgramados: string[];
  
  estadoAprobacion?: string;
  motivoRechazo?: string;
  semaforoTiempo?: string;
  fechaEjecucion?: string;
  observaciones?: string;
  evidencias?: string[];
}

export interface Pgr {
  _id: string;
  empresa: string;
  vicepresidencia: string;
  gerencia: string;
  superintendencia: string;
  gestion: string;
  areas?: string[];
  estado: string;
  codigoAutogenerado: string;
  aprobadoPor?: string;
  fechaAprobacion?: string;
  activo?: boolean;
  actividades: ActividadPgr[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePgrDto extends Omit<Pgr, '_id' | 'codigoAutogenerado' | 'actividades'> {
  actividades: Omit<ActividadPgr, '_id'>[];
}
