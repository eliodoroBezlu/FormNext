// lib/actions/equipment-tracking.ts
"use server";

import { getAuthHeaders, handleApiResponse } from "./helpers";
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

export interface DisponibilidadEquipo {
  codigo: string;
  ultimaInspeccion: string | null;
  proximaInspeccion: string | null;
  disponible: boolean;
}

/**
 * Disponibilidad de códigos de equipo para un template, según la frecuencia
 * configurada en ese template. Si el template no tiene frecuencia activa,
 * el backend devuelve todos los códigos como disponibles (sin restricción).
 */
export async function obtenerDisponibilidadEquipos(
  templateCode: string,
  area?: string,
): Promise<DisponibilidadEquipo[]> {
  try {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams({ templateCode });
    if (area) params.append("area", area);

    const response = await fetch(
      `${API_BASE_URL}/equipment-tracking/disponibilidad?${params.toString()}`,
      { method: "GET", headers, cache: "no-store" },
    );

    return await handleApiResponse<DisponibilidadEquipo[]>(response);
  } catch (error) {
    console.error("❌ [ACTION] Error al obtener disponibilidad de equipos:", error);
    // Ante un error, no bloquear al usuario: se resuelve como "sin datos" y
    // el llamador debe tratarlo como "no restringir" (fail-open, igual que
    // el comportamiento actual sin esta funcionalidad).
    return [];
  }
}

export async function checkEquipmentStatus(
  equipmentId: string,
  templateCode: string
) {
  try {
    const headers = await getAuthHeaders();
    

    // ✅ USANDO API_BASE_URL y handleApiResponse
    const response = await fetch(
      `${API_BASE_URL}/equipment-tracking/check-status?equipmentId=${equipmentId}&templateCode=${templateCode}`,
      {
        method: "GET",
        headers,
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