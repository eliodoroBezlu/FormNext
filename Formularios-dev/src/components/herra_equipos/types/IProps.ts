import { FieldErrors } from "react-hook-form";
import { DamageMarker } from "../VehicleDamageSelector";

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



export interface AccesorioConfig {
  cantidad: number;
  tipoServicio: string;
}

export interface AccesoriosConfig {
  [key: string]: AccesorioConfig;
}

export interface VehicleData {
  // Daños
  damages?: DamageMarker[];
  damageImageBase64?: string;
  damageObservations?: string;
  
  // Inspección
  tipoInspeccion?: "inicial" | "periodica";
  certificacionMSC?: "si" | "no";
  fechaProximaInspeccion?: string;
  responsableProximaInspeccion?: string;
}

export enum InspectionStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress', // ✅ NUEVO
  COMPLETED = 'completed',
}
export interface FormDataHerraEquipos {
  verification: Record<string, string | number>;
  generalObservations?: string;
  responses: Record<string, Record<string, QuestionResponseUnion>>;
  outOfService?: OutOfServiceData; // 🆕 Usar el tipo unificado
  accesoriosConfig?: AccesoriosConfig
  vehicle?: VehicleData;
  scaffold?: ScaffoldData;
  selectedSubsections?: string[];
  selectedItems?: Record<string, string[]>;

  inspectorSignature?: Record<string, string | number>;
  supervisorSignature?: Record<string, string | number>;
  status?: InspectionStatus;
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

export type SignatureFieldType = 
  | 'text' // TextField normal (para códigos, nombres manuales)
  | 'autocomplete' // AutocompleteCustom (para seleccionar de listas)
  | 'canvas' // SignatureCanvas (firma digital real)
  | 'date'; // DatePicker (fechas)

export interface SignatureFieldConfig {
  enabled: boolean;
  type?: SignatureFieldType; // ✅ NUEVO: Tipo de campo
  label?: string;
  placeholder?: string;
  required?: boolean;
  fieldName?: string;
  dataSource?: string; // Para autocomplete
  heightPercentage?: number; // Para canvas
}

export interface SignatureConfig {
  inspector: boolean | SignatureDetailsConfig;
  supervisor: boolean | SignatureDetailsConfig;
}

export interface SignatureData {
  // Campos estándar
  name?: string;
  signature?: string;           // base64 si es canvas, o texto/código
  date?: string;                // ISO string
  position?: string;
  license?: string;
  
  // Campos custom adicionales
  [key: string]: string | undefined;
}

export interface SignatureDetailsConfig {
  enabled: boolean;
  title?: string;               // Título de la sección (ej: "Firma del Inspector")
  fields?: {
    // Campos estándar
    name?: SignatureFieldConfig;
    signature?: SignatureFieldConfig;
    date?: SignatureFieldConfig;
    position?: SignatureFieldConfig;
    license?: SignatureFieldConfig;
    
    // Permite campos custom adicionales
    [key: string]: SignatureFieldConfig | undefined;
  };
}

export interface SignatureConfig {
  inspector: boolean | {
    enabled: boolean;
    title?: string;
    fields?: {
      name?: SignatureFieldConfig;
      signature?: SignatureFieldConfig;
      date?: SignatureFieldConfig;
      position?: SignatureFieldConfig;
      license?: SignatureFieldConfig;
      [key: string]: SignatureFieldConfig | undefined;
    };
  };
  supervisor: boolean | {
    enabled: boolean;
    title?: string;
    fields?: {
      name?: SignatureFieldConfig;
      signature?: SignatureFieldConfig;
      date?: SignatureFieldConfig;
      position?: SignatureFieldConfig;
      license?: SignatureFieldConfig;
      [key: string]: SignatureFieldConfig | undefined;
    };
  };
}

export interface AlertConfig {
  show: boolean
  message?: string
  description?:string
  variant?: "default" | "destructive" | "warning"
}

export interface ColorCodeConfig {
  enabled: boolean
  hasTrimestre: boolean
}

export interface ConclusionCheckboxOptions {
  liberatedLabel?: string;
  liberatedColor?: string;
  notLiberatedLabel?: string;
  notLiberatedColor?: string;
}

export interface ConclusionConfig {
  enabled: boolean
  label?: string
  placeholder?: string
  showCheckbox?: boolean;
  checkboxOptions?: ConclusionCheckboxOptions;
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
  [key: string]: string | OutOfServiceResponse | undefined; 
}
export interface DynamicFieldConfig {
  type: 'text' | 'date' | 'number' | 'select' | 'autocomplete' | 'radioGroup'; // ✅ NUEVO tipo
  label: string;
  placeholder?: string;
  required?: boolean;
  fieldName: string;
  
