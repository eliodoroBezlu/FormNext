"use server";

import { getAuthHeaders, handleApiResponse } from "@/lib/actions/helpers";
import { API_BASE_URL } from "@/lib/constants";

const CATALOGO_URL = `${API_BASE_URL}/pgr/catalogos`;

export interface UnidadRecurso {
  _id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface EntregableSugerido {
  _id: string;
  nombre: string;
  activo: boolean;
}

export interface GrupoResponsable {
  _id: string;
  nombre: string;
  superintendencia?: string;
  areas: string[];
  criterio: "regla" | "lista";
  roles: string[];
  puestoContiene?: string;
  miembros: string[];
  activo: boolean;
}

export interface MiembroGrupo {
  ci: string;
  nombre: string;
  puesto: string;
  area: string;
}

/**
 * Catálogos configurables del PGR.
 *
 * Se leen del backend en vez de tener listas en el código: las unidades de
 * recurso y los entregables sugeridos se administran desde la base, y los
 * grupos de responsables se resuelven contra el roster.
 *
 * Todas devuelven `[]` ante un error en vez de tirar: un catálogo caído no
 * debe impedir editar el resto del formulario.
 */
export async function obtenerUnidadesRecurso(): Promise<UnidadRecurso[]> {
  try {
    const res = await fetch(`${CATALOGO_URL}/unidades`, {
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    return await handleApiResponse<UnidadRecurso[]>(res);
  } catch (error) {
    console.error("Error obteniendo unidades de recurso:", error);
    return [];
  }
}

export async function obtenerEntregablesSugeridos(): Promise<
  EntregableSugerido[]
> {
  try {
    const res = await fetch(`${CATALOGO_URL}/entregables`, {
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    return await handleApiResponse<EntregableSugerido[]>(res);
  } catch (error) {
    console.error("Error obteniendo entregables sugeridos:", error);
    return [];
  }
}

export async function obtenerGruposResponsables(
  superintendencia?: string,
): Promise<GrupoResponsable[]> {
  try {
    const query = superintendencia
      ? `?superintendencia=${encodeURIComponent(superintendencia)}`
      : "";
    const res = await fetch(`${CATALOGO_URL}/grupos${query}`, {
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    return await handleApiResponse<GrupoResponsable[]>(res);
  } catch (error) {
    console.error("Error obteniendo grupos de responsables:", error);
    return [];
  }
}

/** A quiénes alcanza el grupo. Sirve para mostrarlo antes de asignarlo. */
export async function obtenerMiembrosDelGrupo(
  grupoId: string,
): Promise<MiembroGrupo[]> {
  try {
    const res = await fetch(`${CATALOGO_URL}/grupos/${grupoId}/miembros`, {
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    return await handleApiResponse<MiembroGrupo[]>(res);
  } catch (error) {
    console.error("Error resolviendo el grupo:", error);
    return [];
  }
}

// ── Escrituras ─────────────────────────────────────────────────────────────
//
// A diferencia de las lecturas, estas **sí** devuelven el error: el panel de
// administración tiene que poder decir por qué no se guardó (un código
// duplicado, por ejemplo), no fallar en silencio.

export interface ResultadoCatalogo<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function escribir<T>(
  url: string,
  method: "POST" | "PATCH",
  body: unknown,
): Promise<ResultadoCatalogo<T>> {
  try {
    const res = await fetch(url, {
      method,
      headers: await getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return { success: true, data: await handleApiResponse<T>(res) };
  } catch (error) {
    console.error(`Error en ${method} ${url}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al guardar",
    };
  }
}

export async function crearUnidadRecurso(datos: {
  codigo: string;
  nombre: string;
}): Promise<ResultadoCatalogo<UnidadRecurso>> {
  return escribir(`${CATALOGO_URL}/unidades`, "POST", datos);
}

export async function actualizarUnidadRecurso(
  id: string,
  datos: Partial<{ codigo: string; nombre: string; activo: boolean }>,
): Promise<ResultadoCatalogo<UnidadRecurso>> {
  return escribir(`${CATALOGO_URL}/unidades/${id}`, "PATCH", datos);
}

export async function crearEntregableSugerido(
  nombre: string,
): Promise<ResultadoCatalogo<EntregableSugerido>> {
  return escribir(`${CATALOGO_URL}/entregables`, "POST", { nombre });
}

export async function actualizarEntregableSugerido(
  id: string,
  datos: Partial<{ nombre: string; activo: boolean }>,
): Promise<ResultadoCatalogo<EntregableSugerido>> {
  return escribir(`${CATALOGO_URL}/entregables/${id}`, "PATCH", datos);
}

/** Lo que el formulario del panel envía para un grupo. */
export type GrupoResponsableDto = Omit<GrupoResponsable, "_id" | "activo"> & {
  activo?: boolean;
};

export async function crearGrupoResponsable(
  datos: GrupoResponsableDto,
): Promise<ResultadoCatalogo<GrupoResponsable>> {
  return escribir(`${CATALOGO_URL}/grupos`, "POST", datos);
}

export async function actualizarGrupoResponsable(
  id: string,
  datos: Partial<GrupoResponsableDto>,
): Promise<ResultadoCatalogo<GrupoResponsable>> {
  return escribir(`${CATALOGO_URL}/grupos/${id}`, "PATCH", datos);
}
