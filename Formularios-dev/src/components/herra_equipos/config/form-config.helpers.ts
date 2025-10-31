
import { FormFeatureConfig } from "../types/IProps"
import { formConfigRegistry } from "./form-configs"

/**
 * Obtiene la configuración de características para un formulario específico
 */
export const getFormConfig = (formCode: string): FormFeatureConfig | null => {
  return formConfigRegistry[formCode] || null
}

/**
 * Verifica si un formulario requiere código de color
 */
export const requiresColorCode = (formCode: string): boolean => {
  const config = getFormConfig(formCode)
  return config?.colorCode?.enabled ?? false
}

/**
 * Verifica si un formulario requiere código de color con trimestre
 */
export const requiresColorCodeWithTrimestre = (formCode: string): boolean => {
  const config = getFormConfig(formCode)
  return config?.colorCode?.enabled && config.colorCode.hasTrimestre ? true : false
}

/**
 * Verifica si un formulario requiere firma de supervisor
 */
export const requiresSupervisorSignature = (formCode: string): boolean => {
  const config = getFormConfig(formCode)
  return config?.signatures?.supervisor ?? false
}

/**
 * Verifica si un formulario requiere firma de inspector
 */
export const requiresInspectorSignature = (formCode: string): boolean => {
  const config = getFormConfig(formCode)
  return config?.signatures?.inspector ?? true // Por defecto true
}

/**
 * Obtiene el tipo de formulario
 */
export const getFormType = (formCode: string): FormFeatureConfig["formType"] | null => {
  const config = getFormConfig(formCode)
  return config?.formType || null
}

/**
 * Verifica si un formulario tiene selector de daños (vehículos)
 */
export const hasDamageSelector = (formCode: string): boolean => {
  const config = getFormConfig(formCode)
  return config?.vehicle?.hasDamageSelector ?? false
}

/**
 * Verifica si un formulario tiene fecha de próxima inspección
 */
export const hasNextInspectionDate = (formCode: string): boolean => {
  const config = getFormConfig(formCode)
  return config?.vehicle?.hasNextInspectionDate ?? false
}

/**
 * Verifica si un formulario permite guardar como borrador
 */
export const allowsDraft = (formCode: string): boolean => {
  const config = getFormConfig(formCode)
  return config?.allowDraft ?? true // Por defecto true
}

/**
 * Obtiene todos los códigos de formulario disponibles
 */
export const getAllFormCodes = (): string[] => {
  return Object.keys(formConfigRegistry)
}

/**
 * Obtiene todas las configuraciones de un tipo específico
 */
export const getFormConfigsByType = (type: FormFeatureConfig["formType"]): FormFeatureConfig[] => {
  return Object.values(formConfigRegistry).filter((config) => config.formType === type)
}
