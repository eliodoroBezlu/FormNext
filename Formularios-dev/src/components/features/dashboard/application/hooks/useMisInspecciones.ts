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
  Tecnico,
  Vista,
} from "../../domain/models/dashboardModels";
import {
  enPeriodo,
  filasEmergencia,
  periodoInicial,
  type FilaEmergencia,
  type Periodo,
} from "../../domain/models/carpetaVirtual";
import { mensajeParaUsuario } from "@/lib/errores/mensajeParaUsuario";

/**
 * Estado de una fuente: lo pintado vale para la combinación de filtros `clave`. Mientras la clave
 * pedida no coincida con la pintada, se está cargando (sin `useState(true)` que encender a mano).
 */
interface Fuente<T> {
  clave: string | null;
  datos: T[];
  error: string | null;
}
const VACIA = { clave: null, datos: [], error: null };

/**
 * Carga una fuente cada vez que cambia su `clave`. `consultar` **solo consulta y devuelve**: el
 * efecto encadena la promesa, así el analizador no ve sus setState como una cascada de renders.
 */
function useFuente<T>(clave: string, consultar: () => Promise<T[]>, mensajeDeError: string) {
  const [fuente, setFuente] = useState<Fuente<T>>(VACIA);
  useEffect(() => {
    let vigente = true;
    consultar()
      .then((datos) => {
        if (vigente) setFuente({ clave, datos, error: null });
      })
      .catch((err: unknown) => {
        if (vigente) setFuente({ clave, datos: [], error: mensajeParaUsuario(err, mensajeDeError) });
      });
    return () => {
      vigente = false;
    };
  }, [clave, consultar, mensajeDeError]);
  return { datos: fuente.datos, error: fuente.error, cargando: fuente.clave !== clave };
}

/**
 * Carpeta virtual de inspecciones: Herramientas y Equipos, IRO/ISOP y Sistemas de Emergencia, por
 * técnico (cualquiera, no solo quien mira) o por área, en un año o un mes.
 *
 * El periodo se aplica en el cliente sobre lo ya traído (no vuelve a pedir nada al cambiar de mes);
 * solo Sistemas de Emergencia se pide por año, porque sin filtro trae todos los formularios.
 */
