"use client";

import { use } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { usePgrAprobacion } from "@/components/features/pgr/application/hooks/usePgrAprobacion";
import { PgrAprobacionView } from "@/components/features/pgr/presentation/components/PgrAprobacionView";

export default function PgrAprobacion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
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
  } = usePgrAprobacion(id);

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
    <PgrAprobacionView
      pgr={pgr}
      aprobadoPor={aprobadoPor}
      onAprobadoPorChange={setAprobadoPor}
      fechaAprobacion={fechaAprobacion}
      onFechaAprobacionChange={setFechaAprobacion}
      respuestas={respuestas}
      onEstadoChange={handleEstadoChange}
      onMotivoChange={handleMotivoChange}
      isAllApproved={isAllApproved}
      isSubmitting={isSubmitting}
      onSubmit={handleAprobar}
      snackbar={snackbar}
      onCloseSnackbar={closeSnackbar}
    />
  );
}
