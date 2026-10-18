"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Autocomplete,
  Badge,
  Box,
  Button,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Add, FilterAltOff, Search, Settings, Speed } from "@mui/icons-material";
import { useUserRole } from "@/hooks/useUserRole";
import { enBandeja, type Bandeja } from "../../domain/accionesReporte";
import { useCatalogosMonitoreo } from "../../application/hooks/useCatalogosMonitoreo";
import { useListaReportes } from "../../application/hooks/useListaReportes";
import { ETIQUETA_ESTADO, type EstadoReporte, type FiltrosReportes } from "../../domain/models/Monitoreo";
import { ChipEstado, ChipResultado, formatearDia } from "./CamposReporte";

const BASE = "/dashboard/monitoreo-equipos";

/** Los reportes de monitoreo, con filtros por TAG, fecha, técnica, resultado y estado. */
export function ListaReportes() {
  const router = useRouter();
  const { reportes, abiertos, cargando, error, buscar } = useListaReportes();
  const { user } = useUserRole();
  const [bandeja, setBandeja] = useState<Bandeja>("todos");
  const { catalogos, bombas, colorDeResultado } = useCatalogosMonitoreo();
  const [f, setF] = useState<FiltrosReportes>({});
  const cambiar = (campo: keyof FiltrosReportes) => (valor: string | null) =>
    setF((prev) => ({ ...prev, [campo]: valor ?? "" }));

  const deBandeja = (b: Bandeja) => abiertos.filter((r) => enBandeja(r, user?.username, b));
  const porRevisar = deBandeja("por_revisar").length;
  const visibles = bandeja === "todos" ? reportes : deBandeja(bandeja);
  const vencidas = bombas.filter((b) => b.situacion.alerta === "vencida").length;
  const proximas = bombas.filter((b) => b.situacion.alerta === "proxima").length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Monitoreo de equipos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reportes 2.03.P01.R09 de Confiabilidad
          </Typography>
        </Box>
        <Stack direction="row" gap={1} alignItems="center">
          <Button component={NextLink} href={`${BASE}/bombas`} startIcon={<Speed />} size="small">
            Bombas
          </Button>
          <Button component={NextLink} href={`${BASE}/configuracion`} startIcon={<Settings />} size="small">
            Configuración
          </Button>
          <Button component={NextLink} href={`${BASE}/nuevo`} variant="contained" startIcon={<Add />}>
            Nuevo reporte
          </Button>
        </Stack>
      </Stack>

      {(vencidas > 0 || proximas > 0) && (
        <Alert
          severity={vencidas ? "error" : "warning"}
          sx={{ mb: 2 }}
          action={
            <Button component={NextLink} href={`${BASE}/bombas`} color="inherit" size="small">
              Ver bombas
            </Button>
          }
        >
          {vencidas > 0 && `${vencidas} bombas con monitoreo o intervención vencidos. `}
          {proximas > 0 && `${proximas} con fechas próximas.`}
        </Alert>
      )}

      <Tabs value={bandeja} onChange={(_, v: Bandeja) => setBandeja(v)} sx={{ mb: 2 }}>
        <Tab value="todos" label="Todos" />
        <Tab
          value="por_revisar"
          label={
            <Badge color="warning" badgeContent={porRevisar} sx={{ pr: porRevisar ? 1.5 : 0 }}>
              Por revisar
            </Badge>
          }
        />
        <Tab value="mis_borradores" label="Mis borradores" />
      </Tabs>

      {bandeja === "todos" && (
      <Paper
        variant="outlined"
        sx={{ p: 2, mb: 2 }}
        component="form"
        noValidate
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          void buscar(f);
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Autocomplete
              freeSolo
              options={bombas.map((b) => b.equipo.codigo).sort()}
              value={f.tag ?? ""}
              onChange={(_, v) => cambiar("tag")(v)}
              onInputChange={(_, v, motivo) => {
                if (motivo === "input") cambiar("tag")(v);
              }}
              renderInput={(params) => <TextField {...params} label="TAG" size="small" />}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              label="Desde"
              type="date"
              size="small"
              fullWidth
              value={f.desde ?? ""}
              onChange={(e) => cambiar("desde")(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              label="Hasta"
              type="date"
              size="small"
              fullWidth
              value={f.hasta ?? ""}
              onChange={(e) => cambiar("hasta")(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Autocomplete
              options={catalogos.tecnica.map((t) => t.valor)}
              value={f.tecnica || null}
              onChange={(_, v) => cambiar("tecnica")(v)}
              renderInput={(params) => <TextField {...params} label="Técnica" size="small" />}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Autocomplete
              options={catalogos.severidad.map((s) => s.valor)}
              value={f.resultado || null}
              onChange={(_, v) => cambiar("resultado")(v)}
              renderInput={(params) => <TextField {...params} label="Resultado" size="small" />}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              select
              label="Estado"
              size="small"
              fullWidth
              value={f.estado ?? ""}
              onChange={(e) => cambiar("estado")(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {(Object.keys(ETIQUETA_ESTADO) as EstadoReporte[]).map((e) => (
                <MenuItem key={e} value={e}>
                  {ETIQUETA_ESTADO[e]}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <Stack direction="row" gap={1} justifyContent="flex-end">
              <Button
                type="button"
                size="small"
                startIcon={<FilterAltOff />}
                onClick={() => {
                  setF({});
                  void buscar({});
                }}
              >
                Limpiar
              </Button>
              <Button type="submit" size="small" variant="outlined" startIcon={<Search />}>
                Buscar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.join(" · ")}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ overflowX: "auto" }}>
        {cargando && <LinearProgress />}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>TAG</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Técnica</TableCell>
              <TableCell>Resultado</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Elaborado por</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!cargando && visibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2" color="text.secondary" py={2} textAlign="center">
                    {bandeja === "por_revisar"
                      ? "No hay reportes de otros esperando revisión."
                      : bandeja === "mis_borradores"
                        ? "No tiene borradores."
                        : "No hay reportes con esos filtros."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {visibles.map((r) => (
              <TableRow
                key={r._id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => router.push(`${BASE}/${r._id}`)}
              >
                <TableCell>{r.codigo_interno ?? "—"}</TableCell>
                <TableCell>
                  <strong>{r.tag}</strong>
                </TableCell>
                <TableCell>{formatearDia(r.fecha)}</TableCell>
                <TableCell>{r.tecnica ?? "—"}</TableCell>
                <TableCell>
                  <ChipResultado valor={r.resultado} color={colorDeResultado(r.resultado)} />
                </TableCell>
                <TableCell>
                  <ChipEstado estado={r.estado} />
                </TableCell>
                <TableCell>{r.elaboradoPor}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
