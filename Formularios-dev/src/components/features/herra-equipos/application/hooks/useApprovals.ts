'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import {
  getPendingApprovals,
  InspectionResponse,
} from '@/lib/actions/inspection-herra-equipos';
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

  const isAdmin = hasRole(Role.ADMIN) || hasRole(Role.SUPERINTENDENTE);

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

      // Si no se fuerza refresco, intentar usar caché
      if (!forceRefresh) {
        const cached = readCache(user.username);
        if (cached) {
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
        const result = await getPendingApprovals(
          user.username,
          isAdmin ? undefined : areas,
          isAdmin,
        );
        if (!result.success) throw new Error(result.error || 'Error al cargar');
        const data = result.data || [];
        setInspections(data);
        setLoadedAreas(areas);
        writeCache({ inspections: data, areas, timestamp: Date.now(), username: user.username });
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

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      loadInspections([]);
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
    loadInspections,
    refreshInspections,
    removeInspection,
    groupedByTemplate,
    groupedByArea,
  };
};
