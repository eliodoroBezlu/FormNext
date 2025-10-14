export interface Trabajador {
  _id: string;
  ci: string;
  nomina: string;
  puesto: string;
  fecha_ingreso: string;
  superintendencia: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrabajadorForm {
  ci: string;
  nomina: string;
  puesto: string;
  fecha_ingreso: string;
  superintendencia: string;
  activo: boolean;
}