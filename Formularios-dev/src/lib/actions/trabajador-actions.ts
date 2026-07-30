"use server";

import { Trabajador } from "@/types/trabajador";
import { API_BASE_URL } from "../constants";
import { getAuthHeaders, handleApiResponse } from "./helpers";

// Obtener todos los trabajadores
export async function obtenerTrabajadores(): Promise<Trabajador[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/trabajadores`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    return await handleApiResponse<Trabajador[]>(response);
  } catch (error) {
    console.error("Error obteniendo trabajadores:", error);
    throw error;
  }
}

// Obtener todos los trabajadores completos
export async function obtenerTrabajadoresCompletos(): Promise<Trabajador[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/trabajadores/completos`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    return await handleApiResponse<Trabajador[]>(response);
  } catch (error) {
    console.error("Error obteniendo trabajadores completos:", error);
    throw error;
  }
}

// Obtener trabajador por ID
export async function obtenerTrabajadorPorId(id: string): Promise<Trabajador> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/trabajadores/${id}`, {
      method: "GET",
      headers,
    });
    return await handleApiResponse<Trabajador>(response);
  } catch (error) {
    console.error("Error obteniendo trabajador:", error);
    throw error;
  }
}

// Obtener trabajador por username (para resolver el área del usuario autenticado)
export async function obtenerTrabajadorPorUsername(
  username: string
): Promise<Trabajador | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/trabajadores/by-username/${encodeURIComponent(username)}`,
      { method: "GET", headers, cache: "no-store" }
    );
    if (response.status === 404) return null;
    return await handleApiResponse<Trabajador>(response);
  } catch (error) {
    console.error("Error obteniendo trabajador por username:", error);
    return null;
  }
}

// Buscar trabajadores
export async function buscarTrabajadores(query: string): Promise<Trabajador[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/trabajadores/buscar?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );
    return await handleApiResponse<Trabajador[]>(response);
  } catch (error) {
    console.error("Error buscando trabajadores:", error);
    throw error;
  }
}
