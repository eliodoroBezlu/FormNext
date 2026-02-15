// // hooks/use-planes-accion.ts

// import { useState, useCallback } from 'react';
// import { PlanDeAccion, CreatePlanDeAccionDTO, UpdatePlanDeAccionDTO, TaskSummary } from '../types/IProps';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// export function usePlanesAccion() {
//   const [planes, setPlanes] = useState<PlanDeAccion[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const calculateTaskSummary = useCallback((): TaskSummary => {
//     const abiertas = planes.filter(p => p.estado === 'abierto').length;
//     const cerradas = planes.filter(p => p.estado === 'cerrado').length;
//     const total = planes.length;

//     return {
//       tareasAbiertas: abiertas,
//       tareasCerradas: cerradas,
//       totalTareas: total,
//       porcentajeCierre: total > 0 ? Math.round((cerradas / total) * 100) : 0,
//     };
//   }, [planes]);

//   /**
//    * 🔥 Generar planes automáticamente desde una inspección
//    */
//   const generarPlanesDesdeInstancia = useCallback(async (
//     instanceId: string,
//     opciones?: {
//       incluirPuntaje3?: boolean;
//       incluirSoloConComentario?: boolean;
//     }
//   ) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const params = new URLSearchParams();
//       if (opciones?.incluirPuntaje3) params.append('incluirPuntaje3', 'true');
//       if (opciones?.incluirSoloConComentario) params.append('incluirSoloConComentario', 'true');

//       const response = await fetch(
//         `${API_URL}/planes-accion/generar-desde-instancia/${instanceId}?${params}`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Error al generar planes de acción');
//       }

//       const planesGenerados = await response.json();
      
//       // Agregar los nuevos planes al estado
//       setPlanes(prev => [...planesGenerados, ...prev]);
      
//       return planesGenerados;
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Error al generar planes';
//       setError(message);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   /**
//    * Cargar lista de inspecciones disponibles
//    */
//   const cargarInspecciones = useCallback(async () => {
//     try {
//       const response = await fetch(`${API_URL}/instances?limit=100`);
      
//       if (!response.ok) {
//         throw new Error('Error al cargar inspecciones');
//       }

//       const result = await response.json();
//       return result.data || [];
//     } catch (err) {
//       console.error('Error cargando inspecciones:', err);
//       return [];
//     }
//   }, []);

//   /**
//    * Cargar planes de acción (con filtros opcionales)
//    */
//   const loadPlanes = useCallback(async (filters?: {
//     instanceId?: string;
//     estado?: string;
//     empresa?: string;
//   }) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const params = new URLSearchParams();
//       if (filters?.instanceId) params.append('instanceId', filters.instanceId);
//       if (filters?.estado) params.append('estado', filters.estado);
//       if (filters?.empresa) params.append('empresa', filters.empresa);

//       const response = await fetch(`${API_URL}/planes-accion?${params}`);

//       if (!response.ok) {
//         throw new Error('Error al cargar planes de acción');
//       }

//       const data = await response.json();
//       setPlanes(data);
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Error al cargar planes';
//       setError(message);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const createPlan = useCallback(async (data: CreatePlanDeAccionDTO) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(`${API_URL}/planes-accion`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//       });

//       if (!response.ok) {
//         throw new Error('Error al crear plan');
//       }

//       const newPlan = await response.json();
//       setPlanes(prev => [newPlan, ...prev]);
//       return newPlan;
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Error al crear plan';
//       setError(message);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const updatePlan = useCallback(async (_id: string, data: UpdatePlanDeAccionDTO) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(`${API_URL}/planes-accion/${_id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//       });

//       if (!response.ok) {
//         throw new Error('Error al actualizar plan');
//       }

//       const updatedPlan = await response.json();
//       setPlanes(prev => prev.map(plan => plan._id === _id ? updatedPlan : plan));
//       return updatedPlan;
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Error al actualizar plan';
//       setError(message);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const deletePlan = useCallback(async (_id: string) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(`${API_URL}/planes-accion/${_id}`, {
//         method: 'DELETE',
//       });

//       if (!response.ok) {
//         throw new Error('Error al eliminar plan');
//       }

