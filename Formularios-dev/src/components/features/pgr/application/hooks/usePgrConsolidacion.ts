"use client";

import { useCallback, useEffect, useState } from "react";
import {
  consolidarDesdeMatrices,
  previsualizarConsolidacion,
} from "../../infrastructure/adapters/pgrAdapter";
import { VistaPreviaConsolidacion } from "../../domain/models/IProps";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

/**
 * Trae las actividades que las matrices de riesgo aprobadas aportarían a este
 * PGR y, si se confirma, las vuelca.
 *
 * La previsualización se recarga al cambiar `desdoblarPorArea` porque esa
 * opción cambia el agrupamiento: con ella activada una misma medida en dos
 * áreas produce dos actividades en vez de una.
 */
export function usePgrConsolidacion(pgrId: string) {
  const [vista, setVista] = useState<VistaPreviaConsolidacion | null>(null);
  const [desdoblarPorArea, setDesdoblarPorArea] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Se incrementa para forzar una recarga sin cambiar los parámetros. */
  const [recargas, setRecargas] = useState(0);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const closeSnackbar = useCallback(
    () => setSnackbar((prev) => ({ ...prev, open: false })),
    [],
  );

  const recargar = useCallback(() => setRecargas((n) => n + 1), []);

  useEffect(() => {
    // Alternar el desdoble dispara una petición nueva antes de que llegue la
    // anterior; sin esta bandera la respuesta vieja podría pisar a la nueva y
    // la pantalla mostraría un agrupamiento que no es el elegido.
    let vigente = true;

    const traer = async () => {
      setIsLoading(true);
      setError(null);

      const res = await previsualizarConsolidacion(pgrId, desdoblarPorArea);
      if (!vigente) return;

      if (res.success && res.data) {
        setVista(res.data);
      } else {
        setError(res.error ?? "No se pudo previsualizar la consolidación");
        setVista(null);
      }
      setIsLoading(false);
    };

    void traer();
    return () => {
      vigente = false;
    };
  }, [pgrId, desdoblarPorArea, recargas]);

  const consolidar = useCallback(async () => {
    setIsSubmitting(true);

    const res = await consolidarDesdeMatrices(pgrId, desdoblarPorArea);

    if (res.success) {
      setSnackbar({
        open: true,
        message: res.message ?? "Consolidación realizada",
        severity: "success",
      });
      // Tras consolidar, todo lo propuesto pasa a "sin-cambios": se recarga
      // para que la pantalla refleje el estado real y no el previo.
      recargar();
    } else {
      setSnackbar({
        open: true,
        message: res.error ?? "No se pudo consolidar",
        severity: "error",
      });
    }
    setIsSubmitting(false);
  }, [pgrId, desdoblarPorArea, recargar]);

  /** Hay algo que aportar solo si alguna propuesta cambia el PGR. */
  const hayCambios =
    vista?.propuestas.some((p) => p.efecto !== "sin-cambios") ?? false;

  return {
    vista,
    isLoading,
    isSubmitting,
    error,
    desdoblarPorArea,
    setDesdoblarPorArea,
    hayCambios,
    consolidar,
    recargar,
    snackbar,
    closeSnackbar,
  };
}
