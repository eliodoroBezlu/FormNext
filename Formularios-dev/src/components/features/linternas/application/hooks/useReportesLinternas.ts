"use client";

import { useCallback, useEffect, useState } from "react";
import { linternasAdapter } from "../../infrastructure/adapters/linternasAdapter";
import type {
  EntregaLinterna,
  FilaPorArea,
  FilaPorTrabajador,
  ResumenLinternas,
  TrabajadorSinDotacion,
} from "../../domain/models/Linterna";

const RESUMEN_VACIO: ResumenLinternas = {
  totalTrabajadores: 0,
  conDotacion: 0,
  sinDotacion: 0,
  totalCambios: 0,
  totalPerdidas: 0,
  perdidasPendientes: 0,
  stockDisponible: 0,
  ingresadas: 0,
  entregadas: 0,
};

export function useReportesLinternas() {
  const [resumen, setResumen] = useState<ResumenLinternas>(RESUMEN_VACIO);
  const [porArea, setPorArea] = useState<FilaPorArea[]>([]);
  const [porTrabajador, setPorTrabajador] = useState<FilaPorTrabajador[]>([]);
  const [sinDotacion, setSinDotacion] = useState<TrabajadorSinDotacion[]>([]);
  const [perdidas, setPerdidas] = useState<EntregaLinterna[]>([]);
  const [cargando, setCargando] = useState(true);

  /** Solo consulta y devuelve; no toca el estado. */
  const consultar = useCallback(
    (filtros?: { desde?: string; hasta?: string }) =>
      // En paralelo: son consultas independientes y encadenarlas multiplicaría
      // la espera sin ganar nada.
      Promise.all([
        linternasAdapter.resumen(),
        linternasAdapter.porArea(),
        linternasAdapter.porTrabajador(),
        linternasAdapter.sinDotacion(),
        linternasAdapter.perdidas(filtros),
      ]),
    [],
  );

  const aplicar = useCallback(
    ([r, a, t, s, p]: Awaited<ReturnType<typeof consultar>>) => {
      setResumen(r);
      setPorArea(a);
      setPorTrabajador(t);
      setSinDotacion(s);
      setPerdidas(p);
    },
    [],
  );

  /** Recarga a petición, con el indicador encendido. */
  const refrescar = useCallback(
    async (filtros?: { desde?: string; hasta?: string }) => {
      setCargando(true);
      try {
        aplicar(await consultar(filtros));
      } finally {
        setCargando(false);
      }
    },
    [consultar, aplicar],
  );

  useEffect(() => {
    // `cargando` ya nace en `true`; los setState van en los callbacks.
    let vigente = true;

    consultar()
      .then((datos) => {
        if (vigente) aplicar(datos);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [consultar, aplicar]);

  return {
    resumen,
    porArea,
    porTrabajador,
    sinDotacion,
    perdidas,
    cargando,
    refrescar,
  };
}
