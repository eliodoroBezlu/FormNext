"use server";

import { revalidatePath } from "next/cache";
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
import { handleApiResponse } from "@/lib/actions/helpers";

// URL base para la API
const API_URL = process.env.API_URL || "";

// Función para obtener headers
function getHeaders() {
  return new Headers({
    "Content-Type": "application/json",
  });
}

// ============= INSPECCIONES =============

export async function crearInspeccion(data: FormData): Promise<FormData> {
  const response = await fetch(`${API_URL}/inspecciones`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const result = await handleApiResponse<FormData>(response);
  revalidatePath("/inspecciones");
  return result;
}

export async function obtenerInspeccionPorId(id: string): Promise<FormData> {
  const response = await fetch(`${API_URL}/inspecciones/${id}`, {
    headers: getHeaders(),
    cache: "no-store",
  });

  return handleApiResponse<FormData>(response);
}

export async function obtenerTodasInspecciones(): Promise<FormDataExport[]> {
  const response = await fetch(`${API_URL}/inspecciones`, {
    headers: getHeaders(),
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
  const response = await fetch(
    `${API_URL}/inspecciones?page=${page}&limit=${limit}`,
    {
      headers: getHeaders(),
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
  const response = await fetch(`${API_URL}/inspecciones/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
    cache: "no-store",
  });

  const result = await handleApiResponse<FormDataExport>(response);
  revalidatePath("/inspecciones");
  return result;
}

export async function eliminarInspeccion(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/inspecciones/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
    cache: "no-store",
  });

  await handleApiResponse<{ success: boolean }>(response);
  revalidatePath("/inspecciones");
}

export async function descargarPdf(id: string): Promise<Blob> {
  const response = await fetch(`${API_URL}/inspecciones/${id}/pdf`, {
    headers: getHeaders(),
    cache: "no-store",
  });

  return handleApiResponse<Blob>(response);
}

export async function descargarExcel(id: string): Promise<Blob> {
  const response = await fetch(`${API_URL}/inspecciones/${id}/excel`, {
    headers: getHeaders(),
    cache: "no-store",
  });

  return handleApiResponse<Blob>(response);
}

// ============= INSPECCIONES EMERGENCIA =============

export async function verificarTag(datos: VerificarTagData): Promise<{
  existe: boolean;
  formulario: FormularioInspeccion;
  extintores: {
    extintores: ExtintorBackend[];
    totalActivosArea: number;
  };
  superintendencia: string;
}> {
  const response = await fetch(
    `${API_URL}/inspecciones-emergencia/verificar-tag`,
    {
      method: "POST",
      headers: getHeaders(),
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
  const response = await fetch(
    `${API_URL}/inspecciones-emergencia/crear-formulario`,
    {
      method: "POST",
      headers: getHeaders(),
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
  const response = await fetch(
    `${API_URL}/inspecciones-emergencia/actualizar-mes/${tag}`,
    {
      method: "PUT",
      headers: getHeaders(),
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
  const url = `${API_URL}/inspecciones-emergencia${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url, {
    headers: getHeaders(),
    cache: "no-store",
  });

  return handleApiResponse<InspeccionServiceExport[]>(response);
}

export async function descargarExcelInspeccionesEmergencia(
  id: string
): Promise<Blob> {
  const response = await fetch(
    `${API_URL}/inspecciones-emergencia/${id}/excel`,
    {
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleApiResponse<Blob>(response);
}

export async function actualizarExtintoresPorTag(
  tag: string,
  data: { extintores: InspeccionExtintor[]; area: string }
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(
    `${API_URL}/inspecciones-emergencia/actualizar-extintores/${tag}`,
    {
      method: "PUT",
      headers: getHeaders(),
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

export async function obtenerTagsConEstadoPorAreaYMes(
  area: string,
  mesActual: Mes
): Promise<{ tag: string; inspeccionRealizada: boolean }[]> {
  const response = await fetch(
    `${API_URL}/inspecciones-emergencia/tags-con-estado?area=${encodeURIComponent(
      area
    )}&mesActual=${encodeURIComponent(mesActual)}`,
    {
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleApiResponse<{ tag: string; inspeccionRealizada: boolean }[]>(
    response
  );
}

// ✅ CORREGIDO: Tipar correctamente el retorno
export async function verificarInspecciones(
  area: string, 
  mesActual: string
): Promise<{
  totalTags: number;
  inspeccionadas: number;
  pendientes: number;
  porcentajeCompletado: number;
  tags: Array<{ tag: string; inspeccionRealizada: boolean }>;
}> {
  const response = await fetch(
    `${API_URL}/inspecciones-emergencia/verificar-inspecciones?area=${encodeURIComponent(
      area
    )}&mesActual=${encodeURIComponent(mesActual)}`,
    {
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleApiResponse<{
    totalTags: number;
    inspeccionadas: number;
    pendientes: number;
    porcentajeCompletado: number;
    tags: Array<{ tag: string; inspeccionRealizada: boolean }>;
  }>(response);
}

// ============= TRABAJADORES =============

export async function buscarTrabajadores(query: string): Promise<Trabajador[]> {
  const response = await fetch(
    `${API_URL}/trabajadores/buscar?query=${encodeURIComponent(query)}`,
    {
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleApiResponse<Trabajador[]>(response);
}

// ============= AREAS =============

export async function buscarAreas(query: string): Promise<string[]> {
  const response = await fetch(
    `${API_URL}/area/buscar?query=${encodeURIComponent(query)}`,
    {
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  return handleApiResponse<string[]>(response);
}

export async function obtenerAreas(): Promise<string[]> {
  const response = await fetch(`${API_URL}/area`, {
    headers: getHeaders(),
    cache: "no-store",
  });

  return handleApiResponse<string[]>(response);
}

export async function obtenerTagsPorArea(area: string): Promise<string[]> {
  const response = await fetch(
    `${API_URL}/tag/por-area?area=${encodeURIComponent(area)}`,
    {
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  const data = await handleApiResponse<string[]>(response);
  return Array.isArray(data) ? data : [];
}

// ============= EXTINTORES =============

export async function obtenerExtintoresPorTag(
  tag: string
): Promise<ExtintorAreaResponse> {
  console.log('🔍 Frontend - Obteniendo extintores para tag:', tag);
  console.log('📍 URL:', `${API_URL}/extintor/tag/${encodeURIComponent(tag)}`);
  
  const response = await fetch(
    `${API_URL}/extintor/tag/${encodeURIComponent(tag)}`,
    {
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  const data = await handleApiResponse<ExtintorAreaResponse>(response);
  console.log('✅ Extintores recibidos:', data);
  return data;
}

export async function obtenerExtintoresPorArea(
  area: string
): Promise<ExtintorAreaResponse> {
  console.log('🔍 Frontend - Obteniendo extintores para área:', area);
  console.log('📍 URL:', `${API_URL}/extintor/area/${encodeURIComponent(area)}`);
  
  const response = await fetch(
    `${API_URL}/extintor/area/${encodeURIComponent(area)}`,
    {
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  const data = await handleApiResponse<ExtintorAreaResponse>(response);
  console.log('✅ Extintores recibidos:', data);
  return data;
}

export async function desactivarExtintor(
  codigo: string
): Promise<{ exito: boolean; mensaje: string }> {
  const response = await fetch(
    `${API_URL}/extintor/desactivar/${encodeURIComponent(codigo)}`,
    {
      method: "PUT",
      headers: getHeaders(),
      cache: "no-store",
    }
  );

  const result = await handleApiResponse<{ exito: boolean; mensaje: string }>(
    response
  );
  revalidatePath("/inspecciones-emergencia");
  return result;
}

// ============= QR CODES =============

export async function generarCodigoQR(
  data: QRGenerateRequest
): Promise<QRGenerateResponse> {
  const response = await fetch(`${API_URL}/qr/generate`, {
    method: "POST",
    headers: getHeaders(),
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
  const response = await fetch(`${API_URL}/qr/complete`, {
    method: "POST",
    headers: getHeaders(),
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

  const url = `${API_URL}/qr/image?${params.toString()}`;

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

  const url = `${API_URL}/qr/svg?${params.toString()}`;

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

  const response = await fetch(`${API_URL}/qr/image?${params.toString()}`, {
    headers: new Headers(),
    cache: "no-store",
  });

  return handleApiResponse<Blob>(response);
}

export async function descargarSvgQR(
  text: string,
  options?: Omit<QROptions, "color" | "errorCorrectionLevel">
): Promise<Blob> {
  const params = new URLSearchParams({ text });

  if (options?.width) params.append("width", options.width.toString());
  if (options?.height) params.append("height", options.height.toString());

  const response = await fetch(`${API_URL}/qr/svg?${params.toString()}`, {
    headers: new Headers(),
    cache: "no-store",
  });

  return handleApiResponse<Blob>(response);
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