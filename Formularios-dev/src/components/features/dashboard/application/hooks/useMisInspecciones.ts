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
  /**
   * Combinación (vista · usuario · área) cuyos datos ya están pintados. De aquí
   * se derivan los tres indicadores de carga: mientras lo pintado no coincida
   * con lo pedido, se está cargando.
   *
   * Antes eran tres `useState(true)` que los efectos encendían de forma
   * síncrona. Derivarlos evita ese render de más y elimina la posibilidad de
   * que el indicador y los datos se desincronicen.
   */
  const [herraCargadoPara, setHerraCargadoPara] = useState<string | null>(null);
  const [errorHerra, setErrorHerra] = useState<string | null>(null);

  const [isoInstances, setIsoInstances] = useState<FormInstance[]>([]);
  const [isoCargadoPara, setIsoCargadoPara] = useState<string | null>(null);
  const [errorIso, setErrorIso] = useState<string | null>(null);

  const [emergencia, setEmergencia] = useState<InspeccionServiceExport[]>([]);
  const [emergenciaCargadaPara, setEmergenciaCargadaPara] = useState<
    string | null
  >(null);
  const [errorEmergencia, setErrorEmergencia] = useState<string | null>(null);

  // ── Herramientas y Equipos ──────────────────────────────────────────────
  const claveHerra = `${vista}|${username}|${area ?? ""}`;
  const claveIso = `${vista}|${username}|${area ?? ""}`;
  const claveEmergencia = `${vista}|${area ?? ""}`;

  const loadingHerra = herraCargadoPara !== claveHerra;
  const loadingIso = isoCargadoPara !== claveIso;
  const loadingEmergencia = emergenciaCargadaPara !== claveEmergencia;

  /**
   * Las tres cargas siguen la misma forma: un `consultar*` que **solo consulta
   * y devuelve** —sin tocar el estado— y un efecto que encadena su promesa.
   *
   * Encadenar es lo que hace la diferencia: si el efecto llamara a la función
   * `async`, el analizador rastrearía dentro de ella y vería sus setState como
   * una cascada de renders. Los casos que no necesitan red (una vista sin
   * área, por ejemplo) devuelven una lista vacía en vez de escribirla a mano,
   * así que también pasan por el mismo camino.
   */
  const consultarHerraEquipos = useCallback(async (): Promise<
    InspectionResponse[]
  > => {
    const filtros = vista === "mias" ? { submittedBy: username } : {};
    const result = await dashboardAdapter.getHerraEquiposInspections(filtros);
    if (!result.success || !result.data) {
      throw new Error("No se pudo cargar Herramientas y Equipos.");
    }
    if (vista === "area") {
      return area ? result.data.filter((i) => getArea(i) === area) : [];
    }
    return result.data;
  }, [vista, username, area]);

  useEffect(() => {
    let vigente = true;

    consultarHerraEquipos()
      .then((datos) => {
        if (!vigente) return;
        setHerraEquipos(datos);
        setErrorHerra(null);
      })
      .catch((err: unknown) => {
        if (!vigente) return;
        setErrorHerra(
          err instanceof Error
            ? err.message
            : "Error al cargar Herramientas y Equipos.",
        );
        setHerraEquipos([]);
      })
      .finally(() => {
        if (vigente) setHerraCargadoPara(claveHerra);
      });

    return () => {
      vigente = false;
    };
  }, [consultarHerraEquipos, claveHerra]);

  useEffect(() => {
    dashboardAdapter.getHerraEquiposTemplates().then((res) => {
      if (res.success && res.data) setHerraTemplates(Array.isArray(res.data) ? res.data : []);
    });
  }, []);

  // ── IRO-ISOP ─────────────────────────────────────────────────────────────
  const consultarIso = useCallback(async (): Promise<FormInstance[]> => {
    const filtros =
      vista === "mias"
        ? { createdBy: username, limit: AREA_FETCH_LIMIT }
        : area
          ? { area, limit: AREA_FETCH_LIMIT }
          : null;
    // Sin filtros no hay nada que pedir: la lista vacía es el resultado.
    if (!filtros) return [];

    const result = await dashboardAdapter.getIsoInstances(filtros);
    if (!result.success || !result.data) {
      throw new Error("No se pudo cargar IRO-ISOP.");
    }
    return result.data.data;
  }, [vista, username, area]);

  useEffect(() => {
    let vigente = true;

    consultarIso()
      .then((datos) => {
        if (!vigente) return;
        setIsoInstances(datos);
        setErrorIso(null);
      })
      .catch((err: unknown) => {
        if (!vigente) return;
        setErrorIso(
          err instanceof Error ? err.message : "Error al cargar IRO-ISOP.",
        );
        setIsoInstances([]);
      })
      .finally(() => {
        if (vigente) setIsoCargadoPara(claveIso);
      });

    return () => {
      vigente = false;
    };
  }, [consultarIso, claveIso]);

  // ── Sistemas de Emergencia (solo vista "de mi área") ───────────────────
  const consultarEmergencia = useCallback(async (): Promise<
    InspeccionServiceExport[]
  > => {
    // Fuera de la vista "de mi área" esta fuente no aplica.
    if (vista !== "area" || !area) return [];

    const data = await dashboardAdapter.getEmergenciaReport({ area });
    return Array.isArray(data) ? data : [];
  }, [vista, area]);

  useEffect(() => {
    let vigente = true;

    consultarEmergencia()
      .then((datos) => {
        if (!vigente) return;
        setEmergencia(datos);
        setErrorEmergencia(null);
      })
      .catch(() => {
        if (!vigente) return;
        setErrorEmergencia("Error al cargar Sistemas de Emergencia.");
        setEmergencia([]);
      })
      .finally(() => {
        if (vigente) setEmergenciaCargadaPara(claveEmergencia);
      });

    return () => {
      vigente = false;
    };
  }, [consultarEmergencia, claveEmergencia]);

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
