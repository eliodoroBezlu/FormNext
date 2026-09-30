'use server'

import { API_BASE_URL } from "../constants";
import { getAuthHeaders, handleApiResponse } from "./helpers";

/**
 * Nodo del árbol de ubicaciones (hasta 7 niveles). `padre`, `ancestros`,
 * `ruta` y `nivel` los calcula el backend; aquí solo se leen.
 */
export interface UbicacionBackend {
  _id: string;
  nombre: string;
  /** `null` = raíz. */
  padre: string | null;
  /** De la raíz al padre. */
  ancestros: string[];
  /** «Taller de flotación › Bodega 1 › Estante A». */
  ruta: string;
  /** 0 = raíz. */
  nivel: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Crear, renombrar o mover. `padre: null` = raíz. */
export interface UbicacionForm {
  nombre: string;
  padre: string | null;
}

export interface ResultadoFusion {
  destino: UbicacionBackend;
  equiposMovidos: number;
  ubicacionesMovidas: number;
}

/**
 * Obtener todas las ubicaciones, en plano y ordenadas por ruta.
 * `incluirBajas` es para la pantalla de administración, que las necesita
 * para poder restaurarlas.
 */
export async function obtenerUbicaciones(incluirBajas = false): Promise<UbicacionBackend[]> {
  try {
    const headers = await getAuthHeaders();
    const query = incluirBajas ? "?incluirBajas=true" : "";
    const response = await fetch(`${API_BASE_URL}/ubicaciones${query}`, {
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

/** Renombrar y/o mover (cambiar `padre`). */
export async function actualizarUbicacion(id: string, data: Partial<UbicacionForm>): Promise<UbicacionBackend> {
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

/** Baja lógica. El backend la rechaza si tiene ubicaciones debajo o equipos. */
export async function eliminarUbicacion(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/ubicaciones/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      await handleApiResponse<void>(response);
    }
  } catch (error) {
    console.error('Error al eliminar ubicación:', error);
    throw new Error(`No se pudo dar de baja la ubicación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

export async function restaurarUbicacion(id: string): Promise<UbicacionBackend> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/ubicaciones/${id}/restaurar`, {
      method: 'POST',
      headers,
    });
    return handleApiResponse<UbicacionBackend>(response);
  } catch (error) {
    console.error('Error al restaurar ubicación:', error);
    throw new Error(`No se pudo restaurar la ubicación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/** Pasa equipos e hijas de `origenId` a `destinoId` y da de baja el origen. */
export async function fusionarUbicacion(origenId: string, destinoId: string): Promise<ResultadoFusion> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/ubicaciones/${origenId}/fusionar-en/${destinoId}`, {
      method: 'POST',
      headers,
    });
    return handleApiResponse<ResultadoFusion>(response);
  } catch (error) {
    console.error('Error al fusionar ubicaciones:', error);
    throw new Error(`No se pudieron fusionar las ubicaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}
