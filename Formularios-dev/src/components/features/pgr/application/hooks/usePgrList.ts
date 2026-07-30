"use client";

import { useCallback, useMemo, useState } from "react";
import {
  obtenerPgrs,
  actualizarPgr,
  eliminarPgr,
} from "../../infrastructure/adapters/pgrAdapter";
import { Pgr, PgrFilters } from "../../domain/models/IProps";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

const FILTROS_INICIALES: PgrFilters = {
  codigo: "",
  empresa: "",
  estado: "",
  activo: "",
};

/**
 * Hook para el listado + filtros + acciones básicas (activar/desactivar,
 * eliminar) de Planes PGR. Consumido por `dashboard/pgr/page.tsx`.
 * También reutilizable por `dashboard/graphics/pgr/page.tsx`, que solo
 * necesita `planes` / `isLoading` / `error` / `loadPlanes`.
 */
export function usePgrList() {
  const [planes, setPlanes] = useState<Pgr[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PgrFilters>(FILTROS_INICIALES);

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

  const loadPlanes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await obtenerPgrs();
      setPlanes(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los planes PGR",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setFilter = useCallback(
    <K extends keyof PgrFilters>(key: K, value: PgrFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const limpiarFiltros = useCallback(() => setFilters(FILTROS_INICIALES), []);

  const planesFiltrados = useMemo(() => {
    let filtrados = planes;

    if (filters.codigo.trim()) {
      const term = filters.codigo.toLowerCase().trim();
      filtrados = filtrados.filter((p) =>
        p.codigoAutogenerado?.toLowerCase().includes(term),
      );
    }

    if (filters.empresa.trim()) {
      const term = filters.empresa.toLowerCase().trim();
      filtrados = filtrados.filter((p) => p.empresa?.toLowerCase().includes(term));
    }

    if (filters.estado) {
      filtrados = filtrados.filter((p) => p.estado === filters.estado);
    }

    if (filters.activo) {
      const isActivo = filters.activo === "true";
      filtrados = filtrados.filter((p) => p.activo === isActivo);
    }

    return filtrados;
  }, [planes, filters]);

  const toggleActivo = useCallback(
    async (plan: Pgr) => {
      setIsLoading(true);
      try {
        const nuevoEstado = plan.activo !== undefined ? !plan.activo : false;
        const result = await actualizarPgr(plan._id, { activo: nuevoEstado });
        if (result.success) {
          showSnackbar(
            nuevoEstado ? "Plan activado exitosamente" : "Plan desactivado exitosamente",
            "success",
          );
          await loadPlanes();
        } else {
          showSnackbar(result.error || "Error al actualizar el plan", "error");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [loadPlanes, showSnackbar],
  );

  const eliminarPlan = useCallback(
    async (planId: string) => {
      setIsLoading(true);
      try {
        const result = await eliminarPgr(planId);
        if (result.success) {
          showSnackbar("Plan eliminado exitosamente", "success");
          await loadPlanes();
        } else {
          showSnackbar(result.error || "Error al eliminar el plan", "error");
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [loadPlanes, showSnackbar],
  );

  return {
    planes,
    planesFiltrados,
    isLoading,
    error,
    loadPlanes,
    filters,
    setFilter,
    limpiarFiltros,
    toggleActivo,
    eliminarPlan,
    snackbar,
    showSnackbar,
    closeSnackbar,
  };
}
