"use server"


// Helper para manejar respuestas de API
export async function handleApiResponse<T >(response: Response): Promise<T> {
  if (!response.ok) {
    // Primero intentar obtener el texto completo (más robusto)
    const errorText = await response.text().catch(() => '');
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    
    if (errorText) {
      try {
        // Intentar parsear como JSON para obtener mensaje estructurado
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        // Si no es JSON válido, usar el texto tal como viene
        // Esto maneja casos donde el servidor devuelve texto plano
        errorMessage = errorText.length > 200 
          ? `${errorText.substring(0, 200)}...` 
          : errorText;
      }
    }
    
    throw new Error(errorMessage);
  }

  // Manejar diferentes tipos de respuesta exitosa
  const contentType = response.headers.get('content-type');
  
  // Respuesta vacía (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }
  
  // Si es JSON, parsearlo
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  
  // Si es un blob (archivos), retornarlo como tal
  if (contentType && (
    contentType.includes('application/pdf') ||
    contentType.includes('application/vnd.openxmlformats') ||
    contentType.includes('image/') ||
    contentType.includes('text/csv') ||
    contentType.includes('application/octet-stream')
  )) {
    return response.blob() as T;
  }
  
  // Por defecto, intentar JSON
  try {
    return response.json();
  } catch {
    // Si falla, retornar como texto
    return response.text() as T;
  }
}



