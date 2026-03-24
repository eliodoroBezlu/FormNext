"use client";

import { Box, CircularProgress, Alert } from "@mui/material";

interface ReportStateHandlerProps {
  loading: boolean;
  error: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}

export function ReportStateHandler({
  loading,
  error,
  isEmpty = false,
  emptyMessage = "No se encontraron resultados",
  children,
}: ReportStateHandlerProps) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (isEmpty) {
    return (
      <Box p={3}>
        <Alert severity="info">{emptyMessage}</Alert>
      </Box>
    );
  }

  return <>{children}</>;
}