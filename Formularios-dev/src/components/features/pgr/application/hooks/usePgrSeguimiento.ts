"use client";

import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { uploadImageToCloudinary } from "@/lib/actions/cloudinary";
import { usePgr } from "./usePgr";
import { addSeguimientoBatch } from "../../infrastructure/adapters/pgrAdapter";
import {
  ActividadPgr,
  CategoriaEjecucionKey,
  PendingFile,
  SeguimientoActividadState,
  SeguimientoBatchItem,
} from "../../domain/models/IProps";
import { normalizarProgramacion } from "../../domain/pgrHelpers";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Orquesta el flujo de seguimiento/ejecución de las actividades de un PGR:
 * edición de campos por actividad, carga de evidencias a Cloudinary y guardado
 * en un único envío mediante el nuevo endpoint por lote
 * (`PATCH /pgr/:id/seguimiento/batch`), reemplazando el loop secuencial de
 * PATCH por actividad que existía antes.
 */
export function usePgrSeguimiento(id: string) {
  const { pgr, isLoading, error } = usePgr(id);

  const [seguimientoData, setSeguimientoData] = useState<
    Record<string, SeguimientoActividadState>
  >({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, PendingFile[]>>(
    {},
  );
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
    if (!pgr?.actividades) return;
    const initial: Record<string, SeguimientoActividadState> = {};
    pgr.actividades.forEach((act: ActividadPgr) => {
      initial[act._id] = {
        semaforoTiempo: act.semaforoTiempo || "En el Mes",
        fechaEjecucion: act.fechaEjecucion || undefined,
        observaciones: act.observaciones || "",
        evidencias: act.evidencias || [],
        // Siempre 12 meses para poder indexar por mes sin comprobar huecos.
        programacion: normalizarProgramacion(act),
      };
    });
    setSeguimientoData(initial);
  }, [pgr]);

  /**
   * Registra la cantidad ejecutada de un mes en una de las 3 categorías de
   * oportunidad. Solo «a tiempo» y «adelantado» cuentan para eficiencia; el
   * cálculo lo hace el backend a partir de estas cantidades.
   */
  const handleCantidadChange = useCallback(
    (
      actId: string,
      mes: number,
      categoria: CategoriaEjecucionKey,
      cantidad: number,
    ) => {
      setSeguimientoData((prev) => {
        const actual = prev[actId];
        if (!actual) return prev;
        return {
          ...prev,
          [actId]: {
            ...actual,
            programacion: (actual.programacion ?? []).map((p) =>
              p.mes === mes ? { ...p, [categoria]: cantidad } : p,
            ),
          },
        };
      });
    },
    [],
  );

  const handleChange = useCallback(
    (
      actId: string,
      field: keyof SeguimientoActividadState,
      value: string | dayjs.Dayjs | null,
    ) => {
      setSeguimientoData((prev) => ({
        ...prev,
        [actId]: { ...prev[actId], [field]: value as never },
      }));
    },
    [],
  );

  const handleFileUpload = useCallback(
    (actId: string, event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const newPendingFiles: PendingFile[] = [];
      const rejected: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > MAX_FILE_SIZE) {
          rejected.push(file.name);
          continue;
        }
        const isImage = file.type.startsWith("image/");
        const previewUrl = URL.createObjectURL(file);
        newPendingFiles.push({ file, previewUrl, isImage, name: file.name });
      }

      if (rejected.length > 0) {
        showSnackbar(
          `${rejected.join(", ")} ${rejected.length > 1 ? "son" : "es"} demasiado ${rejected.length > 1 ? "grandes" : "grande"} (máximo 10MB)`,
          "warning",
        );
      }

      setPendingFiles((prev) => ({
        ...prev,
        [actId]: [...(prev[actId] || []), ...newPendingFiles],
      }));

      event.target.value = "";
    },
    [showSnackbar],
  );

  const removePendingFile = useCallback((actId: string, index: number) => {
    setPendingFiles((prev) => {
      const newFiles = [...(prev[actId] || [])];
      URL.revokeObjectURL(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return { ...prev, [actId]: newFiles };
    });
  }, []);

  const removeSavedFile = useCallback((actId: string, index: number) => {
    setSeguimientoData((prev) => {
      const newEvidencias = [...(prev[actId]?.evidencias || [])];
      newEvidencias.splice(index, 1);
      return { ...prev, [actId]: { ...prev[actId], evidencias: newEvidencias } };
    });
  }, []);

  const onGuardarSeguimiento = useCallback(async () => {
    if (!pgr) return;
    setSaving(true);
    try {
      const dataToSave = { ...seguimientoData };

      for (const actId of Object.keys(pendingFiles)) {
        const filesToUpload = pendingFiles[actId] || [];
        if (filesToUpload.length === 0) continue;

        const uploadedUrls: string[] = [];
        for (const item of filesToUpload) {
          const formData = new FormData();
          formData.append("file", item.file);
          const { url } = await uploadImageToCloudinary(formData);
          uploadedUrls.push(url);
        }

        dataToSave[actId] = {
          ...dataToSave[actId],
          evidencias: [...(dataToSave[actId]?.evidencias || []), ...uploadedUrls],
        };
      }

      const seguimientos: SeguimientoBatchItem[] = Object.keys(dataToSave).map(
        (actId) => {
          const item = { ...dataToSave[actId] };
          if (item.fechaEjecucion) {
            const parsedDate = dayjs(item.fechaEjecucion);
            item.fechaEjecucion = parsedDate.isValid()
              ? parsedDate.toISOString()
              : undefined;
          }
          return { actividadId: actId, ...item };
        },
      );

      const result = await addSeguimientoBatch(pgr._id, { seguimientos });

      if (result.success) {
        setSeguimientoData(dataToSave);
        setPendingFiles({});
        showSnackbar("Seguimiento guardado correctamente", "success");
      } else {
        showSnackbar(
          result.error || "Error al guardar seguimiento",
          "error",
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      showSnackbar(`Error al guardar seguimiento: ${errorMessage}`, "error");
    } finally {
      setSaving(false);
    }
  }, [pgr, seguimientoData, pendingFiles, showSnackbar]);

  return {
    pgr,
    isLoading,
    error,
    seguimientoData,
    pendingFiles,
    saving,
    handleChange,
    handleCantidadChange,
    handleFileUpload,
    removePendingFile,
    removeSavedFile,
    onGuardarSeguimiento,
    snackbar,
    closeSnackbar,
  };
}
