import { FormFeatureConfig } from "../../types/IProps";


// Configuraciones para formularios con accesorios agrupados (Eslings, Grilletes, etc.)
export const andamioFormConfigs: Record<string, FormFeatureConfig> = {
  "1.02.P06.F30": {
    formCode: "1.02.P06.F30",
    formName: "INSPECCIÓN DE ANDAMIOS PERIMETRALES",
    formType: "scaffold",
    approval: {
      enabled: true,
      requiredRoles: ["supervisor", "admin", "superintendente"],
      allowSelfApproval: false,
      requiresComments: false,
    },
    signatures: {
      inspector: {
        enabled: true,
        title: "NOMBRE DEL RESPONSABLE DE LA INSPECCIÓN",
        fields: {
          name: {
            enabled: true,
            type: "autocomplete",
            dataSource: "trabajador",
            label: "NOMBRE DEL RESPONSABLE DE LA INSPECCIÓN",
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
        title: "NOMBRE SUPERVISOR RESPONSABLE DEL TRABAJO",
        fields: {
          name: {
            enabled: true,
            type: "autocomplete",
            label: "NOMBRE DEL SUPERVISOR DE LA INSPECCIÓN",
            required: false,
            dataSource: "supervisor",
            fieldName: "supervisorSignature.supervisorName",
          },
          signature: {
            type: "canvas",
            enabled: true,
            required: false,
            heightPercentage: 30,
            fieldName: "supervisorSignature.supervisorSignature",
          },
          // Campo custom para supervisor
        },
      },
    },

     routineInspection: {
      enabled: true,
      title: "II. INSPECCIÓN RUTINARIA DEL ANDAMIO",
      question:
        "EL ANDAMIO MANTIENE LOS ESTÁNDARES DE SEGURIDAD INICIALES. NO SE HA DETECTADO NINGUNA CONDICIÓN INSEGURA EN SU ESTRUCTURA",
      maxEntries: 30,
      fields: {
        showDate: true,
        dateLabel: "FECHA DE INSPECCIÓN",
        dateRequired: true,

        showInspector: true,
        inspectorLabel: "NOMBRE DEL INSPECTOR",
        inspectorRequired: true,

        showResponse: true,
        responseRequired: true,

        showObservations: true,
        observationsLabel: "OBSERVACIONES",
        observationsPlaceholder: "Describa cualquier anomalía o condición detectada",

        showSignature: true,
        signatureLabel: "FIRMA",
      },
    },

    

    colorCode: {
      enabled: false,
      hasTrimestre: false,
    },
    alert: {
      show: false,
      message: "Inspeccione cada eslinga individualmente",
      variant: "warning",
    },
    conclusion: {
      enabled: true,
      label: "A LA CONCLUSIÓN DE LA INSPECCIÓN DE TODOS LOS ITEMS EL INSPECTOR DEBERÁ VERIFICAR QUE:",
      showCheckbox: true,
      checkboxOptions: {
        liberatedLabel: "El Andamio es liberado, colocar una tarjeta verde y autorizar la utilización del mismo.",
        liberatedColor: "#4caf50",
        notLiberatedLabel: "El Andamio No es liberado, colocar tarjeta roja y cinta de peligro hasta que las observaciones se corrijan.",
        notLiberatedColor: "#f44336",
      },
    },
    requiresPhotos: true,
    allowDraft: true,
  },
}
