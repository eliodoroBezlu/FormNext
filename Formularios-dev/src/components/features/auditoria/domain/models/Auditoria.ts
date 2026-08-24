/** Un asiento de la bitácora: quién hizo qué, cuándo y cómo terminó. */
export interface AsientoAuditoria {
  _id: string;
  usuario: string;
  roles: string[];
  metodo: string;
  ruta: string;
  recurso: string;
  documentoId?: string;
  estado: number;
  fallo: boolean;
  mensajeError?: string;
  datos?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  duracionMs?: number;
  fecha: string;
}

export interface FiltrosAuditoria {
  usuario?: string;
  recurso?: string;
  metodo?: string;
  soloFallos?: boolean;
  desde?: string;
  hasta?: string;
  pagina?: number;
  porPagina?: number;
}

export interface PaginaAuditoria {
  filas: AsientoAuditoria[];
  total: number;
  pagina: number;
  porPagina: number;
}

export interface OpcionesFiltro {
  recursos: string[];
  usuarios: string[];
}

/** Qué hizo, en castellano. La ruta ya dice sobre qué. */
export const ACCION_POR_METODO: Record<string, string> = {
  POST: "Creó",
  PATCH: "Modificó",
  PUT: "Reemplazó",
  DELETE: "Eliminó",
};

export const describirAccion = (asiento: AsientoAuditoria): string =>
  ACCION_POR_METODO[asiento.metodo] ?? asiento.metodo;

/**
 * Color del método. `DELETE` en rojo porque es el irreversible y es lo primero
 * que alguien busca al revisar la bitácora.
 */
export const COLOR_POR_METODO: Record<
  string,
  "success" | "info" | "warning" | "error" | "default"
> = {
  POST: "success",
  PATCH: "info",
  PUT: "warning",
  DELETE: "error",
};
