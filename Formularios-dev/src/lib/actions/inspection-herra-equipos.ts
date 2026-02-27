"use server";

import {
  FormDataHerraEquipos,
  QuestionResponseUnion,
  OutOfServiceData,
  AccesoriosConfig,
  VehicleData,
  ScaffoldData,
  InspectionStatus,
  ApprovalData,
} from "@/components/herra_equipos/types/IProps";
import { getAuthHeaders } from "./helpers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const INSPECTIONS_ENDPOINT = `${API_BASE_URL}/inspections-herra-equipos`;

// ✅ Respuesta genérica tipada
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  count?: number;
}

// ✅ Tipos para respuestas del backend
export interface InspectionResponse extends FormDataHerraEquipos {
  _id: string;
  templateId: string;
  templateCode: string;
  templateName: string;
  submittedAt: string;
  submittedBy?: string;
  location?: string;
  project?: string;
  updatedAt: string;
  status: InspectionStatus;
  approval?: ApprovalData;
}

export interface InProgressInspection {
  _id: string;
  templateCode: string;
  templateName?: string;
  status: InspectionStatus;
  verification: Record<string, string | number>;
  scaffold?: ScaffoldData;
  submittedAt: string;
  submittedBy?: string;
  updatedAt?: string;
  approval?: ApprovalData;
}

