"use server";

import { revalidatePath } from "next/cache";
import { getAuthHeaders, handleApiResponse } from "@/lib/actions/helpers";
import { API_BASE_URL } from "@/lib/constants";

// Tipos para el módulo de áreas
export interface AreaBackend {
  _id: string;
  nombre: string;
  superintendencia: {
    _id: string;
    nombre: string;
  };
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
  creadoPor?: string;
  actualizadoPor?: string;
}

export interface CreateAreaDto {
  nombre: string;
  superintendencia: string;
  activo?: boolean;
}

export interface UpdateAreaDto {
  nombre?: string;
  superintendencia?: string;
  activo?: boolean;
}

// Crear nueva área
export async function crearArea(data: CreateAreaDto): Promise<AreaBackend> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/area`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const result = await handleApiResponse<AreaBackend>(response);
  revalidatePath("/areas");
  return result;
}

// Obtener todas las áreas completas (objetos con superintendencia)
export async function obtenerAreasCompletas(): Promise<AreaBackend[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/area`, {
    headers,
    cache: "no-store",
  });

  return handleApiResponse<AreaBackend[]>(response);
}

// Obtener solo nombres de áreas activas (para selects simples)
export async function obtenerAreas(): Promise<string[]> {
  const areas = await obtenerAreasCompletas();
  return areas
    .filter(area => area.activo)
    .map(area => area.nombre)
    .sort();
}

// Obtener área por ID
export async function obtenerAreaPorId(id: string): Promise<AreaBackend> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/area/${id}`, {
    headers,
    cache: "no-store",
  });

  return handleApiResponse<AreaBackend>(response);
}

// Actualizar área
export async function actualizarArea(
  id: string,
  data: UpdateAreaDto
): Promise<AreaBackend> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/area/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const result = await handleApiResponse<AreaBackend>(response);
  revalidatePath("/areas");
  return result;
}

// Desactivar área
export async function desactivarArea(
  id: string
): Promise<{ exito: boolean; mensaje: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/area/desactivar/${id}`, {
    method: "PUT",
    headers,
    cache: "no-store",
  });

  const result = await handleApiResponse<{ exito: boolean; mensaje: string }>(
    response
  );
  revalidatePath("/areas");
  return result;
}

// Activar área
export async function activarArea(id: string): Promise<AreaBackend> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/area/activar/${id}`, {
    method: "PUT",
    headers,
    cache: "no-store",
  });

  const result = await handleApiResponse<AreaBackend>(response);
  revalidatePath("/areas");
  return result;
}

// Eliminar área (solo si es necesario mantenerlo)
export async function eliminarArea(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/area/${id}`, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });

  await handleApiResponse<{ success: boolean }>(response);
  revalidatePath("/areas");
}

// Buscar áreas por query
export async function buscarAreas(query: string): Promise<string[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/area/buscar?query=${encodeURIComponent(query)}`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse<string[]>(response);
}