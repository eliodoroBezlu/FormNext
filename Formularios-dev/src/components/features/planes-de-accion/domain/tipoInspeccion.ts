/**
 * El tipo de IRO o ISOP de un plan o de una inspección, para filtrar por él.
 *
 * El tipo es el **código** de la plantilla (1.02.P06.F50 = IRO Izaje): todas
 * las revisiones de una plantilla comparten código, así que una ISOP de la
 * revisión 7 y otra de la 8 caen en el mismo tipo.
 *
 * TypeScript puro: se prueba con `yarn test`.
 */

export interface TipoDeInspeccion {
  codigo: string;
  nombre: string;
}

export interface OpcionDeTipo {
  valor: string;
  etiqueta: string;
}

/** Los planes creados a mano no salen de ninguna inspección. */
export const SIN_INSPECCION = "sin-inspeccion";

const primeraMayuscula = (texto: string) =>
  texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();

/**
 * «INSPECCIÓN REGLAS DE ORO, (IRO) - TRABAJO EN ALTURA» → «IRO · Trabajo en altura».
 * «INSPECCIÓN DE SEGURIDAD OPERATIVA (ISOP)» → «ISOP». Lo que no siga el
 * patrón se muestra tal cual.
 */
export function etiquetaDeTipo(nombre: string): string {
  const limpio = nombre.replace(/\s+/g, " ").trim();
  const sigla = limpio.match(/\((IRO|ISOP)\)/i)?.[1]?.toUpperCase();
  if (!sigla) return limpio;
  const resto = limpio.split(/\((?:IRO|ISOP)\)/i)[1]?.replace(/^\s*-\s*/, "").trim();
  return resto ? `${sigla} · ${primeraMayuscula(resto)}` : sigla;
}

/** La clave por la que se filtra: el código de la plantilla, o «sin inspección». */
export const claveDeTipo = (tipo?: TipoDeInspeccion | null): string =>
  tipo?.codigo || SIN_INSPECCION;

/** Las opciones del filtro, una por código, ordenadas por cómo se leen. */
export function opcionesDeTipo(
  tipos: readonly (TipoDeInspeccion | null | undefined)[],
): OpcionDeTipo[] {
  const porCodigo = new Map<string, string>();
  for (const tipo of tipos) {
    const valor = claveDeTipo(tipo);
    if (porCodigo.has(valor)) continue;
    porCodigo.set(valor, tipo ? etiquetaDeTipo(tipo.nombre) : "Sin inspección (manual)");
  }
  return [...porCodigo]
    .map(([valor, etiqueta]) => ({ valor, etiqueta }))
    .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, "es"));
}
