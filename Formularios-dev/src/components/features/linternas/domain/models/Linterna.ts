/**
 * Tipos puros del control de linternas. Sin React y sin MUI: los comparte el
 * adaptador, el hook y las vistas.
 */

export enum TipoEntrega {
  DOTACION = "dotacion",
  CAMBIO = "cambio",
  REPOSICION_PERDIDA = "reposicion_perdida",
}

export enum EstadoEntrega {
  REGISTRADA = "registrada",
  PENDIENTE_APROBACION = "pendiente_aprobacion",
  APROBADA = "aprobada",
  RECHAZADA = "rechazada",
}

export const ETIQUETA_TIPO: Record<TipoEntrega, string> = {
  [TipoEntrega.DOTACION]: "Dotación",
  [TipoEntrega.CAMBIO]: "Cambio",
  [TipoEntrega.REPOSICION_PERDIDA]: "Reposición por pérdida",
};

export const ETIQUETA_ESTADO: Record<EstadoEntrega, string> = {
  [EstadoEntrega.REGISTRADA]: "Registrada",
  [EstadoEntrega.PENDIENTE_APROBACION]: "Pendiente de aprobación",
  [EstadoEntrega.APROBADA]: "Aprobada",
  [EstadoEntrega.RECHAZADA]: "Rechazada",
};

export interface ArchivoAdjunto {
  url: string;
  nombre: string;
  mime?: string;
  tamano?: number;
}

/** Firma ya sellada por el servidor. */
export interface FirmaSellada {
  imagen: string;
  hash: string;
  metodo: "dibujada" | "subida";
  firmadoPor: string;
  firmadoEn: string;
}

export interface EntregaLinterna {
  _id: string;
  trabajador: string;
  nombreTrabajador: string;
  area: string;
  superintendencia: string;
  tipo: TipoEntrega;
  estado: EstadoEntrega;
  fechaEntrega?: string;
  /**
   * La entrega es anterior al sistema: ya tenían la linterna cuando se puso
   * en marcha el módulo. Por eso no lleva fecha ni movió el stock.
   */
  previaAlSistema?: boolean;
  registradoPor: string;
  entregadoPor?: string;
  firmaTrabajador?: FirmaSellada;
  devolucion?: { foto: ArchivoAdjunto; observacion?: string };
  perdida?: {
    justificacion: string;
    evidencias: ArchivoAdjunto[];
    aprobadoPor?: string;
    fechaAprobacion?: string;
    firmaAprobador?: FirmaSellada;
    comentarioAprobador?: string;
  };
  observacion?: string;
  createdAt?: string;
}

/** Lo que hay que saber de la persona antes de entregarle algo. */
export interface EstadoTrabajador {
  trabajador: string;
  nombre: string;
  area: string;
  superintendencia: string;
  tieneDotacion: boolean;
  siguienteAccion: TipoEntrega;
  totalCambios: number;
  totalPerdidas: number;
  ultimaEntrega?: string;
  pendienteDeAprobacion: boolean;
}

export interface StockLinternas {
  cantidadDisponible: number;
  ingresos: {
    _id: string;
    cantidad: number;
    fecha: string;
    registradoPor: string;
    observacion?: string;
  }[];
}

export interface TrabajadorSinDotacion {
  _id: string;
  nomina: string;
  area: string;
  superintendencia: string;
}

export interface ResumenLinternas {
  totalTrabajadores: number;
  conDotacion: number;
  sinDotacion: number;
  totalCambios: number;
  totalPerdidas: number;
  perdidasPendientes: number;
  stockDisponible: number;
  ingresadas: number;
  entregadas: number;
}

export interface FilaPorArea {
  area: string;
  superintendencia: string;
  dotados: number;
  cambios: number;
  perdidas: number;
  entregadas: number;
}

export interface FilaPorTrabajador {
  trabajador: string;
  nombre: string;
  area: string;
  superintendencia: string;
  tieneDotacion: boolean;
  fechaDotacion?: string;
  cambios: number;
  ultimoCambio?: string;
  perdidas: number;
  ultimaEntrega?: string;
  /** Dotación + cambios + pérdidas aprobadas. */
  totalRecibidas: number;
  pendienteDeAprobacion: boolean;
}

export interface RegistrarEntregaPayload {
  trabajador: string;
  tipo: TipoEntrega;
  firmaTrabajador?: string;
  metodoFirma?: "dibujada" | "subida";
  devolucion?: { foto: ArchivoAdjunto; observacion?: string };
  perdida?: { justificacion: string; evidencias?: ArchivoAdjunto[] };
  observacion?: string;
}
