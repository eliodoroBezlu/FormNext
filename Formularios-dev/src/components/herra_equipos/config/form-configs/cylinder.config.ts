import { FormFeatureConfig } from "../../types/IProps";


// Configuraciones para formularios de cilindros (requieren firma de supervisor)
export const cylinderFormConfigs: Record<string, FormFeatureConfig> = {
  "1.02.P06.F20": {
    formCode: "1.02.P06.F20",
    formName: "Inspección de Cilindros",
    formType: "cylinder",
    signatures: {
      inspector: true,
      supervisor: true, // Requiere firma de supervisor
    },
    colorCode: {
      enabled: true,
      hasTrimestre: false,
    },
    alert: {
      show: true,
      message: "Esta inspección requiere aprobación del supervisor",
      variant: "default",
    },
    conclusion: {
      enabled: true,
      label: "Conclusión y recomendaciones",
    },
    requiresPhotos: true,
    allowDraft: true,
  },
}
