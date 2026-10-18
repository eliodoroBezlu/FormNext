"use client";

import { useCallback, useEffect, useState } from "react";
import {
  monitoreoAdapter,
  motivosDeError,
} from "../../infrastructure/adapters/monitoreoAdapter";
import type { FichaBomba } from "../../domain/models/Monitoreo";

/** La ficha de una bomba con su historial de piezas, intervenciones y reportes. */
export function useFichaBomba(tag: string) {
  const [ficha, setFicha] = useState<FichaBomba | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string[] | null>(null);

  const consultar = useCallback((t: string) => monitoreoAdapter.fichaBomba(t), []);
  const aplicar = useCallback((f: FichaBomba) => {
    setFicha(f);
    setError(null);
  }, []);
  const avisarFallo = useCallback((e: unknown) => setError(motivosDeError(e)), []);

  useEffect(() => {
    let vigente = true;
    consultar(tag)
      .then((f) => {
        if (vigente) aplicar(f);
      })
      .catch((e: unknown) => {
        if (vigente) avisarFallo(e);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [tag, consultar, aplicar, avisarFallo]);

  return { ficha, cargando, error };
}
