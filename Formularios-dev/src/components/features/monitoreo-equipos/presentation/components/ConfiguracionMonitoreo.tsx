"use client";

import { useState } from "react";
import NextLink from "next/link";
import {
  Alert,
  Box,
  Button,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useConfiguracionMonitoreo } from "../../application/hooks/useConfiguracionMonitoreo";
import { CargaPlanilla } from "./CargaPlanilla";
import { formatearDia } from "./CamposReporte";

/** Hasta 6, el tope del backend (`FOTOS_POR_FILA_MAXIMO`). */
const OPCIONES_FOTOS = [1, 2, 3, 4, 5, 6];

/** Lo que se prepara una vez: bombas, numeración y plantilla. */
export function ConfiguracionMonitoreo() {
  const c = useConfiguracionMonitoreo();
  const [correlativo, setCorrelativo] = useState({
    tecnica_codigo: "COTEM",
    anio: String(new Date().getFullYear()),
    ultimo: "",
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: "auto" }}>
      <Stack direction="row" alignItems="center" gap={2} mb={3}>
        <Button component={NextLink} href="/dashboard/monitoreo-equipos" startIcon={<ArrowBack />} size="small">
          Reportes
        </Button>
        <Typography variant="h5" fontWeight={700}>
          Configuración del monitoreo
        </Typography>
      </Stack>

      {c.cargando && <LinearProgress sx={{ mb: 2 }} />}
      {c.error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => c.setError(null)}>
          {c.error.join(" · ")}
        </Alert>
      )}

      <Stack gap={2}>
        <CargaPlanilla
          revision={c.revision}
          trabajando={c.cargando}
          onRevisar={(a) => void c.revisarPlanilla(a)}
          onAplicar={(a) => void c.aplicarPlanilla(a)}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Numeración del código interno
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Para seguir desde el último número usado en el Excel: si el último fue COTEM-0137,
                ponga 137 y el sistema emite desde el 0138. Solo se puede subir.
              </Typography>
              <Stack
                component="form"
                noValidate
                direction={{ xs: "column", sm: "row" }}
                gap={1}
                mb={2}
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  void c.fijarCorrelativo({
                    tecnica_codigo: correlativo.tecnica_codigo.trim().toUpperCase(),
                    anio: Number(correlativo.anio),
                    ultimo: Number(correlativo.ultimo),
                  });
                }}
              >
                <TextField
                  label="Técnica"
                  size="small"
                  value={correlativo.tecnica_codigo}
                  onChange={(e) => setCorrelativo({ ...correlativo, tecnica_codigo: e.target.value })}
                />
                <TextField
                  label="Año"
                  size="small"
                  value={correlativo.anio}
                  slotProps={{ htmlInput: { inputMode: "numeric" } }}
                  onChange={(e) => setCorrelativo({ ...correlativo, anio: e.target.value })}
                />
                <TextField
                  label="Último usado"
                  size="small"
                  value={correlativo.ultimo}
                  slotProps={{ htmlInput: { inputMode: "numeric" } }}
                  onChange={(e) => setCorrelativo({ ...correlativo, ultimo: e.target.value })}
                />
                <Button
                  type="submit"
                  variant="outlined"
                  disabled={c.cargando || !/^\d+$/.test(correlativo.ultimo)}
                >
                  Fijar
                </Button>
              </Stack>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Técnica</TableCell>
                    <TableCell>Año</TableCell>
                    <TableCell align="right">Último usado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {c.correlativos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="body2" color="text.secondary">
                          Todavía no se emitió ningún reporte.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {c.correlativos.map((x) => (
                    <TableRow key={x._id}>
                      <TableCell>{x.tecnica_codigo}</TableCell>
                      <TableCell>{x.anio}</TableCell>
                      <TableCell align="right">{String(x.ultimo).padStart(4, "0")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Plantilla de bombas
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Fotos por fila como máximo. Las filas se reparten parejo: con 6 por fila y 7
                fotos van 4 + 3. Los reportes ya creados conservan la suya.
              </Typography>
              <TextField
                select
                label="Fotos por fila"
                size="small"
                value={c.plantilla?.fotos_por_fila ?? 3}
                disabled={c.cargando}
                onChange={(e) => void c.guardarFotosPorFila(Number(e.target.value))}
              >
                {OPCIONES_FOTOS.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </TextField>
              <Box mt={3}>
                <Button type="button" size="small" disabled={c.cargando} onClick={() => void c.sembrarCatalogos()}>
                  Cargar listas iniciales
                </Button>
                <Typography variant="caption" color="text.secondary" display="block">
                  Llena solo las listas vacías (técnicas, grupos de trabajo, severidad…). Lo que ya
                  se editó no se toca.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Paper variant="outlined" sx={{ overflowX: "auto" }}>
          <Typography variant="subtitle1" fontWeight={700} p={2} pb={0}>
            Bombas cargadas ({c.bombas.length})
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>TAG</TableCell>
                <TableCell>Modelo</TableCell>
                <TableCell align="right">Piezas montadas</TableCell>
                <TableCell>Última intervención</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {c.bombas.map((b) => (
                <TableRow key={b.equipo._id}>
                  <TableCell>
                    <strong>{b.equipo.codigo}</strong>
                  </TableCell>
                  <TableCell>{b.equipo.modelo ?? "—"}</TableCell>
                  <TableCell align="right">{b.componentes.length} / 4</TableCell>
                  <TableCell>{formatearDia(b.ultimaIntervencion?.fecha)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>
    </Box>
  );
}
