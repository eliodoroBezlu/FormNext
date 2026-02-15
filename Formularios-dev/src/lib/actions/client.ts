// app/actions/client-downloads.ts  (o donde lo tengas)
'use client';

import { API_BASE_URL } from "../constants";


/**
 * Helper para obtener el access_token desde las cookies del cliente
 * IMPORTANTE: Este token ya fue validado por el middleware
 */
function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const accessTokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
  
  if (!accessTokenCookie) return null;
  
  return accessTokenCookie.split('=')[1];
}

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
 * 
 * IMPORTANTE: Como el access_token está en una cookie httpOnly,
 * el navegador lo enviará automáticamente con credentials: 'include'
 */
async function descargarConAuth(url: string, nombreArchivo: string) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📥 [DESCARGA] Iniciando descarga...');
  console.log('  🌐 URL:', url);
  console.log('  📄 Archivo:', nombreArchivo);

  // Verificar que haya token (opcional, para feedback al usuario)
  const token = getAccessToken();
  
  if (!token) {
    console.error('❌ [DESCARGA] No hay access token');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    throw new Error("No estás autenticado. Por favor inicia sesión nuevamente.");
  }

  console.log('✅ [DESCARGA] Token encontrado:', token.slice(0, 15) + '...');

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include", // ✅ CRÍTICO: Envía cookies httpOnly automáticamente
      cache: "no-store",
    });

    console.log('📨 [DESCARGA] Respuesta:', {
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get('content-type'),
    });

    if (response.status === 401) {
      console.error('🔒 [DESCARGA] 401 - Sesión expirada');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DESCARGA] Error:', errorText);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
    }

    const blob = await response.blob();
    console.log('✅ [DESCARGA] Blob recibido:', {
      size: blob.size,
      type: blob.type,
    });

    descargarArchivo(blob, nombreArchivo);
    
    console.log('✅ [DESCARGA] Descarga completada');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('💥 [DESCARGA] Error:', error);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    throw error;
  }
}

// ============= DESCARGAS AUTENTICADAS =============

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