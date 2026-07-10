'use server'

import { API_BASE_URL } from "../constants";
import { getAuthHeaders, handleApiResponse } from "./helpers";

export interface CampoFormulario {
  name: string;
  label: string;
  type: string; // "text" | "number" | "select" | "boolean"
  required: boolean;
  options?: string[];
}

export interface ConfigFormularioBackend {
  tipo_equipo: string;
  campos: CampoFormulario[];
  createdAt?: string;
  updatedAt?: string;
}

// Obtener todas las configuraciones
export async function obtenerConfigFormularios(): Promise<ConfigFormularioBackend[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/config-formulario`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    return handleApiResponse<ConfigFormularioBackend[]>(response);
  } catch (error) {
    console.error('Error al obtener config formularios:', error);
    throw new Error(`No se pudieron obtener las configuraciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Obtener una configuración específica
export async function obtenerConfigFormularioPorTipo(tipoEquipo: string): Promise<ConfigFormularioBackend> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/config-formulario/${encodeURIComponent(tipoEquipo)}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    return handleApiResponse<ConfigFormularioBackend>(response);
  } catch (error) {
    console.error(`Error al obtener config formulario para ${tipoEquipo}:`, error);
    throw new Error(`No se pudo obtener la configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Crear nueva configuración
export async function crearConfigFormulario(data: ConfigFormularioBackend): Promise<ConfigFormularioBackend> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/config-formulario`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleApiResponse<ConfigFormularioBackend>(response);
  } catch (error) {
    console.error('Error al crear config formulario:', error);
    throw new Error(`No se pudo crear la configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Actualizar configuración
export async function actualizarConfigFormulario(tipoEquipo: string, data: ConfigFormularioBackend): Promise<ConfigFormularioBackend> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/config-formulario/${encodeURIComponent(tipoEquipo)}`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleApiResponse<ConfigFormularioBackend>(response);
  } catch (error) {
    console.error('Error al actualizar config formulario:', error);
    throw new Error(`No se pudo actualizar la configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Eliminar configuración
export async function eliminarConfigFormulario(tipoEquipo: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/config-formulario/${encodeURIComponent(tipoEquipo)}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al eliminar');
    }
  } catch (error) {
    console.error('Error al eliminar config formulario:', error);
    throw new Error(`No se pudo eliminar la configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}