//       setPlanes(prev => prev.filter(plan => plan._id !== _id));
//     } catch (err) {
//       const message = err instanceof Error ? err.message : 'Error al eliminar plan';
//       setError(message);
//       throw err;
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   return {
//     planes,
//     isLoading,
//     error,
//     createPlan,
//     updatePlan,
//     deletePlan,
//     calculateTaskSummary,
//     generarPlanesDesdeInstancia,
//     cargarInspecciones,
//     loadPlanes,
//   };
// }

// hooks/use-planes-accion.ts

// hooks/use-planes-accion.ts
"use server";

import { getAuthHeaders, handleApiResponse } from "@/lib/actions/helpers";
import { AddTareaDTO, CreatePlanDeAccionDTO, PlanDeAccion, UpdatePlanDeAccionDTO, UpdateTareaDTO } from "../types/IProps";


const API_URL = process.env.API_URL || "http://localhost:3002";

// ==========================================
// TIPOS
// ==========================================

export interface GenerarPlanesOptions {
  incluirPuntaje3?: boolean;
  incluirSoloConComentario?: boolean;
}

export interface PlanSummary {
  totalPlanes: number;
  planesAbiertos: number;
  planesEnProgreso: number;
  planesCerrados: number;
  porcentajeCierre: number;
}

export interface PlanesFilters {
  estado?: string;
  vicepresidencia?: string;
  superintendencia?: string;
  areaFisica?: string;
}

export interface ActionResult<
// eslint-disable-next-line @typescript-eslint/no-explicit-any
T = any
> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ==========================================
// PLANES - CRUD
// ==========================================

/**
 * Obtener lista de planes con filtros opcionales
 */
export async function obtenerPlanes(
  filters?: PlanesFilters
): Promise<PlanDeAccion[]> {
  try {
    const headers = await getAuthHeaders();
    
    const params = new URLSearchParams();
    if (filters?.estado) params.append("estado", filters.estado);
    if (filters?.vicepresidencia) params.append("vicepresidencia", filters.vicepresidencia);
    if (filters?.superintendencia) params.append("superintendencia", filters.superintendencia);
    if (filters?.areaFisica) params.append("areaFisica", filters.areaFisica);

    const url = `${API_URL}/planes-accion${params.toString() ? `?${params}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return await handleApiResponse<PlanDeAccion[]>(response);
  } catch (error) {
    console.error("Error obteniendo planes:", error);
    throw error;
  }
}

/**
 * Obtener un plan específico por ID
 */
export async function obtenerPlanPorId(planId: string): Promise<PlanDeAccion> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/planes-accion/${planId}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return await handleApiResponse<PlanDeAccion>(response);
  } catch (error) {
    console.error("Error obteniendo plan:", error);
    throw error;
  }
}

/**
 * Crear un nuevo plan vacío
 */
export async function crearPlan(
  data: CreatePlanDeAccionDTO
): Promise<ActionResult<PlanDeAccion>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/planes-accion`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    const plan = await handleApiResponse<PlanDeAccion>(response);

    return {
      success: true,
      data: plan,
      message: "Plan creado exitosamente",
    };
  } catch (error) {
    console.error("Error creando plan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear plan",
    };
  }
}

/**
 * Actualizar datos organizacionales del plan
 */
export async function actualizarPlan(
  planId: string,
  data: UpdatePlanDeAccionDTO
): Promise<ActionResult<PlanDeAccion>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/planes-accion/${planId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });

    const plan = await handleApiResponse<PlanDeAccion>(response);

    return {
      success: true,
      data: plan,
      message: "Plan actualizado exitosamente",
    };
  } catch (error) {
    console.error("Error actualizando plan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar plan",
    };
  }
}

/**
 * Eliminar un plan completo
 */
export async function eliminarPlan(
  planId: string
): Promise<ActionResult<void>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/planes-accion/${planId}`, {
      method: "DELETE",
      headers,
    });

    await handleApiResponse<void>(response);

    return {
      success: true,
      message: "Plan eliminado exitosamente",
    };
  } catch (error) {
    console.error("Error eliminando plan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar plan",
    };
  }
}

// ==========================================
// GENERACIÓN AUTOMÁTICA
// ==========================================

/**
 * Generar plan desde una inspección
 */
export async function generarPlanDesdeInstancia(
  instanceId: string,
  opciones: GenerarPlanesOptions = {}
): Promise<ActionResult<PlanDeAccion>> {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎯 [GENERAR PLAN] Iniciando...");
  console.log("  📋 Instance ID:", instanceId);
  console.log("  ⚙️ Opciones:", opciones);

  try {
    const headers = await getAuthHeaders();

    const params = new URLSearchParams();
    if (opciones.incluirPuntaje3 !== undefined) {
      params.append("incluirPuntaje3", String(opciones.incluirPuntaje3));
    }
    if (opciones.incluirSoloConComentario !== undefined) {
      params.append("incluirSoloConComentario", String(opciones.incluirSoloConComentario));
    }

    const url = `${API_URL}/planes-accion/generar-desde-instancia/${instanceId}${
      params.toString() ? `?${params}` : ""
    }`;

    console.log("  🌐 URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers,
    });

    const plan = await handleApiResponse<PlanDeAccion>(response);

    console.log("✅ [GENERAR PLAN] Plan creado:", plan._id);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      success: true,
      data: plan,
      message: "Plan generado exitosamente",
    };
  } catch (error) {
    console.error("❌ [GENERAR PLAN] Error:", error);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al generar plan",
    };
  }
}

