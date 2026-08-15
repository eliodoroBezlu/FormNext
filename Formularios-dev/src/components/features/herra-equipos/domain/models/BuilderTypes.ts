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
  /** Valores ofrecidos cuando `type` es `select`. */
  options?: string[]
  /**
   * Con `type: select`, deja escribir un valor fuera de la lista. Se guarda el
   * texto tal cual, no la palabra «Otro».
   */
  permiteOtro?: boolean
  dataSource?: string
  obligatorio?: boolean
}

export type UnidadFrecuencia =
  | "diaria"
  | "semanal"
  | "mensual"
  | "trimestral"
  | "semestral"
  | "anual"
  | "personalizada"

export interface FrecuenciaInspeccionHerraEquipos {
  unidad: UnidadFrecuencia
  valorPersonalizado?: number
  activa: boolean
}

export interface FormBuilderDataHerraEquipos {
  name: string
  code: string
  revision: string
  type: "interna" | "externa"
  descripcion?: string
  verificationFields: VerificationFieldHerraEquipos[]
  sections: SectionHerraEquipos[]
  campoCodigoEquipo?: string
  frecuencia?: FrecuenciaInspeccionHerraEquipos
  /**
   * Roles que ven y pueden llenar esta plantilla.
   * Vacío = visible para todos (comportamiento por defecto).
   */
  rolesVisibles?: string[]
}

export interface FormTemplateHerraEquipos extends FormBuilderDataHerraEquipos {
  _id: string
  createdAt: Date
  updatedAt: Date
}
