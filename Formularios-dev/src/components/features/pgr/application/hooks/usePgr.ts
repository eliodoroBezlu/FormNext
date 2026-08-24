"use client";

import { useCallback, useEffect, useState } from "react";
import { obtenerPgrPorId } from "../../infrastructure/adapters/pgrAdapter";
import { Pgr } from "../../domain/models/IProps";

/**
 * Hook compartido para cargar un único PGR por id.
 * Unifica el boilerplate duplicado en `[id]/page.tsx`, `aprobacion/[id]/page.tsx`
 * y `seguimiento/[id]/page.tsx` (fetch + loading + error + not-found).
 */
export function usePgr(id: string) {
  const [pgr, setPgr] = useState<Pgr | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Id cuyos datos ya están cargados. De aquí se deriva el indicador de carga:
   * mientras lo cargado no corresponda al id pedido, se está cargando.
   *
   * Antes era un `useState(true)` que el efecto ponía a `true` de forma
   * síncrona. Derivarlo evita ese render de más y, de paso, acierta también
   * cuando cambia el `id` sin desmontar el componente.
   */
  const [idCargado, setIdCargado] = useState<string | null>(null);
  const isLoading = idCargado !== id;

  const aplicarDatos = useCallback((data: Pgr) => {
    setPgr(data);
    setError(null);
  }, []);

  const aplicarFallo = useCallback((err: unknown) => {
    setError(
      err instanceof Error ? err.message : "No se pudo cargar el plan PGR",
    );
    setPgr(null);
  }, []);

  /** Recarga a petición, mostrando el indicador mientras tanto. */
  const reload = useCallback(async () => {
    setIdCargado(null);
    try {
      aplicarDatos(await obtenerPgrPorId(id));
    } catch (err) {
      aplicarFallo(err);
    } finally {
      setIdCargado(id);
    }
  }, [id, aplicarDatos, aplicarFallo]);

  useEffect(() => {
    // La promesa se encadena aquí, en vez de llamar a una función `async`: el
    // analizador rastrea dentro de la función y vería sus setState como
    // síncronos. Dentro de `.then`/`.catch`/`.finally` son correctos.
    let vigente = true;

    obtenerPgrPorId(id)
      .then((data) => {
        if (vigente) aplicarDatos(data);
      })
      .catch((err: unknown) => {
        if (vigente) aplicarFallo(err);
      })
      .finally(() => {
        if (vigente) setIdCargado(id);
      });

    return () => {
      vigente = false;
    };
  }, [id, aplicarDatos, aplicarFallo]);

  return { pgr, setPgr, isLoading, error, reload };
}
