import {
  ESCALA_NIVELES,
  EstadoMatriz,
  NIVELES_QUE_REQUIEREN_PGR,
  NivelRiesgo,
  RiesgoAnalizado,
} from "./models/IProps";

/**
 * Helpers de presentación de la matriz IPER. TypeScript puro: sin React,
 * sin MUI — solo colores como string, que la capa visual traduce.
 */

/**
 * Color por nivel de riesgo. Se mantiene la semántica del semáforo del Excel:
 * lo inaceptable en rojo, lo aceptable en verde.
 */
const COLOR_NIVEL: Record<NivelRiesgo, string> = {
  ACEPTABLE: "#2e7d32",
  BAJA: "#689f38",
  "ACEPTABLE CON REVISIÓN": "#f9a825",
  SUSTANCIAL: "#ef6c00",
  INACEPTABLE: "#c62828",
};

export const colorDeNivel = (nivel?: string | null): string =>
  nivel && nivel in COLOR_NIVEL
    ? COLOR_NIVEL[nivel as NivelRiesgo]
    : "#9e9e9e";

/**
 * Color del chip de eficacia de un control, con el semáforo del Excel:
 * Eficaz en verde, Satisfactorio en amarillo, No Eficaz en rojo.
 *
 * Se devuelve el nombre del color de MUI y no un hexadecimal porque el chip de
 * eficacia usa `color=` en vez de `sx.bgcolor`, a diferencia del de nivel.
 */
export const colorEficacia = (
  eficacia?: string | null,
): "success" | "warning" | "error" | "default" => {
  if (eficacia === "Control/Acción Eficaz") return "success";
  if (eficacia === "Control/Acción Satisfactorio") return "warning";
  if (eficacia === "Control/Acción No Eficaz") return "error";
  return "default";
};

/** Los niveles que obligan a generar actividades en el PGR. */
export const requierePgr = (nivel?: string | null): boolean =>
  !!nivel && NIVELES_QUE_REQUIEREN_PGR.includes(nivel as NivelRiesgo);

const COLOR_ESTADO: Record<EstadoMatriz, string> = {
  BORRADOR: "default",
  EN_REVISION: "warning",
  APROBADA: "success",
  SUPERADA: "default",
};

export const colorDeEstado = (estado: EstadoMatriz): string =>
  COLOR_ESTADO[estado] ?? "default";

export const ETIQUETA_ESTADO: Record<EstadoMatriz, string> = {
  BORRADOR: "Borrador",
  EN_REVISION: "En revisión",
  APROBADA: "Aprobada",
  SUPERADA: "Superada",
};

/**
 * ¿El nivel bajó, subió o quedó igual tras aplicar los controles?
 * Es lo que la UI muestra como «antes → después».
 */
export function variacionNivel(
  inicial?: string | null,
  actual?: string | null,
): "baja" | "sube" | "igual" | "desconocido" {
  const i = ESCALA_NIVELES.indexOf(inicial as NivelRiesgo);
  const a = ESCALA_NIVELES.indexOf(actual as NivelRiesgo);
  if (i < 0 || a < 0) return "desconocido";
  if (a < i) return "baja";
  if (a > i) return "sube";
  return "igual";
}

/** Cuántos escalones se redujo el riesgo. 0 si no se redujo. */
export function escalonesReducidos(
  inicial?: string | null,
  actual?: string | null,
): number {
  const i = ESCALA_NIVELES.indexOf(inicial as NivelRiesgo);
  const a = ESCALA_NIVELES.indexOf(actual as NivelRiesgo);
  return i >= 0 && a >= 0 ? Math.max(0, i - a) : 0;
}

/**
 * Distribución de riesgos por nivel, en el orden de la escala.
 * Devolver el orden aquí evita que cada gráfico lo reinvente.
 */
export function distribucionPorNivel(
  porNivel: Record<string, number>,
): { nivel: string; cantidad: number; color: string }[] {
  return [...ESCALA_NIVELES]
    .reverse()
    .map((nivel) => ({
      nivel,
      cantidad: porNivel[nivel] ?? 0,
      color: colorDeNivel(nivel),
    }))
    .filter((d) => d.cantidad > 0);
}

/** Riesgos con al menos una discrepancia entre el Excel y el motor. */
export const riesgosConDiscrepancias = (
  riesgos: RiesgoAnalizado[],
): RiesgoAnalizado[] => riesgos.filter((r) => r.discrepancias.length > 0);

/**
 * Verificadores distintos de una lista de riesgos, con cuántos controles los
 * usan. Es la vista previa de lo que después alimentará el PGR.
 */
export function verificadoresDe(
  riesgos: { controles: { verificador: string }[] }[],
): { verificador: string; controles: number }[] {
  const conteo = new Map<string, number>();
  for (const r of riesgos) {
    for (const c of r.controles) {
      if (!c.verificador) continue;
      conteo.set(c.verificador, (conteo.get(c.verificador) ?? 0) + 1);
    }
  }
  return [...conteo.entries()]
    .map(([verificador, controles]) => ({ verificador, controles }))
    .sort((a, b) => b.controles - a.controles);
}
