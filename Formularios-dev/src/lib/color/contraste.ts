/**
 * Contraste de color según WCAG 2.1 y elección del texto legible sobre un
 * fondo. Sirve para los colores que no son del tema (el semáforo de la matriz
 * de riesgos, por ejemplo): el tono del fondo es fijo, pero el texto encima se
 * elige para que se lea.
 *
 * TypeScript puro: se prueba con `yarn test`.
 */

/** Luminancia relativa de un color `#RRGGBB` (o `#RGB`). */
export function luminancia(hex: string): number {
  const limpio = hex.replace("#", "");
  const largo = limpio.length === 3 ? [...limpio].map((c) => c + c).join("") : limpio;
  const canales = [0, 2, 4].map((i) => parseInt(largo.slice(i, i + 2), 16) / 255);
  const [r, g, b] = canales.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razón de contraste entre dos colores: de 1 (iguales) a 21 (negro y blanco). */
export function contraste(a: string, b: string): number {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

/** De dos colores de texto, el que más contrasta con el fondo. */
export function textoLegibleSobre(fondo: string, opciones: { claro: string; oscuro: string }): string {
  return contraste(fondo, opciones.claro) >= contraste(fondo, opciones.oscuro) ? opciones.claro : opciones.oscuro;
}