// ==========================================
// TAREAS - CRUD
// ==========================================

/**
 * Agregar tarea a un plan existente
 */
export async function agregarTarea(
  planId: string,
  tarea: AddTareaDTO
): Promise<ActionResult<PlanDeAccion>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/planes-accion/${planId}/tareas`, {
      method: "POST",
      headers,
      body: JSON.stringify(tarea),
    });

    const plan = await handleApiResponse<PlanDeAccion>(response);

    return {
      success: true,
      data: plan,
      message: "Tarea agregada exitosamente",
    };
  } catch (error) {
    console.error("Error agregando tarea:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al agregar tarea",
    };
  }
}

/**
 * Actualizar una tarea específica
 */
export async function actualizarTarea(
  planId: string,
  tareaId: string,
  data: UpdateTareaDTO
): Promise<ActionResult<PlanDeAccion>> {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎯 [ACTUALIZAR TAREA] Iniciando...");
  console.log("  📋 Plan ID:", planId);
  console.log("  📋 Tarea ID:", tareaId);
  console.log("  📦 Data:", data);
  
  if (data.evidencias) {
    console.log("  📎 Evidencias:", data.evidencias.length);
    data.evidencias.forEach((ev, i) => {
      console.log(`    [${i}]:`, { nombre: ev.nombre, url: ev.url });
    });
  }

  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_URL}/planes-accion/${planId}/tareas/${tareaId}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
      }
    );

    const plan = await handleApiResponse<PlanDeAccion>(response);

    console.log("✅ [ACTUALIZAR TAREA] Tarea actualizada exitosamente");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      success: true,
      data: plan,
      message: "Tarea actualizada exitosamente",
    };
  } catch (error) {
    console.error("❌ [ACTUALIZAR TAREA] Error:", error);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar tarea",
    };
  }
}

/**
 * Eliminar una tarea
 */
export async function eliminarTarea(
  planId: string,
  tareaId: string
): Promise<ActionResult<PlanDeAccion>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_URL}/planes-accion/${planId}/tareas/${tareaId}`,
      {
        method: "DELETE",
        headers,
      }
    );

    const plan = await handleApiResponse<PlanDeAccion>(response);

    return {
      success: true,
      data: plan,
      message: "Tarea eliminada exitosamente",
    };
  } catch (error) {
    console.error("Error eliminando tarea:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar tarea",
    };
  }
}

/**
 * Aprobar una tarea
 */
export async function aprobarTarea(
  planId: string,
  tareaId: string
): Promise<ActionResult<PlanDeAccion>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_URL}/planes-accion/${planId}/tareas/${tareaId}/aprobar`,
      {
        method: "PATCH",
        headers,
      }
    );

    const plan = await handleApiResponse<PlanDeAccion>(response);

    return {
      success: true,
      data: plan,
      message: "Tarea aprobada exitosamente",
    };
  } catch (error) {
    console.error("Error aprobando tarea:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al aprobar tarea",
    };
  }
}

// ==========================================
// ESTADÍSTICAS
// ==========================================

/**
 * Obtener estadísticas de planes
 */
export async function obtenerEstadisticas(): Promise<PlanSummary> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/planes-accion/stats`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return await handleApiResponse<PlanSummary>(response);
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    throw error;
  }
}

// ==========================================
// INSPECCIONES (para dropdown)
// ==========================================

/**
 * Obtener lista de inspecciones disponibles
 */
export async function obtenerInspecciones(): Promise<
// eslint-disable-next-line @typescript-eslint/no-explicit-any
any[]

> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/instances?limit=100`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const result = await handleApiResponse<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
    
    >(response);

    // Tu API retorna { data: Array, total, page, limit }
    if (result?.data && Array.isArray(result.data)) {
      return result.data;
    } else if (Array.isArray(result)) {
      return result;
    }

    console.warn("⚠️ Estructura inesperada de inspecciones:", result);
    return [];
  } catch (error) {
    console.error("Error obteniendo inspecciones:", error);
    return [];
  }
}