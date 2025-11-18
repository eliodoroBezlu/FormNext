import { FormFeatureConfig } from "../../types/IProps";

// Configuraciones para formularios estándar
export const standardFormConfigs: Record<string, FormFeatureConfig> = {
  "1.02.P06.F39": {
    formCode: "1.02.P06.F39",
    formName: "Inspección de Amoladora",
    formType: "standard",
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
        enabled: false,
      },
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
        enabled: false,
        
      },
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
        enabled: false,
        
      },
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
            heightPercentage: 30,
            fieldName: "inspectorSignature.inspectorSignature",
          },
          date: {
            enabled: true,
            type: "date",
            label: "Fecha",
            required: true,
            fieldName: "inspectorSignature.inspectionDate",
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
            label: "VoBo del  SUPERVISOR DEL ÁREA ( MSC S.A.)",
            required: true,
            dataSource: "supervisor",
            fieldName: "supervisorSignature.supervisorName",
          },
          signature: {
            type: "canvas",
            enabled: true,
            required: true,
            heightPercentage: 30,
            fieldName: "supervisorSignature.supervisorSignature",
          },
          date: {
            enabled: true,
            type: "date",
            label: "Fecha de VoBo del Supervisor",
            required: true,
            fieldName: "supervisorSignature.supervisorDate",
          },
        },
      },
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
      inspector: {
        enabled: true,
        //title: "NOMBRE DEL RESPONSABLE DE LA INSPECCIÓN",
        fields: {
          name: {
            enabled: false,
            type: "autocomplete",
            dataSource: "OPERADOR",
            label: "NOMBRE DEL RESPONSABLE DE LA INSPECCIÓN",
            required: true,
            fieldName: "inspectorSignature.inspectorName",
          },
          signature: {
            type: "canvas",
            label: "FIRMA OPERADOR",
            enabled: true,
            required: true,
            heightPercentage: 30,
            fieldName: "inspectorSignature.inspectorSignature",
          },
        },
      },
      supervisor: {
        enabled: true,
        //title: "NOMBRE DEL SUPERVISOR DE LA INSPECCIÓN",
        fields: {
          name: {
            enabled: false,
            type: "autocomplete",
            label: "SUPERVISOR DE ÁREA",
            required: true,
            dataSource: "supervisor",
            fieldName: "supervisorSignature.supervisorName",
          },
          signature: {
            type: "canvas",
            label: "V°B° SUPERVISOR DE ÁREA",
            enabled: true,
            required: true,
            heightPercentage: 30,
            fieldName: "supervisorSignature.supervisorSignature",
          }
        },
      },
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

      header: {
        enabled: true,

        fields: [
          {
            type: "radioGroup",
            label: "¿El equipo está fuera de servicio?",
            required: true,
            fieldName: "outOfService.status",
            responseType: "yes-no",
          },
          {
            type: "date",
            label: "Fecha probable de corrección",
            required: false,
            fieldName: "outOfService.fechaCorrecion",
          },

          
        ],
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
      inspector: {
        enabled: true,
        title: "NOMBRE DEL RESPONSABLE DE LA INSPECCIÓN",
        fields: {
          name: {
            enabled: true,
            type: "autocomplete",
            dataSource: "trabajador",
            label: "Inspeccionado por ( Nombre y firma)",
            required: true,
            fieldName: "inspectorSignature.inspectorName",
          },
          signature: {
            type: "canvas",
            label: "FIRMA OPERADOR",
            enabled: true,
            required: true,
            heightPercentage: 30,
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
            label: "Verificado por ( Nombre y firma)",
            required: true,
            dataSource: "supervisor",
            fieldName: "supervisorSignature.supervisorName",
          },
          signature: {
            type: "canvas",
            label: "V°B° SUPERVISOR DE ÁREA",
            enabled: true,
            required: true,
            heightPercentage: 30,
            fieldName: "supervisorSignature.supervisorSignature",
          }
        },
      },
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
      inspector: {
        enabled: true,
        title: "NOMBRE DEL RESPONSABLE DE LA INSPECCIÓN",
        fields: {
          name: {
            enabled: true,
            type: "autocomplete",
            dataSource: "OPERADOR",
            label: "Inspeccionado por ( Nombre y firma)",
            required: true,
            fieldName: "inspectorSignature.inspectorName",
          },
          signature: {
            type: "canvas",
            label: "FIRMA OPERADOR",
            enabled: true,
            required: true,
            heightPercentage: 30,
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
            label: "Verificado por ( Nombre y firma)",
            required: true,
            dataSource: "supervisor",
            fieldName: "supervisorSignature.supervisorName",
          },
          signature: {
            type: "canvas",
            label: "V°B° SUPERVISOR DE ÁREA",
            enabled: true,
            required: true,
            heightPercentage: 30,
            fieldName: "supervisorSignature.supervisorSignature",
          }
        },
      },
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
      label: "Observaciones",
    },

    outOfService: {
      enabled: true,
      footer: {
        enabled: true,
        fields: [
          {
            type: "radioGroup",
            label: "¿El equipo está fuera de servicio?",
            required: true,
            fieldName: "outOfService.status",
            responseType: "AP-MAN-RECH",
          },
        ],
      },
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
      inspector: {
        enabled: true,
        title: "NOMBRE DEL RESPONSABLE DE LA INSPECCIÓN",
        fields: {
          name: {
            enabled: true,
            type: "autocomplete",
            dataSource: "trabajador",
            label: "Nombre y firma del responsable del trabajo que realiza la inspección",
            required: true,
            fieldName: "inspectorSignature.inspectorName",
          },
          signature: {
            type: "canvas",
            enabled: true,
            required: true,
            heightPercentage: 30,
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
            label: "Nombre del Supervisor que recibe y aprueba el check list de inspección",
            required: true,
            dataSource: "supervisor",
            fieldName: "supervisorSignature.supervisorName",
          },
          signature: {
            type: "canvas",
            label: "FIRMA",
            enabled: true,
            required: true,
            heightPercentage: 30,
            fieldName: "supervisorSignature.supervisorSignature",
          },
          date: {
            enabled: true,
            type: "date",
            label: "Fecha:",
            required: true,
            fieldName: "supervisorSignature.supervisorDate",
          },
        },
      },
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

  "1.02.P06.F33": {
    formCode: "1.02.P06.F33",
    formName: "INSPECCIÓN  DE  ESCALERAS DE MANO",
    formType: "standard",
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
            enabled: true,
            required: true,
            heightPercentage: 30,
            fieldName: "supervisorSignature.supervisorSignature",
          },
          // Campo custom para supervisor
        },
      },
    },
    colorCode: {
      enabled: false,
      hasTrimestre: false,
    },
    alert: {
      show: true,
      message: "QUÉ DEBE HACER SI LA ESCALERA ESTÁ DEFECTUOSA",
      description:
        "Si usted nota una escalera EN MAL ESTADO O DEFECTOSA NO LA USE, estas deben ser removidas cuanto antes del lugar de trabajo y dar de baja la escalera cortando longitudinalmente.",
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

    sectionSelector: {
      enabled: true,
      items: [
        {
          sectionTitle:
            "B. OTRAS CONSIDERACIONES A INSPECCIONAR SEGÚN EL TIPO DE ESCALERA (Seleccione el tipo de escalera y continúe con la inspección)", // ← Título exacto de la sección
          label: "Seleccione el tipo de escalera y continúe con la inspección",
          helperText: "Puede seleccionar una o más ",
          required: true,
        },
      ],
    },
  },
};