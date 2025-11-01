import { FormFeatureConfig } from "../../types/IProps";

// Configuraciones para formularios de vehículos
export const vehicleFormConfigs: Record<string, FormFeatureConfig> = {
  "3.04.P48.F03": {
    formCode: "3.04.P48.F03",
    formName: "LISTA DE VERIFICACIÓN DE VEHÍCULOS Y EQUIPOS MÓVILES",
    formType: "vehicle",
    signatures: {
      inspector: true,
      supervisor: true,
    },
    vehicle: {
      hasDamageSelector: true,
      hasNextInspectionDate: true,
    },
    colorCode: {
      enabled: false,
      hasTrimestre: false,
    },
    conclusion: {
      enabled: true,
      label: "Observaciones en general de todo el check list:",
    },
    requiresPhotos: true,
    allowDraft: true,
  },
}
