/**
 * Los filtros de la lista del inventario.
 *
 * TypeScript «borrable»: sus pruebas corren con `yarn test`.
 */
import type { Equipo } from "./models/Equipo";

export interface FiltrosEquipos {
  texto: string;
  area: string;
  ubicacion: string;
  tipo: string;
}

export const filtrosVacios = (): FiltrosEquipos => ({ texto: "", area: "", ubicacion: "", tipo: "" });

/**
 * Filtrar por una ubicación incluye lo que está dentro de ella (sus bodegas y
 * estantes). Misma regla que `perteneceA` de `ubicaciones`, repetida aquí para
 * que este archivo se pruebe sin resolver alias.
 */
const estaEn = (u: Equipo["ubicacion_id"], id: string) =>
  !!u && (u._id === id || (u.ancestros ?? []).includes(id));

export function filtrarEquipos(equipos: Equipo[], f: FiltrosEquipos): Equipo[] {
  const t = f.texto.trim().toLowerCase();
  return equipos.filter((e) => {
    const coincide =
      !t ||
      [e.codigo, e.descripcion, e.marca, e.modelo, e.responsable, e.num_serie].some((v) =>
        (v ?? "").toLowerCase().includes(t),
      );
    return (
      coincide &&
      (!f.area || e.area_id?._id === f.area) &&
      (!f.ubicacion || estaEn(e.ubicacion_id, f.ubicacion)) &&
      (!f.tipo || e.tipo_equipo === f.tipo)
    );
  });
}

/** Los tipos que aparecen en la lista, para el filtro. */
export const tiposEnUso = (equipos: Equipo[]): string[] =>
  [...new Set(equipos.map((e) => e.tipo_equipo).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
