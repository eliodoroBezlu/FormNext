"use server";

import { Trabajador, TrabajadorResumen } from "@/types/trabajador";
import type {
  ResultadoDeAplicar,
  UltimaSincronizacion,
  VistaPrevia,
} from "@/components/features/settings/domain/models/sincronizacionTrabajadores";
import { API_BASE_URL } from "../constants";
import { getAuthHeaders, handleApiResponse } from "./helpers";

/** Supervisores y superintendentes que pueden ser responsables de cierre. */
export async function obtenerResponsablesDeCierreApi(): Promise<
  {
    nomina: string;
    puesto: string;
    username: string;
    area: string;
    superintendencia: string;
    rol: "supervisor" | "superintendente";
  }[]
> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/trabajadores/responsables-cierre`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  return handleApiResponse(response);
}

/**
 * forms guarda su propia copia del padrón y no la actualiza sola: quien crea
 * un trabajador en el Portal IAM tiene que sincronizar para verlo aquí. Las
 * dos son solo para admin.
 *
 * Qué cambiaría sincronizar, sin escribir nada.
 */
export async function obtenerVistaPreviaSincronizacion(): Promise<VistaPrevia> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/trabajadores/sync/vista-previa`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  return handleApiResponse(response);
}

/** Cuándo fue la última sincronización y quién la hizo (no consulta al IAM). */
export async function obtenerUltimaSincronizacion(): Promise<UltimaSincronizacion | null> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/trabajadores/sync/ultima`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  return handleApiResponse(response);
}

/** Aplica lo elegido de la vista previa (ids de fichas del IAM) y, si se pide, los supervisores. */
export async function aplicarSincronizacionIam(
  ids: string[],
  supervisores: boolean,
): Promise<ResultadoDeAplicar> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/trabajadores/sync`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ ids, supervisores }),
    cache: "no-store",
  });
  return handleApiResponse(response);
}

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

/**
 * Roster reducido para autocompletar por nombre.
 *
 * Pese a llamarse «completos», el backend hace `.select('nomina ci puesto')`:
 * **no trae `_id` ni `area`**. Si necesita cualquiera de los dos, use
 * `obtenerTrabajadores()`.
 */
export async function obtenerTrabajadoresCompletos(): Promise<
  TrabajadorResumen[]
> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/trabajadores/completos`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    return await handleApiResponse<TrabajadorResumen[]>(response);
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
