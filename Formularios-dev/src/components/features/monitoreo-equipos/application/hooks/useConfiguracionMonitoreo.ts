"use client";

import { useCallback, useEffect, useState } from "react";
import {
  monitoreoAdapter,
  motivosDeError,
} from "../../infrastructure/adapters/monitoreoAdapter";
import type {
  BombaResumen,
  Correlativo,
  PlantillaMonitoreo,
  ResultadoImportacion,
} from "../../domain/models/Monitoreo";

type Datos = [BombaResumen[], Correlativo[], PlantillaMonitoreo];

/** La carga de bombas, los correlativos y la plantilla. */
export function useConfiguracionMonitoreo() {
  const [bombas, setBombas] = useState<BombaResumen[]>([]);
  const [correlativos, setCorrelativos] = useState<Correlativo[]>([]);
  const [plantilla, setPlantilla] = useState<PlantillaMonitoreo | null>(null);
  const [revision, setRevision] = useState<ResultadoImportacion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string[] | null>(null);

  const consultar = useCallback(
    (): Promise<Datos> =>
      Promise.all([
        monitoreoAdapter.bombas(),
        monitoreoAdapter.correlativos(),
        monitoreoAdapter.plantilla(),
      ]),
    [],
  );
  const aplicar = useCallback(([b, c, p]: Datos) => {
    setBombas(b);
    setCorrelativos(c);
    setPlantilla(p);
    setError(null);
  }, []);
  const avisarFallo = useCallback((e: unknown) => setError(motivosDeError(e)), []);

  useEffect(() => {
    let vigente = true;
    consultar()
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

  /** Ejecuta una acción y recarga todo; el error queda a la vista. */
  const conRecarga = useCallback(
    async <T,>(accion: () => Promise<T>): Promise<T | undefined> => {
      setCargando(true);
      try {
        const r = await accion();
        aplicar(await consultar());
        return r;
      } catch (e) {
        avisarFallo(e);
        return undefined;
      } finally {
        setCargando(false);
      }
    },
    [consultar, aplicar, avisarFallo],
  );

  /** Sin aplicar: solo dice qué haría. */
  const revisarPlanilla = useCallback(
    async (archivo: File) => {
      const r = await conRecarga(() => monitoreoAdapter.importarPlanilla(archivo, false));
      setRevision(r ?? null);
    },
    [conRecarga],
  );

  const aplicarPlanilla = useCallback(
    async (archivo: File) => {
      const r = await conRecarga(() => monitoreoAdapter.importarPlanilla(archivo, true));
      setRevision(r ?? null);
    },
    [conRecarga],
  );

  const fijarCorrelativo = useCallback(
    (datos: { tecnica_codigo: string; anio: number; ultimo: number }) =>
      conRecarga(() => monitoreoAdapter.fijarCorrelativo(datos)),
    [conRecarga],
  );

  const guardarFotosPorFila = useCallback(
    (n: number) => conRecarga(() => monitoreoAdapter.guardarPlantilla(n)),
    [conRecarga],
  );

  const sembrarCatalogos = useCallback(
    () => conRecarga(() => monitoreoAdapter.sembrarCatalogos()),
    [conRecarga],
  );

  return {
    bombas,
    correlativos,
    plantilla,
    revision,
    setRevision,
    cargando,
    error,
    setError,
    revisarPlanilla,
    aplicarPlanilla,
    fijarCorrelativo,
    guardarFotosPorFila,
    sembrarCatalogos,
  };
}
