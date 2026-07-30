import { fetchDataBySource, DataSourceType } from "@/lib/actions/dataSourceService";
import { obtenerEquipos, EquipoBackend } from "@/lib/actions/equipo-actions";
import { obtenerAreas } from "@/lib/actions/area-actions";
import {
  obtenerDisponibilidadEquipos,
  DisponibilidadEquipo,
} from "@/lib/actions/equipment-tracking";

export type { DataSourceType, EquipoBackend, DisponibilidadEquipo };

/**
 * Obtiene los valores disponibles para un origen de datos genérico
 * (área, superintendencia, trabajador, gerencia, cargo, equipo, etc.)
 * usado por los campos de tipo "autocomplete" del formulario.
 */
export const fetchDataBySourceAdapter = async (
  dataSource: DataSourceType,
): Promise<string[]> => {
  return fetchDataBySource(dataSource);
};

/**
 * Obtiene el listado completo de equipos registrados en el backend,
 * usado para autocompletar/autollenar campos de código de equipo.
 */
export const obtenerEquiposAdapter = async (): Promise<EquipoBackend[]> => {
  return obtenerEquipos();
};

/**
 * Obtiene los nombres de las áreas activas, usado por el selector
 * de áreas del panel de aprobaciones.
 */
export const obtenerAreasAdapter = async (): Promise<string[]> => {
  return obtenerAreas();
};

/**
 * Obtiene la disponibilidad de códigos de equipo para un template, según
 * su frecuencia de inspección configurada (si no tiene, todos disponibles).
 */
export const obtenerDisponibilidadEquiposAdapter = async (
  templateCode: string,
  area?: string,
): Promise<DisponibilidadEquipo[]> => {
  return obtenerDisponibilidadEquipos(templateCode, area);
};
