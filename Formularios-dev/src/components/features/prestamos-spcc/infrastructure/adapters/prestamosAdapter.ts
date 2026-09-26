import {
  cancelarSolicitud,
  corregirSolicitante,
  crearSolicitud,
  devolverItems,
  entregarSolicitud,
  obtenerDetalle,
  obtenerDisponibles,
  obtenerSolicitudes,
} from "@/lib/actions/prestamo-actions";
import { obtenerTrabajadores } from "@/lib/actions/trabajador-actions";
import type { Trabajador } from "@/types/trabajador";
import type {
  CorregirSolicitantePayload,
  CrearSolicitudPayload,
  DevolverItemPayload,
  EntregarPayload,
  EquipoPrestable,
  LineaPrestamo,
  SolicitudPrestamo,
} from "../../domain/models/Prestamo";

/**
 * Único punto por el que la presentación llega al servidor.
 *
 * Los conflictos de este módulo —«ese arnés ya está en otro préstamo», «la
 * fecha no puede ser anterior a hoy»— son exactamente lo que el usuario
 * necesita leer, así que el mensaje del backend se deja pasar tal cual en vez
 * de esconderlo tras un «error inesperado».
 */
const mensaje = (error: unknown, porDefecto: string): string =>
  error instanceof Error && error.message ? error.message : porDefecto;

export const prestamosAdapter = {
  async disponibles(tipo?: string): Promise<EquipoPrestable[]> {
    try {
      return await obtenerDisponibles(tipo);
    } catch {
      return [];
    }
  },

  async solicitudes(filtros?: {
    estado?: string;
    area?: string;
  }): Promise<SolicitudPrestamo[]> {
    try {
      return await obtenerSolicitudes(filtros);
    } catch {
      return [];
    }
  },

  async detalle(
    id: string,
  ): Promise<{ solicitud: SolicitudPrestamo; items: LineaPrestamo[] } | null> {
    try {
      return await obtenerDetalle(id);
    } catch {
      return null;
    }
  },

  async crear(payload: CrearSolicitudPayload): Promise<SolicitudPrestamo> {
    try {
      return await crearSolicitud(payload);
    } catch (error) {
      throw new Error(mensaje(error, "No se pudo registrar la solicitud."));
    }
  },

  async entregar(
    id: string,
    payload: EntregarPayload = {},
  ): Promise<SolicitudPrestamo> {
    try {
      return await entregarSolicitud(id, payload);
    } catch (error) {
      throw new Error(mensaje(error, "No se pudo registrar la entrega."));
    }
  },

  async devolver(
    id: string,
    items: DevolverItemPayload[],
  ): Promise<SolicitudPrestamo> {
    try {
      return await devolverItems(id, items);
    } catch (error) {
      throw new Error(mensaje(error, "No se pudo registrar la devolución."));
    }
  },

  /**
   * El roster del que se elige a quién pide.
   *
   * Se pide aquí, en el adaptador, y **no** en el diálogo: los componentes de
   * presentación no llaman a Server Actions. Es el mismo roster que sincroniza
   * el IAM; los dados de baja no piden equipos.
   */
  async trabajadores(): Promise<Trabajador[]> {
    try {
      const todos = await obtenerTrabajadores();
      return todos.filter((t) => t.activo !== false);
    } catch {
      return [];
    }
  },

  async corregirSolicitante(
    id: string,
    payload: CorregirSolicitantePayload,
  ): Promise<SolicitudPrestamo> {
    try {
      return await corregirSolicitante(id, payload);
    } catch (error) {
      throw new Error(
        mensaje(error, "No se pudo corregir el solicitante."),
      );
    }
  },

  async cancelar(id: string, motivo?: string): Promise<SolicitudPrestamo> {
    try {
      return await cancelarSolicitud(id, motivo);
    } catch (error) {
      throw new Error(mensaje(error, "No se pudo cancelar la solicitud."));
    }
  },
};
