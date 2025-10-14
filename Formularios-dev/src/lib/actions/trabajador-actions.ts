"use server"
import { Trabajador, TrabajadorForm } from "@/types/trabajador";
import { API_BASE_URL } from "../constants";
import { handleApiResponse } from "./helpers";

const headers = {
  "Content-Type": "application/json",
};

// Obtener todos los trabajadores
export async function obtenerTrabajadores(): Promise<Trabajador[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/trabajadores`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return handleApiResponse<Trabajador[]>(response);
  } catch (error) {
    console.error("Error obteniendo trabajadores:", error);
    throw error;
  }
}

// Obtener trabajador por ID
export async function obtenerTrabajadorPorId(id: string): Promise<Trabajador> {
  try {
    const response = await fetch(`${API_BASE_URL}/trabajadores/${id}`, {
      method: "GET",
      headers,
    });

    return handleApiResponse<Trabajador>(response)
  } catch (error) {
    console.error("Error obteniendo trabajador:", error);
    throw error;
  }
}

// Crear trabajador
export async function crearTrabajador(data: TrabajadorForm): Promise<Trabajador> {
  try {
    const response = await fetch(`${API_BASE_URL}/trabajadores`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

  return handleApiResponse<Trabajador>(response);
  } catch (error) {
    console.error("Error creando trabajador:", error);
    throw error;
  }
}

// Actualizar trabajador
export async function actualizarTrabajador(
  id: string, 
  data: Partial<TrabajadorForm>
): Promise<Trabajador> {
  try {
    const response = await fetch(`${API_BASE_URL}/trabajadores/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });

    return handleApiResponse<Trabajador>(response);
  } catch (error) {
    console.error("Error actualizando trabajador:", error);
    throw error;
  }
}

// Eliminar trabajador
export async function eliminarTrabajador(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/trabajadores/${id}`, {
      method: "DELETE",
      headers,
    });

    return handleApiResponse<void>(response)
  } catch (error) {
    console.error("Error eliminando trabajador:", error);
    throw error;
  }
}

// Buscar trabajadores
export async function buscarTrabajadores(query: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/trabajadores/buscar?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error buscando trabajadores:", error);
    throw error;
  }
}