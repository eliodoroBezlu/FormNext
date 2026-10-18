"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useCatalogosMonitoreo } from "../../application/hooks/useCatalogosMonitoreo";
import { ChipResultado, formatearDia } from "./CamposReporte";
import { ChipAlerta } from "./ChipAlerta";

const BASE = "/dashboard/monitoreo-equipos";

/**
 * Las bombas ordenadas por urgencia: qué toca medir y qué toca intervenir.
 * Antes esa fecha vivía en una celda oculta de cada Excel.
 */
export function PanelBombas() {
  const router = useRouter();
  const { bombas, cargando, error, colorDeResultado } = useCatalogosMonitoreo();
  const vencidas = bombas.filter((b) => b.situacion.alerta === "vencida").length;
  const proximas = bombas.filter((b) => b.situacion.alerta === "proxima").length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Stack direction="row" alignItems="center" gap={2} mb={2}>
        <Button component={NextLink} href={BASE} startIcon={<ArrowBack />} size="small">
          Reportes
        </Button>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Bombas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Próximo monitoreo (último reporte emitido + frecuencia de su OT modelo) y fecha
            tentativa de intervención (por TMEF). Lo vencido arriba.
          </Typography>
        </Box>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.join(" · ")}
        </Alert>
      )}
      {!cargando && bombas.length === 0 && !error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Todavía no hay bombas cargadas. Se cargan desde{" "}
          <NextLink href={`${BASE}/configuracion`}>Configuración</NextLink> con la planilla de
          carga.
        </Alert>
      )}
      {(vencidas > 0 || proximas > 0) && (
        <Alert severity={vencidas ? "error" : "warning"} sx={{ mb: 2 }}>
          {vencidas > 0 && `${vencidas} con fechas vencidas. `}
          {proximas > 0 && `${proximas} con fechas próximas.`}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ overflowX: "auto" }}>
        {cargando && <LinearProgress />}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>TAG</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Último reporte</TableCell>
              <TableCell>Resultado</TableCell>
              <TableCell>Próximo monitoreo</TableCell>
              <TableCell>Fecha tentativa</TableCell>
              <TableCell align="right">Horas restantes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bombas.map(({ equipo, situacion: s }) => (
              <TableRow
                key={equipo._id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => router.push(`${BASE}/bombas/${encodeURIComponent(equipo.codigo)}`)}
              >
                <TableCell>
                  <strong>{equipo.codigo}</strong>
                </TableCell>
                <TableCell>{equipo.modelo ?? "—"}</TableCell>
                <TableCell>
                  {s.ultimo_reporte
                    ? `${s.ultimo_reporte.codigo_interno ?? ""} · ${formatearDia(s.ultimo_reporte.fecha)}`
                    : "—"}
                </TableCell>
                <TableCell>
                  {s.ultimo_reporte ? (
                    <ChipResultado
                      valor={s.ultimo_reporte.resultado}
                      color={colorDeResultado(s.ultimo_reporte.resultado)}
                    />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <ChipAlerta
                    alerta={s.alerta_monitoreo}
                    fecha={s.proximo_monitoreo}
                    dias={s.dias_para_monitoreo}
                  />
                </TableCell>
                <TableCell>
                  <ChipAlerta
                    alerta={s.alerta_intervencion}
                    fecha={s.ultimo_reporte?.fecha_tentativa}
                    dias={s.dias_para_intervencion}
                    sinDatos={s.ultimo_reporte ? "Sin TMEF u horas" : "—"}
                  />
                </TableCell>
                <TableCell align="right">
                  {s.ultimo_reporte?.horas_restantes ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
