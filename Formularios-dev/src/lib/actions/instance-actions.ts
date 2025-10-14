"use server"

import { ApiResponse, FormInstance, InspectionTeamMember, SectionResponse, ValoracionCriterio, VerificationList } from "@/types/formTypes"
import { revalidatePath } from "next/cache"
import {  handleApiResponse } from "./helpers"
import { API_BASE_URL } from "../constants"




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

export interface GetInstancesFilters {
  templateId?: string
  status?: string
  createdBy?: string
  dateFrom?: Date
  dateTo?: Date
  minCompliance?: number
  maxCompliance?: number
  area?: string
  superintendencia?: string
  page?: number
  limit?: number
}

interface UpdateInstanceData {
  verificationList?: VerificationList
  inspectionTeam?: InspectionTeamMember[]
  sections?: SectionResponse[]
  aspectosPositivos?: string
  aspectosAdicionales?: string
  updatedBy?: string
}

export async function createInstance(instanceData: CreateInstanceData): Promise<ApiResponse<FormInstance>> {
  try {
    const response = await fetch(`${API_BASE_URL}/instances`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(instanceData),
      cache: 'no-store',
    });

    const data = await handleApiResponse<FormInstance>(response);
    
    // Revalidar las páginas que muestran instancias
    revalidatePath('/instances');
    revalidatePath('/dashboard');
    
    return {
      success: true,
      data: data,
      message: 'Instancia creada exitosamente'
    };
  } catch (error) {
    console.error('Error creating instance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al crear instancia'
    };
  }
}

// Obtener todas las instancias
export async function getInstances(filters?: GetInstancesFilters): Promise<ApiResponse<{
  data: FormInstance[]
  total: number
  page: number
  limit: number
  totalPages: number
}>> {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString());
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const url = `${API_BASE_URL}/instances${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store',
    });

    const data = await handleApiResponse<{
      data: FormInstance[]
      total: number
      page: number
      limit: number
      totalPages: number
    }>(response);
    
    return {
      success: true,
      data: data,
      message: 'Instancias obtenidas exitosamente'
    };
  } catch (error) {
    console.error('Error fetching instances:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al obtener instancias'
    };
  }
}

// Obtener instancia por ID
export async function getInstance(id: string): Promise<ApiResponse<FormInstance>> {
  try {
    const response = await fetch(`${API_BASE_URL}/instances/${id}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store',
    });

    const data = await handleApiResponse<FormInstance>(response);
    
    return {
      success: true,
      data: data,
      message: 'Instancia obtenida exitosamente'
    };
  } catch (error) {
    console.error('Error fetching instance:', error);
    
    // Manejo específico para instancia no encontrada
    const errorMessage = error instanceof Error && error.message.includes('404')
      ? 'Instancia no encontrada'
      : error instanceof Error ? error.message : 'Error desconocido al obtener instancia';
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Actualizar instancia
export async function updateInstance(id: string, updateData: UpdateInstanceData): Promise<ApiResponse<FormInstance>> {
  try {
    const response = await fetch(`${API_BASE_URL}/instances/${id}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
      cache: 'no-store',
    });

    const data = await handleApiResponse<FormInstance>(response);
    
    // Revalidar las páginas relacionadas
    revalidatePath('/instances');
    revalidatePath(`/instances/${id}`);
    revalidatePath('/dashboard');
    
    return {
      success: true,
      data: data,
      message: 'Instancia actualizada exitosamente'
    };
  } catch (error) {
    console.error('Error updating instance:', error);
    
    // Manejo específico para instancia no encontrada
    const errorMessage = error instanceof Error && error.message.includes('404')
      ? 'Instancia no encontrada'
      : error instanceof Error ? error.message : 'Error desconocido al actualizar instancia';
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Actualizar estado de instancia
export async function updateInstanceStatus(
  id: string, 
  status: "borrador" | "completado" | "revisado" | "aprobado",
  userId?: string
): Promise<ApiResponse<FormInstance>> {
  try {
    const response = await fetch(`${API_BASE_URL}/instances/${id}/status`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, userId }),
      cache: 'no-store',
    });

    const data = await handleApiResponse<FormInstance>(response);
    
    // Revalidar las páginas relacionadas
    revalidatePath('/instances');
    revalidatePath(`/instances/${id}`);
    revalidatePath('/dashboard');
    
    return {
      success: true,
      data: data,
      message: 'Estado actualizado exitosamente'
    };
  } catch (error) {
    console.error('Error updating instance status:', error);
    
    // Manejo específico para instancia no encontrada
    const errorMessage = error instanceof Error && error.message.includes('404')
      ? 'Instancia no encontrada'
      : error instanceof Error ? error.message : 'Error desconocido al actualizar estado';
    
    return {
      success: false,
      error: errorMessage
    };
  }
}