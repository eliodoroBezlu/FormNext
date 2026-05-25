'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import {
  getPendingApprovals,
  InspectionResponse,
} from '@/lib/actions/inspection-herra-equipos';
import { Role } from '@/lib/routePermissions';

export interface TemplateGroup {
  templateName: string;
  items: InspectionResponse[];
}

export interface AreaGroup {
  area: string;
  byTemplate: Map<string, TemplateGroup>;
}

export const useApprovals = (onApprovalChange?: () => void) => {
  const { user, isLoading: authLoading, hasRole } = useUserRole();
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedAreas, setLoadedAreas] = useState<string[] | null>(null);

  const isAdmin = hasRole(Role.ADMIN) || hasRole(Role.SUPERINTENDENTE);

  const loadInspections = useCallback(
    async (areas: string[]) => {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);
        const result = await getPendingApprovals(
          user.username,
          isAdmin ? undefined : areas,
          isAdmin,
        );
        if (!result.success) throw new Error(result.error || 'Error al cargar');
        setInspections(result.data || []);
        setLoadedAreas(areas);
        onApprovalChange?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [user, isAdmin, onApprovalChange],
  );

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      loadInspections([]);
    }
  }, [authLoading, user, isAdmin, loadInspections]);

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
    groupedByTemplate,
    groupedByArea,
  };
};
