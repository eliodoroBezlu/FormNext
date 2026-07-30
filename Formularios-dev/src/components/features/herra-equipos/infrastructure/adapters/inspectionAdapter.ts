import {
  deleteInspection,
  getInspectionById,
  getInspectionsHerraEquipos,
  getPendingApprovals,
} from "@/lib/actions/inspection-herra-equipos";
import type { InspectionResponse } from "@/lib/actions/inspection-herra-equipos";

export type { InspectionResponse };

export const inspectionAdapter = {
  async getInspections(filters?: {
    status?: string;
    templateCode?: string;
    startDate?: string;
    endDate?: string;
    submittedBy?: string;
  }) {
    return getInspectionsHerraEquipos(filters);
  },

  async getById(id: string) {
    return getInspectionById(id);
  },

  async delete(id: string) {
    return deleteInspection(id);
  },

  async getPendingApprovals(
    supervisorUsername?: string,
    supervisorAreas?: string[],
    isAdmin?: boolean,
  ) {
    return getPendingApprovals(supervisorUsername, supervisorAreas, isAdmin);
  },
};
