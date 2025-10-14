import { FieldErrors } from "react-hook-form";

export interface ResponseOption {
  label: string;
  value: string | number | boolean;
  color?: string;
}

export interface ResponseConfig {
  type: string;
  options?: ResponseOption[];
  placeholder?: string;
  min?: number;
  max?: number;
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

export interface FormTemplate {
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
}

export interface FormDataHerraEquipos  {
  verification: Record<string, string | number>;
  responses: Record<string, Record<string, QuestionResponse>>;
}

export interface FormResponse {
  templateId: string;
  verificationData: Record<string, string | number>;
  responses: Record<string, Record<string, QuestionResponse>>;
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