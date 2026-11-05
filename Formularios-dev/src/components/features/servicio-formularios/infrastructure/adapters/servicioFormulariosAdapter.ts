import {
  pedirTokenDelServicio,
  type TokenDelServicio,
} from "@/lib/actions/servicio-formularios-actions";

export type { TokenDelServicio };

/** Pide al backend de forms un token para el servicio de formularios. */
export function obtenerTokenDelServicio(): Promise<TokenDelServicio> {
  return pedirTokenDelServicio();
}

/** Dónde vive la web del servicio. Sin la variable, la pestaña lo explica. */
export const WEB_DEL_SERVICIO = process.env.NEXT_PUBLIC_FORMULARIOS_WEB_URL ?? "";
