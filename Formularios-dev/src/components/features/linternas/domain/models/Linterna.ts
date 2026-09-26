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
  /**
   * Se registró y no debía registrarse.
   *
   * El asiento se queda —la información no se borra— pero sale de los
   * recuentos de dotación: para el sistema esa persona no recibió nada.
   */
  ANULADA = "anulada",
}

/**
 * Estados en los que la entrega ya no cuenta ni admite corrección.
 *
 * Espeja `ESTADOS_SIN_EFECTO` del backend. Si aquí faltara alguno, la pantalla
 * ofrecería un botón que el servidor va a rechazar.
 */
export const ESTADOS_SIN_EFECTO: readonly EstadoEntrega[] = [
  EstadoEntrega.RECHAZADA,
  EstadoEntrega.ANULADA,
];

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
  [EstadoEntrega.ANULADA]: "Anulada",
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

/**
 * De qué tipo a cuál, quién y por qué.
 *
 * El tipo anterior no se pisa: reclasificar mueve stock y estado, y sin este
 * rastro no hay forma de explicar después por qué el almacén cuadró así.
 */
export interface Reclasificacion {
  tipoAnterior: TipoEntrega;
  tipoNuevo: TipoEntrega;
  reclasificadaPor: string;
  fecha: string;
  motivo: string;
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
  /** Rastro de los cambios de tipo. Vacío en las que nunca se reclasificaron. */
  reclasificaciones?: Reclasificacion[];
  motivoAnulacion?: string;
  anuladaPor?: string;
  fechaAnulacion?: string;
  createdAt?: string;
}

/**
 * Una entrega firmada ya no se toca: el acta dice lo que alguien firmó.
 *
 * Se comprueba aquí y no en cada pantalla para que el botón no aparezca
 * cuando el backend va a responder 409.
 */
export const estaFirmada = (e: EntregaLinterna): boolean =>
  Boolean(e.firmaTrabajador ?? e.perdida?.firmaAprobador);

/** Si admite reclasificarse o corregirse: sin firma y con efecto. */
export const admiteCorreccion = (e: EntregaLinterna): boolean =>
  !estaFirmada(e) && !ESTADOS_SIN_EFECTO.includes(e.estado);

/** Anular no exige que esté sin firmar: exige que todavía cuente. */
export const admiteAnulacion = (e: EntregaLinterna): boolean =>
  !ESTADOS_SIN_EFECTO.includes(e.estado);

/**
 * Si esta entrega llegó a descontar una unidad del almacén.
 *
 * Espeja `descontoStock` del backend. La pantalla lo necesita para avisar de
 * qué va a pasar con el stock **antes** de confirmar, no después.
 */
export const descontoStock = (e: EntregaLinterna): boolean =>
  e.tipo !== TipoEntrega.REPOSICION_PERDIDA ||
  e.estado === EstadoEntrega.APROBADA;

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

/**
 * Reclasificar lleva **la entrega entera**, no solo el tipo nuevo.
 *
 * Cada tipo exige unos bloques y prohíbe otros —un cambio pide la foto de la
 * linterna averiada, una pérdida pide la justificación escrita—, así que esto
 * es volver a declarar la entrega con las reglas del tipo nuevo.
 */
export interface ReclasificarEntregaPayload extends RegistrarEntregaPayload {
  motivo: string;
}

export interface AnularEntregaPayload {
  motivo: string;
  /**
   * Si la linterna volvió físicamente al almacén.
   *
   * Lo declara quien anula porque el sistema no puede saberlo: reponer siempre
   * dejaría en el inventario una unidad que no está en la estantería.
   */
  linternaRecuperada?: boolean;
}

/** Lo que se corrige sin cambiar la naturaleza del acto. */
export interface CorregirEntregaPayload {
  observacion?: string;
}
