"use server";

import { FormDataHerraEquipos, InspectionStatus } from "@/components/herra_equipos/types/IProps";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const INSPECTIONS_ENDPOINT = `${API_BASE_URL}/inspections-herra-equipos`;

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  count?: number;
}

// ✅ ACTUALIZAR InspectionPayload
interface InspectionPayload {
  templateId: string;
  templateCode: string;
  templateName?: string;
  verification: Record<string, string | number>;
  responses: Record<string, Record<string, any>>;
  generalObservations?: string;
  inspectorSignature?: Record<string, string | number>;
  supervisorSignature?: Record<string, string | number>;
  outOfService?: any;
  accesoriosConfig?: Record<string, any>;
  vehicle?: any;
  scaffold?: any;
  selectedSubsections?: string[];
  selectedItems?: Record<string, string[]>;
  status: "draft" | "in_progress" | "completed"; // ✅ AGREGAR in_progress
  submittedAt: string;
  submittedBy?: string;
  location?: string;
  project?: string;
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    let errorMessage = `Error ${response.status}: ${response.statusText}`;

    if (errorText) {
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText.length > 200 ? `${errorText.substring(0, 200)}...` : errorText;
      }
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  try {
    return response.json();
  } catch {
    return response.text() as T;
  }
}

// ✅ ACTUALIZAR mapFormDataToPayload
function mapFormDataToPayload(
  formData: FormDataHerraEquipos,
  templateId: string,
  templateCode: string,
  status: "draft" | "in_progress" | "completed", // ✅ AGREGAR in_progress
  additionalData?: {
    templateName?: string;
    submittedBy?: string;
    location?: string;
    project?: string;
  }
): InspectionPayload {
  let responses: Record<string, Record<string, any>> = {};
  
  if (formData.responses && Array.isArray(formData.responses)) {
    console.log("🔄 [MAPPER] Transformando responses array a objeto");
    formData.responses.forEach((sectionData: any, index: number) => {
      const sectionKey = `section_${index}`;
      responses[sectionKey] = sectionData;
    });
  } else if (formData.responses && typeof formData.responses === 'object' && !Array.isArray(formData.responses)) {
    responses = formData.responses;
  } else if ((formData as any).sections && Array.isArray((formData as any).sections)) {
    console.log("🔄 [MAPPER] Transformando sections array a responses objeto");
    const sectionsArray = (formData as any).sections;
    sectionsArray.forEach((sectionData: any, index: number) => {
      const sectionKey = `section_${index}`;
      responses[sectionKey] = sectionData;
    });
  } else {
    responses = {};
  }

  const payload: InspectionPayload = {
    templateId,
    templateCode,
    templateName: additionalData?.templateName,
    verification: formData.verification || {},
    responses,
    generalObservations: formData.generalObservations,
    inspectorSignature: formData.inspectorSignature,
    supervisorSignature: formData.supervisorSignature,
    outOfService: formData.outOfService,
    accesoriosConfig: formData.accesoriosConfig,
    vehicle: formData.vehicle,
    scaffold: formData.scaffold,
    selectedSubsections: formData.selectedSubsections,
    selectedItems: formData.selectedItems,
    status,
    submittedAt: new Date().toISOString(),
    submittedBy: additionalData?.submittedBy,
    location: additionalData?.location,
    project: additionalData?.project,
  };

  return payload;
}

