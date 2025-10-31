// config/formConfig.ts
/**
 * Sistema de configuración centralizado para formularios de inspección
 * Permite customizar comportamiento según el código del template
 */

export interface FormFeatureConfig {
  // Identificación
  code: string;
  name: string;
  
  // Features opcionales
  hasCodigoColorTrimestre: boolean;
  hasFirmaSupervisor: boolean;
  hasFirmaInspector: boolean;
  hasObservacionesGenerales: boolean;
  hasConclusion?: boolean;
  hasVehicleDamage?: boolean;

  

   questionObservations?: {
    enabled: boolean;           // Si muestra el campo de observaciones
    required?: boolean;         // Si es obligatorio
    label?: string;            // Etiqueta personalizada
    placeholder?: string;      // Placeholder personalizado
  };
showAlerts: {
    error: boolean;      // Mostrar alerta de error/instrucciones
    success: boolean;    // Mostrar alerta de éxito
    warning?: boolean;   // Mostrar alerta de advertencia (opcional)
    info?: boolean;      // Mostrar alerta informativa (opcional)
  };
  formType?: 'standard' | 'grouped';

  groupedConfig?: {
    columns: Array<{
      key: string;
      label: string;
      applicability: 'required' | 'notApplicable' | 'requiredWithCount';
    }>;
    instructionText?: string;
    hasTipoServicio?: boolean;
    hasDescripcionAparato?: boolean;
    notaImportante?: string;
  };
  
  // Mensajes de alerta personalizados
  alerts: {
    error?: {
      title: string;
      description: string;
    };
    warning?: {
      title: string;
      description: string;
    };
    success?: {
      message: string;
    };
    info?: {
      message: string;
    };
  };

  observacionesGenerales?: {
    label: string;           // Etiqueta del campo
    placeholder: string;     // Texto placeholder
    required: boolean;       // Si es obligatorio
    maxLength?: number;      // Límite de caracteres
    helperText?: string;     // Texto de ayuda
  };
  
  // Campos de firma requeridos
  signatures: {
    inspector: {
      enabled: boolean;
      label: string;
    };
    supervisor?: {
      enabled: boolean;
      label: string;
    };
  };
  
  // Validaciones adicionales
  // customValidations?: {
  //   [key: string]: any;
  // };
}

// ==================== CONFIGURACIONES POR CÓDIGO ====================

