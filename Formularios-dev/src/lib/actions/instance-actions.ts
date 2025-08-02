"use server"

import { ApiResponse, FormInstance, InspectionTeamMember, SectionResponse, ValoracionCriterio, VerificationList } from "@/types/formTypes"
import { revalidatePath } from "next/cache"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Función helper para manejar respuestas de la API
// async function handleApiResponse(response: Response) {
//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({ message: "Error desconocido" }))
//     throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
//   }
//   return response.json()
// }

// Crear instancia de formulario
interface CreateInstanceData {
  templateId: string
  verificationList: VerificationList
  inspectionTeam: InspectionTeamMember[]
  valoracionCriterio: ValoracionCriterio[]
  sections: SectionResponse[]
  aspectosPositivos?: string
  aspectosAdicionales?: string
  status?: "borrador" | "completado" | "revisado" | "aprobado"
  createdBy?: string
}

export async function createInstance(instanceData: CreateInstanceData): Promise<ApiResponse<FormInstance>> {
  try {
    const response = await fetch(`${API_BASE_URL}/instances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(instanceData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Revalidar las páginas que muestran instancias
    revalidatePath('/instances')
    revalidatePath('/dashboard')
    
    return {
      success: true,
      data: data,
      message: 'Instancia creada exitosamente'
    }
  } catch (error) {
    console.error('Error creating instance:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al crear instancia'
    }
  }
}

// Obtener todas las instancias
interface GetInstancesFilters {
  templateId?: string
  status?: string
  createdBy?: string
  dateFrom?: Date
  dateTo?: Date
  minCompliance?: number
  maxCompliance?: number
  page?: number
  limit?: number
}

export async function getInstances(filters?: GetInstancesFilters): Promise<ApiResponse<{
  data: FormInstance[]
  total: number
  page: number
  limit: number
  totalPages: number
}>> {
  try {
    const queryParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString())
          } else {
            queryParams.append(key, value.toString())
          }
        }
      })
    }

    const url = `${API_BASE_URL}/instances${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      data: data,
      message: 'Instancias obtenidas exitosamente'
    }
  } catch (error) {
    console.error('Error fetching instances:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al obtener instancias'
    }
  }
}
export async function getInstance(id: string): Promise<ApiResponse<FormInstance>> {
  try {
    const response = await fetch(`${API_BASE_URL}/instances/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Instancia no encontrada')
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      data: data,
      message: 'Instancia obtenida exitosamente'
    }
  } catch (error) {
    console.error('Error fetching instance:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al obtener instancia'
    }
  }
}

interface UpdateInstanceData {
  verificationList?: VerificationList
  inspectionTeam?: InspectionTeamMember[]
  sections?: SectionResponse[]
  aspectosPositivos?: string
  aspectosAdicionales?: string
  updatedBy?: string
}

export async function updateInstance(id: string, updateData: UpdateInstanceData): Promise<ApiResponse<FormInstance>> {
  try {
    const response = await fetch(`${API_BASE_URL}/instances/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 404) {
        throw new Error('Instancia no encontrada')
      }
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Revalidar las páginas relacionadas
    revalidatePath('/instances')
    revalidatePath(`/instances/${id}`)
    revalidatePath('/dashboard')
    
    return {
      success: true,
      data: data,
      message: 'Instancia actualizada exitosamente'
    }
  } catch (error) {
    console.error('Error updating instance:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al actualizar instancia'
    }
  }
}

export async function updateInstanceStatus(
  id: string, 
  status: "borrador" | "completado" | "revisado" | "aprobado",
  userId?: string
): Promise<ApiResponse<FormInstance>> {
  try {
    const response = await fetch(`${API_BASE_URL}/instances/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, userId }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 404) {
        throw new Error('Instancia no encontrada')
      }
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Revalidar las páginas relacionadas
    revalidatePath('/instances')
    revalidatePath(`/instances/${id}`)
    revalidatePath('/dashboard')
    
    return {
      success: true,
      data: data,
      message: 'Estado actualizado exitosamente'
    }
  } catch (error) {
    console.error('Error updating instance status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al actualizar estado'
    }
  }
}




