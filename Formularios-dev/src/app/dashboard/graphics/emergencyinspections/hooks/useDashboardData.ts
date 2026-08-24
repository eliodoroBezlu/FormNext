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

  const aplicar = useCallback(
    (result: NonNullable<Awaited<ReturnType<typeof obtenerDashboardData>>>) => {
      const { tags, inspecciones, extintores, areas } = result;
      setTags(tags);
      setInspecciones(inspecciones);
      setExtintores(extintores);
      setAreas(areas);
      setLastUpdated(new Date());
      setError(null);
    },
    [],
  );

  const avisarFallo = useCallback((err: unknown) => {
    console.error("Error fetching data:", err);
    setError(err instanceof Error ? err.message : "Error desconocido");
  }, []);

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

      aplicar(result);
    } catch (err) {
      avisarFallo(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [aplicar, avisarFallo]);

  useEffect(() => {
    // La primera consulta se encadena aquí en vez de llamar a `fetchData()`:
    // el analizador rastrea dentro de las funciones `async` y trataría sus
    // setState como síncronos. El `setInterval` sí puede llamarla: es un
    // callback, no el cuerpo del efecto.
    let vigente = true;

    obtenerDashboardData()
      .then((result) => {
        if (!vigente) return;
        if (!result) {
          throw new Error(
            "No se recibió respuesta del servidor. Refresca la página e intenta de nuevo.",
          );
        }
        aplicar(result);
      })
      .catch((err: unknown) => {
        if (vigente) avisarFallo(err);
      })
      .finally(() => {
        if (vigente) setLoading(false);
      });

    const interval = setInterval(() => void fetchData(), 30000);

    return () => {
      vigente = false;
      clearInterval(interval);
    };
  }, [fetchData, aplicar, avisarFallo]);

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