export function useMisInspecciones(usuario: Tecnico, areaInicial?: string) {
  const [vista, setVista] = useState<Vista>("tecnico");
  const [tecnico, setTecnico] = useState<Tecnico>(usuario);
  const [area, setArea] = useState<string | null>(areaInicial ?? null);
  const [periodo, setPeriodo] = useState<Periodo>(() => periodoInicial());

  // ── Técnicos para elegir ────────────────────────────────────────────────
  const [tecnicosDelPadron, setTecnicosDelPadron] = useState<Tecnico[]>([]);
  useEffect(() => {
    let vigente = true;
    dashboardAdapter
      .getTecnicos()
      .then((lista) => {
        if (vigente) setTecnicosDelPadron(lista);
      })
      .catch((err: unknown) => console.error("Error al cargar los técnicos:", err));
    return () => {
      vigente = false;
    };
  }, []);
  // Quien mira siempre está, aunque el padrón no lo tenga.
  const tecnicos = useMemo(
    () =>
      tecnicosDelPadron.some((t) => t.username === usuario.username)
        ? tecnicosDelPadron
        : [usuario, ...tecnicosDelPadron],
    [tecnicosDelPadron, usuario],
  );
  // El nombre para reconocerlo en Emergencia: el del padrón si lo tiene (es el completo).
  const nombreTecnico =
    tecnicosDelPadron.find((t) => t.username === tecnico.username)?.nombre || tecnico.nombre;

  const porArea = vista === "area";
  const sinArea = porArea && !area;

  // ── Herramientas y Equipos ──────────────────────────────────────────────
  const consultarHerra = useCallback(async (): Promise<InspectionResponse[]> => {
    if (sinArea) return [];
    const result = await dashboardAdapter.getHerraEquiposInspections(
      porArea ? {} : { submittedBy: tecnico.username },
    );
    if (!result.success || !result.data) throw new Error("No se pudo cargar Herramientas y Equipos.");
    return porArea ? result.data.filter((i) => getArea(i) === area) : result.data;
  }, [porArea, sinArea, area, tecnico.username]);
  const herra = useFuente(
    `${vista}|${tecnico.username}|${area ?? ""}`,
    consultarHerra,
    "Error al cargar Herramientas y Equipos.",
  );

  const [herraTemplates, setHerraTemplates] = useState<TemplateHerraEquipo[]>([]);
  useEffect(() => {
    dashboardAdapter.getHerraEquiposTemplates().then((res) => {
      if (res.success && res.data) setHerraTemplates(Array.isArray(res.data) ? res.data : []);
    });
  }, []);

  // ── IRO-ISOP ─────────────────────────────────────────────────────────────
  const consultarIso = useCallback(async (): Promise<FormInstance[]> => {
    if (sinArea) return [];
    const result = await dashboardAdapter.getIsoInstances(
      porArea ? { area: area ?? undefined, limit: AREA_FETCH_LIMIT } : { createdBy: tecnico.username, limit: AREA_FETCH_LIMIT },
    );
    if (!result.success || !result.data) throw new Error("No se pudo cargar IRO-ISOP.");
    return result.data.data;
  }, [porArea, sinArea, area, tecnico.username]);
  const iso = useFuente(`${vista}|${tecnico.username}|${area ?? ""}`, consultarIso, "Error al cargar IRO-ISOP.");

  // ── Sistemas de Emergencia ──────────────────────────────────────────────
  // Por técnico se piden los de todas las áreas del año y se filtra por el nombre del inspector.
  const consultarEmergencia = useCallback(async (): Promise<InspeccionServiceExport[]> => {
    if (sinArea) return [];
    const data = await dashboardAdapter.getEmergenciaReport({
      anio: String(periodo.año),
      ...(porArea && area ? { area } : {}),
    });
    return Array.isArray(data) ? data : [];
  }, [porArea, sinArea, area, periodo.año]);
  const emergencia = useFuente(
    `${vista}|${area ?? ""}|${periodo.año}`,
    consultarEmergencia,
    "Error al cargar Sistemas de Emergencia.",
  );

  // ── Periodo ─────────────────────────────────────────────────────────────
  const herraDelPeriodo = useMemo(
    () => herra.datos.filter((i) => enPeriodo(i.submittedAt, periodo)),
    [herra.datos, periodo],
  );
  const isoDelPeriodo = useMemo(
    () => iso.datos.filter((i) => enPeriodo(i.createdAt, periodo)),
    [iso.datos, periodo],
  );
  const filasDeEmergencia: FilaEmergencia<InspeccionServiceExport>[] = useMemo(
    () => (!porArea && !nombreTecnico ? [] : filasEmergencia(emergencia.datos, periodo, porArea ? undefined : nombreTecnico)),
    [emergencia.datos, periodo, porArea, nombreTecnico],
  );

  // ── Carpetas ────────────────────────────────────────────────────────────
  const carpetasHerra: Folder<InspectionResponse>[] = useMemo(
    () =>
      groupByFolder(
        herraDelPeriodo,
        (i) => i.templateCode,
        (i) => herraTemplates.find((t) => t.code === i.templateCode)?.name || i.templateName || i.templateCode,
      ),
    [herraDelPeriodo, herraTemplates],
  );
  const carpetasIso: Folder<FormInstance>[] = useMemo(
    () =>
      groupByFolder(
        isoDelPeriodo,
        (i) => (typeof i.templateId === "object" ? (i.templateId as unknown as { _id: string })._id : i.templateId),
        (i) => (typeof i.templateId === "object" ? (i.templateId as unknown as { name: string }).name : "Sin tipo"),
      ),
    [isoDelPeriodo],
  );

  const downloadHerraEquipoPdf = useCallback((id: string) => dashboardAdapter.downloadHerraEquipoPdf(id), []);
  const downloadIroIsopPdf = useCallback((id: string) => dashboardAdapter.downloadIroIsopPdf(id), []);
  const downloadEmergenciaPdf = useCallback((id: string) => dashboardAdapter.downloadEmergenciaPdf(id), []);

  return {
    vista,
    setVista,
    tecnico,
    setTecnico,
    tecnicos,
    nombreTecnico,
    area,
    setArea,
    periodo,
    setPeriodo,

    totalHerra: herraDelPeriodo.length,
    loadingHerra: herra.cargando,
    errorHerra: herra.error,
    carpetasHerra,

    totalIso: isoDelPeriodo.length,
    loadingIso: iso.cargando,
    errorIso: iso.error,
    carpetasIso,

    filasDeEmergencia,
    loadingEmergencia: emergencia.cargando,
    errorEmergencia: emergencia.error,

    totalActivo: herraDelPeriodo.length + isoDelPeriodo.length + filasDeEmergencia.length,
    cargandoAlgo: herra.cargando || iso.cargando || emergencia.cargando,

    downloadHerraEquipoPdf,
    downloadIroIsopPdf,
    downloadEmergenciaPdf,
  };
}
