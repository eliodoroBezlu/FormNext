"use server";

import { getAuthHeaders, handleApiResponse } from "@/lib/actions/helpers";
import { API_BASE_URL } from "@/lib/constants";
import {
  AccionesMatriz,
  ActividadDto,
  AreaDisponible,
  CrearMatrizDto,
  FiltrosMatriz,
  MatrizRiesgo,
  MatrizRiesgoResumen,
  OpcionesDeCategoria,
  PreviaRiesgo,
  PrevisualizarRiesgoDto,
  ResultadoAnalisis,
  ResumenImportacionGuardada,
  RiesgoDto,
} from "../../domain/models/IProps";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const MATRIZ_URL = `${API_BASE_URL}/matriz-riesgos`;

/**
 * Cabeceras para subir un archivo.
 *
 * `getAuthHeaders()` fija `Content-Type: application/json`, que rompe el
 * multipart: hay que quitarlo para que `fetch` genere el boundary.
 */
async function headersMultipart(): Promise<Record<string, string>> {
  const headers = await getAuthHeaders();
  delete headers["Content-Type"];
  return headers;
}

const mensajeDeError = (error: unknown, porDefecto: string): string =>
  error instanceof Error ? error.message : porDefecto;

// ────────────────────────────────────────────────────────────────────────────
// Importación
// ────────────────────────────────────────────────────────────────────────────

/**
 * Paso 1: analiza el Excel **sin guardar nada**.
 *
 * Devuelve los riesgos recalculados por el motor y las discrepancias contra
 * los valores del archivo, que es lo que la pantalla muestra antes de pedir
 * confirmación.
 */
export async function analizarMatriz(
  formData: FormData,
): Promise<ActionResult<ResultadoAnalisis>> {
  try {
    const response = await fetch(`${MATRIZ_URL}/import/analizar`, {
      method: "POST",
      headers: await headersMultipart(),
      body: formData,
    });

    return {
      success: true,
      data: await handleApiResponse<ResultadoAnalisis>(response),
    };
  } catch (error) {
    console.error("Error analizando la matriz:", error);
    return {
      success: false,
      error: mensajeDeError(error, "No se pudo analizar el archivo"),
    };
  }
}

/**
 * Paso 2: confirma y guarda.
 *
 * El `FormData` lleva de nuevo el archivo a propósito: el servidor lo relee y
 * recalcula. Si aceptara los riesgos ya parseados, se podrían inyectar niveles
 * de riesgo arbitrarios.
 */
