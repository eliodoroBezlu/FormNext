"use server";

import { revalidatePath } from "next/cache";
//import { cookies } from 'next/headers';
import type {
  FormData,
  InspeccionServiceExport,
  Trabajador,
  VerificarTagData,
  FormularioInspeccion,
  DatosMes,
  Mes,
  FormDataExport,
  ExtintorBackend,
  FiltrosInspeccion,
  InspeccionExtintor,
  ExtintorAreaResponse,
  QRGenerateRequest,
  QRGenerateResponse,
  QRCompleteResponse,
  QROptions,
} from "../../types/formTypes";
import {  getAuthHeaders, handleApiResponse } from "@/lib/actions/helpers";
import { API_BASE_URL } from "@/lib/constants";
import { AreaBackend } from "@/lib/actions/area-actions";

// Acciones del servidor que reemplazan a inspeccionService
export async function crearInspeccion(data: FormData): Promise<FormData> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/inspecciones`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const result = await handleApiResponse<FormData>(response);
  revalidatePath("/inspecciones");
  return result;
}

export async function obtenerInspeccionPorId(id: string): Promise<FormData> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/inspecciones/${id}`, {
    headers,
    cache: "no-store",
  });

  return handleApiResponse<FormData>(response);
}

export async function obtenerTodasInspecciones(): Promise<FormDataExport[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/inspecciones`, {
    headers,
    cache: "no-store",
  });

  return handleApiResponse<FormDataExport[]>(response);
}

export async function listarInspecciones(
  page = 1,
  limit = 10
): Promise<{
  inspecciones: FormDataExport[];
  totalPages: number;
  currentPage: number;
}> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/inspecciones?page=${page}&limit=${limit}`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse<{
    inspecciones: FormDataExport[];
    totalPages: number;
    currentPage: number;
  }>(response);
}

export async function actualizarInspeccion(
  id: string,
  data: FormData
): Promise<FormDataExport> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/inspecciones/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const result = await handleApiResponse<FormDataExport>(response);
  revalidatePath("/inspecciones");
  return result;
}

export async function eliminarInspeccion(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/inspecciones/${id}`, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });

  await handleApiResponse<{ success: boolean }>(response);
  revalidatePath("/inspecciones");
}

export async function descargarPdf(id: string): Promise<Blob> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/inspecciones/${id}/pdf`, {
    headers,
    cache: "no-store",
  });

  // Para archivos, necesitamos manejo especial ya que handleApiResponse está optimizado para JSON
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.blob();
}

export async function descargarExcel(id: string): Promise<Blob> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/inspecciones/${id}/excel`, {
    headers,
    cache: "no-store",
  });

  // Para archivos, necesitamos manejo especial
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.blob();
}

export async function verificarTag(datos: VerificarTagData): Promise<{
  existe: boolean;
  formulario: FormularioInspeccion;
  extintores: {
    extintores: ExtintorBackend[];
    totalActivosArea: number;
  };
  superintendencia: string;
}> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/inspecciones-emergencia/verificar-tag`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(datos),
      cache: "no-store",
    }
  );

  return handleApiResponse<{
    existe: boolean;
    formulario: FormularioInspeccion;
    extintores: {
      extintores: ExtintorBackend[];
      totalActivosArea: number;
    };
    superintendencia: string;
  }>(response);
}

export async function crearFormSistemasEmergencia(
  data: FormularioInspeccion
): Promise<FormularioInspeccion> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/inspecciones-emergencia/crear-formulario`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  const result = await handleApiResponse<FormularioInspeccion>(response);
  revalidatePath("/inspecciones-emergencia");
  return result;
}

export async function actualizarMesPorTag(
  tag: string,
  mes: Mes,
  datosMes: DatosMes,
  area: string
): Promise<FormularioInspeccion> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/inspecciones-emergencia/actualizar-mes/${tag}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({ mes, datosMes, area }),
      cache: "no-store",
    }
  );

  const result = await handleApiResponse<FormularioInspeccion>(response);
  revalidatePath("/inspecciones-emergencia");
  return result;
}

export async function obtenerSistemasEmergenciaReport(
  filtros?: FiltrosInspeccion
): Promise<InspeccionServiceExport[]> {
  const params = new URLSearchParams();

  if (filtros) {
    if (filtros.area) params.append("area", filtros.area);
    if (filtros.superintendencia)
      params.append("superintendencia", filtros.superintendencia);
    if (filtros.mesActual) params.append("mesActual", filtros.mesActual);
    if (filtros.documentCode)
      params.append("documentCode", filtros.documentCode);
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/inspecciones-emergencia${
    queryString ? `?${queryString}` : ""
  }`;

  const headers = await getAuthHeaders();
  const response = await fetch(url, {
    headers,
    cache: "no-store",
  });

  return handleApiResponse<InspeccionServiceExport[]>(response);
}

