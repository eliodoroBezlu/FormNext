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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await obtenerPgrPorId(id);
      setPgr(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cargar el plan PGR",
      );
      setPgr(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { pgr, setPgr, isLoading, error, reload };
}
