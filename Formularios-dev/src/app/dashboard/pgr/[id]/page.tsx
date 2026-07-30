"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography, Alert, Snackbar } from "@mui/material";
import { usePgrDetalle } from "@/components/features/pgr/application/hooks/usePgrDetalle";
import { PgrDetailView } from "@/components/features/pgr/presentation/components/PgrDetailView";

export default function PgrDetalleEdit({
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
    isViewMode,
    formData,
    handleChange,
    saving,
    handleSave,
    snackbar,
    closeSnackbar,
  } = usePgrDetalle(id);

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
    <>
      <PgrDetailView
        pgr={pgr}
        isViewMode={isViewMode}
        formData={formData}
        onChange={handleChange}
        saving={saving}
        onSave={handleSave}
        onBack={() => router.back()}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
