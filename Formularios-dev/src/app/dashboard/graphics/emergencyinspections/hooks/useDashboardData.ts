import { useState, useEffect, useCallback } from "react";
import { Tag, FormularioInspeccion, Extintor } from "../types/IProps";
import { obtenerDashboardData } from "../actions";
import { AreaBackend } from "@/lib/actions/area-actions";

export const useDashboardData = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [inspecciones, setInspecciones] = useState<FormularioInspeccion[]>([]);
  const [extintores, setExtintores] = useState<Extintor[]>([]);
  const [areas, setAreas] = useState<AreaBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      setError(null);

      const result = await obtenerDashboardData();
      if (!result) {
        // Puede pasar en dev si la Server Action quedó con una referencia
        // obsoleta tras un hot-reload (Turbopack) — un refresh la resuelve.
        throw new Error(
          "No se recibió respuesta del servidor. Refresca la página e intenta de nuevo.",
        );
      }

      const { tags, inspecciones, extintores, areas } = result;

      setTags(tags);
      setInspecciones(inspecciones);
      setExtintores(extintores);
      setAreas(areas);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    tags,
    inspecciones,
    extintores,
    areas,
    loading,
    error,
    lastUpdated,
    refreshing,
    fetchData,
  };
};
