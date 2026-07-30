"use client";

import React, { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import NewInspectionTemplates from "@/components/features/herra-equipos/presentation/components/management/NewInspectionTemplates";

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
      <NewInspectionTemplates />
    </Suspense>
  );
}