export async function importarMatriz(
  formData: FormData,
): Promise<ActionResult<ResumenImportacionGuardada>> {
  try {
    const response = await fetch(`${MATRIZ_URL}/import`, {
      method: "POST",
      headers: await headersMultipart(),
      body: formData,
    });

    const data = await handleApiResponse<ResumenImportacionGuardada>(response);
    return {
      success: true,
      data,
      message: `Matriz ${data.codigo} importada: ${data.riesgosImportados} riesgos`,
    };
  } catch (error) {
    console.error("Error importando la matriz:", error);
    return {
      success: false,
      error: mensajeDeError(error, "No se pudo importar la matriz"),
    };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Consulta
// ────────────────────────────────────────────────────────────────────────────

export async function listarMatrices(
  filtros: FiltrosMatriz = {},
): Promise<MatrizRiesgoResumen[]> {
  try {
    const params = new URLSearchParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== "") params.set(clave, String(valor));
    }
    const query = params.toString();

    const response = await fetch(`${MATRIZ_URL}${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: await getAuthHeaders(),
      cache: "no-store",
    });

    return await handleApiResponse<MatrizRiesgoResumen[]>(response);
  } catch (error) {
    console.error("Error listando matrices:", error);
    return [];
  }
}

/**
 * Qué se puede hacer con la matriz ahora mismo.
 *
 * Lo decide el servidor y no la UI: si el front reimplementara las reglas
 * (estado + rol + contenido válido) se desincronizaría de las del backend, y
 * el usuario vería botones que después fallan.
 */
export async function obtenerAcciones(
  id: string,
): Promise<AccionesMatriz | null> {
  try {
    const response = await fetch(`${MATRIZ_URL}/${id}/acciones`, {
      method: "GET",
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    return await handleApiResponse<AccionesMatriz>(response);
  } catch (error) {
    console.error("Error obteniendo acciones:", error);
    return null;
  }
}

async function cambiarEstado(
  id: string,
  accion: "enviar-a-revision" | "aprobar" | "devolver",
  cuerpo: Record<string, string | undefined>,
): Promise<ActionResult<MatrizRiesgo>> {
  try {
    const response = await fetch(`${MATRIZ_URL}/${id}/${accion}`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify(cuerpo),
    });
    return {
      success: true,
      data: await handleApiResponse<MatrizRiesgo>(response),
    };
  } catch (error) {
    console.error(`Error en la acción '${accion}':`, error);
    return {
      success: false,
      error: mensajeDeError(error, "No se pudo cambiar el estado"),
    };
  }
}

// Se escriben como `async function` y no como flechas: en un módulo
// `"use server"` todo export es una Server Action, y Next exige que sean
// funciones asíncronas declaradas. Una flecha que devuelve la promesa compila
// con tsc pero rompe el build de producción.
export async function enviarARevision(
  id: string,
  observaciones?: string,
): Promise<ActionResult<MatrizRiesgo>> {
  return cambiarEstado(id, "enviar-a-revision", { observaciones });
}

export async function aprobarMatriz(
  id: string,
  observaciones?: string,
): Promise<ActionResult<MatrizRiesgo>> {
  return cambiarEstado(id, "aprobar", { observaciones });
}

export async function devolverMatriz(
  id: string,
  motivo?: string,
): Promise<ActionResult<MatrizRiesgo>> {
  return cambiarEstado(id, "devolver", { motivo });
}

export async function obtenerMatriz(
  id: string,
): Promise<ActionResult<MatrizRiesgo>> {
  try {
    const response = await fetch(`${MATRIZ_URL}/${id}`, {
      method: "GET",
      headers: await getAuthHeaders(),
      cache: "no-store",
    });

    return {
      success: true,
      data: await handleApiResponse<MatrizRiesgo>(response),
    };
  } catch (error) {
    console.error("Error obteniendo la matriz:", error);
    return {
      success: false,
      error: mensajeDeError(error, "No se pudo cargar la matriz"),
    };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Alta y edición sin Excel
// ────────────────────────────────────────────────────────────────────────────

export async function obtenerAreasDisponibles(): Promise<AreaDisponible[]> {
  try {
    const response = await fetch(`${MATRIZ_URL}/areas-disponibles`, {
      method: "GET",
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    return await handleApiResponse<AreaDisponible[]>(response);
  } catch (error) {
    console.error("Error obteniendo áreas disponibles:", error);
    return [];
  }
}

/**
 * Evalúa un riesgo sin guardarlo, para mostrar el nivel mientras se escribe.
 * Corre el mismo motor que la escritura: por eso es una llamada y no un
 * cálculo local.
 */
export async function previsualizarRiesgo(
  dto: PrevisualizarRiesgoDto,
): Promise<PreviaRiesgo | null> {
  try {
    const response = await fetch(`${MATRIZ_URL}/previsualizar-riesgo`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    return await handleApiResponse<PreviaRiesgo>(response);
  } catch (error) {
    console.error("Error previsualizando el riesgo:", error);
    return null;
  }
}

export async function obtenerOpcionesDeCategoria(
  categoria: string,
): Promise<OpcionesDeCategoria | null> {
  try {
    const response = await fetch(
      `${MATRIZ_URL}/catalogos/${encodeURIComponent(categoria)}`,
      { method: "GET", headers: await getAuthHeaders() },
    );
    return await handleApiResponse<OpcionesDeCategoria>(response);
  } catch (error) {
    console.error(`Error obteniendo el catálogo de "${categoria}":`, error);
    return null;
  }
}

export async function crearMatriz(
  dto: CrearMatrizDto,
): Promise<ActionResult<MatrizRiesgo>> {
  try {
    const response = await fetch(MATRIZ_URL, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    return {
      success: true,
      data: await handleApiResponse<MatrizRiesgo>(response),
      message: "Matriz creada en BORRADOR",
    };
  } catch (error) {
    console.error("Error creando la matriz:", error);
    return {
      success: false,
      error: mensajeDeError(error, "No se pudo crear la matriz"),
    };
  }
}

export async function agregarActividad(
  id: string,
  dto: ActividadDto,
): Promise<ActionResult<MatrizRiesgo>> {
  try {
    const response = await fetch(`${MATRIZ_URL}/${id}/actividades`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    return {
      success: true,
      data: await handleApiResponse<MatrizRiesgo>(response),
      message: "Actividad agregada",
    };
  } catch (error) {
    console.error("Error agregando la actividad:", error);
    return {
      success: false,
      error: mensajeDeError(error, "No se pudo agregar la actividad"),
    };
  }
}

/** Renombra o corrige el encabezado sin tocar los riesgos. */
export async function actualizarActividad(
  id: string,
  nroAct: number,
  dto: ActividadDto,
): Promise<ActionResult<MatrizRiesgo>> {
  try {
    const response = await fetch(`${MATRIZ_URL}/${id}/actividades/${nroAct}`, {
      method: "PUT",
      headers: await getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    return {
      success: true,
      data: await handleApiResponse<MatrizRiesgo>(response),
      message: "Actividad actualizada",
    };
  } catch (error) {
    console.error("Error actualizando la actividad:", error);
    return {
      success: false,
      error: mensajeDeError(error, "No se pudo actualizar la actividad"),
    };
  }
}

/** Borra la actividad **con todos sus riesgos**. */
export async function eliminarActividad(
  id: string,
  nroAct: number,
): Promise<ActionResult<MatrizRiesgo>> {
  try {
    const response = await fetch(`${MATRIZ_URL}/${id}/actividades/${nroAct}`, {
      method: "DELETE",
      headers: await getAuthHeaders(),
    });
    return {
      success: true,
      data: await handleApiResponse<MatrizRiesgo>(response),
      message: "Actividad eliminada",
    };
  } catch (error) {
    console.error("Error eliminando la actividad:", error);
    return {
      success: false,
      error: mensajeDeError(error, "No se pudo eliminar la actividad"),
    };
  }
}

export async function agregarRiesgo(
  id: string,
  nroAct: number,
  dto: RiesgoDto,
): Promise<ActionResult<MatrizRiesgo>> {
  try {
    const response = await fetch(
      `${MATRIZ_URL}/${id}/actividades/${nroAct}/riesgos`,
      {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify(dto),
      },
    );
    return {
      success: true,
      data: await handleApiResponse<MatrizRiesgo>(response),
      message: "Riesgo agregado",
    };
  } catch (error) {
    console.error("Error agregando el riesgo:", error);
    return {
      success: false,
      error: mensajeDeError(error, "No se pudo agregar el riesgo"),
    };
  }
}

export async function actualizarRiesgo(
  id: string,
  nroAct: number,
  numero: number,
  dto: RiesgoDto,
): Promise<ActionResult<MatrizRiesgo>> {
  try {
    const response = await fetch(
      `${MATRIZ_URL}/${id}/actividades/${nroAct}/riesgos/${numero}`,
      {
        method: "PUT",
        headers: await getAuthHeaders(),
        body: JSON.stringify(dto),
      },
    );
    return {
      success: true,
      data: await handleApiResponse<MatrizRiesgo>(response),
      message: `Riesgo N°${numero} actualizado`,
    };
  } catch (error) {
    console.error("Error actualizando el riesgo:", error);
    return {
      success: false,
      error: mensajeDeError(error, "No se pudo actualizar el riesgo"),
    };
  }
}

export async function eliminarRiesgo(
  id: string,
  nroAct: number,
  numero: number,
): Promise<ActionResult<MatrizRiesgo>> {
  try {
    const response = await fetch(
      `${MATRIZ_URL}/${id}/actividades/${nroAct}/riesgos/${numero}`,
      { method: "DELETE", headers: await getAuthHeaders() },
    );
    return {
      success: true,
      data: await handleApiResponse<MatrizRiesgo>(response),
      message: `Riesgo N°${numero} eliminado`,
    };
  } catch (error) {
    console.error("Error eliminando el riesgo:", error);
    return {
      success: false,
      error: mensajeDeError(error, "No se pudo eliminar el riesgo"),
    };
  }
}
