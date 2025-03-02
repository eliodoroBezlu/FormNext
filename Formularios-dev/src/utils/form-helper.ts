import type { FormData, FormDataExport } from "@/types/formTypes"

export const extractFormData = (data: FormDataExport): FormData => {
  const { _id, ...formData } = data
  return formData as FormData
}

