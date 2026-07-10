'use server'

import { API_BASE_URL } from "../constants";
import { getAuthHeaders, handleApiResponse } from "./helpers";

export interface UbicacionBackend {
  _id: string;
  nombre: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UbicacionForm {
  nombre: string;
  activo?: boolean;
}

// Obtener todas las ubicaciones
export async function obtenerUbicaciones(): Promise<UbicacionBackend[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/ubicaciones`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    return handleApiResponse<UbicacionBackend[]>(response);
  } catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    throw new Error(`No se pudieron obtener las ubicaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Crear nueva ubicación
export async function crearUbicacion(data: UbicacionForm): Promise<UbicacionBackend> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/ubicaciones`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleApiResponse<UbicacionBackend>(response);
  } catch (error) {
    console.error('Error al crear ubicación:', error);
    throw new Error(`No se pudo crear la ubicación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Actualizar ubicación
export async function actualizarUbicacion(id: string, data: UbicacionForm): Promise<UbicacionBackend> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/ubicaciones/${id}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleApiResponse<UbicacionBackend>(response);
  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    throw new Error(`No se pudo actualizar la ubicación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Eliminar ubicación
export async function eliminarUbicacion(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/ubicaciones/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al eliminar');
    }
  } catch (error) {
    console.error('Error al eliminar ubicación:', error);
    throw new Error(`No se pudo eliminar la ubicación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}
