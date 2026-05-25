export type ResponseType =
  | "si_no_na"
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "textarea"
  | "bien_mal"
  | "bueno_malo_na"
  | "operativo_mantenimiento"

export interface ResponseOptionHerraEquipos {
  label: string
  value: string | number | boolean
  color?: string
}

export interface ResponseConfigHerraEquipos {
  type: ResponseType
  options?: ResponseOptionHerraEquipos[]
  placeholder?: string
  min?: number
  max?: number
}

export interface QuestionHerraEquipos {
  _id?: string
  text: string
  obligatorio: boolean
  responseConfig: ResponseConfigHerraEquipos
  order?: number
  image?: {
    url: string
    caption: string
  }
}

export interface SectionImageHerraEquipos {
  _id?: string
  url: string
  caption: string
  order?: number
}

export interface SectionHerraEquipos {
  _id?: string
  title: string
  description?: string
  images?: SectionImageHerraEquipos[]
  questions: QuestionHerraEquipos[]
  order?: number
  isParent?: boolean
  parentId?: string | null
  subsections?: SectionHerraEquipos[]
}

export type VerificationFieldType =
  | "text"
  | "date"
  | "number"
  | "select"
  | "autocomplete"
  | "firma"
  | "time"

export interface VerificationFieldHerraEquipos {
  label: string
  type: VerificationFieldType
  options?: string[]
  dataSource?: string
  obligatorio?: boolean
}

export interface FormBuilderDataHerraEquipos {
  name: string
  code: string
  revision: string
  type: "interna" | "externa"
  verificationFields: VerificationFieldHerraEquipos[]
  sections: SectionHerraEquipos[]
}

export interface FormTemplateHerraEquipos extends FormBuilderDataHerraEquipos {
  _id: string
  createdAt: Date
  updatedAt: Date
}
