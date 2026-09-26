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

/**
 * Un área con los dos escalones que tiene por encima en el maestro.
 *
 * `gerencia` viene vacía a menudo, y no es un fallo: la gerencia de una
 * superintendencia es opcional —el catálogo del IAM no las expone y se asignan
 * a mano desde el panel—, así que hay que contar con el hueco.
 */
export interface CadenaOrganizativa {
  area: string;
  superintendencia: string | null;
  gerencia: string | null;
}

/**
 * La cadena **Gerencia → Superintendencia → Área** de todas las áreas activas.
 *
 * La usan los formularios para deducir superintendencia y gerencia del área
 * que elige el inspector, en vez de preguntárselas. Se pide una sola vez al
 * abrir el formulario: son tres cadenas por área y no cambia durante el rato
 * que dura rellenarlo.
 */
export async function obtenerCadenaDeAreas(): Promise<CadenaOrganizativa[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/area/cadena`, {
    headers,
    cache: "no-store",
  });

  return handleApiResponse<CadenaOrganizativa[]>(response);
}

/**
 * Nombres de las áreas activas, sin repetidos y ordenados.
 *
 * El maestro puede tener dos documentos con el mismo nombre —hoy hay dos
 * «Generacion»—, y eso rompía las listas de React, que usan el nombre como
 * clave: *«Encountered two children with the same key»*, con el riesgo de que
 * una de las dos opciones se pinte mal o desaparezca.
 *
 * Quitarlos aquí, y no en cada pantalla, es lo que evita que el siguiente
 * desplegable vuelva a tropezar con lo mismo. **No arregla el dato**: siguen
 * siendo dos áreas distintas en la base, y mientras lo sean, las inspecciones
 * se reparten entre las dos sin que nadie lo note.
 */
export async function obtenerAreas(): Promise<string[]> {
  const areas = await obtenerAreasCompletas();
  const nombres = areas
    .filter(area => area.activo)
    .map(area => area.nombre);

  return Array.from(new Set(nombres)).sort();
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