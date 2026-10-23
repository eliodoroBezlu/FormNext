/**
 * Qué datos de la lista de verificación se deducen del área elegida.
 *
 * En el maestro el área determina su superintendencia y la superintendencia su
 * gerencia (`GET /area/cadena`). Preguntárselas al inspector solo abre la
 * puerta a que un mismo parte se contradiga. Lo usan los formularios de
 * Herramientas y Equipos y de IRO/ISOP, a través de `useCadenaOrganizativa`.
 *
 * Cada plantilla nombra los campos a su manera («Área», «Area Física:»,
 * «Superintendencia:», «Dirección/Gerencia»), así que se reconocen por la
 * etiqueta normalizada (sin tildes, mayúsculas ni dos puntos).
 *
 * TypeScript puro: se prueba con `yarn test`.
 */

export interface CadenaOrganizativa {
  area: string;
  superintendencia: string | null;
  /** Vacía cuando la superintendencia no tiene gerencia asignada. */
  gerencia: string | null;
}

export const normalizarEtiqueta = (etiqueta: string): string =>
  etiqueta
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/:\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();

/** El campo donde se elige el área («Área», «Área Física», «Área/Sección»…). */
export const esCampoDeArea = (etiqueta: string): boolean => {
  const norm = normalizarEtiqueta(etiqueta);
  return norm === "SECCION" || norm.includes("AREA");
};

/**
 * La superintendencia del área. **No** la «Superintendencia Sénior»: es otro
 * escalón, que el maestro no tiene y que el inspector sigue eligiendo.
 */
export const esCampoDeSuperintendencia = (etiqueta: string): boolean => {
  const norm = normalizarEtiqueta(etiqueta);
  return norm.includes("SUPERINTENDENCIA") && !norm.includes("SENIOR");
};

/**
 * Campo de gerencia («Gerencia», «Dirección/Gerencia»).
 *
 * ⚠️ Se mira **después** de la superintendencia: varias superintendencias del
 * maestro se llaman «GERENCIA …», y una etiqueta como
 * «SUPERINTENDENCIA/GERENCIA» debe resolverse como superintendencia, que es el
 * escalón que el área fija sin ambigüedad.
 */
export const esCampoDeGerencia = (etiqueta: string): boolean => {
  const norm = normalizarEtiqueta(etiqueta);
  return norm.includes("GERENCIA") && !norm.includes("SENIOR");
};

const claveDeArea = (nombre: string): string => normalizarEtiqueta(nombre);

/** Índice por área para resolver la cadena sin recorrer la lista cada vez. */
export const indexarCadenas = (
  cadenas: readonly CadenaOrganizativa[],
): Map<string, CadenaOrganizativa> =>
  new Map(cadenas.map((c) => [claveDeArea(c.area), c]));

/** Si alguna etiqueta de la plantilla se puede llenar desde el área. */
export const necesitaCadena = (etiquetas: readonly string[]): boolean =>
  etiquetas.some((e) => esCampoDeSuperintendencia(e) || esCampoDeGerencia(e));

/**
 * Los valores que salen del área, por etiqueta de la plantilla.
 *
 * No borra nada: si el maestro no conoce el área, o la superintendencia no
 * tiene gerencia (lo normal, porque el IAM no expone gerencias), esa etiqueta
 * no aparece y el campo queda como estaba. Vaciar lo que el inspector acaba de
 * escribir es peor que no ayudarle.
 */
export function valoresDesdeElArea(
  etiquetas: readonly string[],
  area: string,
  porArea: Map<string, CadenaOrganizativa>,
): { etiqueta: string; valor: string }[] {
  const cadena = porArea.get(claveDeArea(area));
  if (!cadena) return [];

  const valores: { etiqueta: string; valor: string }[] = [];
  for (const etiqueta of etiquetas) {
    const valor = esCampoDeSuperintendencia(etiqueta)
      ? cadena.superintendencia
      : esCampoDeGerencia(etiqueta)
        ? cadena.gerencia
        : null;
    if (valor) valores.push({ etiqueta, valor });
  }
  return valores;
}
