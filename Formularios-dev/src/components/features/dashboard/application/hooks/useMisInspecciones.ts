"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FormInstance, InspeccionServiceExport } from "@/types/formTypes";
import { getArea } from "@/lib/utils/herra-equipos-fields";
import {
  dashboardAdapter,
  type InspectionResponse,
  type TemplateHerraEquipo,
} from "../../infrastructure/adapters/dashboardAdapter";
import {
  AREA_FETCH_LIMIT,
  Folder,
  groupByFolder,
  Vista,
} from "../../domain/models/dashboardModels";

/**
 * Orquesta la carga, filtrado y agrupamiento en carpetas de las tres
 * fuentes de datos que consume MisInspeccionesView (Herramientas y
 * Equipos, IRO-ISOP y, en la vista "de mi área", Sistemas de Emergencia).
 */
export function useMisInspecciones(username: string, area?: string) {
  const [vista, setVista] = useState<Vista>("mias");

  const [herraEquipos, setHerraEquipos] = useState<InspectionResponse[]>([]);
  const [herraTemplates, setHerraTemplates] = useState<TemplateHerraEquipo[]>([]);
  const [loadingHerra, setLoadingHerra] = useState(true);
  const [errorHerra, setErrorHerra] = useState<string | null>(null);

  const [isoInstances, setIsoInstances] = useState<FormInstance[]>([]);
  const [loadingIso, setLoadingIso] = useState(true);
  const [errorIso, setErrorIso] = useState<string | null>(null);

  const [emergencia, setEmergencia] = useState<InspeccionServiceExport[]>([]);
  const [loadingEmergencia, setLoadingEmergencia] = useState(true);
  const [errorEmergencia, setErrorEmergencia] = useState<string | null>(null);

  // ── Herramientas y Equipos ──────────────────────────────────────────────
  const cargarHerraEquipos = useCallback(async () => {
    setLoadingHerra(true);
    setErrorHerra(null);
    try {
      const filtros = vista === "mias" ? { submittedBy: username } : {};
      const result = await dashboardAdapter.getHerraEquiposInspections(filtros);
      if (!result.success || !result.data) {
        setErrorHerra("No se pudo cargar Herramientas y Equipos.");
        setHerraEquipos([]);
        return;
      }
      const data =
        vista === "area" && area
          ? result.data.filter((i) => getArea(i) === area)
          : vista === "area"
            ? []
            : result.data;
      setHerraEquipos(data);
    } catch {
      setErrorHerra("Error al cargar Herramientas y Equipos.");
      setHerraEquipos([]);
    } finally {
      setLoadingHerra(false);
    }
  }, [vista, username, area]);

  useEffect(() => {
    cargarHerraEquipos();
  }, [cargarHerraEquipos]);

  useEffect(() => {
    dashboardAdapter.getHerraEquiposTemplates().then((res) => {
      if (res.success && res.data) setHerraTemplates(Array.isArray(res.data) ? res.data : []);
    });
  }, []);

  // ── IRO-ISOP ─────────────────────────────────────────────────────────────
  const cargarIso = useCallback(async () => {
    setLoadingIso(true);
    setErrorIso(null);
    try {
      const filtros =
        vista === "mias"
          ? { createdBy: username, limit: AREA_FETCH_LIMIT }
          : area
            ? { area, limit: AREA_FETCH_LIMIT }
            : null;
      if (!filtros) {
        setIsoInstances([]);
        return;
      }
      const result = await dashboardAdapter.getIsoInstances(filtros);
      if (!result.success || !result.data) {
        setErrorIso("No se pudo cargar IRO-ISOP.");
        setIsoInstances([]);
        return;
      }
      setIsoInstances(result.data.data);
    } catch {
      setErrorIso("Error al cargar IRO-ISOP.");
      setIsoInstances([]);
    } finally {
      setLoadingIso(false);
    }
  }, [vista, username, area]);

  useEffect(() => {
    cargarIso();
  }, [cargarIso]);

  // ── Sistemas de Emergencia (solo vista "de mi área") ───────────────────
  const cargarEmergencia = useCallback(async () => {
    if (vista !== "area" || !area) {
      setEmergencia([]);
      setLoadingEmergencia(false);
      return;
    }
    setLoadingEmergencia(true);
    setErrorEmergencia(null);
    try {
      const data = await dashboardAdapter.getEmergenciaReport({ area });
      setEmergencia(Array.isArray(data) ? data : []);
    } catch {
      setErrorEmergencia("Error al cargar Sistemas de Emergencia.");
      setEmergencia([]);
    } finally {
      setLoadingEmergencia(false);
    }
  }, [vista, area]);

  useEffect(() => {
    cargarEmergencia();
  }, [cargarEmergencia]);

  // ── KPIs (sobre la vista activa) ────────────────────────────────────────
  const totalActivo =
    herraEquipos.length + isoInstances.length + (vista === "area" ? emergencia.length : 0);
  const cargandoAlgo = loadingHerra || loadingIso || (vista === "area" && loadingEmergencia);

  // ── Carpetas herra-equipos ───────────────────────────────────────────────
  const carpetasHerra: Folder<InspectionResponse>[] = useMemo(
    () =>
      groupByFolder(
        herraEquipos,
        (i) => i.templateCode,
        (i) => herraTemplates.find((t) => t.code === i.templateCode)?.name || i.templateName || i.templateCode,
      ),
    [herraEquipos, herraTemplates],
  );

  // ── Carpetas IRO-ISOP ─────────────────────────────────────────────────────
  const carpetasIso: Folder<FormInstance>[] = useMemo(
    () =>
      groupByFolder(
        isoInstances,
        (i) => (typeof i.templateId === "object" ? (i.templateId as unknown as { _id: string })._id : i.templateId),
        (i) => (typeof i.templateId === "object" ? (i.templateId as unknown as { name: string }).name : "Sin tipo"),
      ),
    [isoInstances],
  );

  const downloadHerraEquipoPdf = useCallback((id: string) => dashboardAdapter.downloadHerraEquipoPdf(id), []);
  const downloadIroIsopPdf = useCallback((id: string) => dashboardAdapter.downloadIroIsopPdf(id), []);
  const downloadEmergenciaPdf = useCallback((id: string) => dashboardAdapter.downloadEmergenciaPdf(id), []);

  return {
    vista,
    setVista,

    herraEquipos,
    loadingHerra,
    errorHerra,
    carpetasHerra,

    isoInstances,
    loadingIso,
    errorIso,
    carpetasIso,

    emergencia,
    loadingEmergencia,
    errorEmergencia,

    totalActivo,
    cargandoAlgo,

    downloadHerraEquipoPdf,
    downloadIroIsopPdf,
    downloadEmergenciaPdf,
  };
}
