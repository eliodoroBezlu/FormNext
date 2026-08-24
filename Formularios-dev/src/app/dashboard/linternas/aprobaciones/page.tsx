"use client";

import { Alert, Box, Snackbar, Stack, Typography } from "@mui/material";
import { AprobacionPerdida } from "@/components/features/linternas/presentation/components/AprobacionPerdida";
import { useAprobacionesLinterna } from "@/components/features/linternas/application/hooks/useLinternas";

export default function AprobacionesLinternaPage() {
  const { pendientes, cargando, error, setError, resolver } =
    useAprobacionesLinterna();

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700}>
        Reposiciones por pérdida
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Nada se entrega hasta que se apruebe.
      </Typography>

      {cargando ? (
        <Alert severity="info">Cargando…</Alert>
      ) : pendientes.length === 0 ? (
        <Alert severity="success">No hay solicitudes pendientes.</Alert>
      ) : (
        <Stack gap={2}>
          {pendientes.map((entrega) => (
            <AprobacionPerdida
              key={entrega._id}
              entrega={entrega}
              onResolver={resolver}
            />
          ))}
        </Stack>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={8000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
