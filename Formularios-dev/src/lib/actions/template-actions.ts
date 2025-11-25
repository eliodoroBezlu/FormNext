"use server"

import { FormTemplate } from "@/types/formTypes"
import {   getAuthHeaders, handleApiResponse } from "./helpers"
import { API_BASE_URL } from "../constants";




// Crear template
export async function createTemplate(templateData: Omit<FormTemplate, "_id">) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: "POST",
      headers,
      body: JSON.stringify(templateData),
      cache: "no-store",
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      data: result,
      message: "Template creado exitosamente",
    };
  } catch (error) {
    console.error("Error creating template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear el template",
    };
  }
}

// Actualizar template
export async function updateTemplate(_id: string, templateData: Partial<FormTemplate>) {
  try {
    console.log('Updating template:', _id, templateData);
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/templates/${_id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        ...templateData,
        updatedBy: "current-user",
      }),
      cache: "no-store",
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      data: result,
      message: "Template actualizado exitosamente",
    };
  } catch (error) {
    console.error("Error updating template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar el template",
    };
  }
}

// Eliminar template
export async function deleteTemplate(id: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });

    await handleApiResponse(response);

    return {
      success: true,
      message: "Template eliminado exitosamente",
    };
  } catch (error) {
    console.error("Error deleting template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar el template",
    };
  }
}

// Obtener todos los templates
export async function getTemplates(filters?: {
  type?: string
  isActive?: boolean
  search?: string
}) {
  try {
    const headers = await getAuthHeaders();
    
    const searchParams = new URLSearchParams();

    if (filters?.type) searchParams.append("type", filters.type);
    if (filters?.isActive !== undefined) searchParams.append("isActive", filters.isActive.toString());
    if (filters?.search) searchParams.append("search", filters.search);
    
    
    const response = await fetch(`${API_BASE_URL}/templates?${searchParams.toString()}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching templates:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener los templates",
      data: [],
    };
  }
}

// Obtener template por ID
export async function getTemplate(id: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener el template",
      data: null,
    };
  }
}

// Obtener estadísticas de templates
export async function getTemplateStats() {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/templates/stats`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching template stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener las estadísticas",
      data: null,
    };
  }
}

// Desactivar template
export async function deactivateTemplate(id: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/templates/${id}/deactivate`, {
      method: "PATCH",
      headers,
      cache: "no-store",
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      data: result,
      message: "Template desactivado exitosamente",
    };
  } catch (error) {
    console.error("Error deactivating template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al desactivar el template",
    };
  }
}