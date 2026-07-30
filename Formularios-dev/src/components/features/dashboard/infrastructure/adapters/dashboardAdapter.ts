// Adaptador delgado alrededor de las Server Actions consumidas por el
// feature "dashboard" (MisInspeccionesView, NotificationBell, ActivityFeed).
// Los componentes de presentation/ y los hooks de application/ nunca
// importan estas Server Actions directamente — siempre pasan por acá.

import {
  getInspectionsHerraEquipos,
  getRecentActivityByArea,
  type InspectionResponse,
} from "@/lib/actions/inspection-herra-equipos";
import {
  getTemplatesHerraEquipos,
  type TemplateHerraEquipo,
} from "@/lib/actions/template-herra-equipos";
import {
  getInstances,
  type GetInstancesFilters,
} from "@/lib/actions/instance-actions";
import { obtenerSistemasEmergenciaReport } from "@/app/actions/inspeccion";
import {
  descargarPdfHerraEquipoCliente,
  descargarPdfIroIsopCliente,
  descargarPdfInspeccionesEmergenciaCliente,
} from "@/lib/actions/client";

export type { InspectionResponse, TemplateHerraEquipo };

export interface HerraEquiposFilters {
  submittedBy?: string;
}

export interface RecentActivityFilters {
  areas?: string[];
  submittedBy?: string;
  limit?: number;
  sinceHours?: number;
}

export interface EmergenciaReportFilters {
  area?: string;
}

export const dashboardAdapter = {
  /** Inspecciones de Herramientas y Equipos (propias o filtradas). */
  async getHerraEquiposInspections(filtros?: HerraEquiposFilters) {
    return getInspectionsHerraEquipos(filtros);
  },

  /** Catálogo de templates de Herramientas y Equipos (para resolver nombres). */
  async getHerraEquiposTemplates() {
    return getTemplatesHerraEquipos();
  },

  /** Instancias de IRO-ISOP. */
  async getIsoInstances(filtros: GetInstancesFilters) {
    return getInstances(filtros);
  },

  /** Reporte de Sistemas de Emergencia por área. */
  async getEmergenciaReport(filtros: EmergenciaReportFilters) {
    return obtenerSistemasEmergenciaReport(filtros);
  },

  /** Actividad reciente (últimas N horas) usada por la campana y el feed. */
  async getRecentActivityByArea(params: RecentActivityFilters) {
    return getRecentActivityByArea(params);
  },

  async downloadHerraEquipoPdf(id: string) {
    return descargarPdfHerraEquipoCliente(id);
  },

  async downloadIroIsopPdf(id: string) {
    return descargarPdfIroIsopCliente(id);
  },

  async downloadEmergenciaPdf(id: string) {
    return descargarPdfInspeccionesEmergenciaCliente(id);
  },
};
