/**
 * Un campo de texto que nombra a una o varias personas («Ana Pérez, Luis
 * Mamani»): el responsable de la observación. Se guarda como texto, con los
 * nombres separados por coma, para que la tabla, el Excel y el historial lo
 * sigan mostrando tal cual.
 *
 * TypeScript puro: se prueba con `yarn test`.
 */

/** Las personas que nombra el texto, sin vacíos ni repetidos. */
export function personasDe(texto?: string | null): string[] {
  const vistas = new Set<string>();
  const personas: string[] = [];
  for (const parte of (texto ?? "").split(",")) {
    const nombre = parte.trim().replace(/\s+/g, " ");
    const clave = nombre.toLowerCase();
    if (!nombre || vistas.has(clave)) continue;
    vistas.add(clave);
    personas.push(nombre);
  }
  return personas;
}

/** El texto que se guarda para una lista de personas. */
export const textoDePersonas = (personas: string[]): string =>
  personasDe(personas.join(",")).join(", ");
