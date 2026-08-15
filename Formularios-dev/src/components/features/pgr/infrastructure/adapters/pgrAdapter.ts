"use server";

import { getAuthHeaders, handleApiResponse } from "@/lib/actions/helpers";
import { API_BASE_URL } from "@/lib/constants";
import {
  AprobarPgrDto,
  CreatePgrDto,
  Pgr,
  SeguimientoBatchDto,
  SeguimientoPgrDto,
  ResultadoConsolidacion,
  UpdatePgrDto,
  VistaPreviaConsolidacion,
} from "../../domain/models/IProps";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const PGR_URL = `${API_BASE_URL}/pgr`;

// ==========================================
// CRUD
// ==========================================

export async function crearPgr(
  data: CreatePgrDto,
): Promise<ActionResult<Pgr>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(PGR_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    const pgr = await handleApiResponse<Pgr>(response);

    return {
      success: true,
      data: pgr,
      message: "Plan PGR creado exitosamente",
    };
  } catch (error) {
    console.error("Error creando PGR:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear el plan",
    };
  }
}

export async function obtenerPgrs(): Promise<Pgr[]> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(PGR_URL, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return await handleApiResponse<Pgr[]>(response);
  } catch (error) {
    console.error("Error obteniendo PGRs:", error);
    throw error;
  }
}

export async function obtenerPgrPorId(id: string): Promise<Pgr> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${PGR_URL}/${id}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return await handleApiResponse<Pgr>(response);
  } catch (error) {
    console.error("Error obteniendo PGR:", error);
    throw error;
  }
}

export async function actualizarPgr(
  id: string,
  data: UpdatePgrDto,
): Promise<ActionResult<Pgr>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${PGR_URL}/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    const pgr = await handleApiResponse<Pgr>(response);

    return {
      success: true,
      data: pgr,
      message: "Plan PGR actualizado exitosamente",
    };
  } catch (error) {
    console.error("Error actualizando PGR:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al actualizar el plan",
    };
  }
}

export async function eliminarPgr(id: string): Promise<ActionResult<void>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${PGR_URL}/${id}`, {
      method: "DELETE",
      headers,
    });

    await handleApiResponse<void>(response);

    return {
      success: true,
      message: "Plan PGR eliminado exitosamente",
    };
  } catch (error) {
    console.error("Error eliminando PGR:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar el plan",
    };
  }
}

// ==========================================
// APROBACIÓN
// ==========================================

export async function aprobarPgr(
  id: string,
  data: AprobarPgrDto,
): Promise<ActionResult<Pgr>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${PGR_URL}/${id}/aprobar`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });

    const pgr = await handleApiResponse<Pgr>(response);

    return {
      success: true,
      data: pgr,
      message: "Respuesta de aprobación enviada exitosamente",
    };
  } catch (error) {
    console.error("Error aprobando PGR:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al aprobar el plan",
    };
  }
}

// ==========================================
// SEGUIMIENTO
// ==========================================

export async function addSeguimiento(
  id: string,
  tareaId: string,
  data: SeguimientoPgrDto,
): Promise<ActionResult<Pgr>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${PGR_URL}/${id}/seguimiento/tarea/${tareaId}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
      },
    );

    const pgr = await handleApiResponse<Pgr>(response);

    return {
      success: true,
      data: pgr,
      message: "Seguimiento guardado exitosamente",
    };
  } catch (error) {
    console.error("Error guardando seguimiento:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al guardar seguimiento",
    };
  }
}

export async function addSeguimientoBatch(
  id: string,
  data: SeguimientoBatchDto,
): Promise<ActionResult<Pgr>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${PGR_URL}/${id}/seguimiento/batch`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });

    const pgr = await handleApiResponse<Pgr>(response);

    return {
      success: true,
      data: pgr,
      message: "Seguimiento guardado correctamente",
    };
  } catch (error) {
    console.error("Error guardando seguimiento por lote:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al guardar seguimiento",
    };
  }
}

// ==========================================
// Consolidación desde matrices de riesgo
// ==========================================

/**
 * Qué actividades saldrían de las matrices aprobadas de la superintendencia
 * de este PGR. No escribe nada: alimenta la pantalla de confirmación.
 */
export async function previsualizarConsolidacion(
  pgrId: string,
  desdoblarPorArea = false,
): Promise<ActionResult<VistaPreviaConsolidacion>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${PGR_URL}/${pgrId}/consolidacion/previsualizar?desdoblarPorArea=${desdoblarPorArea}`,
      { method: "GET", headers, cache: "no-store" },
    );

    const vista = await handleApiResponse<VistaPreviaConsolidacion>(response);

    return { success: true, data: vista };
  } catch (error) {
    console.error("Error previsualizando la consolidación:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al previsualizar la consolidación",
    };
  }
}

/** Vuelca las actividades propuestas en el PGR. Es incremental. */
export async function consolidarDesdeMatrices(
  pgrId: string,
  desdoblarPorArea = false,
): Promise<ActionResult<ResultadoConsolidacion>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${PGR_URL}/${pgrId}/consolidacion`, {
      method: "POST",
      headers,
      body: JSON.stringify({ desdoblarPorArea }),
    });

    const resultado = await handleApiResponse<ResultadoConsolidacion>(response);

    return {
      success: true,
      data: resultado,
      message: `${resultado.actividadesNuevas} actividad(es) nueva(s), ${resultado.actividadesActualizadas} actualizada(s)`,
    };
  } catch (error) {
    console.error("Error consolidando desde las matrices:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al consolidar",
    };
  }
}
