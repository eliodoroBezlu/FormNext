'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import {
  inspectionAdapter,
  type InspectionResponse,
} from '../../infrastructure/adapters/inspectionAdapter';
import { Role } from '@/lib/routePermissions';

// ─── Cache helpers ──────────────────────────────────────────────────────────
const CACHE_KEY = 'pendingApprovals_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

interface CacheEntry {
  inspections: InspectionResponse[];
  areas: string[];
  timestamp: number;
  username: string;
}

function readCache(username: string): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    const expired = Date.now() - entry.timestamp > CACHE_TTL_MS;
    if (expired || entry.username !== username) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function writeCache(entry: CacheEntry) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // sessionStorage lleno o no disponible → ignorar
  }
}

function invalidateCache() {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // noop
  }
}

// ─── Dónde se quedó el revisor ──────────────────────────────────────────────
//
// Las áreas elegidas y la carpeta abierta **no son datos, son el sitio donde
// estaba trabajando**, y por eso se guardan aparte de la caché y sin caducidad.
//
// Antes se perdían: al aprobar una inspección se vuelve a esta pantalla con un
// `router.push` a la URL pelada, el componente se monta de cero y el supervisor
// se encontraba otra vez el buscador de áreas. Aprobar cinco partes de la misma
// carpeta significaba elegir área y abrir carpeta cinco veces.
//
// Meterlo en la caché de datos no valía: esa caduca a los cinco minutos, y
// revisar una inspección con calma tarda más que eso.

const SELECCION_KEY = 'pendingApprovals_seleccion';

interface SeleccionRevision {
  areas: string[];
  /**
   * Área desplegada en la vista de varias áreas, o `null`.
   *
   * Va aparte de `carpeta` aunque en esa vista la clave de la carpeta ya
   * empiece por el área (`${area}__${code}`): deducirla de ahí obligaría a
   * partir por `__`, y un código de plantilla que contuviera esa secuencia
   * daría un área inventada. Con un campo propio no hay nada que adivinar.
   */
  areaAbierta: string | null;
  /**
   * Carpeta abierta. Con un área es el `templateCode`; con varias es
   * `${area}__${templateCode}`, que es la clave que usa esa vista.
   */
  carpeta: string | null;
  username: string;
}

function leerSeleccion(username: string): SeleccionRevision | null {
  try {
    const raw = sessionStorage.getItem(SELECCION_KEY);
    if (!raw) return null;
    const seleccion: SeleccionRevision = JSON.parse(raw);
    // De otra persona en la misma pestaña: no es la suya.
    if (seleccion.username !== username) return null;
    return seleccion;
  } catch {
    return null;
  }
}

function guardarSeleccion(seleccion: SeleccionRevision) {
  try {
    sessionStorage.setItem(SELECCION_KEY, JSON.stringify(seleccion));
  } catch {
    // sessionStorage lleno o no disponible → se pierde el sitio, nada más
  }
}

function olvidarSeleccion() {
  try {
    sessionStorage.removeItem(SELECCION_KEY);
  } catch {
    // noop
  }
}

/** ¿Piden exactamente las mismas áreas que hay guardadas? */
function mismasAreas(unas: string[], otras: string[]): boolean {
  if (unas.length !== otras.length) return false;
  const a = [...unas].sort();
  const b = [...otras].sort();
  return a.every((valor, i) => valor === b[i]);
}

// ─── Exports ─────────────────────────────────────────────────────────────────
export interface TemplateGroup {
  templateName: string;
  items: InspectionResponse[];
}

export interface AreaGroup {
  area: string;
  byTemplate: Map<string, TemplateGroup>;
}

