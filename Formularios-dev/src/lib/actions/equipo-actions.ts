'use server'

import { API_BASE_URL } from "../constants";
import { getAuthHeaders, handleApiResponse } from "./helpers";
import { AreaBackend } from "./area-actions";
import { UbicacionBackend } from "./ubicacion-actions";
import { ClasificacionBackend } from "./clasificacion-actions";

export interface EquipoBackend {
  _id: string;
  codigo: string;
  codigo_antiguo?: string;
  codigo_parte?: string;
  descripcion: string;
  marca?: string;
  modelo?: string;
  cantidad: number;
  costo?: number;
  num_serie?: string;
  frecuencia_uso?: string;
  estado?: string;
  observaciones?: string;
  tipo_equipo: string;
  /**
   * Identificador físico (RFID EPC). Es lo que distingue dos equipos que
   * comparten el mismo `codigo` — pasa en los SPCC.
   */
  rfid?: string;
  /**
   * Placa del vehículo. **Distinta de `codigo`**, que es el número interno de
   * flota: la inspección los pide en dos campos separados.
   */
  placa?: string;
  /**
   * Nivel al que pertenece el equipo. Decide cuál de las tres referencias de
   * abajo está poblada, y quién lo ve en el selector de inspección.
   */
  ambito?: "area" | "superintendencia" | "gerencia";
  /** Poblada solo con `ambito: "area"`. */
  area_id?: AreaBackend;
  /** Poblada solo con `ambito: "superintendencia"`. */
  superintendencia_id?: { _id: string; nombre: string };
  /** Poblada solo con `ambito: "gerencia"`. */
  gerencia_id?: { _id: string; nombre: string };
  /** Sector o TAG del equipo de planta donde está montado. */
  subarea?: string;
  responsable?: string;
  ubicacion_id: UbicacionBackend;
  clasificacion_id: ClasificacionBackend;
  especificaciones: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipoForm {
  codigo: string;
  codigo_antiguo?: string;
  codigo_parte?: string;
  descripcion: string;
  marca?: string;
  modelo?: string;
  cantidad?: number;
  costo?: number;
  num_serie?: string;
  frecuencia_uso?: string;
  estado?: string;
  observaciones?: string;
  tipo_equipo: string;
  rfid?: string;
  placa?: string;
  /** Nivel al que pertenece; decide cuál de las tres referencias se envía. */
  ambito?: "area" | "superintendencia" | "gerencia";
  area_id?: string;
  superintendencia_id?: string;
  gerencia_id?: string;
  subarea?: string;
  responsable?: string;
  ubicacion_id: string;
  clasificacion_id: string;
  especificaciones?: Record<string, unknown>;
}

export interface MigracionResultado {
  exito: boolean;
  creados: number;
  actualizados: number;
  omitidos: number;
  detalles: string[];
}

// Obtener todos los equipos
export async function obtenerEquipos(): Promise<EquipoBackend[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/equipos`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    return handleApiResponse<EquipoBackend[]>(response);
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    throw new Error(`No se pudieron obtener los equipos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Obtener equipo por ID
export async function obtenerEquipoPorId(id: string): Promise<EquipoBackend> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/equipos/${id}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    return handleApiResponse<EquipoBackend>(response);
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    throw new Error(`No se pudo obtener el equipo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Crear nuevo equipo
export async function crearEquipo(data: EquipoForm): Promise<EquipoBackend> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/equipos`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleApiResponse<EquipoBackend>(response);
  } catch (error) {
    console.error('Error al crear equipo:', error);
    throw new Error(`No se pudo crear el equipo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Actualizar equipo
export async function actualizarEquipo(id: string, data: EquipoForm): Promise<EquipoBackend> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/equipos/${id}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleApiResponse<EquipoBackend>(response);
  } catch (error) {
    console.error('Error al actualizar equipo:', error);
    throw new Error(`No se pudo actualizar el equipo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Eliminar equipo
export async function eliminarEquipo(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/equipos/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al eliminar');
    }
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    throw new Error(`No se pudo eliminar el equipo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Migrar Excel (soporta subir archivo por HTTP o procesar el local del servidor si no se pasa archivo)
export async function migrarExcel(formData?: FormData): Promise<MigracionResultado> {
  try {
    const headers = await getAuthHeaders();
    
    // Si hay un archivo subido por HTTP
    if (formData) {
      const headersForUpload = { ...headers };
      delete headersForUpload['Content-Type'];
      const response = await fetch(`${API_BASE_URL}/equipos/migrar-excel`, {
        method: 'POST',
        headers: headersForUpload, // No establecer 'Content-Type' al usar FormData, fetch lo pondrá automáticamente con el boundary correcto
        body: formData,
      });
      return handleApiResponse<MigracionResultado>(response);
    } 
    
    // De lo contrario, se solicita procesar el local
    const response = await fetch(`${API_BASE_URL}/equipos/migrar-excel`, {
      method: 'POST',
      headers,
    });
    return handleApiResponse<MigracionResultado>(response);
  } catch (error) {
    console.error('Error en migración de Excel:', error);
    throw new Error(`Error en la migración de Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}
