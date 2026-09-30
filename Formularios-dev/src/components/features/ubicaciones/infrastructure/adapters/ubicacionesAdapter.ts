import {
  actualizarUbicacion,
  crearUbicacion,
  eliminarUbicacion,
  fusionarUbicacion,
  obtenerUbicaciones,
  restaurarUbicacion,
  type ResultadoFusion,
  type UbicacionBackend,
  type UbicacionForm,
} from "@/lib/actions/ubicacion-actions";

export type { ResultadoFusion, UbicacionBackend, UbicacionForm };

/**
 * Completa los campos del árbol en documentos anteriores a
 * `scripts/migrar-ubicaciones-jerarquia.cjs`: sin esto, abrir la pantalla
 * antes de migrar rompería en el primer `ancestros.includes`.
 */
const conCamposDeArbol = (u: UbicacionBackend): UbicacionBackend => ({
  ...u,
  padre: u.padre ?? null,
  ancestros: u.ancestros ?? [],
  ruta: u.ruta ?? u.nombre,
  nivel: u.nivel ?? 0,
});

export const ubicacionesAdapter = {
  /** Todas, incluidas las dadas de baja: la pantalla de gestión las restaura. */
  async listarTodas(): Promise<UbicacionBackend[]> {
    return (await obtenerUbicaciones(true)).map(conCamposDeArbol);
  },

  crear(data: UbicacionForm): Promise<UbicacionBackend> {
    return crearUbicacion(data);
  },

  /** Renombrar y/o mover. */
  actualizar(id: string, data: Partial<UbicacionForm>): Promise<UbicacionBackend> {
    return actualizarUbicacion(id, data);
  },

  darDeBaja(id: string): Promise<void> {
    return eliminarUbicacion(id);
  },

  restaurar(id: string): Promise<UbicacionBackend> {
    return restaurarUbicacion(id);
  },

  fusionar(origenId: string, destinoId: string): Promise<ResultadoFusion> {
    return fusionarUbicacion(origenId, destinoId);
  },
};
