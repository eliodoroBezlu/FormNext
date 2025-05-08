'use server';

import { revalidatePath } from 'next/cache';
//import { cookies } from 'next/headers';
import type { 
  ExtintoresUpdateData, 
  FormData, 
  InspeccionServiceExport, 
  Trabajador,
  VerificarTagData,
  FormularioInspeccion,
  DatosMes,
  Mes,
  FormDataExport,
  ExtintorBackend,
} from '../../types/formTypes';

// URL base para la API
const API_URL = process.env.API_URL || '';

// Función auxiliar para manejar respuestas
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en la solicitud: ${response.status} - ${errorText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const jsonData = await response.json();
    return jsonData as T;
  }
  
  const blob = await response.blob();
  return blob as unknown as T;
}

// Función para obtener headers 
// Versión simplificada sin autenticación por ahora
function getHeaders() {
  return new Headers({
    'Content-Type': 'application/json',
  });
  
  // Cuando implementes autenticación, puedes usar algo como esto:
  /*
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  
  return headers;
  */
}

// Acciones del servidor que reemplazan a inspeccionService
export async function crearInspeccion(data: FormData): Promise<FormData> {
  const response = await fetch(`${API_URL}/inspecciones`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  
  const result = await handleResponse<FormData>(response);
  revalidatePath('/inspecciones');
  return result;
}

export async function obtenerInspeccionPorId(id: string): Promise<FormData> {
  const response = await fetch(`${API_URL}/inspecciones/${id}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  
  return handleResponse<FormData>(response);
}

export async function obtenerTodasInspecciones(): Promise<FormDataExport[]> {
  const response = await fetch(`${API_URL}/inspecciones`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  
  return handleResponse<FormDataExport[]>(response);
}

export async function listarInspecciones(page = 1, limit = 10): Promise<{
  inspecciones: FormDataExport[];
  totalPages: number;
  currentPage: number;
}> {
  const response = await fetch(`${API_URL}/inspecciones?page=${page}&limit=${limit}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  
  return handleResponse<{
    inspecciones: FormDataExport[];
    totalPages: number;
    currentPage: number;
  }>(response);
}

export async function actualizarInspeccion(id: string, data: FormData): Promise<FormDataExport> {
  const response = await fetch(`${API_URL}/inspecciones/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  
  const result = await handleResponse<FormDataExport>(response);
  revalidatePath('/inspecciones');
  return result;
}

export async function eliminarInspeccion(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/inspecciones/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
    cache: 'no-store',
  });
  
  await handleResponse<{ success: boolean }>(response);
  revalidatePath('/inspecciones');
}

export async function descargarPdf(id: string): Promise<Blob> {
  const response = await fetch(`${API_URL}/inspecciones/${id}/pdf`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  
  return handleResponse<Blob>(response);
}

export async function descargarExcel(id: string): Promise<Blob> {
  const response = await fetch(`${API_URL}/inspecciones/${id}/excel`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  
  return handleResponse<Blob>(response);
}

export async function verificarTag(datos: VerificarTagData): Promise<{
  existe: boolean;
  formulario: FormularioInspeccion ;
  extintores: ExtintorBackend [];
  superintendencia: string;
}> {
  const response = await fetch(`${API_URL}/inspecciones-emergencia/verificar-tag`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(datos),
    cache: 'no-store',
  });
  
  return handleResponse<{
    existe: boolean;
    formulario: FormularioInspeccion;
    extintores: ExtintorBackend [];
    superintendencia: string;
  }>(response);
}

export async function crearFormSistemasEmergencia(data: FormularioInspeccion): Promise<FormularioInspeccion> {
  const response = await fetch(`${API_URL}/inspecciones-emergencia/crear-formulario`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  
  const result = await handleResponse<FormularioInspeccion>(response);
  revalidatePath('/inspecciones-emergencia');
  return result;
}

export async function actualizarMesPorTag(
  tag: string, 
  mes: Mes, 
  datosMes: DatosMes
): Promise<FormularioInspeccion> {
  const response = await fetch(`${API_URL}/inspecciones-emergencia/actualizar-mes/${tag}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ mes, datosMes }),
    cache: 'no-store',
  });
  
  const result = await handleResponse<FormularioInspeccion>(response);
  revalidatePath('/inspecciones-emergencia');
  return result;
}

export async function obtenerSistemasEmergenciaReport(): Promise<InspeccionServiceExport[]> {
  const response = await fetch(`${API_URL}/inspecciones-emergencia`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  
  return handleResponse<InspeccionServiceExport[]>(response);
}

export async function buscarTrabajadores(query: string): Promise<Trabajador[]> {
  const response = await fetch(`${API_URL}/trabajadores/buscar?query=${encodeURIComponent(query)}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  
  return handleResponse<Trabajador[]>(response);
}

export async function descargarExcelInspeccionesEmergencia(id: string): Promise<Blob> {
  const response = await fetch(`${API_URL}/inspecciones-emergencia/${id}/excel`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  
  return handleResponse<Blob>(response);
}

export async function buscarAreas(query: string): Promise<string[]> {
  const response = await fetch(`${API_URL}/area/buscar?query=${encodeURIComponent(query)}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  
  return handleResponse<string[]>(response);
}

export async function obtenerAreas(): Promise<string[]> {
  const response = await fetch(`${API_URL}/area`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  
  return handleResponse<string[]>(response);
}

export async function obtenerTagsPorArea(area: string): Promise<string[]> {
  const response = await fetch(`${API_URL}/tag/por-area?area=${encodeURIComponent(area)}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  
  const data = await handleResponse<string[]>(response);
  return Array.isArray(data) ? data : [];
}

export async function obtenerExtintoresPorArea(area: string): Promise<ExtintorBackend[]> {
  const response = await fetch(`${API_URL}/extintor/area/${encodeURIComponent(area)}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  
  const data = await handleResponse<{extintores: ExtintorBackend[]}>(response);
  return data.extintores || [];
}

export async function actualizarExtintoresPorTag(
  tag: string, 
  datosExtintores: ExtintoresUpdateData
): Promise<{success: boolean; message: string}> {
  const response = await fetch(`${API_URL}/inspecciones-emergencia/actualizar-extintores/${tag}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(datosExtintores),
    cache: 'no-store',
  });
  
  const result = await handleResponse<{success: boolean; message: string}>(response);
  revalidatePath('/inspecciones-emergencia');
  return result;
}