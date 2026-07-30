// Helpers puros de dominio para PGR — TypeScript puro, sin React, sin MUI.

import { ActividadEstado, PgrEstado } from "./models/IProps";

export type StatusColor = "success" | "error" | "warning" | "info" | "default";

/**
 * Color semántico asociado al estado de flujo de un Plan PGR.
 * Única fuente de verdad — reemplaza la lógica duplicada que existía en
 * `pgr/page.tsx` (`getStatusColor`) y `graphics/pgr/page.tsx` (inline).
 */
export function getPgrEstadoColor(estado: PgrEstado | string): StatusColor {
  switch (estado) {
    case PgrEstado.APROBADO:
      return "success";
    case PgrEstado.CORREGIR:
      return "error";
    case PgrEstado.EN_REVISION:
      return "warning";
    case PgrEstado.BORRADOR:
    default:
      return "default";
  }
}

/**
 * Color semántico asociado al estado de aprobación de una Actividad.
 */
export function getActividadEstadoColor(
  estado?: ActividadEstado | string,
): StatusColor {
  switch (estado) {
    case ActividadEstado.APROBADO:
      return "success";
    case ActividadEstado.RECHAZADO:
      return "error";
    case ActividadEstado.PENDIENTE:
    default:
      return "default";
  }
}

/**
 * Etiqueta corta y consistente para identificar una actividad en las tablas
 * y flujos de aprobación/seguimiento: "Actividad ab12".
 */
export function formatActividadLabel(id: string): string {
  return `Actividad ${id.slice(-4)}`;
}

// Mapa local de colores para el semáforo de tiempo de una actividad.
// Precedente aceptado: `getColorSemaforo` en
// `graphics/emergencyinspections/emergencycharts/emergencychartsCharts.tsx`.
const SEMAFORO_COLORES: Record<string, string> = {
  "Antes del Mes": "#2E7D32",
  "En el Mes": "#1976D2",
  Atrasado: "#D32F2F",
};

const SEMAFORO_FONDOS: Record<string, string> = {
  "Antes del Mes": "#E8F5E9",
  "En el Mes": "#E3F2FD",
  Atrasado: "#FFEBEE",
};

export function getSemaforoColor(semaforo?: string): string {
  return (semaforo && SEMAFORO_COLORES[semaforo]) || "#F9A825";
}

export function getSemaforoBackground(semaforo?: string): string {
  return (semaforo && SEMAFORO_FONDOS[semaforo]) || "#FFF8E1";
}

export const MESES_PGR = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

// ==========================================
// Categorías de oportunidad de ejecución
// ==========================================

/**
 * Las tres sub-columnas de la fila `Real` del PGR en Excel.
 *
 * Los colores replican los de la planilla original a propósito: el personal
 * ya los tiene interiorizados del documento en papel, así que cambiar el
 * lenguaje visual sería un coste gratuito.
 */
export const CATEGORIAS_EJECUCION = [
  {
    key: "realMesPasado" as const,
    label: "Con retraso",
    ayuda: "Ejecutada el mes pasado. No cuenta para eficiencia.",
    /** `FFD99594` en la planilla. */
    color: "#D99594",
    fondo: "#FBECEB",
  },
  {
    key: "realDelMes" as const,
    label: "A tiempo",
    ayuda: "Ejecutada dentro del mes programado.",
    /** Sin relleno en la planilla. */
    color: "#9E9E9E",
    fondo: "#FFFFFF",
  },
  {
    key: "realMesAdelantado" as const,
    label: "Adelantada",
    ayuda: "Ejecutada antes de su mes. Sí cuenta para eficiencia.",
    /** `FFEAF1DD` en la planilla. */
    color: "#8FBC5A",
    fondo: "#EAF1DD",
  },
];

export type CategoriaEjecucion = (typeof CATEGORIAS_EJECUCION)[number]["key"];

/** Formatea un porcentaje 0-1 como texto; `—` cuando no hay programación. */
export function formatPorcentaje(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "—";
  return `${(valor * 100).toFixed(1)} %`;
}

/** Verde ≥90 %, ámbar ≥70 %, rojo por debajo. Gris si no aplica. */
export function getColorIndicador(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "#9E9E9E";
  if (valor >= 0.9) return "#2E7D32";
  if (valor >= 0.7) return "#F9A825";
  return "#C62828";
}

/**
 * Devuelve siempre 12 filas de programación, una por mes.
 *
 * El formulario indexa las filas por posición (`programacion.0`…`programacion.11`),
 * así que necesita las 12 aunque estén en cero. Además convierte los planes
 * anteriores a la matriz, que solo guardaban `mesesProgramados: string[]`:
 * cada mes marcado pasa a `programado: 1`, que es lo único deducible del
 * modelo viejo (no registraba cantidades).
 */
export function normalizarProgramacion(actividad: {
  programacion?: Array<{
    mes: number;
    programado: number;
    realMesPasado?: number;
    realDelMes?: number;
    realMesAdelantado?: number;
  }>;
  mesesProgramados?: string[];
}) {
  const porMes = new Map(
    (actividad.programacion ?? []).map((p) => [p.mes, p]),
  );

  const heredados = new Set(
    (actividad.mesesProgramados ?? [])
      .map((m) => MESES_PGR.indexOf(m) + 1)
      .filter((n) => n > 0),
  );

  return Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    const existente = porMes.get(mes);
    if (existente) {
      return {
        mes,
        programado: existente.programado ?? 0,
        realMesPasado: existente.realMesPasado ?? 0,
        realDelMes: existente.realDelMes ?? 0,
        realMesAdelantado: existente.realMesAdelantado ?? 0,
      };
    }
    return {
      mes,
      programado: heredados.has(mes) ? 1 : 0,
      realMesPasado: 0,
      realDelMes: 0,
      realMesAdelantado: 0,
    };
  });
}
