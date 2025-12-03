"use server";

import { revalidatePath } from "next/cache";
import { getAuthHeaders, handleApiResponse } from "@/lib/actions/helpers";
import { API_BASE_URL } from "@/lib/constants";

export interface SuperintendenciaBackend {
  _id: string;
  nombre: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
  creadoPor?: string;
  actualizadoPor?: string;
}

export interface CreateSuperintendenciaDto {
  nombre: string;
  activo?: boolean;
}

export interface UpdateSuperintendenciaDto {
  nombre?: string;
  activo?: boolean;
}

// Crear nueva superintendencia
export async function crearSuperintendencia(
  data: CreateSuperintendenciaDto
): Promise<SuperintendenciaBackend> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/superintendencia`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const result = await handleApiResponse<SuperintendenciaBackend>(response);
  revalidatePath("/superintendencias");
  return result;
}

// Obtener todas las superintendencias completas (objetos)
export async function obtenerSuperintendencias(): Promise<SuperintendenciaBackend[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/superintendencia`, {
    headers,
    cache: "no-store",
  });

  return handleApiResponse<SuperintendenciaBackend[]>(response);
}

// Obtener solo nombres de superintendencias activas (para selects simples)
export async function obtenerNombresSuperintendencias(): Promise<string[]> {
  const superintendencias = await obtenerSuperintendencias();
  return superintendencias
    .filter(sup => sup.activo)
    .map(sup => sup.nombre)
    .sort();
}

// Obtener superintendencia por ID
export async function obtenerSuperintendenciaPorId(
  id: string
): Promise<SuperintendenciaBackend> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/superintendencia/${id}`, {
    headers,
    cache: "no-store",
  });

  return handleApiResponse<SuperintendenciaBackend>(response);
}

// Actualizar superintendencia
export async function actualizarSuperintendencia(
  id: string,
  data: UpdateSuperintendenciaDto
): Promise<SuperintendenciaBackend> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/superintendencia/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const result = await handleApiResponse<SuperintendenciaBackend>(response);
  revalidatePath("/superintendencias");
  return result;
}

// Desactivar superintendencia
export async function desactivarSuperintendencia(
  id: string
): Promise<{ exito: boolean; mensaje: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/superintendencia/desactivar/${id}`,
    {
      method: "PUT",
      headers,
      cache: "no-store",
    }
  );

  const result = await handleApiResponse<{ exito: boolean; mensaje: string }>(
    response
  );
  revalidatePath("/superintendencias");
  return result;
}

// Activar superintendencia
export async function activarSuperintendencia(
  id: string
): Promise<SuperintendenciaBackend> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/superintendencia/activar/${id}`, {
    method: "PUT",
    headers,
    cache: "no-store",
  });

  const result = await handleApiResponse<SuperintendenciaBackend>(response);
  revalidatePath("/superintendencias");
  return result;
}

// Eliminar superintendencia (física - usar con precaución)
export async function eliminarSuperintendencia(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/superintendencia/${id}`, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });

  await handleApiResponse<{ success: boolean }>(response);
  revalidatePath("/superintendencias");
}

// Buscar superintendencias por query
export async function buscarSuperintendencias(query: string): Promise<string[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/superintendencia/buscar?query=${encodeURIComponent(query)}`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse<string[]>(response);
}