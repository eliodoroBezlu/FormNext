export interface Extintor {
  _id: string;
  CodigoExtintor: string;
  Ubicacion: string;
  inspeccionado: boolean;
  activo: boolean;
  updatedAt: string;
  tag: string;
  area: string;
}

export interface AreaStats {
  area: string;
  total: number;
  inspeccionados: number;
  activos: number;
  porcentaje: number;
}
