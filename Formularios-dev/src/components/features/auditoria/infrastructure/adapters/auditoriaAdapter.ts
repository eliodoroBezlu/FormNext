import {
  obtenerAuditoria,
  obtenerFiltrosAuditoria,
} from "@/lib/actions/auditoria-actions";
import type {
  FiltrosAuditoria,
  OpcionesFiltro,
  PaginaAuditoria,
} from "../../domain/models/Auditoria";

const PAGINA_VACIA: PaginaAuditoria = {
  filas: [],
  total: 0,
  pagina: 1,
  porPagina: 50,
};

/**
 * Único punto por el que la presentación llega al servidor.
 *
 * La bitácora es de consulta: si falla, se muestra vacía en vez de romper la
 * pantalla — no hay nada que el usuario pueda reintentar salvo recargar.
 */
export const auditoriaAdapter = {
  async buscar(filtros: FiltrosAuditoria): Promise<PaginaAuditoria> {
    try {
      return await obtenerAuditoria(filtros);
    } catch {
      return PAGINA_VACIA;
    }
  },

  async opciones(): Promise<OpcionesFiltro> {
    try {
      return await obtenerFiltrosAuditoria();
    } catch {
      return { recursos: [], usuarios: [] };
    }
  },
};
