"use server";

import { getAuthHeaders, handleApiResponse } from "@/lib/actions/helpers";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

interface UploadResponse {
  url: string;
  path: string;
}

export async function uploadFile(
  formData: FormData
): Promise<UploadResponse> {
  try {
    // Para FormData no fijamos Content-Type (el navegador define el boundary
    // multipart), pero sí hay que reenviar la cookie de sesión — la API
    // autentica por cookie `access_token`, no por header Authorization.
    const authHeaders = await getAuthHeaders();
    const headers: Record<string, string> = {};
    if (authHeaders.Cookie) headers.Cookie = authHeaders.Cookie;

    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    return await handleApiResponse<UploadResponse>(response);
  } catch (error) {
    console.error("❌ Error en uploadFile:", error);
    throw error;
  }
}