  // Para select/autocomplete
  options?: string[] | { label: string; value: string }[];
  dataSource?: string;
  
  // ✅ NUEVO: Para radioGroup
  responseType?: "yes-no" | "yes-no-na" | "yes-no-na-nr" | "AP-MAN-RECH";
  defaultValue?: string;
  
  // Para validaciones
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  
  // Configuración de grid
  gridColumn?: string;
}

export interface OutOfServiceSectionConfig {
  enabled: boolean;
  title?: string; // Título opcional para la sección
  fields: DynamicFieldConfig[]; // Array de campos configurables
}


export interface OutOfServiceConfig {
  enabled: boolean
  label?: string
  showConclusion?: boolean
  responseType?: "yes-no" | "yes-no-na" | "yes-no-na-nr" | "AP-MAN-RECH" // Tipos de respuesta
  required?: boolean
  defaultValue?: string

  header?: OutOfServiceSectionConfig;
  footer?: OutOfServiceSectionConfig;
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

export interface SelectableItemConfig {
  sectionTitle: string; // Título de la sección/subsección padre
  label?: string; // Etiqueta personalizada para el selector
  helperText?: string;
  defaultSelected?: string[]; // Títulos pre-seleccionados
  required?: boolean;
  // ✅ Puede tener selectores anidados (para subsecciones de subsecciones)
  nested?: SelectableItemConfig[];
}

export interface SectionSelector {
  enabled: boolean;
  items: SelectableItemConfig[]; // ✅ Múltiples secciones configurables
}

export interface SubsectionSelector {
  enabled: boolean;
  parentSectionTitle?: string; // Título de la sección padre
  label?: string;
  helperText?: string;
  defaultSelected?: string[]; // Subsecciones pre-seleccionadas
  required?: boolean; // Si es obligatorio seleccionar al menos una
}

export interface FormFeatureConfig {
  formCode: string
  formName: string
  formType: "standard" | "grouped" | "vehicle" | "scaffold"

  // Feature flags
  signatures?: SignatureConfig;
  alert?: AlertConfig
  colorCode?: ColorCodeConfig
  conclusion?: ConclusionConfig
  vehicle?: VehicleConfig
  questionObservations?: QuestionObservationsConfig // ✅ NUEVO
  generalObservations?: GeneralObservationsConfig // ✅ NUEVO
  outOfService?: OutOfServiceConfig
  questionDescription?: QuestionDescriptionConfig
  routineInspection?: RoutineInspectionConfig;
  sectionSelector?: SectionSelector;

  groupedConfig?: {
    columns: Array<{
      key: string;
      label: string;
      applicability: 'required' | 'notApplicable' | 'requiredWithCount';
    }>;
    questionColumnColors?: Record<number, Record<string, string>>;
    instructionText?: string;
    hasTipoServicio?: boolean;
    hasDescripcionAparato?: boolean;
    notaImportante?: string;
  };

  subsectionSelector?: SubsectionSelector;

  // Additional metadata
  requiresPhotos?: boolean
  allowDraft?: boolean
}

// Helper type for form config registry
export type FormConfigRegistry = Record<string, FormFeatureConfig>


//scaffold 

export interface RoutineInspectionEntry {
  date: string;
  inspector: string;
  response: "si" | "no";
  observations?: string;
  signature?: string;
}

export interface RoutineInspectionConfig {
  enabled: boolean;
  title?: string;
  question?: string;
  maxEntries?: number;
  fields?: {
    showDate?: boolean;
    dateLabel?: string;
    dateRequired?: boolean;
    
    showInspector?: boolean;
    inspectorLabel?: string;
    inspectorRequired?: boolean;
    
    showResponse?: boolean;
    responseLabel?: string;
    responseRequired?: boolean;
    
    showObservations?: boolean;
    observationsLabel?: string;
    observationsPlaceholder?: string;
    
    showSignature?: boolean;
    signatureLabel?: string;
  };
}

export interface ScaffoldData {
  routineInspections?: RoutineInspectionEntry[];
  finalConclusion?: "liberado" | "no_liberado"; // ✅ Mantener español
}




