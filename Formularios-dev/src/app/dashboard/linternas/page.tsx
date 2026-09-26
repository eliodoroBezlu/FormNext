"use client";

import { useState } from "react";
import NextLink from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { BarChart, FactCheck, Inventory2 } from "@mui/icons-material";
import { BuscadorTrabajador } from "@/components/features/linternas/presentation/components/BuscadorTrabajador";
import { EstadoTrabajadorPanel } from "@/components/features/linternas/presentation/components/EstadoTrabajadorPanel";
import { EntregaForm } from "@/components/features/linternas/presentation/components/EntregaForm";
import { useLinternas } from "@/components/features/linternas/application/hooks/useLinternas";
import { useUserRole } from "@/hooks/useUserRole";
import { Role } from "@/lib/routePermissions";
import type { RegistrarEntregaPayload } from "@/components/features/linternas/domain/models/Linterna";

export default function LinternasPage() {
  const {
    stock,
    estado,
    historial,
    cargando,
    error,
    setError,
    seleccionarTrabajador,
    limpiarSeleccion,
    registrar,
    reclasificar,
    anular,
    corregir,
  } = useLinternas();

  /**
   * Registrar entregas es de administración: supervisor y superintendente
   * llegan aquí por las aprobaciones de pérdida y los reportes. Ver el estado
   * de un trabajador les sirve; el formulario de entrega no, porque el
   * backend rechazaría el envío. Mejor no ofrecérselo que dejar que lo
   * rellenen para fallar al final.
   */
  const { user, hasRole } = useUserRole();
  const puedeEntregar = hasRole(Role.ADMIN);

  /**
   * Los permisos de corrección se leen del array de roles **literal**, no de
   * la jerarquía: `RolesGuard` del backend hace `roles.includes(...)`, así que
   * usar `hasRole` aquí pintaría botones que el servidor va a rechazar con un
   * 403 después de haber rellenado el formulario.
   *
   * Reparto: reclasificar y corregir van a admin y superintendente; **anular
   * solo a admin**, porque dejar un registro sin efecto es más grave que
   * corregirlo. Espeja los `@Roles` de `linternas.controller.ts`.
   */
  const roles = user?.roles ?? [];
  const esAdmin = roles.includes(Role.ADMIN);
  const puedeReclasificar = esAdmin || roles.includes(Role.SUPERINTENDENTE);

  // `puedeReclasificar` ya incluye a admin, así que basta con él para decidir
  // si el menú aparece.
  const acciones = puedeReclasificar
    ? {
        puedeReclasificar,
        puedeAnular: esAdmin,
        onReclasificar: reclasificar,
        onAnular: anular,
        onCorregir: corregir,
      }
    : undefined;

  const [aviso, setAviso] = useState<string | null>(null);

  const onRegistrar = async (payload: RegistrarEntregaPayload) => {
    const entrega = await registrar(payload);
    setAviso(
      payload.tipo === "reposicion_perdida"
        ? "Solicitud enviada a aprobación."
        : "Entrega registrada.",
    );
    return entrega;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: "auto" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Entrega de linternas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dotación, cambio y reposición por pérdida.
          </Typography>
        </Box>

        <Stack direction="row" gap={1} alignItems="center">
          <Chip
            icon={<Inventory2 />}
            label={`${stock.cantidadDisponible} en stock`}
            color={stock.cantidadDisponible > 0 ? "success" : "error"}
          />
          <Button
            component={NextLink}
            href="/dashboard/linternas/stock"
            size="small"
            variant="outlined"
          >
            Stock
          </Button>
          <Button
            component={NextLink}
            href="/dashboard/linternas/reportes"
            size="small"
            variant="outlined"
            startIcon={<BarChart />}
          >
            Reportes
          </Button>
          <Button
            component={NextLink}
            href="/dashboard/linternas/aprobaciones"
            size="small"
            variant="outlined"
            startIcon={<FactCheck />}
          >
            Aprobaciones
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <BuscadorTrabajador
              disabled={cargando}
              onSelect={(t) => {
                if (t) void seleccionarTrabajador(t._id);
                else limpiarSeleccion();
              }}
            />
          </Paper>

          {estado && (
            <Box sx={{ mt: 2 }}>
              <EstadoTrabajadorPanel
                estado={estado}
                historial={historial}
                acciones={acciones}
              />
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          {!puedeEntregar ? (
            <Alert severity="info">
              Registrar entregas es de administración. Desde aquí puede
              consultar el estado de cada trabajador, aprobar reposiciones por
              pérdida y ver los reportes.
            </Alert>
          ) : !estado ? (
            <Alert severity="info">
              Busque a un trabajador para ver su estado y registrar la entrega
              que corresponda.
            </Alert>
          ) : (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <EntregaForm
                // Un formulario nuevo por persona: al cambiar de trabajador el
                // componente se remonta y todo su estado —campos, foto,
                // evidencias— nace limpio, sin necesidad de reiniciarlo a mano.
                key={estado.trabajador}
                estado={estado}
                stockDisponible={stock.cantidadDisponible}
                onRegistrar={onRegistrar}
              />
            </Paper>
          )}
        </Grid>
      </Grid>

      <Snackbar
        open={!!error}
        autoHideDuration={8000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!aviso}
        autoHideDuration={4000}
        onClose={() => setAviso(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setAviso(null)}>
          {aviso}
        </Alert>
      </Snackbar>
    </Box>
  );
}
