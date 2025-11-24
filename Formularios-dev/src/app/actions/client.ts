'use client';

// Guardar en app/actions/client.ts

/**
 * Función para descargar un blob como archivo
 */
export function descargarArchivo(blob: Blob, nombre: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombre;
  link.click();
  window.URL.revokeObjectURL(url);
}



/**
 * Descarga un PDF de inspección
 */
export async function descargarPdfCliente(id: string): Promise<void> {
  try {
    const response = await fetch(`/inspecciones/${id}/pdf`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al descargar el PDF: ${response.status} - ${errorText}`);
    }
    
    const blob = await response.blob();
    descargarArchivo(blob, `inspeccion-${id}.pdf`);
  } catch (error) {
    console.error("Error al descargar el PDF:", error);
    throw error;
  }
}

/**
 * Descarga un Excel de inspección
 */
export async function descargarExcelCliente(id: string): Promise<void> {
  try {
    const response = await fetch(`/inspecciones/${id}/excel`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al descargar el Excel: ${response.status} - ${errorText}`);
    }
    
    const blob = await response.blob();
    descargarArchivo(blob, `inspeccion-${id}.xlsx`);
  } catch (error) {
    console.error("Error al descargar el Excel:", error);
    throw error;
  }
}

/**
 * Descarga un Excel de inspecciones de emergencia
 */


export async function descargarExcelInspeccionesEmergenciaCliente(id: string): Promise<void> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${apiUrl}/inspecciones-emergencia/${id}/excel`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al descargar el Excel: ${response.status} - ${errorText}`);
    }
    
    const blob = await response.blob();
    descargarArchivo(blob, `inspeccion-emergencia-${id}.xlsx`);
  } catch (error) {
    console.error("Error al descargar el Excel:", error);
    throw error;
  }
}

export async function descargarExcelIroIsopCliente(id: string): Promise<void> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${apiUrl}/instances/${id}/excel`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al descargar el Excel: ${response.status} - ${errorText}`);
    }
    
    const blob = await response.blob();
    descargarArchivo(blob, `inspeccion-emergencia-${id}.xlsx`);
  } catch (error) {
    console.error("Error al descargar el Excel:", error);
    throw error;
  }
}

export async function descargarExcelHerraEquipoCliente(id: string): Promise<void> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${apiUrl}/inspections-herra-equipos/${id}/excel`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al descargar el Excel: ${response.status} - ${errorText}`);
    }
    
    const blob = await response.blob();
    descargarArchivo(blob, `inspeccion-emergencia-${id}.xlsx`);
  } catch (error) {
    console.error("Error al descargar el Excel:", error);
    throw error;
  }
}

export async function descargarPdfInspeccionesEmergenciaCliente(id: string): Promise<void> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${apiUrl}/inspecciones-emergencia/${id}/pdf`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al descargar el PDF: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
    descargarArchivo(blob, `inspecciones-emergencia-${id}.pdf`);
  } catch (error) {
    console.error('Error al descargar el PDF de instancia:', error);
    throw error;
  }
}

export async function descargarPdfIroIsopCliente(id: string): Promise<void> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${apiUrl}/instances/${id}/pdf`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al descargar el PDF: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
    descargarArchivo(blob, `instancia-${id}.pdf`);
  } catch (error) {
    console.error('Error al descargar el PDF de instancia:', error);
    throw error;
  }
}

export async function descargarPdfHerraEquipoCliente(id: string): Promise<void> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${apiUrl}/inspections-herra-equipos/${id}/pdf`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al descargar el PDF: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
    descargarArchivo(blob, `herraequipo-${id}.pdf`);
  } catch (error) {
    console.error('Error al descargar el PDF de instancia:', error);
    throw error;
  }
}