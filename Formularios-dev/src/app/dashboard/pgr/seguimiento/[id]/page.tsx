"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { usePgrSeguimiento } from "@/components/features/pgr/application/hooks/usePgrSeguimiento";
import { PgrSeguimientoView } from "@/components/features/pgr/presentation/components/PgrSeguimientoView";

export default function PgrSeguimiento({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const {
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
  } = usePgrSeguimiento(id);

  if (isLoading)
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  if (!pgr)
    return (
      <Typography p={4} color="error">
        {error || "Plan no encontrado"}
      </Typography>
    );

  return (
    <PgrSeguimientoView
      pgr={pgr}
      seguimientoData={seguimientoData}
      pendingFiles={pendingFiles}
      saving={saving}
      onChange={handleChange}
      onCantidadChange={handleCantidadChange}
      onFileUpload={handleFileUpload}
      onRemovePendingFile={removePendingFile}
      onRemoveSavedFile={removeSavedFile}
      onGuardar={onGuardarSeguimiento}
      onVerDashboard={() => router.push("/dashboard/pgr")}
      snackbar={snackbar}
      onCloseSnackbar={closeSnackbar}
    />
  );
}
