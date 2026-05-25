export interface ResponseOption {
  label: string;
  value: string | number | boolean;
  color?: string;
}

export type ResponseType =
  | 'si_no_na'
  | 'bueno_malo_na'
  | 'bien_mal'
  | 'operativo_mantenimiento'
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'date';

export const FIXED_OPTION_COLORS: readonly string[] = ['#1976d2', '#607d8b', '#ffffff'];

export const DEFAULT_OPTIONS_MAP: Partial<Record<ResponseType, ResponseOption[]>> = {
  si_no_na: [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
    { value: 'na', label: 'N/A' },
  ],
  bueno_malo_na: [
    { value: 'bueno', label: 'Bueno' },
    { value: 'malo', label: 'Malo' },
    { value: 'na', label: 'N/A' },
  ],
  bien_mal: [
    { value: 'bien', label: 'Bien' },
    { value: 'mal', label: 'Mal' },
  ],
  operativo_mantenimiento: [
    { value: 'operativo', label: 'Operativo' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
  ],
};

export interface ResponseConfig {
  type: ResponseType;
  options?: ResponseOption[];
  placeholder?: string;
  min?: number;
  max?: number;
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
