"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
  TablePagination,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Container,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
  TrackChanges as TrackChangesIcon,
  RateReview as RateReviewIcon,
} from "@mui/icons-material";
import { pgrService } from "@/services/pgrService";
import { useRouter } from "next/navigation";
import { Pgr } from "@/types/pgr";

export default function GestionPGR() {
  const router = useRouter();
  const [planes, setPlanes] = useState<Pgr[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filters
  const [codigoFilter, setCodigoFilter] = useState("");
  const [empresaFilter, setEmpresaFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [activoFilter, setActivoFilter] = useState("");

  // Modals
  // const [selectedPgr, setSelectedPgr] = useState<Pgr | null>(null);

  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pgrService.obtenerTodos();
      setPlanes(data);
    } catch (err) {
      console.error("Error al cargar PGRs:", err);
      setError("No se pudieron cargar los planes PGR");
    } finally {
      setLoading(false);
    }
  };

  const filtrarPlanes = () => {
    let filtrados = planes;

    if (codigoFilter.trim()) {
      filtrados = filtrados.filter((p) =>
        p.codigoAutogenerado
          ?.toLowerCase()
          .includes(codigoFilter.toLowerCase().trim()),
      );
    }

    if (empresaFilter.trim()) {
      filtrados = filtrados.filter((p) =>
        p.empresa?.toLowerCase().includes(empresaFilter.toLowerCase().trim()),
      );
    }

    if (estadoFilter) {
      filtrados = filtrados.filter((p) => p.estado === estadoFilter);
    }

    if (activoFilter) {
      const isActivo = activoFilter === "true";
      filtrados = filtrados.filter((p) => p.activo === isActivo);
    }

    return filtrados;
  };

  const limpiarFiltros = () => {
    setCodigoFilter("");
    setEmpresaFilter("");
    setEstadoFilter("");
    setActivoFilter("");
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleActivo = async (plan: Pgr) => {
    try {
      setLoading(true);
      // Asume que si no tiene el campo activo, por defecto era true
      const newState = plan.activo !== undefined ? !plan.activo : false;
      await pgrService.actualizar(plan._id, { activo: newState });
      await cargarPlanes();
    } catch (err) {
      console.error("Error al actualizar estado activo", err);
      alert("Error al actualizar PGR");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenView = (plan: Pgr) => {
    router.push(`/dashboard/pgr/${plan._id}?mode=view`);
  };

  const handleOpenEdit = (plan: Pgr) => {
    if (plan.estado === "BORRADOR") {
      router.push(`/dashboard/pgr/configuracion?id=${plan._id}`);
    } else {
      router.push(`/dashboard/pgr/${plan._id}?mode=edit`);
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "APROBADO":
        return "success";
      case "CORREGIR":
        return "error";
      case "EN_REVISION":
        return "warning";
      case "BORRADOR":
      default:
        return "default";
    }
  };

  const planesMostrados = filtrarPlanes();

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 3 }}>
        Gestión de Planes PGR
      </Typography>

      {/* PANEL DE FILTROS Y CONTROLES */}
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: "8px" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filtros y Controles
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Código"
              variant="outlined"
              size="small"
              value={codigoFilter}
              onChange={(e) => setCodigoFilter(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Empresa"
              variant="outlined"
              size="small"
              value={empresaFilter}
              onChange={(e) => setEmpresaFilter(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado Flujo</InputLabel>
              <Select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                label="Estado Flujo"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="BORRADOR">Borrador</MenuItem>
                <MenuItem value="EN_REVISION">En Revisión</MenuItem>
                <MenuItem value="CORREGIR">Corregir</MenuItem>
                <MenuItem value="APROBADO">Aprobado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estatus Activo</InputLabel>
              <Select
                value={activoFilter}
                onChange={(e) => setActivoFilter(e.target.value)}
                label="Estatus Activo"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={limpiarFiltros}
          >
            Limpiar Filtros
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/dashboard/pgr/configuracion")}
            color="primary"
            disabled={loading}
          >
            Nuevo PGR
          </Button>
        </Box>
      </Paper>

      {/* TABLA DE PGR */}
      <Paper elevation={2} sx={{ borderRadius: "8px" }}>
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            Planes de Gestión y Actividades ({planesMostrados.length})
          </Typography>
        </Box>

        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100px"
          >
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>Código</TableCell>
                    <TableCell>Empresa</TableCell>
                    <TableCell>Gerencia</TableCell>
                    <TableCell align="center">Estado Flujo</TableCell>
                    <TableCell align="center">Estatus</TableCell>
                    <TableCell align="center">Acciones Básicas</TableCell>
                    <TableCell align="center">Flujo Operativo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {planesMostrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          No se encontraron PGRs con los filtros aplicados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    planesMostrados
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                      .map((plan) => (
                        <TableRow
                          key={plan._id}
                          sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {plan.codigoAutogenerado}
                            </Typography>
                          </TableCell>
                          <TableCell>{plan.empresa}</TableCell>
                          <TableCell>{plan.gerencia}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={plan.estado}
                              color={getStatusColor(plan.estado)}
                              size="small"
                              sx={{ fontWeight: "bold" }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={
                                plan.activo !== false ? "Activo" : "Inactivo"
                              }
                              color={
                                plan.activo !== false ? "success" : "default"
                              }
                              size="small"
                            />
                          </TableCell>

                          {/* ACCIONES BÁSICAS: Ver, Editar General, Activar/Desactivar */}
                          <TableCell align="center">
                            <Tooltip title="Ver Detalles Generales">
                              <IconButton
                                color="info"
                                size="small"
                                onClick={() => handleOpenView(plan)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar General">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleOpenEdit(plan)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title={
                                plan.activo !== false
                                  ? "Desactivar PGR"
                                  : "Activar PGR"
                              }
                            >
                              <IconButton
                                color={
                                  plan.activo !== false ? "error" : "success"
                                }
                                size="small"
                                onClick={() => handleToggleActivo(plan)}
                              >
                                {plan.activo !== false ? (
                                  <ToggleOffIcon />
                                ) : (
                                  <ToggleOnIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                          </TableCell>

                          {/* FLUJO OPERATIVO: Seguimiento y Aprobar */}
                          <TableCell align="center">
                            {plan.estado === "CORREGIR" && (
                              <Tooltip title="Corregir Plan">
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/pgr/configuracion?id=${plan._id}`,
                                    )
                                  }
                                >
                                  <RateReviewIcon />
                                </IconButton>
                              </Tooltip>
                            )}

                            <Tooltip title="Seguimiento">
                              <IconButton
                                color="secondary"
                                size="small"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/pgr/seguimiento/${plan._id}`,
                                  )
                                }
                              >
                                <TrackChangesIcon />
                              </IconButton>
                            </Tooltip>

                            {plan.estado !== "APROBADO" && (
                              <Tooltip title="Aprobar Plan">
                                <IconButton
                                  color="success"
                                  size="small"
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/pgr/aprobacion/${plan._id}`,
                                    )
                                  }
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={planesMostrados.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página"
            />
          </>
        )}
      </Paper>
    </Container>
  );
}
