/**
 * Colores de la empresa y los que se derivan de ellos.
 *
 * El tema (`theme.ts`) se arma con estos valores; los componentes usan el
 * tema (`primary.main`, `text.secondary`…), no este archivo. La excepción son
 * las superficies de marca (barra superior, cabeceras), que son petróleo en
 * los dos modos: para eso está `superficieDeMarca`.
 *
 * Contrastes y decisiones: `docs/SISTEMA_DE_DISENO.md`, sección 1.
 */

/** La paleta oficial de la empresa. */
export const MARCA = {
  petroleo: "#18364A",
  acero: "#52758A",
  grisClaro: "#E8EDF0",
  blanco: "#FFFFFF",
} as const;

/** Tonos derivados de la paleta (mezclas del petróleo y el acero). */
export const DERIVADOS = {
  petroleoOscuro: "#122938",
  petroleoProfundo: "#0E1E29",
  tinta: "#0F1E29",
  aceroOscuro: "#3E6175",
  aceroMedio: "#869EAD",
  aceroClaro: "#A9BAC5",
  aceroPalido: "#CBD6DC",
  hielo: "#A9C3D3",
  bordeClaro: "#D1D7DB",
  papelOscuro: "#142B3A",
  bordeOscuro: "#24404F",
} as const;

/** Barra superior, cabeceras y bandas de marca: petróleo en los dos modos. */
export const superficieDeMarca = (modo: "light" | "dark"): string =>
  modo === "dark" ? DERIVADOS.petroleoOscuro : MARCA.petroleo;
