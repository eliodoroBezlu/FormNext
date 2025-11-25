// app/actions/client-downloads.ts  (o donde lo tengas)
'use client';

import { API_BASE_URL } from "../constants";
import { getSession } from "next-auth/react";

/**
 * Helper para obtener el token JWT desde el cliente
 */
async function getAuthToken(): Promise<string | null> {
  const session = await getSession();
  return session?.accessToken as string | null ?? null;
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
 * Descarga con autenticación (reutilizable)
 */
async function descargarConAuth(url: string, nombreArchivo: string) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("No estás autenticado. Por favor inicia sesión nuevamente.");
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      // No necesitas Content-Type aquí porque es una descarga
    },
    credentials: "include", // Importante si usas cookies (opcional si usas JWT en header)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
  }

  const blob = await response.blob();
  descargarArchivo(blob, nombreArchivo);
}

// ============= DESCARGAS AUTENTICADAS =============

export async function descargarPdfCliente(id: string): Promise<void> {
  await descargarConAuth(`${API_BASE_URL}/inspecciones/${id}/pdf`, `inspeccion-${id}.pdf`);
}

export async function descargarExcelCliente(id: string): Promise<void> {
  await descargarConAuth(`${API_BASE_URL}/inspecciones/${id}/excel`, `inspeccion-${id}.xlsx`);
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
    `${API_BASE_URL}/instances/${id}/excel`, // Ajusta según tu ruta real
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