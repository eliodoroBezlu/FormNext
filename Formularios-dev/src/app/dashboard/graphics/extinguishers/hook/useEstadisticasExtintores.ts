// hooks/useExtintoresData.ts
import { useState, useEffect } from "react";
import type { Extintor, AreaStats } from "../types/Iprops";
import { getAuthHeaders } from "@/lib/actions/helpers";

export const useExtintoresData = () => {
  const [extintores, setExtintores] = useState<Extintor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fetchExtintores = async (): Promise<void> => {
    try {
      setError(null);
      const headers = await getAuthHeaders();
      const response = await fetch("/api/forms/extintor/", {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Extintor[] = await response.json();
      setExtintores(data);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error: unknown) {
      console.error("❌ Error fetching extintores:", error);
      const errorMessage: string =
        error instanceof Error 
          ? error.message 
          : typeof error === "string" 
            ? error 
            : "Error desconocido";
      setError(`Error de conexión: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExtintores();
    const interval = setInterval(fetchExtintores, 15000);
    return () => clearInterval(interval);
  }, []);

  const calcularEstadisticas = (): AreaStats[] => {
    const areas = [...new Set(extintores.map((e) => e.area))];

    return areas.map((area) => {
      const extintoresArea = extintores.filter((e) => e.area === area);
      const total = extintoresArea.length;
      const inspeccionados = extintoresArea.filter(
        (e) => e.inspeccionado
      ).length;
      const activos = extintoresArea.filter((e) => e.activo).length;
      const porcentaje =
        total > 0 ? Math.round((inspeccionados / total) * 100) : 0;

      return {
        area,
        total,
        inspeccionados,
        activos,
        porcentaje,
      };
    });
  };

  const areasConAlerta = (): AreaStats[] => {
    const stats = calcularEstadisticas();
    return stats.filter((area) => area.porcentaje < 70);
  };

  const handleRetry = (): void => {
    setLoading(true);
    setError(null);
    fetchExtintores();
  };

  return {
    extintores,
    loading,
    lastUpdate,
    error,
    handleRetry,
    calcularEstadisticas,
    areasConAlerta,
  };
};