// ============================================
// ✅ FUNCIÓN BASE MEJORADA
// ============================================
export async function createInspectionHerraEquipos(
  formData: FormDataHerraEquipos,
  templateId: string,
  templateCode: string,
  status: "draft" | "in_progress" | "completed" = "completed", // ✅ AGREGAR in_progress
  additionalData?: {
    templateName?: string;
    submittedBy?: string;
    location?: string;
    project?: string;
  }
): Promise<ApiResponse<any>> {
  try {
    console.log("📤 [ACTION] Enviando inspección:", {
      templateCode,
      status,
      hasScaffold: !!formData.scaffold,
      routineInspectionsCount: formData.scaffold?.routineInspections?.length || 0,
    });

    const payload = mapFormDataToPayload(
      formData,
      templateId,
      templateCode,
      status,
      additionalData
    );

    console.log("📦 [ACTION] Payload status:", payload.status);
    console.log("🏗️ [ACTION] Scaffold data:", payload.scaffold);

    const response = await fetch(INSPECTIONS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await handleApiResponse<ApiResponse<any>>(response);

    console.log("✅ [ACTION] Inspección guardada:", result);

    return {
      success: true,
      message: result.message || "Inspección guardada exitosamente",
      data: result.data,
    };
  } catch (error) {
    console.error("❌ [ACTION] Error al guardar inspección:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

// ============================================
// ✅ GUARDAR BORRADOR
// ============================================
export async function saveDraftInspection(
  formData: FormDataHerraEquipos,
  templateId: string,
  templateCode: string,
  additionalData?: {
    templateName?: string;
    submittedBy?: string;
    location?: string;
    project?: string;
  }
): Promise<ApiResponse<any>> {
  console.log("💾 [ACTION] Guardando borrador:", templateCode);
  
  return createInspectionHerraEquipos(
    formData,
    templateId,
    templateCode,
    "draft",
    additionalData
  );
}

// ============================================
// ✅ NUEVO: GUARDAR EN PROGRESO (Para andamios)
// ============================================
export async function saveProgressInspection(
  formData: FormDataHerraEquipos,
  templateId: string,
  templateCode: string,
  additionalData?: {
    templateName?: string;
    submittedBy?: string;
    location?: string;
    project?: string;
  }
): Promise<ApiResponse<any>> {
  console.log("🔄 [ACTION] Guardando en progreso:", templateCode);
  
  return createInspectionHerraEquipos(
    formData,
    templateId,
    templateCode,
    "in_progress", // ✅ NUEVO STATUS
    additionalData
  );
}

// ============================================
// ✅ SUBMIT FINAL
// ============================================
export async function submitInspection(
  formData: FormDataHerraEquipos,
  templateId: string,
  templateCode: string,
  additionalData?: {
    templateName?: string;
    submittedBy?: string;
    location?: string;
    project?: string;
  }
): Promise<ApiResponse<any>> {
  console.log("📤 [ACTION] Enviando inspección final:", templateCode);
  
  return createInspectionHerraEquipos(
    formData,
    templateId,
    templateCode,
    "completed",
    additionalData
  );
}

// ============================================
// ✅ NUEVO: ACTUALIZAR INSPECCIÓN EN PROGRESO
// ============================================
export async function updateInProgressInspection(
  id: string,
  formData: Partial<FormDataHerraEquipos>,
  status?: "in_progress" | "completed"
): Promise<ApiResponse<any>> {
  try {
    console.log("🔄 [ACTION] Actualizando inspección en progreso:", id);
    console.log("🏗️ [ACTION] Scaffold data a actualizar:", formData.scaffold);

    const updatePayload: any = { ...formData };
    if (status) {
      updatePayload.status = status;
    }

    const response = await fetch(`${INSPECTIONS_ENDPOINT}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    const result = await handleApiResponse<ApiResponse<any>>(response);

    console.log("✅ [ACTION] Inspección actualizada:", result);

    return {
      success: true,
      message: result.message || "Inspección actualizada exitosamente",
      data: result.data,
    };
  } catch (error) {
    console.error("❌ [ACTION] Error al actualizar inspección:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

// ============================================
// ✅ NUEVO: OBTENER INSPECCIONES EN PROGRESO
// ============================================
export async function getInProgressInspections(filters?: {
  templateCode?: string;
  submittedBy?: string;
}): Promise<ApiResponse<any[]>> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("status", "in_progress");
    
    if (filters?.templateCode) queryParams.append("templateCode", filters.templateCode);
    if (filters?.submittedBy) queryParams.append("submittedBy", filters.submittedBy);

    const url = `${INSPECTIONS_ENDPOINT}?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await handleApiResponse<ApiResponse<any[]>>(response);

    console.log("📊 [ACTION] Inspecciones en progreso:", result.data?.length || 0);

    return {
      success: true,
      data: result.data,
      count: result.count,
    };
  } catch (error) {
    console.error("❌ [ACTION] Error al obtener inspecciones en progreso:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      data: [],
    };
  }
}

// ============================================
// RESTO DE FUNCIONES (sin cambios)
// ============================================

export async function getInspectionsHerraEquipos(filters?: {
  status?: string;
  templateCode?: string;
  startDate?: string;
  endDate?: string;
  submittedBy?: string;
}): Promise<ApiResponse<any[]>> {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.templateCode) queryParams.append("templateCode", filters.templateCode);
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);
    if (filters?.submittedBy) queryParams.append("submittedBy", filters.submittedBy);

    const url = `${INSPECTIONS_ENDPOINT}?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await handleApiResponse<ApiResponse<any[]>>(response);

    return {
      success: true,
      data: result.data,
      count: result.count,
    };
  } catch (error) {
    console.error("❌ [ACTION] Error al obtener inspecciones:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      data: [],
    };
  }
}

export async function getInspectionById(id: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${INSPECTIONS_ENDPOINT}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await handleApiResponse<ApiResponse<any>>(response);

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("❌ [ACTION] Error al obtener inspección:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function getDraftInspections(userId?: string): Promise<ApiResponse<any[]>> {
  try {
    const url = userId 
      ? `${INSPECTIONS_ENDPOINT}/drafts?userId=${userId}`
      : `${INSPECTIONS_ENDPOINT}/drafts`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await handleApiResponse<ApiResponse<any[]>>(response);

    return {
      success: true,
      data: result.data,
      count: result.count,
    };
  } catch (error) {
    console.error("❌ [ACTION] Error al obtener borradores:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      data: [],
    };
  }
}

export async function updateInspection(
  id: string,
  formData: Partial<FormDataHerraEquipos>,
  status?: "draft" | "in_progress" | "completed" // ✅ AGREGAR in_progress
): Promise<ApiResponse<any>> {
  try {
    console.log("🔄 [ACTION] Actualizando inspección:", id);

    const updatePayload: any = { ...formData };
    if (status) {
      updatePayload.status = status;
    }

    const response = await fetch(`${INSPECTIONS_ENDPOINT}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    const result = await handleApiResponse<ApiResponse<any>>(response);

    console.log("✅ [ACTION] Inspección actualizada:", result);

    return {
      success: true,
      message: result.message || "Inspección actualizada exitosamente",
      data: result.data,
    };
  } catch (error) {
    console.error("❌ [ACTION] Error al actualizar inspección:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function deleteInspection(id: string): Promise<ApiResponse<null>> {
  try {
    console.log("🗑️ [ACTION] Eliminando inspección:", id);

    const response = await fetch(`${INSPECTIONS_ENDPOINT}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await handleApiResponse<ApiResponse<null>>(response);

    console.log("✅ [ACTION] Inspección eliminada");

    return {
      success: true,
      message: result.message || "Inspección eliminada exitosamente",
    };
  } catch (error) {
    console.error("❌ [ACTION] Error al eliminar inspección:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function getInspectionStats(templateCode?: string): Promise<ApiResponse<any>> {
  try {
    const url = templateCode
      ? `${INSPECTIONS_ENDPOINT}/stats?templateCode=${templateCode}`
      : `${INSPECTIONS_ENDPOINT}/stats`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await handleApiResponse<ApiResponse<any>>(response);

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("❌ [ACTION] Error al obtener estadísticas:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function getInspectionsByTemplateCode(
  templateCode: string
): Promise<ApiResponse<any[]>> {
  try {
    const response = await fetch(`${INSPECTIONS_ENDPOINT}/template/${templateCode}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await handleApiResponse<ApiResponse<any[]>>(response);

    return {
      success: true,
      data: result.data,
      count: result.count,
    };
  } catch (error) {
    console.error("❌ [ACTION] Error al obtener inspecciones por template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      data: [],
    };
  }
}

// ============================================
// ✅ NUEVO: FINALIZAR INSPECCIÓN
// ============================================
export async function finalizeInspection(
  id: string,
  formData: FormDataHerraEquipos
): Promise<ApiResponse<any>> {
  console.log("✅ [ACTION] Finalizando inspección:", id);
  
  return updateInProgressInspection(id, formData, "completed");
}