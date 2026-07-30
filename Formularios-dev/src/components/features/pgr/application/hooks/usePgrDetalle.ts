"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePgr } from "./usePgr";
import { actualizarPgr } from "../../infrastructure/adapters/pgrAdapter";
import { Pgr, PgrEstado } from "../../domain/models/IProps";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export interface PgrDetalleFormData {
  empresa: string;
  vicepresidencia: string;
  gerencia: string;
  superintendencia: string;
  gestion: string;
  estado: PgrEstado | "";
  codigoAutogenerado: string;
}

const EMPTY_FORM: PgrDetalleFormData = {
  empresa: "",
  vicepresidencia: "",
  gerencia: "",
  superintendencia: "",
  gestion: "",
  estado: "",
  codigoAutogenerado: "",
};

/**
 * Orquesta la vista/edición de los datos generales de un PGR
 * (`dashboard/pgr/[id]/page.tsx`), reutilizando `usePgr` para la carga.
 */
export function usePgrDetalle(id: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isViewMode = searchParams.get("mode") === "view";

  const { pgr, isLoading, error } = usePgr(id);

  const [formData, setFormData] = useState<PgrDetalleFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    if (!pgr) return;
    setFormData({
      empresa: pgr.empresa || "",
      vicepresidencia: pgr.vicepresidencia || "",
      gerencia: pgr.gerencia || "",
      superintendencia: pgr.superintendencia || "",
      gestion: pgr.gestion || "",
      estado: pgr.estado || "",
      codigoAutogenerado: pgr.codigoAutogenerado || "",
    });
  }, [pgr]);

  const handleChange = useCallback(
    (field: keyof PgrDetalleFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const result = await actualizarPgr(id, formData as Partial<Pgr>);
      if (result.success) {
        showSnackbar("PGR actualizado correctamente", "success");
        router.push("/dashboard/pgr");
      } else {
        showSnackbar(result.error || "Error al actualizar el PGR", "error");
      }
    } finally {
      setSaving(false);
    }
  }, [id, formData, router, showSnackbar]);

  return {
    pgr,
    isLoading,
    error,
    isViewMode,
    formData,
    handleChange,
    saving,
    handleSave,
    snackbar,
    closeSnackbar,
  };
}
