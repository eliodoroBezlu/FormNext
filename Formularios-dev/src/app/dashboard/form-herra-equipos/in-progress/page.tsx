"use client";

import React, { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import { InProgressInspectionsList } from "@/components/features/herra-equipos/InProgressInspectionsList";

export default function InProgressInspectionsPage() {
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
      <InProgressInspectionsList filterByTemplateCode="1.02.P06.F30" />
    </Suspense>
  );
}
