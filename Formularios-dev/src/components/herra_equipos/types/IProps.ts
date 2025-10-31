import { FieldErrors } from "react-hook-form";

export interface ResponseOption {
  label: string;
  value: string | number | boolean;
  color?: string;
}

export interface ResponseConfig {
  type: string; // Agregar "grouped_columns" como nuevo tipo
  options?: ResponseOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  // 🆕 Configuración específica para preguntas agrupadas
  groupedConfig?: {
    columns: Array<{
      key: string;
      label: string;
      applicability: 'required' | 'notApplicable' | 'requiredWithCount';
    }>;
    instructionText?: string;
  };
}

export interface GroupedQuestionData {
  values: {
    [key: string]: string; // "si", "no", "na"
  };
  observacion: string;
}

export interface ColumnConfig {
  key: string;
  label: string;
  applicability: 'required' | 'notApplicable' | 'requiredWithCount';
}

export interface Question {
  _id?: string;
  text: string;
  obligatorio: boolean;
  responseConfig: ResponseConfig;
  order?: number;
  image?: {
    url: string;
    caption: string;
  };
   isGrouped?: boolean;
}

export interface SectionImage {
  _id?: string;
  url: string;
  caption: string;
  order?: number;
}

export interface Section {
  _id?: string;
  title: string;
  description?: string;
  images?: SectionImage[];
  questions: Question[];
  order?: number;
  isParent?: boolean;
  parentId?: string | null;
  subsections?: Section[];
}

export interface VerificationField {
  label: string;
  type: string;
  options?: string[];
  dataSource?: string;
}

export interface FormTemplateHerraEquipos {
  _id: string;
  name: string;
  code: string;
  revision: string;
  type: "interna" | "externa";
  verificationFields: VerificationField[];
  sections: Section[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionResponse {
  value: string | number | boolean;
  observacion?: string;
  description?: string;
}

export type QuestionResponseUnion = QuestionResponse | GroupedQuestionData;

export const isGroupedQuestionData = (obj: unknown): obj is GroupedQuestionData => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'values' in obj &&
    'observacion' in obj &&
    typeof (obj as GroupedQuestionData).values === 'object' &&
    (obj as GroupedQuestionData).values !== null &&
    typeof (obj as GroupedQuestionData).observacion === 'string'
  );
};

// 🆕 Versión mejorada para QuestionResponse
export const isQuestionResponse = (obj: unknown): obj is QuestionResponse => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'value' in obj &&
    (typeof (obj as QuestionResponse).value === 'string' ||
     typeof (obj as QuestionResponse).value === 'number' ||
     typeof (obj as QuestionResponse).value === 'boolean')
  );
};

export type OutOfServiceResponse = "yes" | "no" | "na" | "nr";
export type OutOfServiceResponseType = "yes-no" | "yes-no-na" | "yes-no-na-nr";


export interface FormDataHerraEquipos {
  verification: Record<string, string | number>;
  responses: Record<string, Record<string, QuestionResponseUnion>>;
  outOfService?: OutOfServiceData; // 🆕 Usar el tipo unificado
}

export interface FormResponse {
  templateId: string;
  verificationData: Record<string, string | number>;
  responses: Record<string, Record<string, QuestionResponseUnion>>; // 🆕 Usar el tipo unificado aquí también
  submittedAt: Date;
  status: "draft" | "completed";
}

// Helper para obtener errores anidados
export const getNestedError = (
  errors: FieldErrors,
  path: string
): { message?: string } | undefined => {
  const parts = path.split(".");
  let current: unknown = errors;

  for (const part of parts) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current as { message?: string } | undefined;
};


//form
export interface SignatureConfig {
  inspector: boolean
  supervisor: boolean
}

export interface AlertConfig {
  show: boolean
  message?: string
  variant?: "default" | "destructive" | "warning"
}

export interface ColorCodeConfig {
  enabled: boolean
  hasTrimestre: boolean
}

export interface ConclusionConfig {
  enabled: boolean
  label?: string
  placeholder?: string
}

export interface VehicleConfig {
  hasDamageSelector: boolean
  hasNextInspectionDate: boolean
}

// ✅ NUEVAS INTERFACES
export interface QuestionObservationsConfig {
  enabled: boolean
  required?: boolean
  label?: string
  placeholder?: string
}

export interface QuestionDescriptionConfig extends QuestionObservationsConfig {
  maxLength?: number
}

export interface GeneralObservationsConfig {
  enabled: boolean
  required?: boolean
  label?: string
  placeholder?: string
  maxLength?: number
  helperText?: string
}

export interface OutOfServiceData {
  status?: OutOfServiceResponse;
  date?: string;
  observations?: string;
  tag?: string;          // ✅ NUEVO
  inspector?: string;    // ✅ NUEVO
  capacidad?: string;    // ✅ NUEVO
  tipo?: string; 
}

export interface OutOfServiceConfig {
  enabled: boolean
  label?: string
  showConclusion?: boolean
  responseType?: "yes-no" | "yes-no-na" | "yes-no-na-nr" | "AP-MAN-RECH" // Tipos de respuesta
  required?: boolean
  defaultValue?: string

  fields?: {
    showDate?: boolean;
    dateLabel?: string;
    dateRequired?: boolean;
    
    showResponsible?: boolean;
    responsibleLabel?: string;
    responsibleRequired?: boolean;

    showTag?: boolean;
    tagLabel?: string;
    tagRequired?: boolean;

    showInspector?: boolean;
    inspectorLabel?: string;
    inspectorRequired?: boolean;
    
    showCapacidad?: boolean;
    capacidadLabel?: string;
    capacidadRequired?: boolean;

    showTipo?: boolean;
    tipoLabel?: string;
    tipoRequired?: boolean;
    
    showObservations?: boolean;
    observationsLabel?: string;
    observationsPlaceholder?: string;
    observationsRequired?: boolean;
    observationsMaxLength?: number;
  };
}

export interface FormFeatureConfig {
  formCode: string
  formName: string
  formType: "standard" | "cylinder" | "grouped" | "vehicle"

  // Feature flags
  signatures?: SignatureConfig
  alert?: AlertConfig
  colorCode?: ColorCodeConfig
  conclusion?: ConclusionConfig
  vehicle?: VehicleConfig
  questionObservations?: QuestionObservationsConfig // ✅ NUEVO
  generalObservations?: GeneralObservationsConfig // ✅ NUEVO
  outOfService?: OutOfServiceConfig
  questionDescription?: QuestionDescriptionConfig

  // Additional metadata
  requiresPhotos?: boolean
  allowDraft?: boolean
}

// Helper type for form config registry
export type FormConfigRegistry = Record<string, FormFeatureConfig>




