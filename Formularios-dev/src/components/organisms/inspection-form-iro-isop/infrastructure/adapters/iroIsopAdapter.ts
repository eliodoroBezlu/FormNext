// src/components/organisms/inspection-form-iro-isop/infrastructure/adapters/iroIsopAdapter.ts

import { createInstance } from "@/lib/actions/instance-actions";
import type { VerificationList, InspectionTeamMember, SectionResponse, ValoracionCriterio } from "@/types/formTypes";
import type { PersonalInvolucrado } from "../../types/IProps";

export const iroIsopAdapter = {
  /**
   * Envía la instancia de inspección completada al servidor para su persistencia.
   */
  async saveInspectionInstance(data: {
    templateId: string;
    verificationList: VerificationList;
    inspectionTeam: InspectionTeamMember[];
    valoracionCriterio: ValoracionCriterio[];
    sections: SectionResponse[];
    aspectosPositivos: string;
    aspectosAdicionales: string;
    personalInvolucrado?: PersonalInvolucrado[];
  }) {
    return createInstance(data);
  },
};
