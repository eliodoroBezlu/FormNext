"use server";

import { API_BASE_URL } from "../constants";
import { getAuthHeaders, handleApiResponse } from "./helpers";
import type {
  AnularEntregaPayload,
  CorregirEntregaPayload,
  EntregaLinterna,
  EstadoTrabajador,
  FilaPorArea,
  FilaPorTrabajador,
  ReclasificarEntregaPayload,
  RegistrarEntregaPayload,
  ResumenLinternas,
  StockLinternas,
  TrabajadorSinDotacion,
} from "@/components/features/linternas/domain/models/Linterna";

export async function obtenerResumen(): Promise<ResumenLinternas> {
  const res = await fetch(`${API_BASE_URL}/linternas/reportes/resumen`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });
  return handleApiResponse<ResumenLinternas>(res);
}

export async function obtenerPorArea(): Promise<FilaPorArea[]> {
  const res = await fetch(`${API_BASE_URL}/linternas/reportes/por-area`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });
  return handleApiResponse<FilaPorArea[]>(res);
}

export async function obtenerPorTrabajador(): Promise<FilaPorTrabajador[]> {
  const res = await fetch(`${API_BASE_URL}/linternas/reportes/por-trabajador`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });
  return handleApiResponse<FilaPorTrabajador[]>(res);
}

export async function obtenerPerdidas(filtros?: {
  desde?: string;
  hasta?: string;
}): Promise<EntregaLinterna[]> {
  const params = new URLSearchParams();
  if (filtros?.desde) params.set("desde", filtros.desde);
  if (filtros?.hasta) params.set("hasta", filtros.hasta);

  const res = await fetch(
    `${API_BASE_URL}/linternas/reportes/perdidas?${params.toString()}`,
    { headers: await getAuthHeaders(), cache: "no-store" },
  );
  return handleApiResponse<EntregaLinterna[]>(res);
}

/**
 * Descarga el acta como base64.
 *
 * El PDF lo genera el backend, que es donde están las firmas y el hash; el
 * cliente solo lo entrega al navegador. Se devuelve en base64 porque una Server
 * Action no puede responder con un stream binario.
 */
export async function descargarActa(
  id: string,
): Promise<{ base64: string; nombre: string }> {
  const res = await fetch(`${API_BASE_URL}/linternas/${id}/acta`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`No se pudo generar el acta (${res.status}).`);
  }

  const disposicion = res.headers.get("content-disposition") ?? "";
  const nombre =
    /filename="?([^"]+)"?/.exec(disposicion)?.[1] ?? `acta-${id}.pdf`;

  const buffer = await res.arrayBuffer();
  return { base64: Buffer.from(buffer).toString("base64"), nombre };
}

export async function obtenerEstadoTrabajador(
  trabajadorId: string,
): Promise<EstadoTrabajador> {
  const res = await fetch(`${API_BASE_URL}/linternas/trabajador/${trabajadorId}`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });
  return handleApiResponse<EstadoTrabajador>(res);
}

export async function obtenerHistorialTrabajador(
  trabajadorId: string,
): Promise<EntregaLinterna[]> {
  const res = await fetch(
    `${API_BASE_URL}/linternas/trabajador/${trabajadorId}/historial`,
    { headers: await getAuthHeaders(), cache: "no-store" },
  );
  return handleApiResponse<EntregaLinterna[]>(res);
}

export async function obtenerEntregas(filtros?: {
  area?: string;
  estado?: string;
}): Promise<EntregaLinterna[]> {
  const params = new URLSearchParams();
  if (filtros?.area) params.set("area", filtros.area);
  if (filtros?.estado) params.set("estado", filtros.estado);

  const res = await fetch(`${API_BASE_URL}/linternas?${params.toString()}`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });
  return handleApiResponse<EntregaLinterna[]>(res);
}

export async function obtenerPendientes(): Promise<EntregaLinterna[]> {
  const res = await fetch(`${API_BASE_URL}/linternas/pendientes`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });
  return handleApiResponse<EntregaLinterna[]>(res);
}

export async function obtenerSinDotacion(): Promise<TrabajadorSinDotacion[]> {
  const res = await fetch(`${API_BASE_URL}/linternas/sin-dotacion`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });
  return handleApiResponse<TrabajadorSinDotacion[]>(res);
}

export async function obtenerStock(): Promise<StockLinternas> {
  const res = await fetch(`${API_BASE_URL}/linternas/stock`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });
  return handleApiResponse<StockLinternas>(res);
}

export async function registrarEntrega(
  payload: RegistrarEntregaPayload,
): Promise<EntregaLinterna> {
  const res = await fetch(`${API_BASE_URL}/linternas`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleApiResponse<EntregaLinterna>(res);
}

export async function resolverPerdida(
  id: string,
  payload: {
    aprobar: boolean;
    firmaAprobador?: string;
    metodoFirma?: string;
    comentario?: string;
  },
): Promise<EntregaLinterna> {
  const res = await fetch(`${API_BASE_URL}/linternas/${id}/resolver`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleApiResponse<EntregaLinterna>(res);
}

/**
 * Cambia el tipo de una entrega ya registrada.
 *
 * Manda la entrega completa y no solo el tipo: el servidor vuelve a aplicar
 * las reglas del tipo nuevo —qué bloques exige y cuáles prohíbe— y ajusta
 * estado y stock en consecuencia.
 */
export async function reclasificarEntrega(
  id: string,
  payload: ReclasificarEntregaPayload,
): Promise<EntregaLinterna> {
  const res = await fetch(`${API_BASE_URL}/linternas/${id}/reclasificar`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleApiResponse<EntregaLinterna>(res);
}

/** Saca de los recuentos una entrega que no debía registrarse. */
export async function anularEntrega(
  id: string,
  payload: AnularEntregaPayload,
): Promise<EntregaLinterna> {
  const res = await fetch(`${API_BASE_URL}/linternas/${id}/anular`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleApiResponse<EntregaLinterna>(res);
}

/** Corrige lo que no cambia la naturaleza del acto: hoy, la observación. */
export async function corregirEntrega(
  id: string,
  payload: CorregirEntregaPayload,
): Promise<EntregaLinterna> {
  const res = await fetch(`${API_BASE_URL}/linternas/${id}`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleApiResponse<EntregaLinterna>(res);
}

export async function firmarRecibo(
  id: string,
  payload: { firmaTrabajador: string; metodoFirma?: string },
): Promise<EntregaLinterna> {
  const res = await fetch(`${API_BASE_URL}/linternas/${id}/firmar`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleApiResponse<EntregaLinterna>(res);
}

export async function registrarIngresoStock(payload: {
  cantidad: number;
  observacion?: string;
}): Promise<{ cantidadDisponible: number }> {
  const res = await fetch(`${API_BASE_URL}/linternas/stock/ingreso`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleApiResponse<{ cantidadDisponible: number }>(res);
}

/**
 * Sube la foto de la devolución o una evidencia de pérdida.
 *
 * Va a su propia carpeta: hasta ahora todo caía en `evidencias-tareas`, fuera o
 * no de una tarea.
 */
export async function subirArchivoLinterna(
  formData: FormData,
): Promise<{ url: string; filename: string; mimetype: string; size: number }> {
  const headers = await getAuthHeaders();
  delete headers["Content-Type"]; // lo pone fetch, con el boundary correcto

  const res = await fetch(`${API_BASE_URL}/upload?carpeta=linternas`, {
    method: "POST",
    headers,
    body: formData,
  });
  return handleApiResponse<{
    url: string;
    filename: string;
    mimetype: string;
    size: number;
  }>(res);
}
