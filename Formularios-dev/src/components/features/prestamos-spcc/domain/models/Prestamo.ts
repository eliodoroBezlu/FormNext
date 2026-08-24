export type EstadoSolicitud =
  | "solicitada"
  | "entregada"
  | "cerrada"
  | "cancelada";

export type EstadoPrestamo =
  | "solicitado"
  | "entregado"
  | "devuelto"
  | "cancelado";

export type EstadoDevolucion = "operativo" | "requiere_inspeccion" | "baja";

export interface EquipoPrestable {
  _id: string;
  codigo: string;
  descripcion: string;
  tipo_equipo: string;
  marca?: string;
  fotos?: { url: string; nombre?: string }[];
}

export interface LineaPrestamo {
  _id: string;
  equipo: string;
  codigo: string;
  descripcion: string;
  tipoEquipo: string;
  foto?: string;
  estado: EstadoPrestamo;
  devolucion?: {
    fecha: string;
    registradoPor: string;
    estado: EstadoDevolucion;
    foto?: { url: string; nombre?: string };
    observacion?: string;
  };
}

/**
 * Un tipo de SPCC y cuántos se piden de él.
 *
 * Es lo que sustituye a la lista de equipos concretos en la solicitud: quien
 * pide dice «dos arneses», no «el arnés AR-0142». Ver `TIPOS_SPCC`.
 */
export interface LineaSolicitada {
  tipoEquipo: string;
  cantidad: number;
}

export interface SolicitudPrestamo {
  _id: string;
  numero: string;
  areaSolicitante: string;
  superintendenciaSolicitante?: string;
  solicitanteUsername: string;
  solicitanteNombre?: string;
  motivo: string;
  /** Lo pedido por tipo. Ausente en las solicitudes anteriores al cambio. */
  solicitado?: LineaSolicitada[];
  fechaSolicitud: string;
  /** Desde cuándo se necesitan. Ausente en las solicitudes antiguas. */
  fechaInicioPrevista?: string;
  fechaDevolucionPrevista: string;
  estado: EstadoSolicitud;
  entrega?: { fecha: string; entregadoPor: string; observacion?: string };
  fechaCierre?: string;
  motivoCancelacion?: string;
}

export interface CrearSolicitudPayload {
  areaSolicitante: string;
  areaSolicitanteId?: string;
  superintendenciaSolicitante?: string;
  motivo: string;
  fechaInicioPrevista: string;
  fechaDevolucionPrevista: string;
  solicitado: LineaSolicitada[];
}

/** Lo que el almacén manda al entregar: los equipos que salen de verdad. */
export interface EntregarPayload {
  equipos?: string[];
  observacion?: string;
}

/**
 * Los cinco tipos de SPCC que se prestan.
 *
 * Espeja `TIPOS_PRESTABLES` y `ETIQUETA_TIPO` del backend. La clave es la que
 * guarda el inventario en `tipo_equipo`; la etiqueta es la que ve la persona.
 */
export interface TipoSpcc {
  clave: string;
  etiqueta: string;
  /** Para que el usuario reconozca el equipo aunque no sepa el nombre. */
  descripcion: string;
}

export const TIPOS_SPCC: readonly TipoSpcc[] = [
  {
    clave: "Arnes",
    etiqueta: "Arnés",
    descripcion: "Arnés de cuerpo entero",
  },
  {
    clave: "Autoretractil",
    etiqueta: "Autorretráctil",
    descripcion: "Línea de vida autorretráctil personal",
  },
  {
    clave: "Retractil",
    etiqueta: "Retráctil",
    descripcion: "Línea de vida retráctil",
  },
  {
    clave: "ConectorTT",
    etiqueta: "Conector TT",
    descripcion: "Conector de tejido trenzado o cable de acero",
  },
  {
    clave: "ConectorAN",
    etiqueta: "Anclaje",
    descripcion: "Conector de anclaje",
  },
] as const;

export const ETIQUETA_TIPO = (clave: string): string =>
  TIPOS_SPCC.find((t) => t.clave === clave)?.etiqueta ?? clave;

