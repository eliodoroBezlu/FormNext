export interface Trabajador {
  _id: string;
  ci: string;
  nomina: string;
  puesto: string;
  fecha_ingreso: string;
  superintendencia: string;
  area: string;
  jde?: string;
  no_bloque?: string;
  no_habitacion?: string;
  residencia?: string;
  celular?: string;
  keycloak_user_id?: string;
  username?: string;
  // Poblado por el backend en GET /trabajadores (findAll) vía `.populate('userId', ...)`
  userId?: {
    _id: string;
    username: string;
    email?: string;
    roles: string[];
  };
  tiene_acceso_sistema: boolean;
  // Roles del trabajador en el servicio "forms" según el IAM Core (fuente
  // de verdad, refrescado por sincronización) — ej. ["supervisor"].
  roles_iam?: string[];
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
  area: string;
  jde?: string;
  no_bloque?: string;
  no_habitacion?: string;
  residencia?: string;
  celular?: string;
  email?: string;
  username?: string;
  crear_usuario_keycloak: boolean;
  roles?: string[];
  activo: boolean;
}