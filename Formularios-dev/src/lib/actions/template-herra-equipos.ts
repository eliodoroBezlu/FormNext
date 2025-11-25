"use server";

import { API_BASE_URL } from "@/lib/constants"; 
import {  getAuthHeaders, handleApiResponse } from "./helpers";
import { FormBuilderDataHerraEquipos } from "@/components/herra_equipos/QuestionBuilder";

// Tipos de respuesta
export type TemplateHerraEquipo = FormBuilderDataHerraEquipos & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// ========================
// CREATE
// ========================
export async function createTemplateHerraEquipo(
  data: FormBuilderDataHerraEquipos
): Promise<{ success: true; data: TemplateHerraEquipo } | { success: false; error: string }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/template-herra-equipos`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    const result = await handleApiResponse<TemplateHerraEquipo>(response);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating template:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error desconocido al crear el template" 
    };
  }
}

// ========================
// READ (list)
// ========================
export async function getTemplatesHerraEquipos(
  filters?: { type?: string }
): Promise<{ success: true; data: TemplateHerraEquipo[] } | { success: false; error: string }> {
  try {
    const headers = await getAuthHeaders();
    
    const queryParams = new URLSearchParams();
    
    if (filters?.type) {
      queryParams.append("type", filters.type);
    }

    const url = `${API_BASE_URL}/template-herra-equipos${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers,
      next: { revalidate: 60 }, // ISR: revalidar cada 60 segundos
    });

    const result = await handleApiResponse<TemplateHerraEquipo[]>(response);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching templates:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al obtener los templates" 
    };
  }
}

// ========================
// READ ONE
// ========================
export async function getTemplateHerraEquipoById(
  id: string
): Promise<{ success: true; data: TemplateHerraEquipo } | { success: false; error: string }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/template-herra-equipos/${id}`, {
      method: "GET",
      headers,
      next: { revalidate: 30 },
    });

    const result = await handleApiResponse<TemplateHerraEquipo>(response);
    return { success: true, data: result };
  } catch (error) {
    console.error(`Error fetching template ${id}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al obtener el template" 
    };
  }
}

// ========================
// UPDATE
// ========================
export async function updateTemplateHerraEquipo(
  id: string,
  data: Partial<FormBuilderDataHerraEquipos>
): Promise<{ success: true; data: TemplateHerraEquipo } | { success: false; error: string }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/template-herra-equipos/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });

    const result = await handleApiResponse<TemplateHerraEquipo>(response);
    return { success: true, data: result };
  } catch (error) {
    console.error(`Error updating template ${id}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al actualizar el template" 
    };
  }
}


// ========================
// DELETE
// ========================
export async function deleteTemplateHerraEquipo(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/template-herra-equipos/${id}`, {
      method: "DELETE",
      headers,
    });

    // DELETE en tu backend devuelve 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    // Si no es 204, intentamos manejar como error
    await handleApiResponse(response); // esto lanzará error si no es ok
    return { success: true };
  } catch (error) {
    console.error(`Error deleting template ${id}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al eliminar el template" 
    };
  }
}

// ========================
// SEARCH
// ========================
export async function searchTemplatesHerraEquipos(
  searchTerm: string
): Promise<{ success: true; data: TemplateHerraEquipo[] } | { success: false; error: string }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/template-herra-equipos/search?q=${encodeURIComponent(searchTerm)}`, {
      method: "GET",
      headers,
      next: { revalidate: 30 },
    });

    const result = await handleApiResponse<TemplateHerraEquipo[]>(response);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error searching templates:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al buscar templates" 
    };
  }
}