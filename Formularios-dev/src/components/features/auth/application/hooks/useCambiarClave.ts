"use client";

import { useCallback } from "react";
import { authAdapter } from "../../infrastructure/adapters/authAdapter";
import type { CambioClaveDatos } from "../../domain/schemas/cambioClave.schema";

/** Qué hacer con un rechazo: marcar un campo o mostrarlo arriba del formulario. */
export type ResultadoCambioClave =
  | { ok: true }
  | { ok: false; campo?: "actual" | "nueva"; mensaje: string };

/** Adónde se va al terminar: la pantalla de entrada, con el aviso. */
export const DESTINO_TRAS_CAMBIO = "/?clave=cambiada";

/**
 * Envía el cambio de contraseña al IAM y traduce la respuesta para el
 * formulario.
 *
 * Al salir bien no hay sesión que conservar: el IAM cerró todas, también esta.
 * Se navega con recarga completa (no con el router) para que no quede nada en
 * memoria de la sesión anterior, como el usuario que guarda `useUserRole`.
 */
export function useCambiarClave() {
  const cambiar = useCallback(
    async (datos: CambioClaveDatos): Promise<ResultadoCambioClave> => {
      const r = await authAdapter.cambiarClave(datos.actual, datos.nueva);

      if (r.success) {
        window.location.assign(DESTINO_TRAS_CAMBIO);
        return { ok: true };
      }

      const status = (r.data as { status?: number } | undefined)?.status;
      const mensaje = r.error ?? "No se pudo cambiar la contraseña";

      if (status === 429) {
        return {
          ok: false,
          mensaje: "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.",
        };
      }
      if (/actual incorrecta/i.test(mensaje)) {
        return { ok: false, campo: "actual", mensaje: "La contraseña actual no es correcta" };
      }
      // Reglas de la nueva o «debe ser distinta de la actual».
      if (/contraseña (nueva|debe)/i.test(mensaje)) {
        return { ok: false, campo: "nueva", mensaje };
      }
      return { ok: false, mensaje };
    },
    [],
  );

  return { cambiar };
}
