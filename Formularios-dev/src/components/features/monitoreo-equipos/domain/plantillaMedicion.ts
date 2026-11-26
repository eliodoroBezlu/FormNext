/**
 * El formulario del editor de plantillas de medición y su traducción a lo que
 * guarda el backend. El formulario trabaja con texto (un número vacío es
 * `""`); el backend, con números.
 *
 * TypeScript «borrable» (solo imports de tipos): sus pruebas corren con
 * `yarn test`.
 */
import type {
  DiagramaDeMedicion,
  PlantillaMedicion,
  PlantillaMedicionPayload,
} from "./models/Monitoreo";

export interface ZonaValores {
  nombre: string;
  anillos: string;
  puntos: string;
}

export interface PiezaValores {
  nombre: string;
  espesor_nominal_mm: string;
  espesor_alerta_mm: string;
  zonas: ZonaValores[];
}

export interface ValoresPlantilla {
  tag: string;
  tecnica: string;
  titulo: string;
  piezas: PiezaValores[];
  diagramas: DiagramaDeMedicion[];
}

export const ZONA_VACIA: ZonaValores = { nombre: "", anillos: "3", puntos: "8" };
export const PIEZA_VACIA: PiezaValores = {
  nombre: "",
  espesor_nominal_mm: "",
  espesor_alerta_mm: "",
  zonas: [ZONA_VACIA],
};

const texto = (n?: number): string => (n === undefined ? "" : String(n).replace(".", ","));

/** Coma o punto decimal. Vacío o inválido → `undefined`. */
function numero(escrito: string): number | undefined {
  const limpio = escrito.trim().replace(",", ".");
  if (limpio === "") return undefined;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : undefined;
}

/** Para editar una plantilla, o para una nueva (con la técnica sugerida). */
export function valoresDePlantilla(p: PlantillaMedicion | null, tecnica = ""): ValoresPlantilla {
  if (!p) {
    return { tag: "", tecnica, titulo: "", piezas: [{ ...PIEZA_VACIA }], diagramas: [] };
  }
  return {
    tag: p.tag,
    tecnica: p.tecnica,
    titulo: p.titulo,
    piezas: p.piezas.map((pz) => ({
      nombre: pz.nombre,
      espesor_nominal_mm: texto(pz.espesor_nominal_mm),
      espesor_alerta_mm: texto(pz.espesor_alerta_mm),
      zonas: pz.zonas.map((z) => ({
        nombre: z.nombre,
        anillos: String(z.anillos),
        puntos: String(z.puntos),
      })),
    })),
    diagramas: p.diagramas,
  };
}

/**
 * Lo que se envía. Un número que no se entiende viaja como `NaN` → el backend
 * lo rechaza con su motivo, en vez de guardarse como «sin dato».
 */
export function payloadDePlantilla(v: ValoresPlantilla): PlantillaMedicionPayload {
  const entero = (t: string) => (t.trim() === "" ? Number.NaN : Number(t.trim()));
  return {
    tag: v.tag.trim().toUpperCase(),
    tecnica: v.tecnica.trim(),
    titulo: v.titulo.trim(),
    piezas: v.piezas.map((p) => {
      const nominal = numero(p.espesor_nominal_mm);
      const alerta = numero(p.espesor_alerta_mm);
      return {
        nombre: p.nombre.trim(),
        zonas: p.zonas.map((z) => ({
          nombre: z.nombre.trim(),
          anillos: entero(z.anillos),
          puntos: entero(z.puntos),
        })),
        ...(nominal !== undefined && { espesor_nominal_mm: nominal }),
        ...(alerta !== undefined && { espesor_alerta_mm: alerta }),
      };
    }),
    diagramas: v.diagramas.map((d) => ({ ...d, descripcion: d.descripcion.trim() })),
  };
}

/** Puntos que tendrá la grilla, para ver el tamaño mientras se arma. */
export const celdasDeValores = (piezas: PiezaValores[]): number =>
  piezas.reduce(
    (t, p) =>
      t + p.zonas.reduce((s, z) => s + (Number(z.anillos) || 0) * (Number(z.puntos) || 0), 0),
    0,
  );
