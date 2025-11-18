// lib/actions/equipment-tracking.ts
"use server";

import { handleApiResponse } from "./helpers";
import { API_BASE_URL } from "../constants";

export interface CheckEquipmentStatusResponse {
  canProceed: boolean;
  openForm: string;
  message: string;
  shouldRedirect: boolean;
  requiresFrecuente: boolean;
  trackingData?: {
    preUsoCount?: number;
    usageInterval?: number;
    remainingUses?: number;
    lastInspection?: Date;
  };
  redirectToPreUso?: boolean;
}

export async function checkEquipmentStatus(
  equipmentId: string,
  templateCode: string
) {
  try {
    console.log(
      `🔍 [ACTION] Verificando TAG: ${equipmentId} para form: ${templateCode}`
    );

    // ✅ USANDO API_BASE_URL y handleApiResponse
    const response = await fetch(
      `${API_BASE_URL}/equipment-tracking/check-status?equipmentId=${equipmentId}&templateCode=${templateCode}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    // ✅ USANDO handleApiResponse para manejar la respuesta
    const data = await handleApiResponse<CheckEquipmentStatusResponse>(response);

    console.log("📨 [ACTION] Respuesta del backend:", data);

    return {
      success: true,
      data: {
        canProceed: data.canProceed,
        openForm: data.openForm,
        shouldRedirect: data.shouldRedirect,
        message: data.message,
        trackingData: data.trackingData,
      },
    };
  } catch (error) {
    console.error("❌ [ACTION] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}