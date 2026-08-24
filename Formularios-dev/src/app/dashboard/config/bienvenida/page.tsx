"use client";

import { Box, Typography } from "@mui/material";
import { ConfigBienvenidaForm } from "@/components/features/bienvenida/presentation/components/ConfigBienvenidaForm";

export default function ConfigBienvenidaPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" fontWeight={700}>
        Pantalla de bienvenida
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Lo que se ve mientras el sistema abre la sesión.
      </Typography>

      <ConfigBienvenidaForm />
    </Box>
  );
}
