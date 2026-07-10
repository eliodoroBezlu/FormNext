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
 * Extrae el nombre de archivo del header Content-Disposition, priorizando
 * la variante RFC 6266 (filename*=UTF-8''...) sobre el filename ASCII plano.
 */
function extraerFilenameDeHeader(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      // sigue al siguiente intento si el valor viene mal codificado
    }
  }

  const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (plainMatch) return plainMatch[1].trim();

  return null;
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
    const nombreDesdeHeader = extraerFilenameDeHeader(
      response.headers.get("content-disposition"),
    );
    descargarArchivo(blob, nombreDesdeHeader || nombreArchivo);
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

// ============= DESCARGA MASIVA (ZIP) =============

/**
 * Descarga múltiples inspecciones como un único .zip generado en el backend.
 * `backendUrl` debe apuntar al endpoint "bulk-download" del módulo correspondiente.
 */
async function descargarZipConAuth(
  backendUrl: string,
  ids: string[],
  format: "pdf" | "excel",
  nombreZipFallback: string,
): Promise<void> {
  const path = new URL(backendUrl).pathname;
  const proxyUrl = `/api/download${path}`;

  const response = await fetch(proxyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, format }),
    cache: "no-store",
  });

  if (response.status === 401) {
    window.location.href = "/login";
    throw new Error("Sesión expirada.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  const blob = await response.blob();
  const nombreDesdeHeader = extraerFilenameDeHeader(
    response.headers.get("content-disposition"),
  );
  descargarArchivo(blob, nombreDesdeHeader || nombreZipFallback);
}

export async function descargarZipHerraEquipoCliente(
  ids: string[],
  format: "pdf" | "excel",
): Promise<void> {
  await descargarZipConAuth(
    `${API_BASE_URL}/inspections-herra-equipos/bulk-download`,
    ids,
    format,
    "Inspecciones.zip",
  );
}

export async function descargarZipIroIsopCliente(
  ids: string[],
  format: "pdf" | "excel",
): Promise<void> {
  await descargarZipConAuth(
    `${API_BASE_URL}/instances/bulk-download`,
    ids,
    format,
    "Inspecciones.zip",
  );
}

export async function descargarZipInspeccionesEmergenciaCliente(
  ids: string[],
  format: "pdf" | "excel",
): Promise<void> {
  await descargarZipConAuth(
    `${API_BASE_URL}/inspecciones-emergencia/bulk-download`,
    ids,
    format,
    "Inspecciones.zip",
  );
}