"use server";

import { API_BASE_URL } from "../constants";
import { getAuthHeaders, handleApiResponse } from "./helpers";
import type {
  CorregirSolicitantePayload,
  CrearSolicitudPayload,
  DevolverItemPayload,
  EquipoPrestable,
  LineaPrestamo,
  SolicitudPrestamo,
} from "@/components/features/prestamos-spcc/domain/models/Prestamo";

export async function obtenerDisponibles(
  tipo?: string,
): Promise<EquipoPrestable[]> {
  const params = tipo ? `?tipo=${encodeURIComponent(tipo)}` : "";
  const res = await fetch(`${API_BASE_URL}/prestamos-spcc/disponibles${params}`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });
  return handleApiResponse<EquipoPrestable[]>(res);
}

export async function obtenerSolicitudes(filtros?: {
  estado?: string;
  area?: string;
}): Promise<SolicitudPrestamo[]> {
  const params = new URLSearchParams();
  if (filtros?.estado) params.set("estado", filtros.estado);
  if (filtros?.area) params.set("area", filtros.area);

  const res = await fetch(
    `${API_BASE_URL}/prestamos-spcc?${params.toString()}`,
    { headers: await getAuthHeaders(), cache: "no-store" },
  );
  return handleApiResponse<SolicitudPrestamo[]>(res);
}

export async function obtenerDetalle(
  id: string,
): Promise<{ solicitud: SolicitudPrestamo; items: LineaPrestamo[] }> {
  const res = await fetch(`${API_BASE_URL}/prestamos-spcc/${id}`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });
  return handleApiResponse<{
    solicitud: SolicitudPrestamo;
    items: LineaPrestamo[];
  }>(res);
}

export async function crearSolicitud(
  payload: CrearSolicitudPayload,
): Promise<SolicitudPrestamo> {
  const res = await fetch(`${API_BASE_URL}/prestamos-spcc`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleApiResponse<SolicitudPrestamo>(res);
}

export async function entregarSolicitud(
  id: string,
  payload: {
    /** Equipos que salen del almacén. Se eligen al entregar, no al pedir. */
    equipos?: string[];
    firmaEntrega?: string;
    firmaReceptor?: string;
    observacion?: string;
  },
): Promise<SolicitudPrestamo> {
  const res = await fetch(`${API_BASE_URL}/prestamos-spcc/${id}/entregar`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleApiResponse<SolicitudPrestamo>(res);
}

export async function devolverItems(
  id: string,
  items: DevolverItemPayload[],
): Promise<SolicitudPrestamo> {
  const res = await fetch(`${API_BASE_URL}/prestamos-spcc/${id}/devolver`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ items }),
  });
  return handleApiResponse<SolicitudPrestamo>(res);
}

export async function cancelarSolicitud(
  id: string,
  motivo?: string,
): Promise<SolicitudPrestamo> {
  const res = await fetch(`${API_BASE_URL}/prestamos-spcc/${id}/cancelar`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ motivo }),
  });
  return handleApiResponse<SolicitudPrestamo>(res);
}

/**
 * Corrige a nombre de quién está una solicitud ya registrada.
 *
 * Solo admin. El valor anterior no se pisa: el servidor lo guarda en
 * `correcciones[]` y el acta lo muestra al pie.
 */
export async function corregirSolicitante(
  id: string,
  payload: CorregirSolicitantePayload,
): Promise<SolicitudPrestamo> {
  const res = await fetch(`${API_BASE_URL}/prestamos-spcc/${id}/solicitante`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleApiResponse<SolicitudPrestamo>(res);
}

/**
 * Mapa `código → área` de lo que está prestado ahora.
 *
 * Lo usa el selector del formulario SPCC solo para etiquetar. Si falla, se
 * devuelve vacío: no poder decir dónde está un equipo no debe impedir
 * inspeccionarlo.
 */
export async function obtenerPrestadosAhora(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API_BASE_URL}/prestamos-spcc/prestados-ahora`, {
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    return handleApiResponse<Record<string, string>>(res);
  } catch {
    return {};
  }
}
