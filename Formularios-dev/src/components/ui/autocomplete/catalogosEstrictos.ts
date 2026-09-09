import type { DataSourceType } from "@/lib/actions/dataSourceService";

/**
 * Orígenes de datos que son un **catálogo cerrado**: solo vale lo que ya
 * existe en la lista.
 *
 * No es una preferencia de interfaz, es integridad de datos. Estos valores se
 * usan después para filtrar, agrupar y contar; si cada persona escribe el suyo,
 * la misma área aparece varias veces y ningún informe cuadra.
 *
 * Estado real de la base cuando se añadió esto:
 *
 * ```
 * catálogo de áreas                     21
 * valores distintos usados              29
 *   · «Recursos Hidricos» / «recursos Hidricos»
 *   · «Soldadura» / «soldadura»
 *   · «Taller de soldadura» / «taller de soldadura»
 *   · y 13 que no están en el catálogo: "230", "REVISAR",
 *     "Taller Soldaduraa", "4 pulgadas 8000 rpm"…
 *
 * SUPERINTENDENCIA
 *   · «Mantenimiento Planta » escrita de 4 formas, todas con espacio final
 * ```
 *
 * `4 pulgadas 8000 rpm` es la medida de una amoladora escrita en la casilla del
 * área. Con texto libre eso no da error en ningún momento: se guarda, y aparece
 * como si fuera un área más.
 *
 * **Cómo añadir uno:** basta con meterlo en esta lista; no hay que tocar
 * ninguna pantalla. Y al revés — si algún catálogo necesita admitir valores
 * nuevos sobre la marcha, se saca de aquí o se pasa `permitirTextoLibre` en esa
 * llamada concreta.
 */
export const CATALOGOS_ESTRICTOS: ReadonlySet<DataSourceType> = new Set([
  "area",
  "superintendencia",
]);

export const esCatalogoEstricto = (fuente?: DataSourceType): boolean =>
  !!fuente && CATALOGOS_ESTRICTOS.has(fuente);