// ✅ Payload completamente tipado (sin `any`)
interface InspectionPayload {
  templateId: string;
  templateCode: string;
  templateName?: string;
  verification: Record<string, string | number>;
  responses: Record<string, Record<string, QuestionResponseUnion>>;
  generalObservations?: string;
  inspectorSignature?: Record<string, string | number>;
  supervisorSignature?: Record<string, string | number>;
  outOfService?: OutOfServiceData;
  accesoriosConfig?: AccesoriosConfig;
  vehicle?: VehicleData;
  scaffold?: ScaffoldData;
  selectedSubsections?: string[];
  selectedItems?: Record<string, string[]>;
  status: InspectionStatus; 
  submittedAt: string;
  submittedBy?: string;
  location?: string;
  project?: string;
  requiresApproval?: boolean;
  approval?: ApprovalData;
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

function mapFormDataToPayload(
  formData: FormDataHerraEquipos,
  templateId: string | { _id: string },
  templateCode: string,
  status: InspectionStatus,  // ✅ Usar el tipo enum
  additionalData?: {
    templateName?: string;
    submittedBy?: string;
    location?: string;
    project?: string;
  }
): InspectionPayload {
  const responses =
    formData.responses && typeof formData.responses === "object" && !Array.isArray(formData.responses)
      ? formData.responses
      : {};

      const resolvedTemplateId = 
    typeof templateId === 'object' && templateId !== null
      ? (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        templateId as any
      )._id
      : templateId;

  return {
    templateId: resolvedTemplateId,
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
    status,  // ✅ El status viene del enum
    submittedAt: new Date().toISOString(),
    submittedBy: additionalData?.submittedBy,
    location: additionalData?.location,
    project: additionalData?.project,
    requiresApproval: formData.requiresApproval || false,
    approval: formData.approval,  // ✅ Incluir approval
  };
}

// ============================================
// ✅ FUNCIONES DE ACCIÓN (TODAS TIPADAS)
// ============================================

export async function createInspectionHerraEquipos(
  formData: FormDataHerraEquipos,
  templateId: string,
  templateCode: string,
  status: InspectionStatus = InspectionStatus.COMPLETED,  // ✅ Tipo correcto
  additionalData?: {
    templateName?: string;
    submittedBy?: string;
    location?: string;
    project?: string;
  }
): Promise<ApiResponse<InspectionResponse>> {
  try {
    const headers = await getAuthHeaders();
    
    // ✅ USAR EL STATUS DEL FORMDATA SI EXISTE
    const finalStatus = formData.status || status;
    
    console.log("📤 [ACTION] Guardando con:");
    console.log("  - formData.status:", formData.status);
    console.log("  - status param:", status);
    console.log("  - finalStatus:", finalStatus);
    console.log("  - requiresApproval:", formData.requiresApproval);

    const payload = mapFormDataToPayload(
      formData, 
      templateId, 
      templateCode, 
      finalStatus,
      additionalData
    );

    const response = await fetch(INSPECTIONS_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const result = await handleApiResponse<ApiResponse<InspectionResponse>>(response);

    console.log("✅ [ACTION] Respuesta del servidor:");
    console.log("  - ID:", result.data?._id);
    console.log("  - Status guardado:", result.data?.status);

    return {
      success: true,
      message: result.message || "Inspección guardada exitosamente",
      data: result.data,
    };
  } catch (error) {
    console.error("❌ [ACTION] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function approveInspection(
  id: string,
  approvedBy: string,
  comments?: string
): Promise<ApiResponse<InspectionResponse>> {
  try {
    const headers = await getAuthHeaders();
    
    const approvalData: ApprovalData = {
      status: "approved",
      approvedBy,
      approvedAt: new Date().toISOString(),
      supervisorComments: comments,
    };

    const response = await fetch(`${INSPECTIONS_ENDPOINT}/${id}/approve`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        approval: approvalData,
        status: "approved",
      }),
    });

    const result = await handleApiResponse<ApiResponse<InspectionResponse>>(response);

    console.log("✅ [ACTION] Inspección aprobada:", result);

    return {
      success: true,
      message: "Inspección aprobada exitosamente",
      data: result.data,
    };
  } catch (error) {
    console.error("❌ [ACTION] Error al aprobar inspección:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function rejectInspection(
  id: string,
  rejectedBy: string,
  reason: string
): Promise<ApiResponse<InspectionResponse>> {
  try {
    const headers = await getAuthHeaders();
    
    const approvalData: ApprovalData = {
      status: "rejected",
      approvedBy: rejectedBy,
      approvedAt: new Date().toISOString(),
      rejectionReason: reason,
    };

    const response = await fetch(`${INSPECTIONS_ENDPOINT}/${id}/reject`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        approval: approvalData,
        status: "rejected",
      }),
    });

    const result = await handleApiResponse<ApiResponse<InspectionResponse>>(response);

    console.log("✅ [ACTION] Inspección rechazada:", result);

    return {
      success: true,
      message: "Inspección rechazada",
      data: result.data,
    };
  } catch (error) {
    console.error("❌ [ACTION] Error al rechazar inspección:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function getPendingApprovals(
  supervisorEmail?: string
): Promise<ApiResponse<InspectionResponse[]>> {
  try {
    const headers = await getAuthHeaders();
    
    const queryParams = new URLSearchParams();
    queryParams.append("status", "pending_approval");
    
    if (supervisorEmail) {
      queryParams.append("excludeSubmittedBy", supervisorEmail);
    }

    const url = `${INSPECTIONS_ENDPOINT}?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const result = await handleApiResponse<ApiResponse<InspectionResponse[]>>(response);

    console.log("📋 [ACTION] Inspecciones pendientes:", result.data?.length || 0);

    return {
      success: true,
      data: result.data,
      count: result.count,
    };
  } catch (error) {
    console.error("❌ [ACTION] Error al obtener pendientes:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      data: [],
    };
  }
}

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
): Promise<ApiResponse<InspectionResponse>> {
  
  return createInspectionHerraEquipos(
    formData,
    templateId,
    templateCode,
    InspectionStatus.DRAFT,
    additionalData
  );
}

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
): Promise<ApiResponse<InspectionResponse>> {
  console.log("🔄 [ACTION] Guardando en progreso:", templateCode);
  
  return createInspectionHerraEquipos(
    formData,
    templateId,
    templateCode,
    InspectionStatus.IN_PROGRESS,
    additionalData
  );
}

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
): Promise<ApiResponse<InspectionResponse>> {
  console.log("📤 [ACTION] submitInspection:");
  console.log("  - formData.status:", formData.status);
  
  // ✅ CORRECCIÓN: Usar el status que viene en formData
  const status = formData.status || InspectionStatus.COMPLETED;
  
  console.log("  - Status a usar:", status);
  
  return createInspectionHerraEquipos(
    formData,
    templateId,
    templateCode,
    status,  // ✅ Usar el status correcto
    additionalData
  );
}

export async function updateInProgressInspection(
  id: string,
  formData: Partial<FormDataHerraEquipos>,
  status?: InspectionStatus.IN_PROGRESS | InspectionStatus.COMPLETED,
): Promise<ApiResponse<InspectionResponse>> {
  try {
    const headers = await getAuthHeaders();
    
    const updatePayload: Partial<InspectionPayload> = { ...formData };

    // ✅ CORRECCIÓN: Resolver templateId si viene como objeto populado
    if (updatePayload.templateId && typeof updatePayload.templateId === 'object') {
      updatePayload.templateId = (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updatePayload.templateId as any
      )._id;
    }

    if (status) {
      updatePayload.status = status;
    }

    const response = await fetch(`${INSPECTIONS_ENDPOINT}/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updatePayload),
    });

