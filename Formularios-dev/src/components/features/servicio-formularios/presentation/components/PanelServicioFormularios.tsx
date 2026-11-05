"use client";

import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { OpenInNew, Refresh } from "@mui/icons-material";
import { useServicioFormularios } from "../../application/hooks/useServicioFormularios";

/**
 * Pestaña de pruebas del servicio de formularios: su web completa (inicio,
 * registros, constructor, métricas) dentro de forms, con la sesión de quien
 * entra. Solo admin mientras se prueba.
 */
export function PanelServicioFormularios() {
  const { estado, recargar, web } = useServicioFormularios();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, height: "calc(100vh - 120px)" }}>
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 600, flexGrow: 1 }}>
          Servicio de formularios (pruebas)
        </Typography>
        <Button type="button" size="small" startIcon={<Refresh />} onClick={recargar}>
          Volver a entrar
        </Button>
        {web && (
          <Button
            type="button"
            size="small"
            startIcon={<OpenInNew />}
            href={web}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir la web aparte
          </Button>
        )}
      </Stack>

      {estado.tipo === "cargando" && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Pidiendo el token al backend…</Typography>
        </Box>
      )}

      {estado.tipo === "error" && (
        <Alert severity="warning">
          No se pudo abrir el servicio: {estado.mensaje}
        </Alert>
      )}

      {estado.tipo === "listo" && (
        <Box
          component="iframe"
          key={estado.url}
          src={estado.url}
          title="Servicio de formularios"
          sx={{ flexGrow: 1, width: "100%", border: 1, borderColor: "divider", borderRadius: 1 }}
        />
      )}
    </Box>
  );
}
