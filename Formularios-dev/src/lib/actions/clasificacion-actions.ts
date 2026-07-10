'use server'

import { API_BASE_URL } from "../constants";
import { getAuthHeaders, handleApiResponse } from "./helpers";

export interface ClasificacionBackend {
  _id: string;
  nombre: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClasificacionForm {
  nombre: string;
  activo?: boolean;
}

// Obtener todas las clasificaciones
export async function obtenerClasificaciones(): Promise<ClasificacionBackend[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/clasificaciones`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    return handleApiResponse<ClasificacionBackend[]>(response);
  } catch (error) {
    console.error('Error al obtener clasificaciones:', error);
    throw new Error(`No se pudieron obtener las clasificaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Crear nueva clasificación
export async function crearClasificacion(data: ClasificacionForm): Promise<ClasificacionBackend> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/clasificaciones`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleApiResponse<ClasificacionBackend>(response);
  } catch (error) {
    console.error('Error al crear clasificación:', error);
    throw new Error(`No se pudo crear la clasificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Actualizar clasificación
export async function actualizarClasificacion(id: string, data: ClasificacionForm): Promise<ClasificacionBackend> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/clasificaciones/${id}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleApiResponse<ClasificacionBackend>(response);
  } catch (error) {
    console.error('Error al actualizar clasificación:', error);
    throw new Error(`No se pudo actualizar la clasificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Eliminar clasificación
export async function eliminarClasificacion(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/clasificaciones/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al eliminar');
    }
  } catch (error) {
    console.error('Error al eliminar clasificación:', error);
    throw new Error(`No se pudo eliminar la clasificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}
