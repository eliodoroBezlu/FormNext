"use server";

import { API_BASE_URL } from "../constants";
import { getAuthHeaders } from "./helpers";
import type {
  BombaResumen,
  Correlativo,
  EntradaCatalogo,
  FichaBomba,
  FiltrosReportes,
  ImagenSubida,
  PlantillaMonitoreo,
  Prellenado,
  ReporteMonitoreo,
  ReportePayload,
  ResultadoImportacion,
  Resultado,
  UsoDeImagen,
} from "@/components/features/monitoreo-equipos/domain/models/Monitoreo";

const BASE = `${API_BASE_URL}/monitoreo-equipos`;

/**
 * Las acciones de este módulo **devuelven** el error en vez de lanzarlo: en
 * producción Next reemplaza el mensaje de un error lanzado en el servidor por
 * uno genérico, y aquí el mensaje es lo que hay que leer («Falta: el
 * alcance», ««KSB» no está en la lista de fabricantes»).
 *
 * El backend manda el motivo en `mensaje` (su filtro de errores), que puede
 * ser un texto o una lista.
 */
async function pedir<T>(
  ruta: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<Resultado<T>> {
  try {
    const headers = await getAuthHeaders();
    const { json, ...resto } = init;
    if (init.body instanceof FormData) delete headers["Content-Type"];

    const res = await fetch(`${BASE}${ruta}`, {
      ...resto,
      headers,
      body: json === undefined ? init.body : JSON.stringify(json),
      cache: "no-store",
    });

    if (res.status === 401) {
      return { ok: false, errores: ["La sesión expiró. Recargue la página."] };
    }
    if (res.status === 403) {
      return { ok: false, errores: ["No tiene acceso al monitoreo de equipos."] };
    }
    if (!res.ok) {
      const cuerpo = (await res.json().catch(() => ({}))) as {
        mensaje?: string | string[];
        message?: string | string[];
      };
      const motivo = cuerpo.mensaje ?? cuerpo.message ?? `Error ${res.status}`;
      return { ok: false, errores: Array.isArray(motivo) ? motivo : [motivo] };
    }
    return { ok: true, datos: (await res.json()) as T };
  } catch (error) {
    return {
      ok: false,
      errores: [
        error instanceof Error ? error.message : "No se pudo conectar con el servidor.",
      ],
    };
  }
}

const consulta = (filtros: Record<string, string | number | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filtros)) {
    if (v !== undefined && v !== "") p.set(k, String(v));
  }
  const q = p.toString();
  return q ? `?${q}` : "";
};

// ── Reportes ──────────────────────────────────────────────────────────────

export async function listarReportesMonitoreo(
  filtros: FiltrosReportes,
): Promise<Resultado<ReporteMonitoreo[]>> {
  return pedir(`/reportes${consulta({ ...filtros })}`);
}

export async function obtenerReporteMonitoreo(
  id: string,
): Promise<Resultado<ReporteMonitoreo>> {
  return pedir(`/reportes/${encodeURIComponent(id)}`);
}

export async function prellenadoMonitoreo(
  tag: string,
  fecha?: string,
  horas?: number,
): Promise<Resultado<Prellenado>> {
  return pedir(`/reportes/prellenado/${encodeURIComponent(tag)}${consulta({ fecha, horas })}`);
}

export async function crearReporteMonitoreo(
  payload: ReportePayload,
): Promise<Resultado<ReporteMonitoreo>> {
  return pedir("/reportes", { method: "POST", json: payload });
}

export async function actualizarReporteMonitoreo(
  id: string,
  payload: ReportePayload,
): Promise<Resultado<ReporteMonitoreo>> {
  // El TAG no se cambia: el backend no lo acepta en la edición.
  const resto = { ...payload };
  delete resto.tag;
  return pedir(`/reportes/${encodeURIComponent(id)}`, { method: "PATCH", json: resto });
}

export async function darDeBajaReporteMonitoreo(
  id: string,
): Promise<Resultado<ReporteMonitoreo>> {
  return pedir(`/reportes/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function enviarReporteMonitoreo(
  id: string,
): Promise<Resultado<ReporteMonitoreo>> {
  return pedir(`/reportes/${encodeURIComponent(id)}/enviar`, { method: "POST" });
}

export async function devolverReporteMonitoreo(
  id: string,
  motivo: string,
): Promise<Resultado<ReporteMonitoreo>> {
  return pedir(`/reportes/${encodeURIComponent(id)}/devolver`, {
    method: "POST",
    json: { motivo },
  });
}

export async function emitirReporteMonitoreo(
  id: string,
): Promise<Resultado<ReporteMonitoreo>> {
  return pedir(`/reportes/${encodeURIComponent(id)}/emitir`, { method: "POST" });
}

// ── Imágenes ──────────────────────────────────────────────────────────────

export async function subirImagenMonitoreo(
  formData: FormData,
  uso: UsoDeImagen,
): Promise<Resultado<ImagenSubida>> {
  return pedir(`/archivos?uso=${uso}`, { method: "POST", body: formData });
}

// ── Catálogos, bombas y configuración ─────────────────────────────────────

export async function listarCatalogosMonitoreo(): Promise<Resultado<EntradaCatalogo[]>> {
  return pedir("/catalogos");
}

export async function sembrarCatalogosMonitoreo(): Promise<
  Resultado<{ sembrados: string[]; fichaBombaCreada: boolean }>
> {
  return pedir("/catalogos/sembrar", { method: "POST" });
}

export async function listarBombasMonitoreo(): Promise<Resultado<BombaResumen[]>> {
  return pedir("/bombas");
}

export async function fichaBombaMonitoreo(tag: string): Promise<Resultado<FichaBomba>> {
  return pedir(`/bombas/${encodeURIComponent(tag)}`);
}

export async function importarPlanillaBombas(
  formData: FormData,
  aplicar: boolean,
): Promise<Resultado<ResultadoImportacion>> {
  return pedir(`/bombas/planilla${aplicar ? "?aplicar=true" : ""}`, {
    method: "POST",
    body: formData,
  });
}

export async function listarCorrelativosMonitoreo(): Promise<Resultado<Correlativo[]>> {
  return pedir("/correlativos");
}

export async function fijarCorrelativoMonitoreo(datos: {
  tecnica_codigo: string;
  anio: number;
  ultimo: number;
}): Promise<Resultado<Correlativo>> {
  return pedir("/correlativos", { method: "PUT", json: datos });
}

export async function obtenerPlantillaMonitoreo(): Promise<Resultado<PlantillaMonitoreo>> {
  return pedir("/plantillas/bomba");
}

export async function guardarPlantillaMonitoreo(
  fotosPorFila: number,
): Promise<Resultado<PlantillaMonitoreo>> {
  return pedir("/plantillas/bomba", {
    method: "PUT",
    json: { fotos_por_fila: fotosPorFila },
  });
}
