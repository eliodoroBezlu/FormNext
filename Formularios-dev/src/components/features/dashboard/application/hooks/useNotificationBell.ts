"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import {
  dashboardAdapter,
  type InspectionResponse,
} from "../../infrastructure/adapters/dashboardAdapter";
import {
  NOTIFICATION_LS_KEY,
  NOTIFICATION_POLL_INTERVAL_MS,
  SUPERVISOR_ROLES,
} from "../../domain/models/dashboardModels";

/**
 * Estado y polling de la campana de notificaciones: trae actividad
 * reciente del área del supervisor y calcula cuántas son "no leídas"
 * respecto de la última vez que se abrió el panel.
 */
export function useNotificationBell() {
  // ✅ TODOS los hooks PRIMERO — nunca después de un return condicional
  const { user, hasAnyRole } = useUserRole();
  const [notifications, setNotifications] = useState<InspectionResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSupervisorLike = hasAnyRole(SUPERVISOR_ROLES);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const result = await dashboardAdapter.getRecentActivityByArea({
        areas: user.area ? [user.area] : undefined,
        limit: 20,
        sinceHours: 8,
      });

      if (!result.success || !result.data) return;

      const data = result.data;
      setNotifications(data);

      // Contar nuevas desde la última vez que el usuario vio las notificaciones
      const lastSeen = localStorage.getItem(NOTIFICATION_LS_KEY);
      const lastSeenDate = lastSeen ? new Date(lastSeen) : new Date(0);
      const newCount = data.filter(
        (insp) => new Date(insp.submittedAt) > lastSeenDate
      ).length;
      setUnreadCount(newCount);
    } catch {
      // Silencioso — la campana no es crítica
    }
  }, [user]);

  useEffect(() => {
    // El efecto solo actúa si es supervisor; pero el hook siempre se llama
    if (!user || !isSupervisorLike) return;

    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, NOTIFICATION_POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, isSupervisorLike, fetchNotifications]);

  /** Se llama al abrir el panel: marca como vistas y refresca. */
  const openAndRefresh = useCallback(async () => {
    localStorage.setItem(NOTIFICATION_LS_KEY, new Date().toISOString());
    setUnreadCount(0);
    setLoading(true);
    try {
      await fetchNotifications();
    } finally {
      setLoading(false);
    }
  }, [fetchNotifications]);

  return {
    user,
    isSupervisorLike,
    notifications,
    unreadCount,
    loading,
    openAndRefresh,
  };
}
