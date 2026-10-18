import {
  actualizarReporteMonitoreo,
  crearReporteMonitoreo,
  darDeBajaReporteMonitoreo,
  devolverReporteMonitoreo,
  emitirReporteMonitoreo,
  enviarReporteMonitoreo,
  fichaBombaMonitoreo,
  fijarCorrelativoMonitoreo,
  guardarPlantillaMonitoreo,
  importarPlanillaBombas,
  listarBombasMonitoreo,
  listarCatalogosMonitoreo,
  listarCorrelativosMonitoreo,
  listarReportesMonitoreo,
  obtenerPlantillaMonitoreo,
  obtenerReporteMonitoreo,
  prellenadoMonitoreo,
  sembrarCatalogosMonitoreo,
  subirImagenMonitoreo,
} from "@/lib/actions/monitoreo-actions";
import { reducirImagen, TAMANO_MAXIMO_SUBIDA } from "@/components/ui/camera/reducirImagen";
import type {
  Catalogos,
  EntradaCatalogo,
  FiltrosReportes,
  ReportePayload,
  Resultado,
  TipoCatalogo,
  UsoDeImagen,
} from "../../domain/models/Monitoreo";

/**
 * El error de una acción de este módulo: trae **todos** los motivos que dio el
 * servidor, para mostrarlos en lista («Falta: el alcance», «Falta: …»).
 */
export class ErrorMonitoreo extends Error {
  constructor(readonly motivos: string[]) {
    super(motivos.join(" · "));
    this.name = "ErrorMonitoreo";
  }
}

const desenvolver = async <T>(promesa: Promise<Resultado<T>>): Promise<T> => {
  const r = await promesa;
  if (!r.ok) throw new ErrorMonitoreo(r.errores);
  return r.datos;
};

/** Los motivos de cualquier error, para pintarlos. */
export const motivosDeError = (error: unknown): string[] =>
  error instanceof ErrorMonitoreo
    ? error.motivos
    : [error instanceof Error ? error.message : "Ocurrió un error inesperado."];

const TIPOS: TipoCatalogo[] = [
  "tecnica",
  "grupo_trabajo",
  "prioridad_jde",
  "severidad",
  "fabricante",
  "proveedor",
  "condicion_inicial",
  "tipo_intervencion",
  "instrumento",
  "punto_referencia",
];

const agrupar = (entradas: EntradaCatalogo[]): Catalogos => {
  const grupos = Object.fromEntries(TIPOS.map((t) => [t, []])) as unknown as Catalogos;
  for (const e of entradas) grupos[e.tipo]?.push(e);
  return grupos;
};

/** Dónde ve el navegador una imagen del módulo: por el proxy, con la cookie de sesión. */
export const urlDeImagen = (archivo: string): string =>
  `/api/forms/monitoreo-equipos/archivos/${encodeURIComponent(archivo)}`;

/**
 * El PDF del reporte (lo genera el backend). Un enlace directo por el proxy:
 * se descarga con la sesión del navegador, sin pasar el archivo por una
 * Server Action en base64.
 */
export const urlDelPdf = (id: string): string =>
  `/api/forms/monitoreo-equipos/reportes/${encodeURIComponent(id)}/pdf`;

/** Único punto por el que la presentación llega al servidor. */
export const monitoreoAdapter = {
  reportes: (filtros: FiltrosReportes) => desenvolver(listarReportesMonitoreo(filtros)),
  reporte: (id: string) => desenvolver(obtenerReporteMonitoreo(id)),
  prellenado: (tag: string, fecha?: string, horas?: number) =>
    desenvolver(prellenadoMonitoreo(tag, fecha, horas)),
  crear: (payload: ReportePayload) => desenvolver(crearReporteMonitoreo(payload)),
  actualizar: (id: string, payload: ReportePayload) =>
    desenvolver(actualizarReporteMonitoreo(id, payload)),
  darDeBaja: (id: string) => desenvolver(darDeBajaReporteMonitoreo(id)),
  enviar: (id: string) => desenvolver(enviarReporteMonitoreo(id)),
  devolver: (id: string, motivo: string) => desenvolver(devolverReporteMonitoreo(id, motivo)),
  emitir: (id: string) => desenvolver(emitirReporteMonitoreo(id)),

  /**
   * Sube una foto o el gráfico. Solo se reduce en el navegador si pasa el
   * límite de las Server Actions: el backend ya la ajusta sin recortar, y
   * reducir aquí una captura PNG de PI la convertiría a JPEG y borronearía el
   * texto.
   */
  async subirImagen(archivo: File, uso: UsoDeImagen) {
    const aSubir =
      archivo.size > TAMANO_MAXIMO_SUBIDA * 0.95 ? await reducirImagen(archivo) : archivo;
    const datos = new FormData();
    datos.append("file", aSubir);
    return desenvolver(subirImagenMonitoreo(datos, uso));
  },

  catalogos: async () => agrupar(await desenvolver(listarCatalogosMonitoreo())),
  sembrarCatalogos: () => desenvolver(sembrarCatalogosMonitoreo()),
  /** Ordenadas por urgencia: lo vencido primero. */
  bombas: () => desenvolver(listarBombasMonitoreo()),
  fichaBomba: (tag: string) => desenvolver(fichaBombaMonitoreo(tag)),

  importarPlanilla(archivo: File, aplicar: boolean) {
    const datos = new FormData();
    datos.append("file", archivo);
    return desenvolver(importarPlanillaBombas(datos, aplicar));
  },

  correlativos: () => desenvolver(listarCorrelativosMonitoreo()),
  fijarCorrelativo: (datos: { tecnica_codigo: string; anio: number; ultimo: number }) =>
    desenvolver(fijarCorrelativoMonitoreo(datos)),
  plantilla: () => desenvolver(obtenerPlantillaMonitoreo()),
  guardarPlantilla: (fotosPorFila: number) =>
    desenvolver(guardarPlantillaMonitoreo(fotosPorFila)),
};
