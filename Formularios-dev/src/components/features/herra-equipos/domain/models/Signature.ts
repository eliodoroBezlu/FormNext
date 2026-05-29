export type SignatureFieldType = 
  | 'text' 
  | 'autocomplete' 
  | 'canvas' 
  | 'date'; 

export interface SignatureFieldConfig {
  enabled: boolean;
  type?: SignatureFieldType; 
  label?: string;
  placeholder?: string;
  required?: boolean;
  fieldName?: string;
  dataSource?: string; 
  heightPercentage?: number; 
}

export interface SignatureData {
  name?: string;
  signature?: string;           
  date?: string;                
  position?: string;
  license?: string;
  [key: string]: string | undefined;
}

export interface SignatureDetailsConfig {
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
