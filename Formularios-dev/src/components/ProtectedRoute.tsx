// components/ProtectedRoute.tsx - Componente para proteger rutas
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import { useUserRole, UserRole } from "@/hooks/useUserRole";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallbackComponent?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  fallbackComponent 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const { hasAnyRole, isLoading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return null;
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return fallbackComponent || (
      <Box p={3}>
        <Alert severity="error">
          No tienes permisos para acceder a esta sección.
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
}