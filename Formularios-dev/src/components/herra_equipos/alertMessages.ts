// components/form-filler/specialized/config/alertMessages.ts

export interface AlertConfig {
  error: {
    title: string;
    description: string;
    rangeItems?: string; // "1 al 25", "1 al 30", etc.
  };
  success: {
    message: string;
  };
}

export const ALERT_MESSAGES: Record<string, AlertConfig> = {
  '1.02.P06.F39': {
    error: {
      title: 'Si algún ÍTEM del 1 al 25 se marcó NO entonces el equipo no debe usarse, adicionalmente debe avisar inmediatamente a su Supervisor o Responsable del área para su corrección.',
      description: 'La amoladora debe ser mantenida para corrección de los ítems que no cumplen los requisitos',
      rangeItems: '1 al 25'
    },
    success: {
      message: 'Todos los ítems arriba mencionados marcaron en la columna SI, el esmeril es seguro para su uso'
    }
  },
  '1.02.P06.F42': {
    error: {
      title: 'Si algún ÍTEM del 1 al 30 se marcó NO entonces el equipo no debe usarse, adicionalmente debe avisar inmediatamente a su Supervisor o Responsable del área para su corrección.',
      description: 'La amoladora angular grande debe ser revisada y mantenida antes de su próximo uso',
      rangeItems: '1 al 30'
    },
    success: {
      message: 'Todos los ítems arriba mencionados marcaron en la columna SI, la amoladora angular grande es segura para su uso'
    }
  },
  '1.02.P06.F40': {
    error: {
      title: 'Si algún ÍTEM del 1 al 20 se marcó NO entonces el equipo no debe usarse, adicionalmente debe avisar inmediatamente a su Supervisor o Responsable del área para su corrección.',
      description: 'El equipo debe ser inspeccionado y corregido antes de permitir su uso',
      rangeItems: '1 al 20'
    },
    success: {
      message: 'Todos los ítems arriba mencionados marcaron en la columna SI, el equipo es seguro para su uso'
    }
  },
  // Mensaje por defecto para códigos no configurados
  'DEFAULT': {
    error: {
      title: 'Si algún ÍTEM se marcó NO entonces el equipo no debe usarse, adicionalmente debe avisar inmediatamente a su Supervisor o Responsable del área para su corrección.',
      description: 'El equipo debe ser mantenido para corrección de los ítems que no cumplen los requisitos'
    },
    success: {
      message: 'Todos los ítems arriba mencionados marcaron en la columna SI, el equipo es seguro para su uso'
    }
  }
};

/**
 * Obtiene la configuración de alertas para un código específico
 * @param code - Código del formulario (ej: '1.02.P06.F39')
 * @returns Configuración de alertas o configuración por defecto
 */
export const getAlertMessages = (code: string): AlertConfig => {
  return ALERT_MESSAGES[code] || ALERT_MESSAGES['DEFAULT'];
};