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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  Clear as ClearIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { Trabajador } from "@/types/trabajador";
import { obtenerTrabajadores } from "@/lib/actions/trabajador-actions";

const IAM_PORTAL_URL =
  process.env.NEXT_PUBLIC_IAM_PORTAL_URL ?? "http://localhost:3005";

export default function GestionTrabajadores() {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para filtros
  const [ciFilter, setCiFilter] = useState("");
  const [nominaFilter, setNominaFilter] = useState("");
  const [puestoFilter, setPuestoFilter] = useState("");
  const [superintendenciaFilter, setSuperintendenciaFilter] = useState("");
  const [activoFilter, setActivoFilter] = useState("");
  const [tieneUsuarioFilter, setTieneUsuarioFilter] = useState("");

  // Detalle de solo lectura
  const [detalleTrabajador, setDetalleTrabajador] = useState<Trabajador | null>(
    null,
  );

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const cargarTrabajadores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerTrabajadores();
      setTrabajadores(data);
    } catch (error) {
      console.error("Error al cargar trabajadores:", error);
      setError("No se pudieron cargar los trabajadores");
    } finally {
      setLoading(false);
    }
  };

  const filtrarTrabajadores = () => {
    let filtrados = trabajadores;

    if (ciFilter.trim()) {
      filtrados = filtrados.filter((t) =>
        t.ci.toLowerCase().includes(ciFilter.toLowerCase().trim()),
      );
    }

    if (nominaFilter.trim()) {
      filtrados = filtrados.filter((t) =>
        t.nomina.toLowerCase().includes(nominaFilter.toLowerCase().trim()),
      );
    }

    if (puestoFilter.trim()) {
      filtrados = filtrados.filter((t) =>
        t.puesto.toLowerCase().includes(puestoFilter.toLowerCase().trim()),
      );
    }

    if (superintendenciaFilter.trim()) {
      filtrados = filtrados.filter((t) =>
        t.superintendencia
          .toLowerCase()
          .includes(superintendenciaFilter.toLowerCase().trim()),
      );
    }

    if (activoFilter) {
      const isActive = activoFilter === "true";
      filtrados = filtrados.filter((t) => t.activo === isActive);
    }

    if (tieneUsuarioFilter) {
      const hasUser = tieneUsuarioFilter === "true";
      filtrados = filtrados.filter((t) => t.tiene_acceso_sistema === hasUser);
    }

    return filtrados;
  };

  const limpiarFiltros = () => {
    setCiFilter("");
    setNominaFilter("");
    setPuestoFilter("");
    setSuperintendenciaFilter("");
    setActivoFilter("");
    setTieneUsuarioFilter("");
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

  const trabajadoresMostrados = filtrarTrabajadores();

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Trabajadores
      </Typography>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
        action={
          <Button
            color="inherit"
            size="small"
            endIcon={<OpenInNewIcon fontSize="small" />}
            href={IAM_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Gestionar en Portal IAM
          </Button>
        }
      >
        Estos datos se sincronizan desde IAM Core — esta pantalla es de solo
        lectura. Para crear, editar o dar de baja trabajadores y usuarios, usá
        el Portal IAM.
      </Alert>

      {/* PANEL DE FILTROS */}
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: "8px" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filtros
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="CI"
              variant="outlined"
              size="small"
              value={ciFilter}
              onChange={(e) => setCiFilter(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Nómina"
              variant="outlined"
              size="small"
              value={nominaFilter}
              onChange={(e) => setNominaFilter(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Puesto"
              variant="outlined"
              size="small"
              value={puestoFilter}
              onChange={(e) => setPuestoFilter(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Superintendencia"
              variant="outlined"
              size="small"
              value={superintendenciaFilter}
              onChange={(e) => setSuperintendenciaFilter(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={activoFilter}
                onChange={(e) => setActivoFilter(e.target.value)}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Usuario Sistema</InputLabel>
              <Select
                value={tieneUsuarioFilter}
                onChange={(e) => setTieneUsuarioFilter(e.target.value)}
                label="Usuario Sistema"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Con Usuario</MenuItem>
                <MenuItem value="false">Sin Usuario</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={limpiarFiltros}
          >
            Limpiar Filtros
          </Button>
        </Box>
      </Paper>

      {/* TABLA DE TRABAJADORES */}
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
            Trabajadores ({trabajadoresMostrados.length})
          </Typography>
        </Box>

        {loading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100px"
          >
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {!loading && !error && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>CI</TableCell>
                    <TableCell>Nómina</TableCell>
                    <TableCell>Puesto</TableCell>
                    <TableCell>Superintendencia</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="center">Usuario Sistema</TableCell>
                    <TableCell align="center">Fecha Ingreso</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trabajadoresMostrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          No se encontraron trabajadores con los filtros
                          aplicados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    trabajadoresMostrados
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                      .map((trabajador) => (
                        <TableRow
                          key={trabajador._id}
                          sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {trabajador.ci}
                            </Typography>
                          </TableCell>
                          <TableCell>{trabajador.nomina}</TableCell>
                          <TableCell>{trabajador.puesto}</TableCell>
                          <TableCell>{trabajador.superintendencia}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={trabajador.activo ? "Activo" : "Inactivo"}
                              color={trabajador.activo ? "success" : "error"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={
                                trabajador.tiene_acceso_sistema
                                  ? "Con Usuario"
                                  : "Sin Usuario"
                              }
                              color={
                                trabajador.tiene_acceso_sistema
                                  ? "primary"
                                  : "default"
                              }
                              size="small"
                              icon={
                                trabajador.tiene_acceso_sistema ? (
                                  <PersonIcon />
                                ) : undefined
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            {new Date(
                              trabajador.fecha_ingreso,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver detalle">
                              <IconButton
                                onClick={() => setDetalleTrabajador(trabajador)}
                                color="info"
                                size="small"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={trabajadoresMostrados.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
            />
          </>
        )}
      </Paper>

      {/* DETALLE DE SOLO LECTURA */}
      <Dialog
        open={!!detalleTrabajador}
        onClose={() => setDetalleTrabajador(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{detalleTrabajador?.nomina}</DialogTitle>
        <DialogContent>
          {detalleTrabajador && (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {[
                { label: "CI", value: detalleTrabajador.ci },
                { label: "Puesto", value: detalleTrabajador.puesto },
                {
                  label: "Superintendencia",
                  value: detalleTrabajador.superintendencia,
                },
                { label: "Área", value: detalleTrabajador.area },
                { label: "Código JDE", value: detalleTrabajador.jde },
                { label: "N° Bloque", value: detalleTrabajador.no_bloque },
                {
                  label: "N° Habitación",
                  value: detalleTrabajador.no_habitacion,
                },
                { label: "Residencia", value: detalleTrabajador.residencia },
                { label: "Celular", value: detalleTrabajador.celular },
                {
                  label: "Fecha de ingreso",
                  value: new Date(
                    detalleTrabajador.fecha_ingreso,
                  ).toLocaleDateString(),
                },
                {
                  label: "Estado",
                  value: detalleTrabajador.activo ? "Activo" : "Inactivo",
                },
                {
                  label: "Usuario del sistema",
                  value: detalleTrabajador.userId?.username || "Sin usuario",
                },
                {
                  label: "Email",
                  value: detalleTrabajador.userId?.email || "N/A",
                },
                {
                  label: "Roles (IAM)",
                  value: detalleTrabajador.roles_iam?.length
                    ? detalleTrabajador.roles_iam.join(", ")
                    : "Ninguno",
                },
              ].map(({ label, value }) => (
                <Grid key={label} size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    {label}
                  </Typography>
                  <Typography variant="body1">{value || "N/A"}</Typography>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetalleTrabajador(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
