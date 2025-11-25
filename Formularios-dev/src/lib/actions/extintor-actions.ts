// app/actions/extintor.ts
"use server"

import { ExtintorBackend } from "@/types/formTypes"
import {  getAuthHeaders, handleApiResponse } from "./helpers"
import { API_BASE_URL } from "../constants"

// Interfaces


interface CreateExtintorDto {
  area: string
  tag: string
  CodigoExtintor: string
  Ubicacion: string
  inspeccionado?: boolean
  activo?: boolean
}

interface UpdateExtintorDto {
  area?: string
  tag?: string
  CodigoExtintor?: string
  Ubicacion?: string
  inspeccionado?: boolean
  activo?: boolean
}

interface FiltrosExtintor {
  area?: string
  tag?: string
  codigo?: string
  activo?: boolean
  inspeccionado?: boolean
}

// URL base de tu API

/**
 * Obtener todos los extintores
 */
export async function obtenerExtintores(): Promise<ExtintorBackend[]> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/extintor`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    return handleApiResponse<ExtintorBackend[]>(response);
  } catch (error) {
    console.error('Error al obtener extintores:', error);
    throw new Error('No se pudieron cargar los extintores');
  }
}

/**
 * Obtener extintores con filtros
 */
export async function obtenerExtintoresFiltrados(filtros: FiltrosExtintor): Promise<ExtintorBackend[]> {
  try {
    const params = new URLSearchParams();
    
    if (filtros.area) params.append('area', filtros.area);
    if (filtros.tag) params.append('tag', filtros.tag);
    if (filtros.codigo) params.append('codigo', filtros.codigo);
    if (filtros.activo !== undefined) params.append('activo', filtros.activo.toString());
    if (filtros.inspeccionado !== undefined) params.append('inspeccionado', filtros.inspeccionado.toString());

    const url = `${API_BASE_URL}/extintor/filtrar?${params.toString()}`;
    const headers = await getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    return handleApiResponse<ExtintorBackend[]>(response);
  } catch (error) {
    console.error('Error al obtener extintores filtrados:', error);
    throw new Error('No se pudieron cargar los extintores filtrados');
  }
}

/**
 * Obtener extintor por ID
 */
export async function obtenerExtintorPorId(id: string): Promise<ExtintorBackend> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/extintor/${id}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    return handleApiResponse<ExtintorBackend>(response);
  } catch (error) {
    console.error('Error al obtener extintor por ID:', error);
    throw new Error('No se pudo cargar el extintor');
  }
}

/**
 * Obtener extintores por área
 */
export async function obtenerExtintoresPorArea(area: string): Promise<{
  success: boolean
  extintores: ExtintorBackend[]
  count: number
  totalExtintoresActivosArea: number
}> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/extintor/area/${encodeURIComponent(area)}`, {
      
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    return handleApiResponse<{
      success: boolean
      extintores: ExtintorBackend[]
      count: number
      totalExtintoresActivosArea: number
    }>(response);
  } catch (error) {
    console.error('Error al obtener extintores por área:', error);
    throw new Error('No se pudieron cargar los extintores del área');
  }
}

/**
 * Obtener extintores por tag
 */
export async function obtenerExtintoresPorTag(tag: string): Promise<{
  success: boolean
  extintores: ExtintorBackend[]
  count: number
  totalExtintoresActivosArea: number
}> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/extintor/tag/${encodeURIComponent(tag)}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    return handleApiResponse<{
      success: boolean
      extintores: ExtintorBackend[]
      count: number
      totalExtintoresActivosArea: number
    }>(response);
  } catch (error) {
    console.error('Error al obtener extintores por tag:', error);
    throw new Error('No se pudieron cargar los extintores del tag');
  }
}

/**
 * Crear nuevo extintor
 */
