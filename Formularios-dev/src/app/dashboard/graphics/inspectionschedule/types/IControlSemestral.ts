export type EstadoSemestre = 'CUMPLIDO' | 'FUERA_PLAZO' | 'PENDIENTE' | 'CRITICO';

export interface SemestreInfo {
  llenado: boolean;
  fechaLlenado?: string;
  formularioId?: string;
  estado: EstadoSemestre;
  porcentaje: number;
}

export interface ControlSemestral {
  formularioId: string;
  nombreFormulario: string;
  año: number;
  primerSemestre: SemestreInfo;
  segundoSemestre: SemestreInfo;
  alerta: boolean;
  instancias: TemplateInstance[];
  totalInstancias: number;
  ultimaInstancia?: TemplateInstance;
}

export interface TemplateInstance {
  _id: string;
  templateId: string | { _id: string };
  status: string;
  createdAt: string;
  overallCompliancePercentage?: number;
  [key: string]: unknown;
}

export interface TemplateItem {
  _id: string;
  name: string;
  [key: string]: unknown;
}