export async function buscarTrabajadores(query: string): Promise<Trabajador[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/trabajadores/buscar?query=${encodeURIComponent(query)}`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse<Trabajador[]>(response);
}

export async function descargarExcelInspeccionesEmergencia(
  id: string
): Promise<Blob> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/inspecciones-emergencia/${id}/excel`,
    {
      headers,
      cache: "no-store",
    }
  );

  // Para archivos, manejo especial
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.blob();
}

// Agregar este import al inicio del archivo

// ... resto de imports ...

// =====================================================
// FUNCIONES DE ÁREAS CORREGIDAS
// =====================================================

/**
 * Buscar áreas por query - devuelve solo nombres
 * El backend endpoint /area/buscar devuelve string[]
 */
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

/**
 * Obtener todas las áreas - devuelve solo nombres de áreas activas
 * El backend endpoint /area devuelve objetos completos
 */
export async function obtenerAreas(): Promise<string[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/area`, {
    headers,
    cache: "no-store",
  });

  // El backend devuelve objetos completos de tipo AreaBackend[]
  const areas = await handleApiResponse<AreaBackend[]>(response);
  
  // Filtrar solo áreas activas y extraer nombres
  return areas
    .filter(area => area.activo)
    .map(area => area.nombre)
    .sort(); // Ordenar alfabéticamente
}

/**
 * Obtener todas las áreas completas (objetos)
 * Útil cuando necesitas más información que solo el nombre
 */
export async function obtenerAreasCompletas(): Promise<AreaBackend[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/area`, {
    headers,
    cache: "no-store",
  });

  return handleApiResponse<AreaBackend[]>(response);
}

/**
 * Obtener áreas activas completas con su superintendencia
 */
export async function obtenerAreasActivas(): Promise<AreaBackend[]> {
  const areas = await obtenerAreasCompletas();
  return areas.filter(area => area.activo);
}

/**
 * Obtener áreas por superintendencia
 */
export async function obtenerAreasPorSuperintendencia(
  superintendenciaId: string
): Promise<AreaBackend[]> {
  const areas = await obtenerAreasCompletas();
  return areas.filter(
    area => area.activo && area.superintendencia._id === superintendenciaId
  );
}

export async function obtenerTagsPorArea(area: string): Promise<string[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/tag/por-area?area=${encodeURIComponent(area)}`,
    {
      headers,
      cache: "no-store",
    }
  );

  const data = await handleApiResponse<string[]>(response);
  return Array.isArray(data) ? data : [];
}

export async function obtenerExtintoresPorTag(
  tag: string
): Promise<ExtintorAreaResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/extintor/tag/${encodeURIComponent(tag)}`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse<ExtintorAreaResponse>(response);
}

export async function actualizarExtintoresPorTag(
  tag: string,
  data: { extintores: InspeccionExtintor[]; area: string }
): Promise<{ success: boolean; message: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/inspecciones-emergencia/actualizar-extintores/${tag}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  const result = await handleApiResponse<{ success: boolean; message: string }>(
    response
  );
  revalidatePath("/inspecciones-emergencia");
  return result;
}

export async function desactivarExtintor(
  codigo: string
): Promise<{ exito: boolean; mensaje: string }> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/extintor/desactivar/${encodeURIComponent(codigo)}`,
    {
      method: "PUT",
      headers,
      cache: "no-store",
    }
  );

  const result = await handleApiResponse<{ exito: boolean; mensaje: string }>(
    response
  );
  revalidatePath("/inspecciones-emergencia");
  return result;
}

export async function obtenerTagsConEstadoPorAreaYMes(
  area: string,
  mesActual: Mes
): Promise<{ tag: string; inspeccionRealizada: boolean }[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/inspecciones-emergencia/tags-con-estado?area=${encodeURIComponent(
      area
    )}&mesActual=${encodeURIComponent(mesActual)}`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse<{ tag: string; inspeccionRealizada: boolean }[]>(
    response
  );
}

