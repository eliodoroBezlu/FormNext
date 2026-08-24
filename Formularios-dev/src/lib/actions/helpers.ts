// lib/actions/helpers.ts
"use server";

import { cookies } from "next/headers";

/**
 * Obtiene los headers de autenticación para llamadas al backend.
 * 
 * IMPORTANTE: Esta función NO hace refresh porque el Middleware ya lo maneja.
 * Si no hay access_token aquí, simplemente lanzamos un error y dejamos que 
 * el Middleware (en la próxima navegación) maneje la redirección.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  console.log("🔍 [HEADERS] Estado de token:", {
    accessToken: accessToken ? `✅ ${accessToken.slice(0, 15)}...` : "❌ AUSENTE",
  });

  // Si no hay access token, lanzar error
  // El Middleware manejará la redirección en la próxima navegación
  if (!accessToken) {
    console.error("❌ [HEADERS] Sin access token");
    throw new Error("Sesión expirada. Por favor, recarga la página.");
  }

  return {
    "Content-Type": "application/json",
    Cookie: `access_token=${accessToken}`,
  };
}

/**
 * Maneja la respuesta de una llamada a la API.
 * Parsea JSON, maneja errores.
 * 
 * IMPORTANTE: Si recibe 401, NO redirige. Solo lanza un error.
 * El usuario verá el error en la UI y al recargar la página,
 * el Middleware manejará el refresh/redirección.
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  console.log("📨 [API] Respuesta:", {
    status: response.status,
    ok: response.ok,
    url: response.url,
  });

  // Si recibimos 401, lanzar error amigable
  if (response.status === 401) {
    console.error("🔒 [API] 401 → Token expiró durante la acción");
    throw new Error(
      "Tu sesión expiró mientras se procesaba la acción. Por favor, recarga la página e intenta nuevamente."
    );
  }

  // Manejar otros errores HTTP
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    
    try {
      const errorData = await response.json();
      /**
       * `mensaje` va primero porque es lo que emite el filtro de errores del
       * backend (`{ statusCode, mensaje, ruta, momento, idPeticion }`).
       * Mirando solo `message`/`error`, todo motivo explicado por el servidor
       * —«la fecha no puede ser anterior a hoy», «ese arnés ya está en otro
       * préstamo»— se perdía y al usuario le llegaba un «HTTP 400» pelado.
       *
       * `message` se conserva detrás: es lo que devuelve Nest cuando el fallo
       * ocurre antes del filtro, como en los errores de validación del DTO.
       */
      errorMessage =
        errorData.mensaje || errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = (await response.text().catch(() => "")) || errorMessage;
    }
    
    console.error(`❌ [API] Error:`, errorMessage);
    throw new Error(errorMessage);
  }

  // Parsear respuesta según Content-Type
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }
  
  if (contentType.includes("text/")) {
    return response.text() as unknown as T;
  }
  
  if (contentType.includes("image/") || contentType.includes("application/pdf")) {
    return response.blob() as unknown as T;
  }

  // Fallback: intentar parsear como JSON
  try {
    return response.json();
  } catch {
    return {} as T;
  }
}

