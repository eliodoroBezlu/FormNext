import { Section } from './Section';

export interface VerificationField {
  label: string;
  type: string;
  /** Valores ofrecidos cuando `type` es `select`. */
  options?: string[];
  /** Con `type: select`, admite un valor fuera de la lista. */
  permiteOtro?: boolean;
  dataSource?: string;
  obligatorio?: boolean;
}

export type UnidadFrecuencia =
  | "diaria"
  | "semanal"
  | "mensual"
  | "trimestral"
  | "semestral"
  | "anual"
  | "personalizada";

export interface FrecuenciaInspeccion {
  unidad: UnidadFrecuencia;
  valorPersonalizado?: number;
  activa: boolean;
}

export interface FormTemplateHerraEquipos {
  _id: string;
  name: string;
  code: string;
  revision: string;
  type: "interna" | "externa";
  descripcion?: string;
  verificationFields: VerificationField[];
  sections: Section[];
  campoCodigoEquipo?: string;
  frecuencia?: FrecuenciaInspeccion;
  createdAt: Date;
  updatedAt: Date;
}
