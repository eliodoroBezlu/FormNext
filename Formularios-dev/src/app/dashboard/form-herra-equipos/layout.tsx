"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import {
  Construction,
  Add,
  Pending,
} from "@mui/icons-material";

import { Role } from "@/lib/routePermissions";
import { getInProgressInspections, getPendingApprovals } from "@/lib/actions/inspection-herra-equipos";
import { FormCountsContext } from "@/components/features/herra-equipos/FormCountsContext";

const SCAFFOLD_FORM = "1.02.P06.F30";

export default function FormHerraEquiposLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasRole, isLoading: authLoading } = useUserRole();

  const [inProgressCount, setInProgressCount] = useState(0);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);

  // Roles permitidos para aprobar
  const canViewApprovals =
    hasRole(Role.SUPERVISOR) ||
    hasRole(Role.ADMIN) ||
    hasRole(Role.SUPERINTENDENTE);

  // Determinar si es una de las pestañas principales de la gestión
  const isTabRoute =
    pathname === "/dashboard/form-herra-equipos" ||
    pathname === "/dashboard/form-herra-equipos/in-progress" ||
    pathname === "/dashboard/form-herra-equipos/pending-approval";

  // Mapear pathname al índice de la pestaña activa
  let activeTab = 0;
  if (pathname === "/dashboard/form-herra-equipos/in-progress") {
    activeTab = 1;
  } else if (pathname === "/dashboard/form-herra-equipos/pending-approval") {
    activeTab = 2;
  }

  const refreshCounts = async () => {
    if (!user) return;

    try {
      const isAdmin = hasRole(Role.ADMIN) || hasRole(Role.SUPERINTENDENTE);
      const [inProgressResult, pendingResult] = await Promise.all([
        getInProgressInspections({ templateCode: SCAFFOLD_FORM }),
        canViewApprovals
          ? getPendingApprovals(
              user.username,
              isAdmin ? undefined : user.area ? [user.area] : [],
              isAdmin,
            )
          : Promise.resolve({ success: true, data: [] }),
      ]);

      if (inProgressResult.success) {
        setInProgressCount(inProgressResult.data?.length || 0);
      }
      if (pendingResult.success) {
        setPendingApprovalCount(pendingResult.data?.length || 0);
      }
    } catch (err) {
      console.error("Error al refrescar contadores:", err);
    }
  };

  useEffect(() => {
    if (!authLoading && user && isTabRoute) {
      refreshCounts();
    }
  }, [authLoading, user, pathname, isTabRoute]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const base = "/dashboard/form-herra-equipos";
    if (newValue === 0) {
      router.push(base);
    } else if (newValue === 1) {
      router.push(`${base}/in-progress`);
    } else if (newValue === 2 && canViewApprovals) {
      router.push(`${base}/pending-approval`);
    }
  };

  // Si no es una ruta de pestaña (ej. al llenar formulario /[code]), no renderizar la barra de navegación de pestañas
  if (!isTabRoute) {
    return <>{children}</>;
  }

  if (authLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
        <Typography ml={2}>Verificando autenticación...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box p={3}>
        <Alert severity="error">
          No se pudo obtener información del usuario. Por favor, inicia sesión nuevamente.
        </Alert>
      </Box>
    );
  }

  return (
    <FormCountsContext.Provider value={{ refreshCounts }}>
      <Box p={3}>
        {process.env.NODE_ENV === "development" && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Usuario: {user.username} | Roles: {user.roles.join(", ")}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="inspections tabs"
          >
            <Tab icon={<Add />} iconPosition="start" label="Nueva Inspección" />

            <Tab
              icon={
                <Badge badgeContent={inProgressCount} color="warning">
                  <Construction />
                </Badge>
              }
              iconPosition="start"
              label="Andamios en Progreso"
            />

            {canViewApprovals && (
              <Tab
                icon={
                  <Badge badgeContent={pendingApprovalCount} color="error">
                    <Pending />
                  </Badge>
                }
                iconPosition="start"
                label="Pendientes de Aprobación"
              />
            )}
          </Tabs>
        </Box>

        {children}
      </Box>
    </FormCountsContext.Provider>
  );
}
