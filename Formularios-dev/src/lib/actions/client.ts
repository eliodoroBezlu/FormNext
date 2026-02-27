// app/actions/client-downloads.ts
'use client';

// Asegúrate de que API_BASE_URL sea correcta (ej. http://localhost:3002 o tu proxy)
import { API_BASE_URL } from "../constants";

/**
 * Función para descargar un blob como archivo
 */
export function descargarArchivo(blob: Blob, nombre: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombre;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Descarga con autenticación usando cookies httpOnly
 */
async function descargarConAuth(backendUrl: string, nombreArchivo: string) {
  console.log("📥 [DESCARGA] Iniciando...");

  // Extraer solo el path desde la URL del backend
  // Ej: https://backend.railway.app/instances/123/excel → /instances/123/excel
  const path = new URL(backendUrl).pathname;
  const proxyUrl = `/api/download${path}`;

  console.log("  🌐 Proxy URL:", proxyUrl);

  try {
    const response = await fetch(proxyUrl, {
      method: "GET",
      cache: "no-store",
    });

    console.log("📨 [DESCARGA] Status:", response.status);

    if (response.status === 401) {
      console.error("🔒 [DESCARGA] Sesión expirada");
      window.location.href = "/login";
      throw new Error("Sesión expirada.");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const blob = await response.blob();
    console.log("✅ [DESCARGA] Blob recibido, tamaño:", blob.size);
    descargarArchivo(blob, nombreArchivo);
  } catch (error) {
    console.error("💥 [DESCARGA] Error:", error);
    throw error;
  }
}

// ============= DESCARGAS AUTENTICADAS (Igual que antes) =============

export async function descargarPdfCliente(id: string): Promise<void> {
  await descargarConAuth(
    `${API_BASE_URL}/inspecciones/${id}/pdf`, 
    `inspeccion-${id}.pdf`
  );
}

export async function descargarExcelCliente(id: string): Promise<void> {
  await descargarConAuth(
    `${API_BASE_URL}/inspecciones/${id}/excel`, 
    `inspeccion-${id}.xlsx`
  );
}

export async function descargarExcelInspeccionesEmergenciaCliente(id: string): Promise<void> {
  await descargarConAuth(
    `${API_BASE_URL}/inspecciones-emergencia/${id}/excel`,
    `inspeccion-emergencia-${id}.xlsx`
  );
}

export async function descargarPdfInspeccionesEmergenciaCliente(id: string): Promise<void> {
  await descargarConAuth(
    `${API_BASE_URL}/inspecciones-emergencia/${id}/pdf`,
    `inspeccion-emergencia-${id}.pdf`
  );
}

export async function descargarExcelIroIsopCliente(id: string): Promise<void> {
  await descargarConAuth(
    `${API_BASE_URL}/instances/${id}/excel`,
    `iro-isop-${id}.xlsx`
  );
}

export async function descargarPdfIroIsopCliente(id: string): Promise<void> {
  await descargarConAuth(
    `${API_BASE_URL}/instances/${id}/pdf`,
    `iro-isop-${id}.pdf`
  );
}

export async function descargarExcelHerraEquipoCliente(id: string): Promise<void> {
  await descargarConAuth(
    `${API_BASE_URL}/inspections-herra-equipos/${id}/excel`,
    `herramienta-equipo-${id}.xlsx`
  );
}

export async function descargarPdfHerraEquipoCliente(id: string): Promise<void> {
  await descargarConAuth(
    `${API_BASE_URL}/inspections-herra-equipos/${id}/pdf`,
    `herramienta-equipo-${id}.pdf`
  );
}