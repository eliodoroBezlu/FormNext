import { FormFeatureConfig } from "../../types/IProps";

// Configuraciones para formularios estándar
export const standardFormConfigs: Record<string, FormFeatureConfig> = {
  "1.02.P06.F39": {
    formCode: "1.02.P06.F39",
    formName: "Inspección de Amoladora",
    formType: "standard",
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
      message: "Recuerde verificar el estado del disco y protecciones",
      variant: "warning",
    },
    conclusion: {
      enabled: true,
      label: "Conclusión de la inspección",
      placeholder: "Ingrese observaciones finales...",
    },
    // ✅ NUEVAS CONFIGURACIONES
    questionObservations: {
      enabled: true,
      required: false,
      label: "Observaciones",
      placeholder: "Comentarios adicionales sobre esta pregunta...",
    },
    generalObservations: {
      enabled: true,
      required: false,
      label: "Observaciones Generales",
      placeholder: "Ingrese observaciones generales de la inspección...",
      maxLength: 1000,
      helperText: "Máximo 1000 caracteres",
    },
    requiresPhotos: true,
    allowDraft: true,
  },

  "1.02.P06.F40": {
    formCode: "1.02.P06.F40",
    formName: "Inspección de Esmeril",
    formType: "standard",
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
      message: "Recuerde verificar el estado del disco y protecciones",
      variant: "warning",
    },
    conclusion: {
      enabled: true,
      label: "Conclusión de la inspección",
      placeholder: "Ingrese observaciones finales...",
    },
    questionObservations: {
      enabled: true,
      required: false,
    },
    generalObservations: {
      enabled: true,
      required: false,
    },
    requiresPhotos: true,
    allowDraft: true,
  },

  "1.02.P06.F42": {
    formCode: "1.02.P06.F42",
    formName: "Inspección de Soldadura",
    formType: "standard",
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
      message: "Verificar certificaciones y estado de electrodos",
      variant: "warning",
    },
    conclusion: {
      enabled: true,
    },
    questionObservations: {
      enabled: true, // Habilitar para este formulario
    },
    generalObservations: {
      enabled: false, // Deshabilitar para este formulario
    },
    requiresPhotos: true,
    allowDraft: true,
  },

  "2.03.P10.F05": {
    formCode: "2.03.P10.F05",
    formName: "Inspección de Taladro",
    formType: "standard",
    signatures: {
      inspector: true,
      supervisor: true,
    },
    colorCode: {
      enabled: true,
      hasTrimestre: true,
    },
    conclusion: {
      enabled: true,
    },
    questionObservations: {
      enabled: true,
      required: false,
    },
    generalObservations: {
      enabled: true,
      required: false, // Obligatorio para este formulario
      label: "Observaciones Finales (Opcional)",
    },
    requiresPhotos: false,
    allowDraft: true,
  },

  "1.02.P06.F37": {
    formCode: "1.02.P06.F37",
    formName: "INSPECCION  DE  MAN LIFT",
    formType: "standard",
    signatures: {
      inspector: true,
      supervisor: true,
    },
    colorCode: {
      enabled: false,
      hasTrimestre: false,
    },
    conclusion: {
      enabled: false,
    },
    questionObservations: {
      enabled: true,
      required: false,
    },
    generalObservations: {
      enabled: true,
      required: false, // Obligatorio para este formulario
      label: "Observaciones Finales (Opcional)",
    },

    outOfService: {
      enabled: true,
      label: "Fuera de Servicio:",
      responseType: "yes-no", // Solo SI/NO
      required: false,
      fields: {
        showDate: true,
        dateLabel: "Fecha probable de corrección",
        dateRequired: false,
      },
    },
    requiresPhotos: false,
    allowDraft: true,
  },

  "3.04.P04.F23": {
    formCode: "3.04.P04.F23",
    formName: "VERIFICACIÓN DE PUENTE GRUA CON CABINA",
    formType: "standard",
    signatures: {
      inspector: true,
      supervisor: true,
    },
    colorCode: {
      enabled: false,
      hasTrimestre: false,
    },
    conclusion: {
      enabled: true,
    },
    questionObservations: {
      enabled: true,
      required: false,
    },
    generalObservations: {
      enabled: true,
      required: false, // Obligatorio para este formulario
      label: "Otras observaciones",
    },
    requiresPhotos: false,
    allowDraft: true,
  },

  "3.04.P04.F35": {
    formCode: "3.04.P04.F35",
    formName:
      "INSPECCION PUENTE GRUA A CONTROL REMOTO Y ACCESORIOS DE IZAJE (Inspección Pre-uso)",
    formType: "standard",
    signatures: {
      inspector: true,
      supervisor: true,
    },
    colorCode: {
      enabled: false,
      hasTrimestre: false,
    },
    conclusion: {
      enabled: false,
    },
    questionObservations: {
      enabled: true,
      required: false,
    },
    generalObservations: {
      enabled: false,
      required: false, // Obligatorio para este formulario
      label: "Otras observaciones",
    },
    requiresPhotos: false,
    allowDraft: true,
  },

  "3.04.P37.F25": {
    formCode: "3.04.P37.F25",
    formName: "INSPECCIÓN FRECUENTE DE TECLES DE CADENAS - (POLIPASTOS)",
    formType: "standard",
    signatures: {
      inspector: false,
      supervisor: false,
    },
    colorCode: {
      enabled: false,
      hasTrimestre: false,
    },
    conclusion: {
      enabled: false,
    },
    questionObservations: {
      enabled: true,
      required: false,
      label: "Observaciones"
    },

    outOfService: {
      enabled: true,
      label: "Conclusión:",
      responseType: "AP-MAN-RECH", // Solo SI/NO
      required: true,
    },
    generalObservations: {
      enabled: true,
      required: false, // Obligatorio para este formulario
      label: "Recomendaciones",
    },

    questionDescription: {
      enabled: true,
      required: false, // Obligatorio para este formulario
      label: "Descripción del Mantenimiento",
    },
    requiresPhotos: false,
    allowDraft: true,
  },

  "3.04.P37.F24": {
    formCode: "3.04.P37.F24",
    formName:
      "INSPECCIÓN PRE USO DE TECLES DE CADENAS Y A PALANCA, MANUALES Y ELÉCTRICOS (POLIPASTOS)",
    formType: "standard",
    signatures: {
      inspector: false,
      supervisor: false,
    },
    colorCode: {
      enabled: false,
      hasTrimestre: false,
    },
    conclusion: {
      enabled: false,
    },
    questionObservations: {
      enabled: false,
      required: false,
    },

    outOfService: {
      enabled: true,
      showConclusion: false,
      label: "Conclusión:",
      responseType: "AP-MAN-RECH", // Solo SI/NO
      required: true,

      fields: {
        showDate: true,
        dateLabel: "Fecha",
        dateRequired: true,

        showTag: true,
        tagLabel: "TAG",
        tagRequired: true,

        showInspector: true,
        inspectorLabel: "Persona que Inspecciona",
        inspectorRequired: true,

        showCapacidad: true,
        capacidadLabel: "Capacidad Nominal",
        capacidadRequired: true,

        showTipo: true,
        tipoLabel: "tipo",
        tipoRequired: true,
      },
    },
    generalObservations: {
      enabled: true,
      required: false, // Obligatorio para este formulario
      label: "Observaciones",
    },
    requiresPhotos: false,
    allowDraft: true,
  },


  //falta la configuracion de la fecha de la firma del supervisor mas la configuracion del label para todos
  "1.02.P06.F20": {
    formCode: "1.02.P06.F20",
    formName: "INSPECCIÓN DE CILINDROS PARA GASES COMPRIMIDOS",
    formType: "standard",
    signatures: {
      inspector: true,
      supervisor: true,
    },
    colorCode: {
      enabled: false,
      hasTrimestre: false,
    },
    alert: {
      show: true,
      message: "Recuerde verificar el estado del disco y protecciones",
      variant: "warning",
    },
    conclusion: {
      enabled: true,
      label: "Conclusión de la inspección",
      placeholder: "Ingrese observaciones finales...",
    },
    questionObservations: {
      enabled: true,
      required: false,
    },
    generalObservations: {
      enabled: true,
      required: false,
    },
    requiresPhotos: true,
    allowDraft: true,
  },
};
