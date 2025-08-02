"use client";

import { useSession } from "next-auth/react";
import { Box, CircularProgress, Alert } from "@mui/material";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const {  status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Box p={3}>
        <Alert severity="error">
          No tienes permisos para acceder a esta sección. Redirigiendo...
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
}