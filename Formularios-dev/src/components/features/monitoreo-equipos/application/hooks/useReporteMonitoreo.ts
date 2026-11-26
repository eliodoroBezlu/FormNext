"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  monitoreoAdapter,
  motivosDeError,
} from "../../infrastructure/adapters/monitoreoAdapter";
import { numero, payloadDesdeValores, type ValoresReporte } from "../../domain/formularioReporte";
import type {
  AntecedentesReporte,
  DiagramaDeMedicion,
  EstructuraDeMedicion,
  PlantillaMedicion,
  ReporteMonitoreo,
  UsoDeImagen,
} from "../../domain/models/Monitoreo";

/** La grilla con que se carga el reporte y los diagramas del equipo. */
export interface MedicionEnPantalla {
  estructura: EstructuraDeMedicion;
  diagramas: DiagramaDeMedicion[];
  /** La técnica de la plantilla: la del reporte, si todavía no tiene. */
  tecnica?: string;
}

/**
 * Un reporte: cargarlo, guardarlo y moverlo de estado.
 *
 * Sin `id` es un reporte nuevo: no hay nada que cargar y el primer guardado
 * lo crea. Con `tagInicial` (se llega desde la ficha de una bomba) sus
 * antecedentes se piden de entrada. Las acciones devuelven el reporte actualizado o lanzan
 * `ErrorMonitoreo`, con todos los motivos del servidor.
 */
export function useReporteMonitoreo(id?: string, tagInicial?: string) {
  const [reporte, setReporte] = useState<ReporteMonitoreo | null>(null);
  /** Antecedentes de un reporte que todavía no se guardó (prellenado). */
  const [prellenado, setPrellenado] = useState<AntecedentesReporte | null>(null);
  /** La plantilla de medición del tag y la técnica elegidos, antes de guardar. */
  const [plantilla, setPlantilla] = useState<PlantillaMedicion | null>(null);
  const [cargando, setCargando] = useState(!!id);
  const [error, setError] = useState<string[] | null>(null);

  const consultar = useCallback((rid: string) => monitoreoAdapter.reporte(rid), []);
  const aplicar = useCallback((r: ReporteMonitoreo) => {
    setReporte(r);
    setError(null);
  }, []);
  const avisarFallo = useCallback((e: unknown) => setError(motivosDeError(e)), []);

  useEffect(() => {
    if (!id) return;
    let vigente = true;
    consultar(id)
      .then((r) => {
        if (vigente) aplicar(r);
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
  }, [id, consultar, aplicar, avisarFallo]);

  useEffect(() => {
    if (id || !tagInicial) return;
    let vigente = true;
    monitoreoAdapter
      .prellenado(tagInicial)
      .then((p) => {
        if (vigente) {
          setPrellenado(p.antecedentes);
          setPlantilla(p.plantilla_medicion);
        }
      })
      .catch((e: unknown) => {
        if (vigente) avisarFallo(e);
      });
    return () => {
      vigente = false;
    };
  }, [id, tagInicial, avisarFallo]);

  /**
   * Los antecedentes del equipo y, si el tag y la técnica la tienen, la
   * plantilla de medición, sin guardar nada.
   */
  const prellenar = useCallback(
    async (
      tag: string,
      fecha: string,
      horas: string,
      tecnica: string,
    ): Promise<AntecedentesReporte | null> => {
      if (!tag) {
        setPrellenado(null);
        setPlantilla(null);
        return null;
      }
      try {
        const p = await monitoreoAdapter.prellenado(
          tag,
          fecha || undefined,
          numero(horas),
          tecnica,
        );
        setPrellenado(p.antecedentes);
        setPlantilla(p.plantilla_medicion);
        setError(null);
        return p.antecedentes;
      } catch (e) {
        setPrellenado(null);
        setPlantilla(null);
        setError(motivosDeError(e));
        return null;
      }
    },
    [],
  );

  // La que ya tiene el reporte manda; si no tiene, la de su tag y técnica.
  const delReporte = reporte?.medicion;
  const medicion = useMemo<MedicionEnPantalla | null>(() => {
    if (delReporte) return { estructura: delReporte.estructura, diagramas: delReporte.diagramas };
    if (!plantilla) return null;
    return {
      estructura: { titulo: plantilla.titulo, piezas: plantilla.piezas },
      diagramas: plantilla.diagramas,
      tecnica: plantilla.tecnica,
    };
  }, [delReporte, plantilla]);
  const conMedicion = medicion !== null;

  /** Crea o actualiza, según si ya existe. */
  const guardar = useCallback(
    async (valores: ValoresReporte): Promise<ReporteMonitoreo> => {
      const payload = payloadDesdeValores(valores, conMedicion);
      const guardado = reporte
        ? await monitoreoAdapter.actualizar(reporte._id, payload)
        : await monitoreoAdapter.crear(payload);
      setReporte(guardado);
      return guardado;
    },
    [reporte, conMedicion],
  );

  /** Guarda lo último y lo envía: el revisor recibe lo que se ve en pantalla. */
  const enviar = useCallback(
    async (valores: ValoresReporte) => {
      const guardado = await guardar(valores);
      const enviado = await monitoreoAdapter.enviar(guardado._id);
      setReporte(enviado);
      return enviado;
    },
    [guardar],
  );

  const conReporte = useCallback(
    async (accion: (rid: string) => Promise<ReporteMonitoreo>) => {
      if (!reporte) throw new Error("El reporte todavía no se guardó.");
      const r = await accion(reporte._id);
      setReporte(r);
      return r;
    },
    [reporte],
  );

  const devolver = useCallback(
    (motivo: string) => conReporte((rid) => monitoreoAdapter.devolver(rid, motivo)),
    [conReporte],
  );
  const emitir = useCallback(() => conReporte(monitoreoAdapter.emitir), [conReporte]);
  const darDeBaja = useCallback(() => conReporte(monitoreoAdapter.darDeBaja), [conReporte]);

  const subirImagen = useCallback(
    (archivo: File, uso: UsoDeImagen) => monitoreoAdapter.subirImagen(archivo, uso),
    [],
  );

  return {
    reporte,
    antecedentes: reporte?.antecedentes ?? prellenado,
    medicion,
    cargando,
    error,
    setError,
    prellenar,
    guardar,
    enviar,
    devolver,
    emitir,
    darDeBaja,
    subirImagen,
  };
}
