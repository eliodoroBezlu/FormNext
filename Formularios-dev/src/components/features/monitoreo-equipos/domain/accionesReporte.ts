/**
 * Qué puede hacer un usuario con un reporte. Espeja las reglas del backend
 * (`reportes-monitoreo.service.ts`), que es quien las hace cumplir:
 *
 * - el borrador lo edita, envía o da de baja solo quien lo elaboró;
 * - lo revisa (devuelve o emite) **otra persona** con el rol.
 *
 * TypeScript «borrable»: sus pruebas corren con `yarn test`.
 */
import type { EstadoReporte } from "./models/Monitoreo";

export interface AccionesReporte {
  editar: boolean;
  enviar: boolean;
  darDeBaja: boolean;
  revisar: boolean;
  /** Por qué no puede hacer nada, para decírselo en vez de dejar botones grises. */
  aviso?: string;
}

export function accionesDelReporte(
  reporte: { estado: EstadoReporte; elaboradoPor: string } | null,
  usuario: string | undefined,
): AccionesReporte {
  const ninguna = { editar: false, enviar: false, darDeBaja: false, revisar: false };
  if (!reporte) return { editar: true, enviar: true, darDeBaja: false, revisar: false };

  const esAutor = !!usuario && reporte.elaboradoPor === usuario;
  switch (reporte.estado) {
    case "borrador":
      return esAutor
        ? { editar: true, enviar: true, darDeBaja: true, revisar: false }
        : { ...ninguna, aviso: `Borrador de ${reporte.elaboradoPor}: solo esa persona lo edita.` };
    case "pendiente_revision":
      return esAutor
        ? { ...ninguna, aviso: "Enviado a revisión: lo revisa otra persona de Confiabilidad." }
        : { ...ninguna, revisar: true };
    default:
      return { ...ninguna, aviso: "Reporte emitido: ya no se modifica." };
  }
}

export type Bandeja = "todos" | "por_revisar" | "mis_borradores";

/**
 * Si un reporte va en una bandeja de la lista. «Por revisar» son los
 * pendientes **de otros**: los propios no se pueden revisar (misma regla que
 * `accionesDelReporte`).
 */
export function enBandeja(
  reporte: { estado: EstadoReporte; elaboradoPor: string },
  usuario: string | undefined,
  bandeja: Bandeja,
): boolean {
  const esAutor = !!usuario && reporte.elaboradoPor === usuario;
  if (bandeja === "por_revisar") return reporte.estado === "pendiente_revision" && !!usuario && !esAutor;
  if (bandeja === "mis_borradores") return reporte.estado === "borrador" && esAutor;
  return true;
}