    const result = await handleApiResponse<ApiResponse<InspectionResponse>>(response);

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

export async function getInProgressInspections(filters?: {
  templateCode?: string;
  submittedBy?: string;
}): Promise<ApiResponse<InProgressInspection[]>> {
  try {
    const headers = await getAuthHeaders();
    
    const queryParams = new URLSearchParams();
    queryParams.append("status", "in_progress");
    
    if (filters?.templateCode) queryParams.append("templateCode", filters.templateCode);
    if (filters?.submittedBy) queryParams.append("submittedBy", filters.submittedBy);

    const url = `${INSPECTIONS_ENDPOINT}?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const result = await handleApiResponse<ApiResponse<InProgressInspection[]>>(response);

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

export async function getInspectionsHerraEquipos(filters?: {
  status?: string;
  templateCode?: string;
  startDate?: string;
  endDate?: string;
  submittedBy?: string;
}): Promise<ApiResponse<InspectionResponse[]>> {
  try {
    const headers = await getAuthHeaders();
    
    const queryParams = new URLSearchParams();
    
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.templateCode) queryParams.append("templateCode", filters.templateCode);
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);
    if (filters?.submittedBy) queryParams.append("submittedBy", filters.submittedBy);

    const url = `${INSPECTIONS_ENDPOINT}?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const result = await handleApiResponse<ApiResponse<InspectionResponse[]>>(response);

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

export async function getInspectionById(id: string): Promise<ApiResponse<InspectionResponse>> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${INSPECTIONS_ENDPOINT}/${id}`, {
      method: "GET",
      headers,
    });

    const result = await handleApiResponse<ApiResponse<InspectionResponse>>(response);

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

export async function getDraftInspections(userId?: string): Promise<ApiResponse<InspectionResponse[]>> {
  try {
    const headers = await getAuthHeaders();
    
    const url = userId 
      ? `${INSPECTIONS_ENDPOINT}/drafts?userId=${userId}`
      : `${INSPECTIONS_ENDPOINT}/drafts`;
    
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const result = await handleApiResponse<ApiResponse<InspectionResponse[]>>(response);

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
  status?: InspectionStatus.IN_PROGRESS | InspectionStatus.COMPLETED | InspectionStatus.DRAFT
): Promise<ApiResponse<InspectionResponse>> {
  try {
    const headers = await getAuthHeaders();
    
    const updatePayload: Partial<InspectionPayload> = { ...formData };
    
    // ✅ CORRECCIÓN: Resolver templateId si viene como objeto populado
    if (updatePayload.templateId && typeof updatePayload.templateId === 'object') {
      updatePayload.templateId = (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updatePayload.templateId as any
      )._id;
    }
    
    if (status) {
      updatePayload.status = status;
    }

    const response = await fetch(`${INSPECTIONS_ENDPOINT}/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updatePayload),
    });

    const result = await handleApiResponse<ApiResponse<InspectionResponse>>(response);

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
    const headers = await getAuthHeaders();
    

    const response = await fetch(`${INSPECTIONS_ENDPOINT}/${id}`, {
      method: "DELETE",
      headers,
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

// ✅ Usa `unknown` si la estructura no está definida (seguro y permitido por ESLint)
export async function getInspectionStats(templateCode?: string): Promise<ApiResponse<Record<string, unknown>>> {
  try {
    const headers = await getAuthHeaders();
    
    const url = templateCode
      ? `${INSPECTIONS_ENDPOINT}/stats?templateCode=${templateCode}`
      : `${INSPECTIONS_ENDPOINT}/stats`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const result = await handleApiResponse<ApiResponse<Record<string, unknown>>>(response);

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
): Promise<ApiResponse<InspectionResponse[]>> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${INSPECTIONS_ENDPOINT}/template/${templateCode}`, {
      method: "GET",
      headers,
    });

    const result = await handleApiResponse<ApiResponse<InspectionResponse[]>>(response);

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

export async function finalizeInspection(
  id: string,
  formData: FormDataHerraEquipos
): Promise<ApiResponse<InspectionResponse>> {
  console.log("✅ [ACTION] Finalizando inspección:", id);
  
  return updateInProgressInspection(id, formData, InspectionStatus.COMPLETED);
}

