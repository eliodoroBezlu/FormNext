import { FormFeatureConfig } from "../types/IProps"
import { formConfigRegistry } from "."

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
  const supervisor = config?.signatures?.supervisor
  
  // Si es boolean, retornarlo directamente
  if (typeof supervisor === 'boolean') {
    return supervisor
  }
  
  // Si es objeto, verificar la propiedad enabled
  return supervisor?.enabled ?? false
}

/**
 * Verifica si un formulario requiere firma de inspector
 */
export const requiresInspectorSignature = (formCode: string): boolean => {
  const config = getFormConfig(formCode)
  const inspector = config?.signatures?.inspector
  
  // Si es boolean, retornarlo directamente
  if (typeof inspector === 'boolean') {
    return inspector
  }
  
  // Si es objeto, verificar la propiedad enabled
  return inspector?.enabled ?? true // Por defecto true
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

/**
 * Obtiene la configuración completa de firmas del inspector
 */
export const getInspectorSignatureConfig = (formCode: string) => {
  const config = getFormConfig(formCode)
  const inspector = config?.signatures?.inspector
  
  if (typeof inspector === 'boolean') {
    return inspector ? { enabled: true } : { enabled: false }
  }
  
  return inspector ?? { enabled: true }
}

/**
 * Obtiene la configuración completa de firmas del supervisor
 */
export const getSupervisorSignatureConfig = (formCode: string) => {
  const config = getFormConfig(formCode)
  const supervisor = config?.signatures?.supervisor
  
  if (typeof supervisor === 'boolean') {
    return supervisor ? { enabled: true } : { enabled: false }
  }
  
  return supervisor ?? { enabled: false }
}
