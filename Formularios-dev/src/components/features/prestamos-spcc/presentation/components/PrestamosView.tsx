"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { usePrestamos } from "../../application/hooks/usePrestamos";
import { SolicitudForm } from "./SolicitudForm";
import { DetallePrestamo } from "./DetallePrestamo";
import {
  COLOR_ESTADO,
  ETIQUETA_ESTADO,
  diasDeAtraso,
  estaVencida,
  resumirSolicitado,
  totalSolicitado,
} from "../../domain/models/Prestamo";
import { useUserRole } from "@/hooks/useUserRole";
import { fetchDataBySource } from "@/lib/actions/dataSourceService";

const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-BO");

export function PrestamosView() {
  const {
    solicitudes,
    disponibles,
    cargando,
    error,
    limpiarError,
    crear,
    entregar,
    devolver,
    cancelar,
    corregirSolicitante,
  } = usePrestamos();

  const { user } = useUserRole();
  /**
   * Roles literales, no jerarquía: `RolesGuard` del backend hace
   * `roles.includes(...)`, así que mirar la jerarquía aquí pintaría botones
   * que el servidor rechaza con un 403.
   */
  const roles = user?.roles ?? [];
  const esAdmin = roles.includes("admin");
  /** Atribuir una solicitud a otro: admin y superintendente. */
  const puedeElegirSolicitante = esAdmin || roles.includes("superintendente");

  const [abrirForm, setAbrirForm] = useState(false);
  const [detalle, setDetalle] = useState<string | null>(null);
  const [areas, setAreas] = useState<string[]>([]);

  useEffect(() => {
    void fetchDataBySource("area").then((datos) => {
      if (!Array.isArray(datos)) return;
      setAreas(
        (datos as (string | { nombre?: string })[])
          .map((a) => (typeof a === "string" ? a : (a.nombre ?? "")))
          .filter(Boolean),
      );
    });
  }, []);

  const fuera = solicitudes.filter((s) => s.estado === "entregada");
  const vencidas = fuera.filter(estaVencida);
  const pendientes = solicitudes.filter((s) => s.estado === "solicitada");

  const resumen = [
    { titulo: "Disponibles", valor: disponibles.length, color: "primary.main" },
    { titulo: "En préstamo", valor: fuera.length, color: "info.main" },
    { titulo: "Por entregar", valor: pendientes.length, color: "warning.main" },
    { titulo: "Vencidos", valor: vencidas.length, color: "error.main" },
  ];

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        gap={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Préstamo de SPCC
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Equipos de protección contra caídas de Oficina Mantenimiento
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAbrirForm(true)}
        >
          Solicitar préstamo
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {resumen.map((r) => (
          <Grid key={r.titulo} size={{ xs: 6, md: 3 }}>
            <Card sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {r.titulo}
              </Typography>
              <Typography variant="h4" fontWeight={700} color={r.color}>
                {r.valor}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {vencidas.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {vencidas.length} préstamo(s) pasaron su fecha de devolución.
        </Alert>
      )}

      {cargando ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : solicitudes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            Todavía no hay préstamos registrados.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Área</TableCell>
                <TableCell>Solicitó</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Pedido</TableCell>
                <TableCell>Periodo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {solicitudes.map((s) => (
                <TableRow key={s._id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{s.numero}</TableCell>
                  <TableCell>{s.areaSolicitante}</TableCell>
                  <TableCell>
                    {s.solicitanteNombre ?? s.solicitanteUsername}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 240,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.motivo}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {totalSolicitado(s.solicitado) > 0 ? (
                      <Chip
                        size="small"
                        variant="outlined"
                        title={resumirSolicitado(s.solicitado)}
                        label={`${totalSolicitado(s.solicitado)} equipo(s)`}
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {fecha(s.fechaInicioPrevista ?? s.fechaSolicitud)} —{" "}
                    {fecha(s.fechaDevolucionPrevista)}
                    {estaVencida(s) && (
                      <Chip
                        size="small"
                        color="error"
                        sx={{ ml: 1 }}
                        label={`+${diasDeAtraso(s)} d`}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={ETIQUETA_ESTADO[s.estado]}
                      color={COLOR_ESTADO[s.estado]}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => setDetalle(s._id)}>
                      {esAdmin && s.estado !== "cerrada" && s.estado !== "cancelada"
                        ? "Gestionar"
                        : "Ver"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <SolicitudForm
        abierto={abrirForm}
        disponibles={disponibles}
        areas={areas}
        areaPorDefecto={user?.area}
        puedeElegirSolicitante={puedeElegirSolicitante}
        onCerrar={() => setAbrirForm(false)}
        onGuardar={crear}
      />

      <DetallePrestamo
        solicitudId={detalle}
        esAdmin={esAdmin}
        disponibles={disponibles}
        onCerrar={() => setDetalle(null)}
        onDevolver={devolver}
        onEntregar={entregar}
        onCancelar={cancelar}
        onCorregirSolicitante={esAdmin ? corregirSolicitante : undefined}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={7000}
        onClose={limpiarError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={limpiarError}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