export const FORM_CONFIGS: Record<string, FormFeatureConfig> = {
  // Amoladora, Soldar, Esmeril (tienen código de color)
  'INSP-AMOL-001': {
    code: 'INSP-AMOL-001',
    name: 'Amoladora Angular',
    hasCodigoColorTrimestre: true,
    hasFirmaSupervisor: false,
    hasObservacionesGenerales: false,
    hasFirmaInspector: true,
    showAlerts: {
      error: true,
      success: true,
    },
    alerts: {
      error: {
        title: 'QUE DEBE HACER SI MARCÓ ALGUNA CASILLA ROJA "NO LO USE"',
        description: 'Si luego de la inspección algún ítem no cumple con el estándar (cuando marca en cualquier casilla roja) NO LO USE, estos deben ser removidos del lugar de trabajo, señalizados y dados de baja si corresponde. Adicionalmente debe avisar inmediatamente a su Supervisor o Responsable del área para su corrección.'
      },
      success: {
        message: 'Si todas las casillas están marcadas en VERDE, la amoladora está en condiciones de uso seguro.'
      }
    },
    signatures: {
      inspector: {
        enabled: true,
        label: 'Inspector'
      }
    }
  },

  'INSP-SOLD-001': {
    code: 'INSP-SOLD-001',
    name: 'Equipo de Soldar',
    hasCodigoColorTrimestre: true,
    hasFirmaSupervisor: false,
    hasObservacionesGenerales: false,
    hasFirmaInspector: true,
    showAlerts: {
      error: true,
      success: true,
    },
    alerts: {
      error: {
        title: 'QUE DEBE HACER SI MARCÓ ALGUNA CASILLA ROJA "NO LO USE"',
        description: 'Si luego de la inspección algún ítem no cumple con el estándar (cuando marca en cualquier casilla roja) NO LO USE, estos deben ser removidos del lugar de trabajo, señalizados y dados de baja si corresponde. Adicionalmente debe avisar inmediatamente a su Supervisor o Responsable del área para su corrección.'
      },
      success: {
        message: 'Si todas las casillas están marcadas en VERDE, el equipo de soldar está en condiciones de uso seguro.'
      }
    },
    signatures: {
      inspector: {
        enabled: true,
        label: 'Inspector'
      }
    }
  },

  'INSP-ESME-001': {
    code: 'INSP-ESME-001',
    name: 'Esmeril',
    hasCodigoColorTrimestre: true,
    hasFirmaSupervisor: false,
    hasObservacionesGenerales: false,
    hasFirmaInspector: true,
    showAlerts: {
      error: true,
      success: true,
    },
    alerts: {
      error: {
        title: 'QUE DEBE HACER SI MARCÓ ALGUNA CASILLA ROJA "NO LO USE"',
        description: 'Si luego de la inspección algún ítem no cumple con el estándar (cuando marca en cualquier casilla roja) NO LO USE, estos deben ser removidos del lugar de trabajo, señalizados y dados de baja si corresponde. Adicionalmente debe avisar inmediatamente a su Supervisor o Responsable del área para su corrección.'
      },
      success: {
        message: 'Si todas las casillas están marcadas en VERDE, el esmeril está en condiciones de uso seguro.'
      }
    },
    signatures: {
      inspector: {
        enabled: true,
        label: 'Inspector'
      }
    }
  },

  // Cilindros (NO tiene código de color, SÍ tiene supervisor)
  'INSP-CIL-001': {
    code: 'INSP-CIL-001',
    name: 'Cilindros para Gases Comprimidos',
    hasCodigoColorTrimestre: false,
    hasFirmaSupervisor: true,
    hasObservacionesGenerales: false,
    hasFirmaInspector: true,
    showAlerts: {
      error: true,
      success: true,
    },
    alerts: {
      error: {
        title: 'QUE DEBE HACER SI MARCÓ ALGUNA CASILLA ROJA "NO LO USE"',
        description: 'Si luego de la inspección algún ítem no cumple con el estándar (cuando marca en cualquier casilla roja) NO LO USE, estos deben ser removidos del lugar de trabajo, señalizados y dados de baja si corresponde. Adicionalmente debe avisar inmediatamente a su Supervisor o Responsable del área para su corrección.'
      },
      success: {
        message: 'Si todas las casillas están marcadas en VERDE, el cilindro está en condiciones de uso seguro.'
      }
    },
    signatures: {
      inspector: {
        enabled: true,
        label: 'Inspector'
      },
      supervisor: {
        enabled: true,
        label: 'Supervisor / Responsable del Área'
      }
    }
  },

  '2.03.P10.F05': {
    code: '2.03.P10.F05',
    name: 'INSPECCION  DE  TALADRO DE BANCO',
    hasCodigoColorTrimestre: true,
    hasFirmaSupervisor: true,
    hasObservacionesGenerales: false,
    hasFirmaInspector: true,
    showAlerts: {
      error: true,
      success: true,
    },
    alerts: {
      error: {
        title: 'Si algún ítem del 1 al 20 se marcó NO, el equipo NO ESTA APTO PARA SU USO',
        description: 'Coloque cinta ROJA y gestione su mantenimiento o reparación con el Supervisor del Área. Si ya no tiene arreglo dar de Baja'
      },
      success: {
        message: 'Si todos los  ítems están marcados SI o N/A, el taladro es APTO PARA SU USO. '
      }
    },
    signatures: {
      inspector: {
        enabled: true,
        label: 'PERSONA QUE REALIZA LA INSPECCIÓN'
      },
      supervisor: {
        enabled: true,
        label: 'VoBo del  SUPERVISOR DEL ÁREA ( MSC S.A.)'
      }
    }
  },

  '3.04.P04.F23': {
    code: '3.04.P04.F23',
    name: 'INSPECCION  DE  TALADRO DE BANCO',
    hasCodigoColorTrimestre: false,
    hasFirmaSupervisor: true,
    hasObservacionesGenerales: true,
    hasFirmaInspector: true,
    showAlerts: {
      error: false,
      success: false,
      info: true,
    },
    alerts: {
      error: {
        title: 'Si algún ítem del 1 al 20 se marcó NO, el equipo NO ESTA APTO PARA SU USO',
        description: 'Coloque cinta ROJA y gestione su mantenimiento o reparación con el Supervisor del Área. Si ya no tiene arreglo dar de Baja'
      },
      success: {
        message: 'Si todos los  ítems están marcados SI o N/A, el taladro es APTO PARA SU USO. '
      },
      info: {
        message: '3. OTRAS OBSERVACIONES (En caso de encontrar observaciones relevantes NO deescritas en la lista y que pueden afectar la operación o seguridad describa las mismas)'
      }

    },

    observacionesGenerales: {
      label: 'Observaciones Generales',
      placeholder: 'Ingrese cualquier observación adicional sobre el estado de la amoladora, condiciones especiales encontradas, o recomendaciones...',
      required: false,
      maxLength: 1000,
      helperText: 'Máximo 1000 caracteres. Incluya detalles importantes que no estén cubiertos en las preguntas anteriores.'
    },

    
    signatures: {
      inspector: {
        enabled: true,
        label: 'PERSONA QUE REALIZA LA INSPECCIÓN'
      },
      supervisor: {
        enabled: true,
        label: 'VoBo del  SUPERVISOR DEL ÁREA ( MSC S.A.)'
      }
    }
  },
  '3.04.P04.F35': {
    code: '3.04.P04.F35',
    name: 'INSPECCION PUENTE GRUA A CONTROL REMOTO Y ACCESORIOS DE IZAJE (Inspección Pre-uso)',
    hasCodigoColorTrimestre: false,
    hasFirmaSupervisor: true,
    hasObservacionesGenerales: false,
    hasFirmaInspector: true,
    showAlerts: {
      error: false,
      success: false,
    },
    alerts: {
      error: {
        title: 'Si algún ítem del 1 al 20 se marcó NO, el equipo NO ESTA APTO PARA SU USO',
        description: 'Coloque cinta ROJA y gestione su mantenimiento o reparación con el Supervisor del Área. Si ya no tiene arreglo dar de Baja'
      },
      success: {
        message: 'Si todos los  ítems están marcados SI o N/A, el taladro es APTO PARA SU USO. '
      }
    },
    signatures: {
      inspector: {
        enabled: true,
        label: 'Inspeccionado por ( Nombre y firma)'
      },
      supervisor: {
        enabled: true,
        label: 'Verificado por ( Nombre y firma)'
      }
    }
  },

  '3.04.P37.F19': {
    code: '3.04.P37.F19',
    name: 'INSPECCIÓN PRE-USO DE ELEMENTOS Y ACCESORIOS DE IZAJE - ESLINGAS SINTÉTICAS, ESLINGAS DE CABLE DE ACERO, GRILLETES Y GANCHOS',
    hasCodigoColorTrimestre: false,
    hasFirmaSupervisor: false,
    hasObservacionesGenerales: true,
    hasFirmaInspector: false,
    showAlerts: {
      error: false,
      success: false,
      warning: true,
    },

    formType: 'grouped',

    groupedConfig: {
      columns: [
        {
          key: 'eslinga',
          label: 'ESLINGA/CADENA',
          applicability: 'requiredWithCount',
        },
        {
          key: 'estrobo',
          label: 'ESTROBO',
          applicability: 'requiredWithCount',
        },
        {
          key: 'grilletes',
          label: 'GRILLETES',
          applicability: 'requiredWithCount',
        },
        {
          key: 'ganchos',
          label: 'GANCHOS',
          applicability: 'requiredWithCount',
        }
      ],
      instructionText: 'Las casillas de los criterios de inspección deben ser marcados: Sí: No y NA (no aplica). Casillas en rojo determinan si se utiliza el ítem. / Acc. de izaje: en amarillo se registra la cantidad por tipo de elem. / Acc. de izaje.',
      hasTipoServicio: true,
      hasDescripcionAparato: true,
      notaImportante: 'Cuando uno o varios elementos / accesorios de izaje sean rechazados, se debe registrar en comentarios el(los) ítem registrado o ítem(s) de identificación.'
    },
    alerts: {
      warning: {
        title: 'Si algún ítem del 1 al 20 se marcó NO, el equipo NO ESTA APTO PARA SU USO',
        description: 'Coloque cinta ROJA y gestione su mantenimiento o reparación con el Supervisor del Área. Si ya no tiene arreglo dar de Baja'
      },
      success: {
        message: 'Si todos los  ítems están marcados SI o N/A, el taladro es APTO PARA SU USO. '
      }
    },
    signatures: {
      inspector: {
        enabled: false,
        label: 'Inspeccionado por ( Nombre y firma)'
      },
      supervisor: {
        enabled: false,
        label: 'Verificado por ( Nombre y firma)'
      }
    }
  },

  '3.04.P37.F24': {
    code: '3.04.P37.F24',
    name: 'INSPECCIÓN PRE USO DE TECLES DE CADENAS Y A PALANCA, MANUALES Y ELÉCTRICOS (POLIPASTOS)',
    hasCodigoColorTrimestre: false,
    hasFirmaSupervisor: false,
    hasObservacionesGenerales: true,
    hasFirmaInspector: false,
    showAlerts: {
      error: false,
      success: false,
    },
    observacionesGenerales: {
      label: 'Observaciones',
      placeholder: 'Ingrese cualquier observación adicional sobre el estado de la amoladora, condiciones especiales encontradas, o recomendaciones...',
      required: false,
      maxLength: 10000,
      helperText: 'Máximo 10000 caracteres. Incluya detalles importantes que no estén cubiertos en las preguntas anteriores.'
    },
    

    questionObservations: {
      enabled: false,  
    },
    
    alerts: {
      error: {
        title: 'Si algún ítem del 1 al 20 se marcó NO, el equipo NO ESTA APTO PARA SU USO',
        description: 'Coloque cinta ROJA y gestione su mantenimiento o reparación con el Supervisor del Área. Si ya no tiene arreglo dar de Baja'
      },
      success: {
        message: 'Si todos los  ítems están marcados SI o N/A, el taladro es APTO PARA SU USO. '
      }
    },
    signatures: {
      inspector: {
        enabled: true,
        label: 'Inspeccionado por ( Nombre y firma)'
      },
      supervisor: {
        enabled: true,
        label: 'Verificado por ( Nombre y firma)'
      }
    }
  },
  '3.04.P37.F25': {
    code: '3.04.P37.F25',
    name: 'INSPECCIÓN FRECUENTE DE TECLES DE CADENAS - (POLIPASTOS)',
    hasCodigoColorTrimestre: false,
    hasFirmaSupervisor: false,
    hasObservacionesGenerales: true,
    hasFirmaInspector: false,
    hasConclusion: true,
    showAlerts: {
      error: false,
      success: false,
    },
    observacionesGenerales: {
      label: 'Recomendaciones',
      placeholder: 'Ingrese cualquier observación adicional sobre el estado de la amoladora, condiciones especiales encontradas, o recomendaciones...',
      required: false,
      maxLength: 10000,
      helperText: 'Máximo 10000 caracteres. Incluya detalles importantes que no estén cubiertos en las preguntas anteriores.'
    },
    

    questionObservations: {
      enabled: false,  
    },
    
    alerts: {
      error: {
        title: 'Si algún ítem del 1 al 20 se marcó NO, el equipo NO ESTA APTO PARA SU USO',
        description: 'Coloque cinta ROJA y gestione su mantenimiento o reparación con el Supervisor del Área. Si ya no tiene arreglo dar de Baja'
      },
      success: {
        message: 'Si todos los  ítems están marcados SI o N/A, el taladro es APTO PARA SU USO. '
      }
    },
    signatures: {
      inspector: {
        enabled: true,
        label: 'Inspeccionado por ( Nombre y firma)'
      },
      supervisor: {
        enabled: true,
        label: 'Verificado por ( Nombre y firma)'
      }
    }
  },
  '3.04.P48.F03': {
    code: '3.04.P48.F03',
    name: 'LISTA DE VERIFICACIÓN DE VEHÍCULOS Y EQUIPOS MÓVILES',
    hasCodigoColorTrimestre: false,
    hasFirmaSupervisor: false,
    hasObservacionesGenerales: true,
    hasFirmaInspector: true,
    hasConclusion: false,
    hasVehicleDamage: true,
    showAlerts: {
      error: false,
      success: false,
    },
    observacionesGenerales: {
      label: 'Observaciones en general de todo el check list:',
      placeholder: 'Ingrese cualquier observación adicional sobre el estado de la amoladora, condiciones especiales encontradas, o recomendaciones...',
      required: false,
      maxLength: 10000,
      helperText: 'Máximo 10000 caracteres. Incluya detalles importantes que no estén cubiertos en las preguntas anteriores.'
    },
    

    questionObservations: {
      enabled: false,  
    },
    
    alerts: {
      error: {
        title: 'Si algún ítem del 1 al 20 se marcó NO, el equipo NO ESTA APTO PARA SU USO',
        description: 'Coloque cinta ROJA y gestione su mantenimiento o reparación con el Supervisor del Área. Si ya no tiene arreglo dar de Baja'
      },
      success: {
        message: 'Si todos los  ítems están marcados SI o N/A, el taladro es APTO PARA SU USO. '
      }
    },
    signatures: {
      inspector: {
        enabled: true,
        label: 'Inspeccionado por ( Nombre y firma)'
      },
      supervisor: {
        enabled: true,
        label: 'Verificado por ( Nombre y firma)'
      }
    }
  },
  
};

