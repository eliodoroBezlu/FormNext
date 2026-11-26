/**
 * La medición de espesores por ultrasonido, del lado de la pantalla: los
 * cálculos que se ven mientras se carga la grilla. **Son los mismos que hace
 * el backend** (`domain/espesores.ts` del módulo): el PDF usa los suyos.
 *
 * TypeScript «borrable» (sin enums; solo imports de tipos): sus pruebas
 * corren con `yarn test`.
 */
import type {
  EstructuraDeMedicion,
  MinimoDeZona,
  PiezaDeMedicion,
} from "./models/Monitoreo";

/** Los mismos topes que el backend (`MAX_ANILLOS`, `MAX_PUNTOS`…). */
export const MAX_PIEZAS_MEDICION = 30;
export const MAX_ZONAS_POR_PIEZA = 8;
export const MAX_ANILLOS = 12;
export const MAX_PUNTOS = 12;
export const MAX_DIAGRAMAS = 6;

/** 0 → A, 1 → B… */
export const letraDePunto = (i: number): string => String.fromCharCode(65 + i);

/** El menor de los medidos; sin medidos, nada. */
export function minimoDe(valores: (number | null | undefined)[]): number | undefined {
  const medidos = valores.filter((v): v is number => typeof v === "number");
  return medidos.length ? Math.min(...medidos) : undefined;
}

/** ¿Un valor de esta pieza está por debajo de su espesor de alerta? */
export const bajoAlerta = (p: PiezaDeMedicion, valor?: number): boolean =>
  valor !== undefined && p.espesor_alerta_mm !== undefined && valor < p.espesor_alerta_mm;

const clave = (t: string): string => t.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");

/**
 * El mínimo anterior de cada zona de esta grilla, buscado por nombre de pieza
 * y zona: lo que ya no se llama igual no tiene anterior.
 */
export function minimosAnteriores(
  e: EstructuraDeMedicion,
  anteriores: MinimoDeZona[],
): (number | undefined)[][] {
  const porClave = new Map(anteriores.map((m) => [`${clave(m.pieza)}|${clave(m.zona)}`, m.minimo]));
  return e.piezas.map((p) => p.zonas.map((z) => porClave.get(`${clave(p.nombre)}|${clave(z.nombre)}`)));
}

/** Cuántas celdas tiene la grilla: para decir «12 de 412 medidos». */
export const celdasDe = (e: EstructuraDeMedicion): number =>
  e.piezas.reduce((t, p) => t + p.zonas.reduce((s, z) => s + z.anillos * z.puntos, 0), 0);
