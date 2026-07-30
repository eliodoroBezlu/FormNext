// Tipos y utilidades puras del feature "dashboard" — sin React ni MUI.

import { Role } from "@/lib/routePermissions";

// ── Mis Inspecciones ────────────────────────────────────────────────────

export type Vista = "mias" | "area";

export interface MisInspeccionesViewProps {
  username: string;
  area?: string;
}

export interface Folder<T> {
  key: string;
  label: string;
  rows: T[];
}

/**
 * Agrupa filas en carpetas según una clave, ordenadas por cantidad
 * descendente (las carpetas más pobladas primero).
 */
export function groupByFolder<T>(
  rows: T[],
  keyFn: (row: T) => string,
  labelFn: (row: T) => string,
): Folder<T>[] {
  const map = new Map<string, Folder<T>>();
  for (const row of rows) {
    const key = keyFn(row) || "sin-tipo";
    if (!map.has(key)) map.set(key, { key, label: labelFn(row) || "Sin tipo", rows: [] });
    map.get(key)!.rows.push(row);
  }
  return Array.from(map.values()).sort((a, b) => b.rows.length - a.rows.length);
}

// Por debajo de este número de inspecciones, una carpeta se muestra tal
// cual — recién a partir de acá vale la pena mostrar un buscador.
export const FOLDER_FILTER_THRESHOLD = 15;
// Techo razonable para "de mi área" — este flujo no está pensado para
// paginar miles de resultados, solo para agrupar por carpeta.
export const AREA_FETCH_LIMIT = 500;

// ── Notificaciones / Actividad reciente ─────────────────────────────────

export const SUPERVISOR_ROLES = [Role.SUPERVISOR, Role.ADMIN, Role.SUPERINTENDENTE];

// Cada cuánto se refresca la campana de notificaciones en segundo plano.
export const NOTIFICATION_POLL_INTERVAL_MS = 45_000;
// Clave de localStorage donde se guarda la última vez que el usuario abrió
// el panel de notificaciones (para calcular "no leídas").
export const NOTIFICATION_LS_KEY = "lastSeenNotificationAt";

// Cuántas tarjetas de actividad reciente se muestran como máximo en el feed
// del dashboard (el resto se ve en las páginas de listado completas).
export const ACTIVITY_FEED_MAX_VISIBLE = 8;
