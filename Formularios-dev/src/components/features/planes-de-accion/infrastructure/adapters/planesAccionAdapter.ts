"use server";

import { getAuthHeaders, handleApiResponse } from "@/lib/actions/helpers";
import {
  AddTareaDTO,
  CreatePlanDeAccionDTO,
  PlanDeAccion,
  UpdatePlanDeAccionDTO,
  UpdateTareaDTO,
} from "../../domain/models/IProps";
import {
  FormInstance,
  SectionResponse,
  QuestionResponse,
} from "@/types/formTypes";

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

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ==========================================
// PLANES - CRUD
// ==========================================

export async function obtenerPlanes(
  filters?: PlanesFilters,
): Promise<PlanDeAccion[]> {
  try {
    const headers = await getAuthHeaders();

    const params = new URLSearchParams();
    if (filters?.estado) params.append("estado", filters.estado);
    if (filters?.vicepresidencia)
      params.append("vicepresidencia", filters.vicepresidencia);
    if (filters?.superintendencia)
      params.append("superintendencia", filters.superintendencia);
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

export async function crearPlan(
  data: CreatePlanDeAccionDTO,
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

export async function actualizarPlan(
  planId: string,
  data: UpdatePlanDeAccionDTO,
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
      error:
        error instanceof Error ? error.message : "Error al actualizar plan",
    };
  }
}

export async function eliminarPlan(
  planId: string,
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

export async function generarPlanDesdeInstancia(
  instanceId: string,
  opciones: GenerarPlanesOptions = {},
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
      params.append(
        "incluirSoloConComentario",
        String(opciones.incluirSoloConComentario),
      );
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

export async function agregarTarea(
  planId: string,
  tarea: AddTareaDTO,
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

export async function actualizarTarea(
  planId: string,
  tareaId: string,
  data: UpdateTareaDTO,
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
      },
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
      error:
        error instanceof Error ? error.message : "Error al actualizar tarea",
    };
  }
}

export async function eliminarTarea(
  planId: string,
  tareaId: string,
): Promise<ActionResult<PlanDeAccion>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_URL}/planes-accion/${planId}/tareas/${tareaId}`,
      {
        method: "DELETE",
        headers,
      },
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

export async function aprobarTarea(
  planId: string,
  tareaId: string,
): Promise<ActionResult<PlanDeAccion>> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_URL}/planes-accion/${planId}/tareas/${tareaId}/aprobar`,
      {
        method: "PATCH",
        headers,
      },
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

export type PopulatedFormInstance = Omit<
  FormInstance,
  "templateId" | "createdAt" | "updatedAt"
> & {
  templateId?: { name?: string };
  createdAt: string;
  updatedAt: string;
};

export async function obtenerInspecciones(): Promise<PopulatedFormInstance[]> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/instances?limit=100`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const result = await handleApiResponse<unknown>(response);

    const resultObj = result as Record<string, unknown>;

    const instancias: PopulatedFormInstance[] =
      resultObj &&
      typeof resultObj === "object" &&
      "data" in resultObj &&
      Array.isArray(resultObj.data)
        ? (resultObj.data as PopulatedFormInstance[])
        : Array.isArray(result)
          ? (result as PopulatedFormInstance[])
          : [];

    // ✅ Solo inspecciones con al menos una pregunta con puntaje 0, 1 o 2
    const inspeccionesConObservaciones = instancias.filter((instancia) => {
      if (!instancia.sections || !Array.isArray(instancia.sections))
        return false;

      return instancia.sections.some((section: SectionResponse) => {
        if (!section.questions || !Array.isArray(section.questions))
          return false;

        return section.questions.some((question: QuestionResponse) => {
          const response = question.response;

          if (
            response === "N/A" ||
            response === "" ||
            response === null ||
            response === undefined
          )
            return false;

          const puntaje = Number(response);
          return (
            !isNaN(puntaje) && (puntaje === 0 || puntaje === 1 || puntaje === 2)
          );
        });
      });
    });

    console.log(
      `✅ Inspecciones con observaciones críticas: ${inspeccionesConObservaciones.length} de ${instancias.length}`,
    );

    return inspeccionesConObservaciones;
  } catch (error) {
    console.error("Error obteniendo inspecciones:", error);
    return [];
  }
}
