"use client";

import { useCallback, useEffect, useState } from "react";
import {
  monitoreoAdapter,
  motivosDeError,
} from "../../infrastructure/adapters/monitoreoAdapter";
import type { FiltrosReportes, ReporteMonitoreo } from "../../domain/models/Monitoreo";

const SIN_FILTROS: FiltrosReportes = {};

type Datos = [ReporteMonitoreo[], ReporteMonitoreo[]];

/**
 * La lista de reportes con sus filtros, y aparte los **abiertos** (pendientes
 * de revisión y borradores) para las bandejas «Por revisar» y «Mis borradores»,
 * que no dependen de los filtros.
 */
export function useListaReportes() {
  const [filtros, setFiltros] = useState<FiltrosReportes>(SIN_FILTROS);
  const [reportes, setReportes] = useState<ReporteMonitoreo[]>([]);
  const [abiertos, setAbiertos] = useState<ReporteMonitoreo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string[] | null>(null);

  const consultar = useCallback(
    async (f: FiltrosReportes): Promise<Datos> => {
      const [lista, pendientes, borradores] = await Promise.all([
        monitoreoAdapter.reportes(f),
        monitoreoAdapter.reportes({ estado: "pendiente_revision" }),
        monitoreoAdapter.reportes({ estado: "borrador" }),
      ]);
      return [lista, [...pendientes, ...borradores]];
    },
    [],
  );
  const aplicar = useCallback(([lista, abiertosAhora]: Datos) => {
    setReportes(lista);
    setAbiertos(abiertosAhora);
    setError(null);
  }, []);
  const avisarFallo = useCallback((e: unknown) => setError(motivosDeError(e)), []);

  const buscar = useCallback(
    async (f: FiltrosReportes) => {
      setFiltros(f);
      setCargando(true);
      try {
        aplicar(await consultar(f));
      } catch (e) {
        avisarFallo(e);
      } finally {
        setCargando(false);
      }
    },
    [consultar, aplicar, avisarFallo],
  );

  useEffect(() => {
    let vigente = true;
    consultar(SIN_FILTROS)
      .then((d) => {
        if (vigente) aplicar(d);
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
  }, [consultar, aplicar, avisarFallo]);

  return { filtros, reportes, abiertos, cargando, error, buscar };
}