export async function verificarInspecciones(area: string, mesActual: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${API_BASE_URL}/inspecciones-emergencia/verificar-inspecciones?area=${encodeURIComponent(
      area
    )}&mesActual=${encodeURIComponent(mesActual)}`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res);
}

export async function obtenerExtintoresPorArea(
  area: string
): Promise<ExtintorAreaResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/extintor/area/${encodeURIComponent(area)}`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse<ExtintorAreaResponse>(response);
}

export async function generarCodigoQR(
  data: QRGenerateRequest
): Promise<QRGenerateResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/qr/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const result = await handleApiResponse<QRGenerateResponse>(response);
  revalidatePath("/qr-generator");
  return result;
}

export async function generarCodigoQRCompleto(
  data: QRGenerateRequest
): Promise<QRCompleteResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/qr/complete`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const result = await handleApiResponse<QRCompleteResponse>(response);
  revalidatePath("/qr-generator");
  return result;
}

export async function obtenerUrlImagenQR(
  text: string,
  options?: Omit<QROptions, "color" | "errorCorrectionLevel">,
  forDownload: boolean = false
): Promise<{ url: string }> {
  const params = new URLSearchParams({ text });

  if (options?.width) params.append("width", options.width.toString());
  if (options?.height) params.append("height", options.height.toString());
  if (options?.margin) params.append("margin", options.margin.toString());
  if (forDownload) params.append("download", "true");

  const url = `${API_BASE_URL}/qr/image?${params.toString()}`;

  return { url };
}

export async function obtenerUrlSvgQR(
  text: string,
  options?: Omit<QROptions, "color" | "errorCorrectionLevel">,
  forDownload: boolean = false
): Promise<{ url: string }> {
  const params = new URLSearchParams({ text });

  if (options?.width) params.append("width", options.width.toString());
  if (options?.height) params.append("height", options.height.toString());
  if (forDownload) params.append("download", "true");

  const url = `${API_BASE_URL}/qr/svg?${params.toString()}`;

  return { url };
}

export async function descargarImagenQR(
  text: string,
  options?: Omit<QROptions, "color" | "errorCorrectionLevel">
): Promise<Blob> {
  const params = new URLSearchParams({ text });

  if (options?.width) params.append("width", options.width.toString());
  if (options?.height) params.append("height", options.height.toString());
  if (options?.margin) params.append("margin", options.margin.toString());

  const response = await fetch(`${API_BASE_URL}/qr/image?${params.toString()}`, {
    headers: new Headers(), // Sin Content-Type para imágenes
    cache: "no-store",
  });

  // Para archivos, manejo especial
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.blob();
}

export async function descargarSvgQR(
  text: string,
  options?: Omit<QROptions, "color" | "errorCorrectionLevel">
): Promise<Blob> {
  const params = new URLSearchParams({ text });

  if (options?.width) params.append("width", options.width.toString());
  if (options?.height) params.append("height", options.height.toString());

  const response = await fetch(`${API_BASE_URL}/qr/svg?${params.toString()}`, {
    headers: new Headers(),
    cache: "no-store",
  });

  // Para archivos, manejo especial
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.blob();
}

export async function validarUrl(
  url: string
): Promise<{ valida: boolean; mensaje?: string }> {
  if (!url || url.trim().length === 0) {
    return { valida: false, mensaje: "La URL no puede estar vacía" };
  }

  try {
    new URL(url);
    return { valida: true };
  } catch {
    return { valida: false, mensaje: "La URL no tiene un formato válido" };
  }
}

export async function generarMultiplesQR(
  urls: string[],
  options?: QROptions
): Promise<QRGenerateResponse[]> {
  const promises = urls.map((url) =>
    generarCodigoQR({ text: url, ...options })
  );

  const results = await Promise.allSettled(promises);

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      return {
        success: false,
        data: {
          text: urls[index],
          qrCode: "",
          timestamp: new Date().toISOString(),
        },
      };
    }
  });
}

export async function obtenerInspeccionEmergenciaPorId(id: string): Promise<FormularioInspeccion> {
  const headers = await getAuthHeaders();
  // Tu controller tiene @Get(':id') en InspeccionesEmergenciaController
  const response = await fetch(`${API_BASE_URL}/inspecciones-emergencia/${id}`, {
    headers,
    cache: "no-store",
  });

  // Usamos handleApiResponse que ya tienes importado
  return handleApiResponse<FormularioInspeccion>(response);
}