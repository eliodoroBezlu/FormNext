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

  /** Solo consulta y devuelve; no toca el estado. */
  const consultarNotificaciones = useCallback(async () => {
    if (!user) return null;
    try {
      const result = await dashboardAdapter.getRecentActivityByArea({
        areas: user.area ? [user.area] : undefined,
        limit: 20,
        sinceHours: 8,
      });
      return result.success && result.data ? result.data : null;
    } catch {
      // Silencioso — la campana no es crítica
      return null;
    }
  }, [user]);

  const aplicar = useCallback(
    (data: InspectionResponse[] | null) => {
      if (!data) return;
      setNotifications(data);

      // Contar nuevas desde la última vez que el usuario vio las notificaciones
      const lastSeen = localStorage.getItem(NOTIFICATION_LS_KEY);
      const lastSeenDate = lastSeen ? new Date(lastSeen) : new Date(0);
      const newCount = data.filter(
        (insp) => new Date(insp.submittedAt) > lastSeenDate
      ).length;
      setUnreadCount(newCount);
    },
    [],
  );

  const fetchNotifications = useCallback(async () => {
    aplicar(await consultarNotificaciones());
  }, [consultarNotificaciones, aplicar]);

  useEffect(() => {
    // El efecto solo actúa si es supervisor; pero el hook siempre se llama
    if (!user || !isSupervisorLike) return;

    // La primera consulta se encadena aquí en vez de llamar a la función
    // `async`: el analizador rastrea dentro de ella y trataría sus setState
    // como síncronos. El `setInterval` sí puede llamarla: es un callback.
    let vigente = true;

    void consultarNotificaciones().then((data) => {
      if (vigente) aplicar(data);
    });

    intervalRef.current = setInterval(
      () => void fetchNotifications(),
      NOTIFICATION_POLL_INTERVAL_MS,
    );

    return () => {
      vigente = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    user,
    isSupervisorLike,
    consultarNotificaciones,
    aplicar,
    fetchNotifications,
  ]);

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
