import {
  actualizarEquipo,
  crearEquipo,
  eliminarEquipo,
  migrarExcel,
  obtenerEquipos,
  type MigracionResultado,
} from "@/lib/actions/equipo-actions";
import { exportarInventarioEquiposExcelCliente } from "@/lib/actions/client";
import { obtenerAreasCompletas } from "@/lib/actions/area-actions";
import { obtenerUbicaciones } from "@/lib/actions/ubicacion-actions";
import { obtenerClasificaciones } from "@/lib/actions/clasificacion-actions";
import { obtenerSuperintendencias } from "@/lib/actions/superintendecia-actions";
import { obtenerGerencias } from "@/lib/actions/gerencia-actions";
import { obtenerConfigFormularios } from "@/lib/actions/config-formulario-actions";
import type {
  CatalogosInventario,
  Equipo,
  EquipoPayload,
} from "../../domain/models/Equipo";

/**
 * Las llamadas al servidor del inventario de equipos. Lo único de este módulo
 * que conoce las Server Actions.
 */

export type { MigracionResultado };

export const listarEquipos = (): Promise<Equipo[]> => obtenerEquipos();

export const guardarEquipo = (payload: EquipoPayload, id?: string): Promise<Equipo> =>
  id ? actualizarEquipo(id, payload) : crearEquipo(payload);

export const darDeBajaEquipo = (id: string): Promise<void> => eliminarEquipo(id);

/** Sin archivo, el backend usa el `Inventario.xlsx` que tiene en el servidor. */
export const importarInventario = (archivo?: File): Promise<MigracionResultado> => {
  if (!archivo) return migrarExcel();
  const datos = new FormData();
  datos.append("file", archivo);
  return migrarExcel(datos);
};

export const exportarInventario = (ids: string[]): Promise<void> =>
  exportarInventarioEquiposExcelCliente(ids);

/** Los catálogos de filtros y formulario. */
export async function listarCatalogos(): Promise<CatalogosInventario> {
  const [areas, ubicaciones, clasificaciones, configs, superintendencias, gerencias] =
    await Promise.all([
      obtenerAreasCompletas(),
      obtenerUbicaciones(),
      obtenerClasificaciones(),
      obtenerConfigFormularios(),
      obtenerSuperintendencias(),
      obtenerGerencias(),
    ]);
  return {
    areas,
    ubicaciones,
    clasificaciones,
    configs,
    superintendencias: Array.isArray(superintendencias) ? superintendencias : [],
    gerencias,
  };
}