// ==================== HELPERS ====================

/**
 * Obtiene la configuración para un código de template
 * Si no existe configuración específica, retorna una por defecto
 */
export function getFormConfig(templateCode: string): FormFeatureConfig {
  const config = FORM_CONFIGS[templateCode];
  
  if (!config) {
    console.warn(`No se encontró configuración para el código: ${templateCode}. Usando configuración por defecto.`);
    return getDefaultConfig(templateCode);
  }
  
  return config;
}

/**
 * Configuración por defecto para códigos no definidos
 */
function getDefaultConfig(templateCode: string): FormFeatureConfig {
  return {
    code: templateCode,
    name: 'Inspección de Equipo',
    hasCodigoColorTrimestre: false,
    hasFirmaSupervisor: false,
    hasObservacionesGenerales: true,
    hasFirmaInspector: false,
    showAlerts: {
      error: false,
      success: false,
    },
    alerts: {
      error: {
        title: 'INSTRUCCIONES DE SEGURIDAD',
        description: 'Si detecta algún problema durante la inspección, no use el equipo y notifique inmediatamente a su supervisor.'
      },
      success: {
        message: 'El equipo ha pasado la inspección satisfactoriamente.'
      }
    },
    signatures: {
      inspector: {
        enabled: false,
        label: 'Inspector'
      }
    }
  };
}

/**
 * Valida si un template requiere código de color
 */
export function requiresCodigoColor(templateCode: string): boolean {
  const config = getFormConfig(templateCode);
  return config.hasCodigoColorTrimestre;
}

/**
 * Valida si un template requiere firma de supervisor
 */
export function requiresSupervisorSignature(templateCode: string): boolean {
  const config = getFormConfig(templateCode);
  return config.hasFirmaSupervisor;
}

/**
 * Obtiene los mensajes de alerta para un template
 */
export function getAlertMessages(templateCode: string) {
  const config = getFormConfig(templateCode);
  return config.alerts;
}