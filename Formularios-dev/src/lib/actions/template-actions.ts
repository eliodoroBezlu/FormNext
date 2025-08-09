"use server"

import { FormTemplate } from "@/types/formTypes"


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Error desconocido" }))
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
  }
  return response.json()
}
// Crear template
export async function createTemplate(templateData: Omit<FormTemplate, "_id">) {
  try {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templateData),
    })

    const result = await handleApiResponse(response)

    // Revalidar la página para mostrar los cambios
    //revalidatePath("/templates")

    return {
      success: true,
      data: result,
      message: "Template creado exitosamente",
    }
  } catch (error) {
    console.error("Error creating template:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear el template",
    }
  }
}

// Actualizar template
export async function updateTemplate(_id: string, templateData: Partial<FormTemplate>) {
  try {
    // Agregar logs para debug
    console.log('Updating template:', _id, templateData);

    const response = await fetch(`${API_BASE_URL}/templates/${_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...templateData,
        updatedBy: "current-user", // Aquí puedes agregar el usuario actual
      }),
    })

    const result = await handleApiResponse(response)

    return {
      success: true,
      data: result,
      message: "Template actualizado exitosamente",
    }
  } catch (error) {
    console.error("Error updating template:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar el template",
    }
  }
}

// Eliminar template
export async function deleteTemplate(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    //revalidatePath("/templates")

    return {
      success: true,
      message: "Template eliminado exitosamente",
    }
  } catch (error) {
    console.error("Error deleting template:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar el template",
    }
  }
}

// Obtener todos los templates
export async function getTemplates(filters?: {
  type?: string
  isActive?: boolean
  search?: string
}) {
  try {
    const searchParams = new URLSearchParams()

    if (filters?.type) searchParams.append("type", filters.type)
    if (filters?.isActive !== undefined) searchParams.append("isActive", filters.isActive.toString())
    if (filters?.search) searchParams.append("search", filters.search)

    const response = await fetch(`${API_BASE_URL}/templates?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Importante: no cachear en desarrollo
      cache: process.env.NODE_ENV === "development" ? "no-store" : "default",
    })

    const result = await handleApiResponse(response)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("Error fetching templates:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener los templates",
      data: [],
    }
  }
}

// Obtener template por ID
export async function getTemplate(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: process.env.NODE_ENV === "development" ? "no-store" : "default",
    })

    const result = await handleApiResponse(response)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("Error fetching template:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener el template",
      data: null,
    }
  }
}

// Obtener estadísticas de templates
export async function getTemplateStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: process.env.NODE_ENV === "development" ? "no-store" : "default",
    })

    const result = await handleApiResponse(response)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("Error fetching template stats:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener las estadísticas",
      data: null,
    }
  }
}

// Desactivar template
export async function deactivateTemplate(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/${id}/deactivate`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const result = await handleApiResponse(response)

    //revalidatePath("/templates")

    return {
      success: true,
      data: result,
      message: "Template desactivado exitosamente",
    }
  } catch (error) {
    console.error("Error deactivating template:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al desactivar el template",
    }
  }
}
