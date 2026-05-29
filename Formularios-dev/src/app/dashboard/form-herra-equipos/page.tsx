"use client";

import React, { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import FormHerraEquipos from "@/components/features/herra-equipos/FormHerraEquipos";

export default function LlenarFormulariosPage() {
  return (
    <Suspense
      fallback={
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      }
    >
      <FormHerraEquipos />
    </Suspense>
  );
}
