"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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

  /**
   * `hasRole` es una función nueva en cada render, así que no sirve como
   * dependencia. Lo que sí sirve son estos dos booleanos: son primitivos y
   * solo cambian cuando cambian los roles de verdad.
   */
  const isAdmin = hasRole(Role.ADMIN) || hasRole(Role.SUPERINTENDENTE);
  // Roles permitidos para aprobar
  const canViewApprovals = hasRole(Role.SUPERVISOR) || isAdmin;

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

  /** Solo consulta y devuelve; **no toca el estado**. */
  const consultar = useCallback(() => {
    if (!user) return Promise.resolve(null);

    return Promise.all([
      getInProgressInspections({ templateCode: SCAFFOLD_FORM }),
      canViewApprovals
        ? getPendingApprovals(
            user.username,
            isAdmin ? undefined : user.area ? [user.area] : [],
            isAdmin,
          )
        : Promise.resolve({ success: true, data: [] }),
    ]);
  }, [user, canViewApprovals, isAdmin]);

  const aplicar = useCallback(
    (resultados: Awaited<ReturnType<typeof consultar>>) => {
      if (!resultados) return;
      const [inProgressResult, pendingResult] = resultados;

      if (inProgressResult.success) {
        setInProgressCount(inProgressResult.data?.length || 0);
      }
      if (pendingResult.success) {
        setPendingApprovalCount(pendingResult.data?.length || 0);
      }
    },
    [],
  );

  /** Recarga a petición: la usan las pestañas tras guardar o aprobar. */
  const refreshCounts = useCallback(async () => {
    try {
      aplicar(await consultar());
    } catch (err) {
      console.error("Error al refrescar contadores:", err);
    }
  }, [consultar, aplicar]);

  useEffect(() => {
    if (authLoading || !user || !isTabRoute) return;

    // La promesa se encadena aquí en vez de llamar a `refreshCounts()`: el
    // analizador rastrea dentro de la función `async` y vería sus setState
    // como una cascada de renders lanzada desde el efecto.
    let vigente = true;

    consultar()
      .then((resultados) => {
        if (vigente) aplicar(resultados);
      })
      .catch((err: unknown) => {
        console.error("Error al refrescar contadores:", err);
      });

    return () => {
      vigente = false;
    };
    // `pathname` está aquí a propósito aunque no se lea en el cuerpo: los
    // contadores deben refrescarse al cambiar de pestaña, no solo al montar.
  }, [authLoading, user, isTabRoute, pathname, consultar, aplicar]);

  /**
   * El valor del contexto se memoiza: sin esto sería un objeto nuevo en cada
   * render y obligaría a repintar a todos los consumidores.
   */
  const contextValue = useMemo(() => ({ refreshCounts }), [refreshCounts]);

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
    <FormCountsContext.Provider value={contextValue}>
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
