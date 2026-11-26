"use client";

import { useCallback, useEffect, useState } from "react";
import {
  monitoreoAdapter,
  motivosDeError,
} from "../../infrastructure/adapters/monitoreoAdapter";
import type {
  BombaResumen,
  Catalogos,
  Coordinador,
  PlantillaMedicion,
} from "../../domain/models/Monitoreo";

/** Mientras no se configure, la plantilla arranca en 3 fotos por fila. */
const FOTOS_POR_FILA_POR_DEFECTO = 3;

const VACIOS: Catalogos = {
  tecnica: [],
  grupo_trabajo: [],
  prioridad_jde: [],
  severidad: [],
  fabricante: [],
  proveedor: [],
  condicion_inicial: [],
  tipo_intervencion: [],
  instrumento: [],
  punto_referencia: [],
};

/**
 * Las listas del reporte, las bombas, las plantillas de medición (sus tags
 * también se reportan) y los supervisores y superintendentes, para los
 * selectores.
 */
export function useCatalogosMonitoreo() {
  const [catalogos, setCatalogos] = useState<Catalogos>(VACIOS);
  const [bombas, setBombas] = useState<BombaResumen[]>([]);
  const [plantillasMedicion, setPlantillasMedicion] = useState<PlantillaMedicion[]>([]);
  const [coordinadores, setCoordinadores] = useState<Coordinador[]>([]);
  const [fotosPorFila, setFotosPorFila] = useState(FOTOS_POR_FILA_POR_DEFECTO);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string[] | null>(null);

  const consultar = useCallback(
    () =>
      Promise.all([
        monitoreoAdapter.catalogos(),
        monitoreoAdapter.bombas(),
        monitoreoAdapter.plantilla(),
        monitoreoAdapter.plantillasMedicion(),
        monitoreoAdapter.coordinadores(),
      ]),
    [],
  );
  const aplicar = useCallback(([c, b, p, m, k]: Awaited<ReturnType<typeof consultar>>) => {
    setCatalogos(c);
    setBombas(b);
    setFotosPorFila(p.fotos_por_fila);
    setPlantillasMedicion(m);
    setCoordinadores(k);
    setError(null);
  }, []);
  const avisarFallo = useCallback((e: unknown) => setError(motivosDeError(e)), []);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      aplicar(await consultar());
    } catch (e) {
      avisarFallo(e);
    } finally {
      setCargando(false);
    }
  }, [consultar, aplicar, avisarFallo]);

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

  /** El color de una severidad, como el formato condicional del Excel. */
  const colorDeResultado = useCallback(
    (resultado?: string) => catalogos.severidad.find((s) => s.valor === resultado)?.color,
    [catalogos.severidad],
  );

  return {
    catalogos,
    bombas,
    plantillasMedicion,
    coordinadores,
    fotosPorFila,
    cargando,
    error,
    recargar,
    colorDeResultado,
  };
}
