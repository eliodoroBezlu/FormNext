import { obtenerCadenaDeAreas } from "@/lib/actions/area-actions";
import { indexarCadenas, type CadenaOrganizativa } from "@/lib/organizacion/cadenaOrganizativa";

export interface MaestroOrganizativo {
  cadenas: CadenaOrganizativa[];
  porArea: Map<string, CadenaOrganizativa>;
}

let enCurso: Promise<MaestroOrganizativo> | null = null;

/**
 * El maestro Área → Superintendencia, pedido una sola vez por carga de página: los tres reportes
 * lo usan y no cambia mientras se filtra. La búsqueda puede esperarlo (`await`) aunque el
 * componente todavía no lo tenga en su estado. Si falla, se olvida para reintentar la próxima vez.
 */
export function obtenerMaestroOrganizativo(): Promise<MaestroOrganizativo> {
  enCurso ??= obtenerCadenaDeAreas()
    .then((cadenas) => ({ cadenas, porArea: indexarCadenas(cadenas) }))
    .catch((err: unknown) => {
      enCurso = null;
      throw err;
    });
  return enCurso;
}