export const useApprovals = () => {
  const { user, isLoading: authLoading, hasRole } = useUserRole();
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedAreas, setLoadedAreas] = useState<string[] | null>(null);

  /**
   * Carpeta abierta, recordada entre visitas a la pantalla.
   *
   * Vive aquí y no en el componente porque tiene que sobrevivir a que este se
   * desmonte, que es lo que pasa cada vez que el supervisor entra a una
   * inspección y vuelve.
   */
  const [carpetaAbierta, setCarpetaAbiertaEstado] = useState<string | null>(
    null,
  );

  /** Área desplegada cuando se revisan varias a la vez. */
  const [areaAbierta, setAreaAbiertaEstado] = useState<string | null>(null);

  const isAdmin = hasRole(Role.ADMIN) || hasRole(Role.SUPERINTENDENTE);

  /** Escribe unos pocos campos del sitio guardado sin perder los demás. */
  const actualizarSeleccion = useCallback(
    (cambios: Partial<Omit<SeleccionRevision, 'username'>>) => {
      if (!user) return;
      const actual = leerSeleccion(user.username);
      guardarSeleccion({
        areas: actual?.areas ?? [],
        areaAbierta: actual?.areaAbierta ?? null,
        carpeta: actual?.carpeta ?? null,
        ...cambios,
        username: user.username,
      });
    },
    [user],
  );

  /** Abre o cierra una carpeta, y lo recuerda para la próxima vuelta. */
  const setCarpetaAbierta = useCallback(
    (carpeta: string | null) => {
      setCarpetaAbiertaEstado(carpeta);
      actualizarSeleccion({ carpeta });
    },
    [actualizarSeleccion],
  );

  /** Abre o cierra un área, y lo recuerda para la próxima vuelta. */
  const setAreaAbierta = useCallback(
    (area: string | null) => {
      setAreaAbiertaEstado(area);
      actualizarSeleccion({ areaAbierta: area });
    },
    [actualizarSeleccion],
  );

  /** Vuelve al buscador de áreas y olvida dónde se estaba. */
  const reiniciarSeleccion = useCallback(() => {
    setLoadedAreas(null);
    setCarpetaAbiertaEstado(null);
    setAreaAbiertaEstado(null);
    olvidarSeleccion();
  }, []);

  // ── Eliminar una inspección del estado local sin refetch ──────────────────
  const removeInspection = useCallback(
    (inspectionId: string) => {
      setInspections((prev) => {
        const next = prev.filter((i) => i._id !== inspectionId);
        // Actualizar caché con la lista reducida
        if (user) {
          const cached = readCache(user.username);
          if (cached) {
            writeCache({ ...cached, inspections: next, timestamp: Date.now() });
          }
        }
        return next;
      });
    },
    [user],
  );

  // ── Fetch real desde el servidor ──────────────────────────────────────────
  const loadInspections = useCallback(
    async (areas: string[], forceRefresh = false) => {
      if (!user) return;

      // Si no se fuerza refresco, intentar usar caché.
      //
      // La caché solo sirve si es **de estas mismas áreas**. Sin esa condición,
      // pulsar «Cambiar áreas» y elegir otras dentro de los cinco minutos
      // devolvía los resultados de las anteriores: se restauraba `cached.areas`
      // y las pedidas se ignoraban en silencio.
      if (!forceRefresh) {
        const cached = readCache(user.username);
        if (cached && mismasAreas(cached.areas, areas)) {
          setInspections(cached.inspections);
          setLoadedAreas(cached.areas);

          // Verificar si hay una inspección procesada pendiente de quitar
          const processedId = sessionStorage.getItem('approvedInspectionId');
          if (processedId) {
            sessionStorage.removeItem('approvedInspectionId');
            setInspections((prev) => {
              const next = prev.filter((i) => i._id !== processedId);
              writeCache({ ...cached, inspections: next, timestamp: Date.now() });
              return next;
            });
          }
          return;
        }
      }

      // Fetch fresco
      try {
        setLoading(true);
        setError(null);
        const result = await inspectionAdapter.getPendingApprovals(
          user.username,
          isAdmin ? undefined : areas,
          isAdmin,
        );
        if (!result.success) throw new Error(result.error || 'Error al cargar');
        const data = result.data || [];
        setInspections(data);
        setLoadedAreas(areas);
        writeCache({ inspections: data, areas, timestamp: Date.now(), username: user.username });
        const sitio = leerSeleccion(user.username);
        guardarSeleccion({
          areas,
          areaAbierta: sitio?.areaAbierta ?? null,
          carpeta: sitio?.carpeta ?? null,
          username: user.username,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [user, isAdmin],
  );

  // ── Botón "Actualizar" → fuerza refresco ────────────────────────────────
  const refreshInspections = useCallback(
    (areas: string[]) => {
      invalidateCache();
      loadInspections(areas, true);
    },
    [loadInspections],
  );

  /**
   * Este efecto **sí** debe quedarse, aunque el linter avise.
   *
   * `loadInspections` empieza leyendo la caché de sesión, que es memoria
   * local: cuando hay algo guardado vuelca las inspecciones y regresa sin
   * tocar la red. Ese `setInspections` es síncrono, y por eso el analizador lo
   * marca — pero no es una cascada de renders esperando a un servidor, es la
   * carga instantánea que evita el parpadeo de la bandeja al volver a ella.
   *
   * Partirlo en `consultar`/`aplicar` como en las páginas de informes no
   * arreglaría nada aquí: perdería justamente el camino rápido.
   *
   * Lo mismo vale para `setCarpetaAbiertaEstado`: restaura desde
   * `sessionStorage` dónde se había quedado el revisor, y tiene que ocurrir en
   * el mismo paso que la carga para que la carpeta aparezca ya abierta en vez
   * de abrirse de golpe un render después.
   */
  useEffect(() => {
    if (authLoading || !user) return;

    // Quien vuelve de aprobar una inspección retoma donde estaba, en vez de
    // encontrarse la bandeja cerrada de nuevo.
    const seleccion = leerSeleccion(user.username);
    if (seleccion) {
      setAreaAbiertaEstado(seleccion.areaAbierta);
      setCarpetaAbiertaEstado(seleccion.carpeta);
    }

    // El administrador ve todas las áreas, así que no hay nada que elegir: lo
    // único suyo que se recupera es el área y la carpeta abiertas, arriba.
    if (isAdmin) {
      loadInspections([]);
      return;
    }

    if (seleccion?.areas.length) {
      loadInspections(seleccion.areas);
    }
  }, [authLoading, user, isAdmin, loadInspections]);

  // ── Agrupaciones derivadas ────────────────────────────────────────────────
  const groupedByTemplate = useMemo(() => {
    const map = new Map<string, TemplateGroup>();
    for (const insp of inspections) {
      if (!map.has(insp.templateCode))
        map.set(insp.templateCode, {
          templateName: insp.templateName || insp.templateCode,
          items: [],
        });
      map.get(insp.templateCode)!.items.push(insp);
    }
    return [...map.entries()].sort(
      ([, a], [, b]) => b.items.length - a.items.length,
    );
  }, [inspections]);

  const groupedByArea = useMemo((): AreaGroup[] => {
    const areaMap = new Map<string, Map<string, TemplateGroup>>();
    for (const insp of inspections) {
      const area = insp.area || 'Sin Área';
      if (!areaMap.has(area)) areaMap.set(area, new Map());
      const tplMap = areaMap.get(area)!;
      if (!tplMap.has(insp.templateCode))
        tplMap.set(insp.templateCode, {
          templateName: insp.templateName || insp.templateCode,
          items: [],
        });
      tplMap.get(insp.templateCode)!.items.push(insp);
    }
    return [...areaMap.entries()]
      .sort(([, a], [, b]) => {
        const sum = (m: Map<string, TemplateGroup>) =>
          [...m.values()].reduce((s, g) => s + g.items.length, 0);
        return sum(b) - sum(a);
      })
      .map(([area, byTemplate]) => ({ area, byTemplate }));
  }, [inspections]);

  return {
    user,
    authLoading,
    isAdmin,
    inspections,
    loading,
    error,
    loadedAreas,
    setLoadedAreas,
    carpetaAbierta,
    setCarpetaAbierta,
    areaAbierta,
    setAreaAbierta,
    reiniciarSeleccion,
    loadInspections,
    refreshInspections,
    removeInspection,
    groupedByTemplate,
    groupedByArea,
  };
};
