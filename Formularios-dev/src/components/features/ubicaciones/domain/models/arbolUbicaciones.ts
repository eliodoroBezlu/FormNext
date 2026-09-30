/**
 * Reglas del árbol de ubicaciones del lado del cliente. TypeScript puro.
 *
 * El backend entrega la lista plana con `padre`, `ancestros`, `ruta` y
 * `nivel` ya calculados; aquí solo se arma la vista (qué fila va debajo de
 * cuál, qué se ve con el buscador) y se anticipan las reglas que el backend
 * igual va a aplicar — para no ofrecer destinos que después rechazaría.
 */

/** Niveles permitidos en total (raíz + 6). Igual que el backend. */
export const PROFUNDIDAD_MAXIMA = 7;

/** Lo que este módulo necesita de una ubicación. */
export interface NodoUbicacion {
  _id: string;
  nombre: string;
  padre: string | null;
  ancestros: string[];
  ruta: string;
  nivel: number;
  activo: boolean;
}

export interface FilaArbol<T extends NodoUbicacion> {
  nodo: T;
  tieneHijos: boolean;
}

/** Mayúsculas, sin tildes, espacios colapsados. Igual que el backend. */
export const normalizarNombre = (valor: string): string =>
  valor
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const porNombre = (a: NodoUbicacion, b: NodoUbicacion) =>
  a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });

function hijosPorPadre<T extends NodoUbicacion>(nodos: T[]): Map<string | null, T[]> {
  const hijos = new Map<string | null, T[]>();
  for (const nodo of nodos) {
    const clave = nodo.padre ?? null;
    hijos.set(clave, [...(hijos.get(clave) ?? []), nodo]);
  }
  hijos.forEach((lista) => lista.sort(porNombre));
  return hijos;
}

/**
 * Las filas de la tabla en orden de árbol (cada nodo seguido de sus hijos),
 * mostrando solo los hijos de los nodos expandidos.
 *
 * Con `busqueda`, se muestran las coincidencias **y sus ancestros**, todo
 * expandido: una coincidencia sin el camino hasta ella no dice dónde está.
 */
export function filasVisibles<T extends NodoUbicacion>(
  nodos: T[],
  expandidos: ReadonlySet<string>,
  busqueda = "",
): FilaArbol<T>[] {
  const hijos = hijosPorPadre(nodos);
  const termino = normalizarNombre(busqueda);

  let visibles: Set<string> | null = null;
  if (termino) {
    visibles = new Set();
    for (const nodo of nodos) {
      if (normalizarNombre(nodo.nombre).includes(termino)) {
        visibles.add(nodo._id);
        nodo.ancestros.forEach((a) => visibles?.add(a));
      }
    }
  }

  const filas: FilaArbol<T>[] = [];
  const bajar = (padre: string | null) => {
    for (const nodo of hijos.get(padre) ?? []) {
      if (visibles && !visibles.has(nodo._id)) continue;
      const tieneHijos = (hijos.get(nodo._id) ?? []).length > 0;
      filas.push({ nodo, tieneHijos });
      if (visibles || expandidos.has(nodo._id)) bajar(nodo._id);
    }
  };
  bajar(null);
  return filas;
}

/** Todos los nodos en orden de árbol (para selectores que muestran la jerarquía). */
export function ordenArbol<T extends NodoUbicacion>(nodos: T[]): T[] {
  const todos = new Set(nodos.map((n) => n._id));
  return filasVisibles(nodos, todos).map((f) => f.nodo);
}

/** `true` si `ubicacion` es `filtroId` o cuelga de ella (para filtrar equipos). */
export const perteneceA = (
  ubicacion: Pick<NodoUbicacion, "_id" | "ancestros"> | null | undefined,
  filtroId: string,
): boolean =>
  !!ubicacion &&
  (ubicacion._id === filtroId || (ubicacion.ancestros ?? []).includes(filtroId));

/** Cuántos niveles hay por debajo de `id` (0 si es hoja). */
export function alturaSubarbol(nodos: NodoUbicacion[], id: string): number {
  const descendientes = nodos.filter((n) => n.ancestros.includes(id));
  const base = nodos.find((n) => n._id === id)?.nivel ?? 0;
  return descendientes.reduce((max, n) => Math.max(max, n.nivel - base), 0);
}

/**
 * Padres posibles para colgar `nodoId` (o una ubicación nueva, si es `null`)
 * sin que el backend lo rechace: activos, que no sean el propio nodo ni algo
 * que cuelgue de él, y con lugar para su subárbol dentro de
 * {@link PROFUNDIDAD_MAXIMA}.
 */
export function padresPosibles<T extends NodoUbicacion>(
  nodos: T[],
  nodoId: string | null,
): T[] {
  const altura = nodoId ? alturaSubarbol(nodos, nodoId) : 0;
  return ordenArbol(nodos).filter(
    (n) =>
      n.activo &&
      (!nodoId || (n._id !== nodoId && !n.ancestros.includes(nodoId))) &&
      n.nivel + 1 + altura <= PROFUNDIDAD_MAXIMA - 1,
  );
}

/**
 * Destinos posibles para fusionar `origenId`: activos, distintos del origen y
 * sin colgar de él, con lugar para lo que cuelga del origen.
 */
export function destinosDeFusion<T extends NodoUbicacion>(nodos: T[], origenId: string): T[] {
  const altura = alturaSubarbol(nodos, origenId);
  return ordenArbol(nodos).filter(
    (n) =>
      n.activo &&
      n._id !== origenId &&
      !n.ancestros.includes(origenId) &&
      n.nivel + altura <= PROFUNDIDAD_MAXIMA - 1,
  );
}

/**
 * El hermano dado de baja con ese nombre bajo ese padre, si existe. Si hay
 * uno, crear de nuevo chocaría con él en el backend: conviene restaurarlo.
 */
export function hermanoDadoDeBaja<T extends NodoUbicacion>(
  nodos: T[],
  padre: string | null,
  nombre: string,
): T | undefined {
  const clave = normalizarNombre(nombre);
  return nodos.find(
    (n) =>
      !n.activo &&
      (n.padre ?? null) === padre &&
      normalizarNombre(n.nombre) === clave,
  );
}
