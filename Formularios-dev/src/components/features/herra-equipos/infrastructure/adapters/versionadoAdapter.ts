import {
  crearNuevaRevision,
  obtenerEstadoEdicion,
  obtenerHistorialRevisiones,
  publicarRevision,
} from "@/lib/actions/versionado-actions";
import type { AdaptadorVersionado } from "@/types/versionado";

/** Versionado de las plantillas de herramientas (`/template-herra-equipos`). */
export const versionadoHerraAdapter: AdaptadorVersionado = {
  estadoEdicion: (id) => obtenerEstadoEdicion("template-herra-equipos", id),
  nuevaRevision: (id) => crearNuevaRevision("template-herra-equipos", id),
  publicar: (id, motivo) => publicarRevision("template-herra-equipos", id, motivo),
  historial: (code) => obtenerHistorialRevisiones("template-herra-equipos", code),
};