export async function crearExtintor(extintor: CreateExtintorDto): Promise<ExtintorBackend> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/extintor`, {
      method: 'POST',
      headers,
      body: JSON.stringify(extintor),
      cache: 'no-store',
    });

    return handleApiResponse<ExtintorBackend>(response);
  } catch (error) {
    console.error('Error al crear extintor:', error);
    if (error instanceof Error) {
      throw new Error(`No se pudo crear el extintor: ${error.message}`);
    }
    throw new Error('No se pudo crear el extintor');
  }
}

/**
 * Actualizar extintor
 */
export async function actualizarExtintor(id: string, extintor: UpdateExtintorDto): Promise<ExtintorBackend> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/extintor/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(extintor),
      cache: 'no-store',
    });

    return handleApiResponse<ExtintorBackend>(response);
  } catch (error) {
    console.error('Error al actualizar extintor:', error);
    if (error instanceof Error) {
      throw new Error(`No se pudo actualizar el extintor: ${error.message}`);
    }
    throw new Error('No se pudo actualizar el extintor');
  }
}

/**
 * Eliminar extintor
 */
export async function eliminarExtintor(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/extintor/${id}`, {
      method: 'DELETE',
      headers,
      cache: 'no-store',
    });

    const data = await handleApiResponse<{ message?: string }>(response);
    return { success: true, message: data.message || 'Extintor eliminado correctamente' };
  } catch (error) {
    console.error('Error al eliminar extintor:', error);
    if (error instanceof Error) {
      throw new Error(`No se pudo eliminar el extintor: ${error.message}`);
    }
    throw new Error('No se pudo eliminar el extintor');
  }
}

/**
 * Desactivar extintor
 */
export async function desactivarExtintor(codigo: string): Promise<{ exito: boolean; mensaje: string }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/extintor/desactivar/${encodeURIComponent(codigo)}`, {
      method: 'PUT',
      headers,
      cache: 'no-store',
    });

    return handleApiResponse<{ exito: boolean; mensaje: string }>(response);
  } catch (error) {
    console.error('Error al desactivar extintor:', error);
    if (error instanceof Error) {
      throw new Error(`No se pudo desactivar el extintor: ${error.message}`);
    }
    throw new Error('No se pudo desactivar el extintor');
  }
}

/**
 * Activar extintor
 */
export async function activarExtintor(id: string): Promise<ExtintorBackend> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/extintor/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ activo: true }),
      cache: 'no-store',
    });

    return handleApiResponse<ExtintorBackend>(response);
  } catch (error) {
    console.error('Error al activar extintor:', error);
    if (error instanceof Error) {
      throw new Error(`No se pudo activar el extintor: ${error.message}`);
    }
    throw new Error('No se pudo activar el extintor');
  }
}

/**
 * Marcar extintores como inspeccionados
 */
export async function marcarExtintoresComoInspeccionados(codigosExtintores: string[]): Promise<{ modified: number }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/extintor/marcar-inspeccionados`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ codigosExtintores }),
      cache: 'no-store',
    });

    return handleApiResponse<{ modified: number }>(response);
  } catch (error) {
    console.error('Error al marcar extintores como inspeccionados:', error);
    if (error instanceof Error) {
      throw new Error(`No se pudieron marcar los extintores: ${error.message}`);
    }
    throw new Error('No se pudieron marcar los extintores como inspeccionados');
  }
}

/**
 * Resetear estado de inspección de extintores
 */
export async function resetearEstadoInspeccion(codigosExtintores?: string[]): Promise<{ modified: number }> {
  try {
    const headers = await getAuthHeaders();
    
    const body = codigosExtintores ? { codigosExtintores } : {};
    
    const response = await fetch(`${API_BASE_URL}/extintor/resetear-inspeccion`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    return handleApiResponse<{ modified: number }>(response);
  } catch (error) {
    console.error('Error al resetear estado de inspección:', error);
    if (error instanceof Error) {
      throw new Error(`No se pudo resetear el estado: ${error.message}`);
    }
    throw new Error('No se pudo resetear el estado de inspección');
  }
}

/**
 * Verificar y crear extintores desde inspección
 */
export async function verificarYCrearExtintores(
  extintores: ExtintorBackend[], 
  tag: string, 
  area: string
): Promise<{ creados: number; actualizados: number }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/extintor/verificar-crear`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ extintores, tag, area }),
      cache: 'no-store',
    });

    return handleApiResponse<{ creados: number; actualizados: number }>(response);
  } catch (error) {
    console.error('Error al verificar y crear extintores:', error);
    if (error instanceof Error) {
      throw new Error(`No se pudieron verificar los extintores: ${error.message}`);
    }
    throw new Error('No se pudieron verificar y crear los extintores');
  }
}