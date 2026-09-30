"use server";

import { API_BASE_URL } from "../constants";
import { getAuthHeaders, handleApiResponse } from "./helpers";
import type {
  EntradaHistorial,
  EstadoEdicion,
  PlantillaVersionada,
} from "@/types/versionado";

/**
 * Versionado de plantillas: las mismas operaciones sobre las dos APIs de
 * plantillas. `recurso` se valida contra esta lista: es parte de la URL y
 * una Server Action se puede invocar con cualquier argumento.
 */
const RECURSOS = ["templates", "template-herra-equipos"] as const;
export type RecursoPlantillas = (typeof RECURSOS)[number];

function base(recurso: RecursoPlantillas): string {
  if (!RECURSOS.includes(recurso)) throw new Error("Recurso de plantillas no válido");
  return `${API_BASE_URL}/${recurso}`;
}

export async function obtenerEstadoEdicion(
  recurso: RecursoPlantillas,
  id: string,
): Promise<EstadoEdicion> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${base(recurso)}/${encodeURIComponent(id)}/estado-edicion`, {
    headers,
    cache: "no-store",
  });
  return handleApiResponse<EstadoEdicion>(response);
}

/** Clona la revisión vigente como borrador de la siguiente. */
export async function crearNuevaRevision(
  recurso: RecursoPlantillas,
  id: string,
): Promise<PlantillaVersionada> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${base(recurso)}/${encodeURIComponent(id)}/nueva-revision`, {
    method: "POST",
    headers,
    cache: "no-store",
  });
  return handleApiResponse<PlantillaVersionada>(response);
}

/** El borrador pasa a vigente y la vigente anterior a obsoleta. */
export async function publicarRevision(
  recurso: RecursoPlantillas,
  id: string,
  motivoCambio: string,
): Promise<unknown> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${base(recurso)}/${encodeURIComponent(id)}/publicar`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ motivoCambio }),
    cache: "no-store",
  });
  return handleApiResponse<unknown>(response);
}

/** Todas las revisiones de un código, de la más nueva a la más vieja. */
export async function obtenerHistorialRevisiones(
  recurso: RecursoPlantillas,
  code: string,
): Promise<EntradaHistorial[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${base(recurso)}/code/${encodeURIComponent(code)}/historial`, {
    headers,
    cache: "no-store",
  });
  return handleApiResponse<EntradaHistorial[]>(response);
}
