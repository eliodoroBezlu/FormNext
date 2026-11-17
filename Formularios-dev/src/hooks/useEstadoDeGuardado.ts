"use client";

import { useCallback, useState } from "react";

export type EstadoDeGuardado = "inactivo" | "guardando" | "guardado";

/**
 * El estado de un botón de guardar: «Guardando…» mientras espera al servidor
 * y «✓ Guardado» un momento después, para que se note que el clic hizo algo.
 *
 * `guardar(accion)` devuelve `true` cuando la acción terminó bien (después de
 * mostrar «Guardado»); si la acción falla, el botón vuelve a su estado y el
 * error sigue su camino para que lo muestre quien llamó.
 */
export function useEstadoDeGuardado(msGuardado = 800) {
  const [estado, setEstado] = useState<EstadoDeGuardado>("inactivo");

  const guardar = useCallback(
    async (accion: () => Promise<unknown>): Promise<boolean> => {
      setEstado("guardando");
      try {
        await accion();
      } catch (error) {
        setEstado("inactivo");
        throw error;
      }
      setEstado("guardado");
      await new Promise((listo) => setTimeout(listo, msGuardado));
      setEstado("inactivo");
      return true;
    },
    [msGuardado],
  );

  return { estado, guardar };
}
