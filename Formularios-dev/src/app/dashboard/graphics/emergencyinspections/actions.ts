"use server";

import { getAuthHeaders, handleApiResponse } from "@/lib/actions/helpers";
import { API_BASE_URL } from "@/lib/constants";
import { FormularioInspeccion, Tag } from "./types/IProps";

// Obtener todos los tags
export async function obtenerTags(): Promise<Tag[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/tag/`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return handleApiResponse<Tag[]>(response);
}

// Obtener todas las inspecciones de emergencia
export async function obtenerInspecciones(): Promise<FormularioInspeccion[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/inspecciones-emergencia/`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return handleApiResponse<FormularioInspeccion[]>(response);
}

// Obtener ambos datos en paralelo
export async function obtenerDashboardData(): Promise<{
  tags: Tag[];
  inspecciones: FormularioInspeccion[];
}> {
  const headers = await getAuthHeaders();

  const [tagsResponse, inspeccionesResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/tag/`, {
      method: "GET",
      headers,
      cache: "no-store",
    }),
    fetch(`${API_BASE_URL}/inspecciones-emergencia/`, {
      method: "GET",
      headers,
      cache: "no-store",
    }),
  ]);

  const [tags, inspecciones] = await Promise.all([
    handleApiResponse<Tag[]>(tagsResponse),
    handleApiResponse<FormularioInspeccion[]>(inspeccionesResponse),
  ]);

  return { tags, inspecciones };
}
