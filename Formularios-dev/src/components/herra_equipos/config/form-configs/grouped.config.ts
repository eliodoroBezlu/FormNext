import { FormFeatureConfig } from "../../types/IProps";


// Configuraciones para formularios con accesorios agrupados (Eslings, Grilletes, etc.)
export const groupedFormConfigs: Record<string, FormFeatureConfig> = {
  "INSP-ESLI-001": {
    formCode: "INSP-ESLI-001",
    formName: "Inspección de Eslings",
    formType: "grouped",
    signatures: {
      inspector: true,
      supervisor: false,
    },
    colorCode: {
      enabled: true,
      hasTrimestre: true,
    },
    alert: {
      show: true,
      message: "Inspeccione cada eslinga individualmente",
      variant: "warning",
    },
    conclusion: {
      enabled: true,
    },
    requiresPhotos: true,
    allowDraft: true,
  },

  "INSP-GRIL-001": {
    formCode: "INSP-GRIL-001",
    formName: "Inspección de Grilletes",
    formType: "grouped",
    signatures: {
      inspector: true,
      supervisor: false,
    },
    colorCode: {
      enabled: true,
      hasTrimestre: true,
    },
    conclusion: {
      enabled: true,
    },
    requiresPhotos: true,
    allowDraft: true,
  },

  "INSP-PGRUA-001": {
    formCode: "INSP-PGRUA-001",
    formName: "Inspección de Puente Grúa",
    formType: "grouped",
    signatures: {
      inspector: true,
      supervisor: true,
    },
    colorCode: {
      enabled: true,
      hasTrimestre: false,
    },
    alert: {
      show: true,
      message: "Inspección crítica - Requiere supervisor",
      variant: "destructive",
    },
    conclusion: {
      enabled: true,
    },
    requiresPhotos: true,
    allowDraft: false,
  },
}