/**
 * Foto que representa a un tipo.
 *
 * Se busca en dos sitios, por este orden:
 *
 * 1. El **inventario**: la del primer equipo libre de ese tipo que tenga foto.
 *    Así, en cuanto el almacén suba fotos, la pantalla se actualiza sola.
 * 2. Una imagen fija en `public/spcc/<clave>.(jpg|png)`.
 *
 * Hoy ningún equipo del inventario tiene foto, así que manda el segundo
 * camino. Basta con dejar los archivos con esos nombres para que aparezcan;
 * mientras no existan, `<Avatar>` detecta el fallo de carga y pinta su icono,
 * que es un hueco honesto y no una imagen rota.
 */
export const FOTO_FIJA_DEL_TIPO: Record<string, string> = {
  Arnes: "/spcc/arnes.jpg",
  Autoretractil: "/spcc/autoretractil.jpg",
  Retractil: "/spcc/retractil.jpg",
  ConectorTT: "/spcc/conector-tt.jpg",
  ConectorAN: "/spcc/anclaje.jpg",
};

export const fotoDelTipo = (
  equipos: EquipoPrestable[],
  clave: string,
): string | undefined =>
  equipos.find((e) => e.tipo_equipo === clave && e.fotos?.[0]?.url)?.fotos?.[0]
    ?.url ?? FOTO_FIJA_DEL_TIPO[clave];

/** Cuántos equipos libres hay de un tipo, ahora mismo. */
export const disponiblesDelTipo = (
  equipos: EquipoPrestable[],
  clave: string,
): number => equipos.filter((e) => e.tipo_equipo === clave).length;

/** Resumen legible de lo pedido: «2 × Arnés · 1 × Anclaje». */
export const resumirSolicitado = (lineas?: LineaSolicitada[]): string =>
  !lineas?.length
    ? "—"
    : lineas
        .map((l) => `${l.cantidad} × ${ETIQUETA_TIPO(l.tipoEquipo)}`)
        .join(" · ");

/** Total de equipos pedidos, sumando todos los tipos. */
export const totalSolicitado = (lineas?: LineaSolicitada[]): number =>
  (lineas ?? []).reduce((suma, l) => suma + l.cantidad, 0);

export interface DevolverItemPayload {
  prestamo: string;
  estado: EstadoDevolucion;
  foto?: { url: string; nombre?: string };
  observacion?: string;
}

export const ETIQUETA_ESTADO: Record<EstadoSolicitud, string> = {
  solicitada: "Pendiente de entrega",
  entregada: "En préstamo",
  cerrada: "Devuelto",
  cancelada: "Cancelada",
};

export const COLOR_ESTADO: Record<
  EstadoSolicitud,
  "warning" | "info" | "success" | "default"
> = {
  solicitada: "warning",
  entregada: "info",
  cerrada: "success",
  cancelada: "default",
};

export const ETIQUETA_DEVOLUCION: Record<EstadoDevolucion, string> = {
  operativo: "Operativo",
  requiere_inspeccion: "Requiere inspección",
  baja: "Dar de baja",
};

/**
 * ¿Se pasó del plazo?
 *
 * Solo tiene sentido mientras los equipos están fuera: una solicitud cerrada
 * se devolvió tarde o a tiempo, pero ya no hay nada que reclamar.
 */
export const estaVencida = (s: SolicitudPrestamo): boolean => {
  if (s.estado !== "entregada") return false;
  const limite = new Date(s.fechaDevolucionPrevista);
  limite.setHours(23, 59, 59, 999);
  return limite < new Date();
};

/** Días de atraso; 0 si aún está en plazo. */
export const diasDeAtraso = (s: SolicitudPrestamo): number => {
  if (!estaVencida(s)) return 0;
  const limite = new Date(s.fechaDevolucionPrevista);
  const dias = (Date.now() - limite.getTime()) / (1000 * 60 * 60 * 24);
  return Math.floor(dias);
};
