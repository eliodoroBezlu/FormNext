"use server";

import { getAuthHeaders, handleApiResponse } from "@/lib/actions/helpers";
import { API_BASE_URL } from "@/lib/constants";

export interface GerenciaBackend {
  _id: string;
  nombre: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Gerencias: el nivel más alto de **Gerencia → Superintendencia → Área**.
 *
 * Devuelve `[]` ante un error en vez de tirar: el catálogo alimenta un
 * selector, y que falle no debe impedir cargar el resto del formulario.
 */
export async function obtenerGerencias(): Promise<GerenciaBackend[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/gerencias`, {
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    return await handleApiResponse<GerenciaBackend[]>(res);
  } catch (error) {
    console.error("Error obteniendo gerencias:", error);
    return [];
  }
}
