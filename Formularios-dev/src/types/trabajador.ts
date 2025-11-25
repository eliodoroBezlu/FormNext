export interface Trabajador {
  _id: string;
  ci: string;
  nomina: string;
  puesto: string;
  fecha_ingreso: string;
  superintendencia: string;
  keycloak_user_id?: string;
  username?: string;
  tiene_acceso_sistema: boolean;
  activo: boolean;
  creado_por_usuario?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrabajadorForm {
  ci: string;
  nomina: string;
  puesto: string;
  fecha_ingreso: string;
  superintendencia: string;
  email?: string;
  username?: string;
  crear_usuario_keycloak: boolean;
  roles?: string[];
  activo: boolean;
}