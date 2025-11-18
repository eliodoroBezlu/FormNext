import { FormFeatureConfig } from "../../types/IProps";

// Configuraciones para formularios de vehículos
export const vehicleFormConfigs: Record<string, FormFeatureConfig> = {
  "3.04.P48.F03": {
    formCode: "3.04.P48.F03",
    formName: "LISTA DE VERIFICACIÓN DE VEHÍCULOS Y EQUIPOS MÓVILES",
    formType: "vehicle",
    signatures: {
      inspector: {
        enabled: true,
        title: "NOMBRE DEL RESPONSABLE DE LA INSPECCIÓN",
        fields: {
          name: {
            enabled: true,
            type: "autocomplete",
            dataSource: "trabajador",
            label: "INSPECCIONADO POR (NOMBRE Y FIRMA)",
            required: true,
            fieldName: "inspectorSignature.inspectorName",
          },
          signature: {
            type: "canvas",
            enabled: true,
            required: true,
            fieldName: "inspectorSignature.inspectorSignature",
          },
        },
      },
      supervisor: {
        enabled: true,
        title: "NOMBRE DEL SUPERVISOR DE LA INSPECCIÓN",
        fields: {
          name: {
            enabled: true,
            type: "autocomplete",
            label: "NOMBRE DEL SUPERVISOR DE LA INSPECCIÓN",
            required: true,
            dataSource: "supervisor",
            fieldName: "supervisorSignature.supervisorName",
          },
          signature: {
            type: "canvas",
            label: "FIRMA RESPONSABLE VEHICULO",
            enabled: true,
            required: true,
            heightPercentage: 30,
            fieldName: "supervisorSignature.supervisorSignature",
          },
          // Campo custom para supervisor
        },
      },
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
