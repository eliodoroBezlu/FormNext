"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import { useUserRole } from "@/hooks/useUserRole";
import { usePgr } from "./usePgr";
import { aprobarPgr } from "../../infrastructure/adapters/pgrAdapter";
import {
  ActividadEstado,
  ActividadPgr,
  AprobacionRespuesta,
} from "../../domain/models/IProps";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

/**
 * Orquesta el flujo de aprobación por actividad de un PGR.
 * Reemplaza el "Gerente General" hardcodeado por el nombre del usuario
 * autenticado (`useUserRole`).
 */
export function usePgrAprobacion(id: string) {
  const router = useRouter();
  const { pgr, isLoading, error } = usePgr(id);
  const { user } = useUserRole();

  const [aprobadoPor, setAprobadoPor] = useState("");
  const [fechaAprobacion, setFechaAprobacion] = useState<Dayjs | null>(dayjs());
  const [respuestas, setRespuestas] = useState<
    Record<string, AprobacionRespuesta>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState["severity"]) =>
      setSnackbar({ open: true, message, severity }),
    [],
  );

  const closeSnackbar = useCallback(
    () => setSnackbar((prev) => ({ ...prev, open: false })),
    [],
  );

  // Precarga "Aprobado por" con el nombre del usuario autenticado.
  useEffect(() => {
    if (user) {
      setAprobadoPor(user.fullName || user.username || "");
    }
  }, [user]);

  // Inicializa las respuestas de aprobación con los datos del plan cargado.
  useEffect(() => {
    if (!pgr?.actividades) return;
    const initial: Record<string, AprobacionRespuesta> = {};
    pgr.actividades.forEach((act: ActividadPgr) => {
      initial[act._id] = {
        estado: act.estadoAprobacion || ActividadEstado.APROBADO,
        motivo: act.motivoRechazo || "",
      };
    });
    setRespuestas(initial);
  }, [pgr]);

  const handleEstadoChange = useCallback(
    (actividadId: string, value: ActividadEstado) => {
      setRespuestas((prev) => ({
        ...prev,
        [actividadId]: { ...prev[actividadId], estado: value },
      }));
    },
    [],
  );

  const handleMotivoChange = useCallback((actividadId: string, value: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [actividadId]: { ...prev[actividadId], motivo: value },
    }));
  }, []);

  const isAllApproved =
    Object.values(respuestas).length > 0 &&
    Object.values(respuestas).every((r) => r.estado === ActividadEstado.APROBADO);

  const handleAprobar = useCallback(async () => {
    if (!pgr) return;
    setIsSubmitting(true);
    try {
      const payload = {
        aprobadoPor,
        actividadesAprobacion: Object.keys(respuestas).map((key) => ({
          _id: key,
          estadoAprobacion: respuestas[key].estado,
          motivoRechazo: respuestas[key].motivo,
        })),
      };
      const result = await aprobarPgr(pgr._id, payload);
      if (result.success) {
        showSnackbar("Respuesta enviada exitosamente", "success");
        router.push("/dashboard/pgr");
      } else {
        showSnackbar(result.error || "Ocurrió un error al enviar la respuesta", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [pgr, aprobadoPor, respuestas, router, showSnackbar]);

  return {
    pgr,
    isLoading,
    error,
    aprobadoPor,
    setAprobadoPor,
    fechaAprobacion,
    setFechaAprobacion,
    respuestas,
    handleEstadoChange,
    handleMotivoChange,
    isAllApproved,
    isSubmitting,
    handleAprobar,
    snackbar,
    closeSnackbar,
  };
}
