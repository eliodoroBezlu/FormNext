"use client";

import { useCallback, useEffect, useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import {
  dashboardAdapter,
  type InspectionResponse,
} from "../../infrastructure/adapters/dashboardAdapter";
import { ACTIVITY_FEED_MAX_VISIBLE, SUPERVISOR_ROLES } from "../../domain/models/dashboardModels";

/**
 * Carga la actividad reciente a mostrar en el feed del dashboard: para
 * supervisores/admin es la actividad del área en las últimas 8h, para
 * técnicos/inspectores son sus propias inspecciones de las últimas 24h.
 */
export function useActivityFeed() {
  const { user, userRole, hasAnyRole, isLoading: authLoading } = useUserRole();
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSupervisorLike = hasAnyRole(SUPERVISOR_ROLES);

  const loadActivity = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      let result;
      if (isSupervisorLike) {
        // Supervisor/Admin: ver inspecciones del área en las últimas 8h
        result = await dashboardAdapter.getRecentActivityByArea({
          areas: user.area ? [user.area] : undefined,
          limit: ACTIVITY_FEED_MAX_VISIBLE + 5,
          sinceHours: 8,
        });
      } else {
        // Técnico/Inspector: ver solo sus propias inspecciones de las últimas 24h
        result = await dashboardAdapter.getRecentActivityByArea({
          submittedBy: user.username,
          limit: ACTIVITY_FEED_MAX_VISIBLE + 5,
          sinceHours: 24,
        });
      }
      if (result.success && result.data) {
        setInspections(result.data.slice(0, ACTIVITY_FEED_MAX_VISIBLE));
      } else {
        setError("No se pudo cargar la actividad reciente.");
      }
    } catch {
      setError("Error al cargar la actividad.");
    } finally {
      setLoading(false);
    }
  }, [user, isSupervisorLike]);

  useEffect(() => {
    if (!authLoading && user) {
      loadActivity();
    }
  }, [authLoading, user, loadActivity]);

  return {
    user,
    userRole,
    authLoading,
    loading,
    error,
    inspections,
    isSupervisorLike,
  };
}
