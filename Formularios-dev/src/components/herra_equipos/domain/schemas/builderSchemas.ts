import { z } from "zod"

export const ResponseOptionSchema = z.object({
  label: z.string().min(1, "La etiqueta es obligatoria"),
  value: z.union([z.string(), z.number(), z.boolean()]),
  color: z.string().optional(),
})

export const ResponseConfigSchema = z.object({
  type: z.enum([
    "si_no_na",
    "text",
    "number",
    "boolean",
    "date",
    "textarea",
    "bien_mal",
    "bueno_malo_na",
    "operativo_mantenimiento"
  ]),
  options: z.array(ResponseOptionSchema).optional(),
  placeholder: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
})

export const QuestionSchema = z.object({
  _id: z.string().optional(),
  text: z.string().min(1, "El texto de la pregunta es obligatorio"),
  obligatorio: z.boolean(),
  responseConfig: ResponseConfigSchema,
  order: z.number().optional(),
  image: z.object({
    url: z.string(),
    caption: z.string(),
  }).optional()
})

export const SectionImageSchema = z.object({
  _id: z.string().optional(),
  url: z.string(),
  caption: z.string(),
  order: z.number().optional()
})

// Subsección (sin recursión profunda para evitar problemas con el resolver)
const SubsectionSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, "El título de la subsección es obligatorio"),
  description: z.string().optional(),
  images: z.array(SectionImageSchema).optional(),
  questions: z.array(QuestionSchema),
  order: z.number().optional(),
  isParent: z.boolean().optional(),
  parentId: z.string().nullable().optional(),
  subsections: z.array(z.any()).optional()
})

export const SectionSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, "El título de la sección es obligatorio"),
  description: z.string().optional(),
  images: z.array(SectionImageSchema).optional(),
  questions: z.array(QuestionSchema),
  order: z.number().optional(),
  isParent: z.boolean().optional(),
  parentId: z.string().nullable().optional(),
  subsections: z.array(SubsectionSchema).optional()
})

export const VerificationFieldSchema = z.object({
  label: z.string().min(1, "El label es obligatorio"),
  type: z.enum(["text", "date", "number", "select", "autocomplete", "firma", "time"]),
  options: z.array(z.string()).optional(),
  dataSource: z.string().optional(),
  obligatorio: z.boolean().optional()
})

export const FormBuilderDataSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  code: z.string().min(1, "El código es obligatorio"),
  revision: z.string().min(1, "La revisión es obligatoria"),
  type: z.enum(["interna", "externa"]),
  verificationFields: z.array(VerificationFieldSchema),
  sections: z.array(SectionSchema).min(1, "Debes agregar al menos una sección al formulario")
})
