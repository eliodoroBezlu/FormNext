import { useState, useEffect, useCallback } from "react";
import { Tag, FormularioInspeccion, Extintor } from "../types/IProps";
import { obtenerDashboardData } from "../actions";

export const useDashboardData = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [inspecciones, setInspecciones] = useState<FormularioInspeccion[]>([]);
  const [extintores, setExtintores] = useState<Extintor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      setError(null);

      const { tags, inspecciones, extintores } = await obtenerDashboardData();

      setTags(tags);
      setInspecciones(inspecciones);
      setExtintores(extintores);
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
    loading,
    error,
    lastUpdated,
    refreshing,
    fetchData,
  };
};
