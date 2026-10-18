"use client";

import { useCallback, useEffect, useState } from "react";
import {
  monitoreoAdapter,
  motivosDeError,
} from "../../infrastructure/adapters/monitoreoAdapter";
import { numero, payloadDesdeValores, type ValoresReporte } from "../../domain/formularioReporte";
import type {
  AntecedentesReporte,
  ReporteMonitoreo,
  UsoDeImagen,
} from "../../domain/models/Monitoreo";

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
        if (vigente) setPrellenado(p.antecedentes);
      })
      .catch((e: unknown) => {
        if (vigente) avisarFallo(e);
      });
    return () => {
      vigente = false;
    };
  }, [id, tagInicial, avisarFallo]);

  /** Los antecedentes de la bomba para un reporte nuevo, sin guardar nada. */
  const prellenar = useCallback(
    async (tag: string, fecha: string, horas: string): Promise<AntecedentesReporte | null> => {
      if (!tag) {
        setPrellenado(null);
        return null;
      }
      try {
        const p = await monitoreoAdapter.prellenado(tag, fecha || undefined, numero(horas));
        setPrellenado(p.antecedentes);
        return p.antecedentes;
      } catch (e) {
        setPrellenado(null);
        setError(motivosDeError(e));
        return null;
      }
    },
    [],
  );

  /** Crea o actualiza, según si ya existe. */
  const guardar = useCallback(
    async (valores: ValoresReporte): Promise<ReporteMonitoreo> => {
      const payload = payloadDesdeValores(valores);
      const guardado = reporte
        ? await monitoreoAdapter.actualizar(reporte._id, payload)
        : await monitoreoAdapter.crear(payload);
      setReporte(guardado);
      return guardado;
    },
    [reporte],
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
