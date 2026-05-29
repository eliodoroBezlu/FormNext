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
} from "@/components/features/herra-equipos/types/IProps";
import { getAuthHeaders, handleApiResponse } from "./helpers";
import { revalidatePath } from "next/cache";

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
  /** Área denormalizada extraída de verification al momento de guardar */
  area?: string;
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

// handleApiResponse importada de ./helpers

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
    typeof templateId === 'object' && templateId !== null && '_id' in templateId
      ? (templateId as { _id: string })._id
      : (templateId as string);

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
    
    console.log(`[INSPECTION_ACTION] Guardando inspección. Status: ${finalStatus}, RequiresApproval: ${formData.requiresApproval || false}`);

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

    revalidatePath("/dashboard/form-herra-equipos");
    revalidatePath("/dashboard/inspecciones-pendientes");

    console.log(`[INSPECTION_ACTION] Guardada con éxito. ID: ${result.data?._id || "unknown"}`);

    return {
      success: true,
      message: result.message || "Inspección guardada exitosamente",
      data: result.data,
    };
  } catch (error) {
    console.error("❌ [INSPECTION_ACTION] Error al crear inspección:", error);
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

    revalidatePath("/dashboard/form-herra-equipos");
    revalidatePath("/dashboard/inspecciones-pendientes");

    console.log(`[INSPECTION_ACTION] Aprobada con éxito. ID: ${id}`);

    return {
      success: true,
      message: "Inspección aprobada exitosamente",
      data: result.data,
    };
  } catch (error) {
    console.error(`❌ [INSPECTION_ACTION] Error al aprobar inspección ${id}:`, error);
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

    revalidatePath("/dashboard/form-herra-equipos");
    revalidatePath("/dashboard/inspecciones-pendientes");

    console.log(`[INSPECTION_ACTION] Rechazada con éxito. ID: ${id}`);

    return {
      success: true,
      message: "Inspección rechazada",
      data: result.data,
    };
  } catch (error) {
    console.error(`❌ [INSPECTION_ACTION] Error al rechazar inspección ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function getPendingApprovals(
  supervisorUsername?: string,
  supervisorAreas?: string[],   // array de áreas seleccionadas
  isAdmin?: boolean,
): Promise<ApiResponse<InspectionResponse[]>> {
  try {
    const headers = await getAuthHeaders();
    
    const queryParams = new URLSearchParams();
    
    if (supervisorUsername) {
      queryParams.append("excludeSubmittedBy", supervisorUsername);
    }
    // Enviar áreas como CSV: "Chancado,Flotacion"
    if (supervisorAreas && supervisorAreas.length > 0) {
      queryParams.append("areas", supervisorAreas.join(","));
    }
    if (isAdmin) {
      queryParams.append("isAdmin", "true");
    }

    // ✅ Endpoint dedicado con lógica de filtrado por área
    const url = `${INSPECTIONS_ENDPOINT}/pending-approvals?${queryParams.toString()}`;
    
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
    console.error("❌ [INSPECTION_ACTION] Error al obtener pendientes:", error);
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
  // ✅ CORRECCIÓN: Usar el status que viene en formData
  const status = formData.status || InspectionStatus.COMPLETED;
  
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

    // ✅ CORRECCIÓN: Resolver templateId de forma segura si viene populado
    if (updatePayload.templateId && typeof updatePayload.templateId === 'object' && '_id' in updatePayload.templateId) {
      updatePayload.templateId = (updatePayload.templateId as { _id: string })._id;
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

    revalidatePath("/dashboard/form-herra-equipos");
    revalidatePath("/dashboard/inspecciones-pendientes");

    return {
      success: true,
      message: result.message || "Inspección actualizada exitosamente",
      data: result.data,
    };
  } catch (error) {
    console.error(`❌ [INSPECTION_ACTION] Error al actualizar inspección ${id}:`, error);
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

    return {
      success: true,
      data: result.data,
      count: result.count,
    };
  } catch (error) {
    console.error("❌ [INSPECTION_ACTION] Error al obtener inspecciones en progreso:", error);
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
    console.error("❌ [INSPECTION_ACTION] Error al obtener inspecciones:", error);
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
    console.error(`❌ [INSPECTION_ACTION] Error al obtener inspección ${id}:`, error);
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
    console.error("❌ [INSPECTION_ACTION] Error al obtener borradores:", error);
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
    
    // ✅ CORRECCIÓN: Resolver templateId de forma segura si viene populado
    if (updatePayload.templateId && typeof updatePayload.templateId === 'object' && '_id' in updatePayload.templateId) {
      updatePayload.templateId = (updatePayload.templateId as { _id: string })._id;
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

    revalidatePath("/dashboard/form-herra-equipos");
    revalidatePath("/dashboard/inspecciones-pendientes");

    return {
      success: true,
      message: result.message || "Inspección actualizada exitosamente",
      data: result.data,
    };
  } catch (error) {
    console.error(`❌ [INSPECTION_ACTION] Error al actualizar inspección ${id}:`, error);
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

    revalidatePath("/dashboard/form-herra-equipos");
    revalidatePath("/dashboard/inspecciones-pendientes");

    console.log(`[INSPECTION_ACTION] Eliminada con éxito. ID: ${id}`);

    return {
      success: true,
      message: result.message || "Inspección eliminada exitosamente",
    };
  } catch (error) {
    console.error(`❌ [INSPECTION_ACTION] Error al eliminar inspección ${id}:`, error);
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
    console.error("❌ [INSPECTION_ACTION] Error al obtener estadísticas:", error);
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
    console.error("❌ [INSPECTION_ACTION] Error al obtener inspecciones por template:", error);
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
  return updateInProgressInspection(id, formData, InspectionStatus.COMPLETED);
}

