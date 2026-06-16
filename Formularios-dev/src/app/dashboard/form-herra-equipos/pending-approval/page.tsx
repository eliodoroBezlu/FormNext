"use client";

import React, { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import { PendingApprovalsList } from "@/components/features/herra-equipos/PendingApprovalsList";

export default function PendingApprovalsPage() {
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
      <PendingApprovalsList />
    </Suspense>
  );
}
