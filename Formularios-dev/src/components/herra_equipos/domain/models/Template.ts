import { Section } from './Section';

export interface VerificationField {
  label: string;
  type: string;
  options?: string[];
  dataSource?: string;
  obligatorio?: boolean;
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
