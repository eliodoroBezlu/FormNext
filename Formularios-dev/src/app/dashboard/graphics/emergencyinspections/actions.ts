"use server";

import { getAuthHeaders, handleApiResponse } from "@/lib/actions/helpers";
import { API_BASE_URL } from "@/lib/constants";
import { FormularioInspeccion, Tag, Extintor } from "./types/IProps";

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

// Obtener todos los extintores
export async function obtenerExtintores(): Promise<Extintor[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/extintor/`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return handleApiResponse<Extintor[]>(response);
}

// Obtener todos los datos en paralelo para el dashboard
export async function obtenerDashboardData(): Promise<{
  tags: Tag[];
  inspecciones: FormularioInspeccion[];
  extintores: Extintor[];
}> {
  const headers = await getAuthHeaders();

  const [tagsResponse, inspeccionesResponse, extintoresResponse] = await Promise.all([
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
    fetch(`${API_BASE_URL}/extintor/`, {
      method: "GET",
      headers,
      cache: "no-store",
    }),
  ]);

  const [tags, inspecciones, extintores] = await Promise.all([
    handleApiResponse<Tag[]>(tagsResponse),
    handleApiResponse<FormularioInspeccion[]>(inspeccionesResponse),
    handleApiResponse<Extintor[]>(extintoresResponse),
  ]);

  return { tags, inspecciones, extintores };
}
