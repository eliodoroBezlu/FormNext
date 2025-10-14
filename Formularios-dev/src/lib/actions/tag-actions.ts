'use server'

import { API_BASE_URL } from "../constants";
import { handleApiResponse } from "./helpers";

// Types
export interface TagBackend {
  _id: string;
  tag: string;
  area: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TagForm {
  tag: string;
  area: string;
  activo: boolean;
}


// Obtener todos los tags
export async function obtenerTags(): Promise<TagBackend[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/tag`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store',
    });

    return handleApiResponse<TagBackend[]>(response);
  } catch (error) {
    console.error('Error al obtener tags:', error);
    throw new Error(`No se pudieron obtener los tags: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Obtener tag por ID
export async function obtenerTagPorId(id: string): Promise<TagBackend> {
  try {
    const response = await fetch(`${API_BASE_URL}/tag/${id}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store',
    });

    return handleApiResponse<TagBackend>(response);
  } catch (error) {
    console.error('Error al obtener tag:', error);
    throw new Error(`No se pudo obtener el tag: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Crear nuevo tag
export async function crearTag(tagData: TagForm): Promise<TagBackend> {
  try {
    const response = await fetch(`${API_BASE_URL}/tag`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tagData),
      cache: 'no-store',
    });

    return handleApiResponse<TagBackend>(response);
  } catch (error) {
    console.error('Error al crear tag:', error);
    throw new Error(`No se pudo crear el tag: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Actualizar tag existente
export async function actualizarTag(id: string, tagData: Partial<TagForm>): Promise<TagBackend> {
  try {
    const response = await fetch(`${API_BASE_URL}/tag/${id}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tagData),
      cache: 'no-store',
    });

    return handleApiResponse<TagBackend>(response);
  } catch (error) {
    console.error('Error al actualizar tag:', error);
    throw new Error(`No se pudo actualizar el tag: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Eliminar tag (eliminación física)
export async function eliminarTag(id: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/tag/${id}`, {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store',
    });

    return handleApiResponse<{ message: string }>(response);
  } catch (error) {
    console.error('Error al eliminar tag:', error);
    throw new Error(`No se pudo eliminar el tag: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Desactivar tag (eliminación lógica)
export async function desactivarTag(id: string): Promise<TagBackend> {
  try {
    const response = await fetch(`${API_BASE_URL}/tag/${id}/desactivar`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store',
    });

    return handleApiResponse<TagBackend>(response);
  } catch (error) {
    console.error('Error al desactivar tag:', error);
    throw new Error(`No se pudo desactivar el tag: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Activar tag
export async function activarTag(id: string): Promise<TagBackend> {
  try {
    const response = await fetch(`${API_BASE_URL}/tag/${id}/activar`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store',
    });

    return handleApiResponse<TagBackend>(response);
  } catch (error) {
    console.error('Error al activar tag:', error);
    throw new Error(`No se pudo activar el tag: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Obtener tags por área (solo activos)
export async function obtenerTagsPorArea(area: string): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/tag/por-area?area=${encodeURIComponent(area)}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      },
      cache: 'no-store',
    });

    return handleApiResponse<string[]>(response);
  } catch (error) {
    console.error('Error al obtener tags por área:', error);
    throw new Error(`No se pudieron obtener los tags del área: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}