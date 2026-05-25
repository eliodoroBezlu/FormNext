import { SignatureConfig } from './Signature';

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

export interface DynamicFieldConfig {
  type: 'text' | 'date' | 'number' | 'select' | 'autocomplete' | 'radioGroup';
  label: string;
  placeholder?: string;
  required?: boolean;
  fieldName: string;
  options?: string[] | { label: string; value: string }[];
  dataSource?: string;
  responseType?: "yes-no" | "yes-no-na" | "yes-no-na-nr" | "AP-MAN-RECH";
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  gridColumn?: string;
}

export interface OutOfServiceSectionConfig {
  enabled: boolean;
  title?: string; 
  fields: DynamicFieldConfig[]; 
}

export interface OutOfServiceConfig {
  enabled: boolean
  label?: string
  showConclusion?: boolean
  responseType?: "yes-no" | "yes-no-na" | "yes-no-na-nr" | "AP-MAN-RECH" 
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
  sectionTitle: string;
  label?: string; 
  helperText?: string;
  defaultSelected?: string[]; 
  required?: boolean;
  nested?: SelectableItemConfig[];
}

export interface SectionSelector {
  enabled: boolean;
  items: SelectableItemConfig[];
}

export interface SubsectionSelector {
  enabled: boolean;
  parentSectionTitle?: string; 
  label?: string;
  helperText?: string;
  defaultSelected?: string[]; 
  required?: boolean; 
}

export interface FormFeatureConfig {
  formCode: string
  formName: string
  formType: "standard" | "grouped" | "vehicle" | "scaffold"

  signatures?: SignatureConfig;
  alert?: AlertConfig
  colorCode?: ColorCodeConfig
  conclusion?: ConclusionConfig
  vehicle?: VehicleConfig
  questionObservations?: QuestionObservationsConfig 
  generalObservations?: GeneralObservationsConfig 
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

  requiresPhotos?: boolean
  allowDraft?: boolean

  approval?: {
    enabled: boolean;
    requiredRoles: string[]; 
    allowSelfApproval?: boolean; 
    requiresComments?: boolean;
  };
}

export type FormConfigRegistry = Record<string, FormFeatureConfig>

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
