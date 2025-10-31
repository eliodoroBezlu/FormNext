import { FormFeatureConfig } from "../../types/IProps";

// Configuraciones para formularios de vehículos
export const vehicleFormConfigs: Record<string, FormFeatureConfig> = {
  "INSP-VEH-001": {
    formCode: "INSP-VEH-001",
    formName: "Inspección de Vehículos",
    formType: "vehicle",
    signatures: {
      inspector: true,
      supervisor: false,
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
      label: "Observaciones del vehículo",
    },
    requiresPhotos: true,
    allowDraft: true,
  },

  "INSP-MONT-001": {
    formCode: "INSP-MONT-001",
    formName: "Inspección de Montacargas",
    formType: "vehicle",
    signatures: {
      inspector: true,
      supervisor: true,
    },
    vehicle: {
      hasDamageSelector: true,
      hasNextInspectionDate: true,
    },
    alert: {
      show: true,
      message: "Inspección de equipo crítico",
      variant: "warning",
    },
    conclusion: {
      enabled: true,
    },
    requiresPhotos: true,
    allowDraft: false,
  },
}
