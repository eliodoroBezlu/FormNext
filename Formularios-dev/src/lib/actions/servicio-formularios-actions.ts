"use server";

import { API_BASE_URL } from "../constants";
import { getAuthHeaders } from "./helpers";

export type TokenDelServicio =
  | { ok: true; token: string; venceEn: string }
  | { ok: false; mensaje: string };

/**
 * Token corto (15 min) para el servicio de formularios, firmado por el backend
 * con la clave del proyecto `forms`. El secreto nunca llega al navegador: solo
 * el token. Devuelve el motivo en vez de lanzar, para que la pantalla lo muestre
 * (un error lanzado desde una Server Action llega sin mensaje en producción).
 */
export async function pedirTokenDelServicio(): Promise<TokenDelServicio> {
  try {
    const headers = await getAuthHeaders();
    const respuesta = await fetch(`${API_BASE_URL}/servicio-formularios/token`, {
      method: "POST",
      headers,
      cache: "no-store",
    });
    const cuerpo = (await respuesta.json().catch(() => ({}))) as {
      token?: string;
      venceEn?: string;
      mensaje?: string;
      message?: string;
    };
    if (!respuesta.ok || !cuerpo.token) {
      return {
        ok: false,
        mensaje:
          cuerpo.mensaje ??
          cuerpo.message ??
          `El backend no entregó el token (HTTP ${respuesta.status})`,
      };
    }
    return { ok: true, token: cuerpo.token, venceEn: cuerpo.venceEn ?? "" };
  } catch (error) {
    return {
      ok: false,
      mensaje: error instanceof Error ? error.message : "No se pudo pedir el token",
    };
  }
}
