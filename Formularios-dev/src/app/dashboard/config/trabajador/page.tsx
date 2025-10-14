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
  Snackbar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Trabajador, TrabajadorForm } from "@/types/trabajador";
import {
  actualizarTrabajador,
  crearTrabajador,
  eliminarTrabajador,
  obtenerTrabajadores,
  obtenerTrabajadorPorId,
} from "@/lib/actions/trabajador-actions";

const initialFormData: TrabajadorForm = {
  ci: "",
  nomina: "",
  puesto: "",
  fecha_ingreso: "",
  superintendencia: "",
  activo: true,
};

export default function GestionTrabajadores() {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para el modal
  const [openModal, setOpenModal] = useState(false);
  const [editingTrabajador, setEditingTrabajador] = useState<Trabajador | null>(
    null
  );
  const [formData, setFormData] = useState<TrabajadorForm>(initialFormData);

  // Estados para filtros
  const [ciFilter, setCiFilter] = useState("");
  const [nominaFilter, setNominaFilter] = useState("");
  const [puestoFilter, setPuestoFilter] = useState("");
  const [superintendenciaFilter, setSuperintendenciaFilter] = useState("");
  const [activoFilter, setActivoFilter] = useState("");

  // Estado para notificaciones
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const validateForm = (): boolean => {
    const requiredFields = [
      "ci",
      "nomina",
      "puesto",
      "fecha_ingreso",
      "superintendencia",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof TrabajadorForm]?.toString().trim()) {
        mostrarNotificacion(`El campo ${field} es requerido`, "error");
        return false;
      }
    }

    const ciPattern = /^\d{6,8}$/;
    if (!ciPattern.test(formData.ci)) {
      mostrarNotificacion("El CI debe tener entre 6 y 8 dígitos", "error");
      return false;
    }

    const today = new Date();
    const fechaIngreso = new Date(formData.fecha_ingreso);
    if (fechaIngreso > today) {
      mostrarNotificacion("La fecha de ingreso no puede ser futura", "error");
      return false;
    }

    return true;
  };

  const validateFormBasic = (): boolean => {
    const requiredFields = [
      "ci",
      "nomina",
      "puesto",
      "fecha_ingreso",
      "superintendencia",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof TrabajadorForm]?.toString().trim()) {
        return false;
      }
    }

    return true;
  };

  const cargarTrabajadores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerTrabajadores();
      setTrabajadores(data);
    } catch (error) {
      console.error("Error al cargar trabajadores:", error);
      setError("No se pudieron cargar los trabajadores");
      mostrarNotificacion("Error al cargar los trabajadores", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtrarTrabajadores = () => {
    let filtrados = trabajadores;

    if (ciFilter.trim()) {
      filtrados = filtrados.filter((t) =>
        t.ci.toLowerCase().includes(ciFilter.toLowerCase().trim())
      );
    }

    if (nominaFilter.trim()) {
      filtrados = filtrados.filter((t) =>
        t.nomina.toLowerCase().includes(nominaFilter.toLowerCase().trim())
      );
    }

    if (puestoFilter.trim()) {
      filtrados = filtrados.filter((t) =>
        t.puesto.toLowerCase().includes(puestoFilter.toLowerCase().trim())
      );
    }

    if (superintendenciaFilter.trim()) {
      filtrados = filtrados.filter((t) =>
        t.superintendencia
          .toLowerCase()
          .includes(superintendenciaFilter.toLowerCase().trim())
      );
    }

    if (activoFilter) {
      const isActive = activoFilter === "true";
      filtrados = filtrados.filter((t) => t.activo === isActive);
    }

    return filtrados;
  };

  const limpiarFiltros = () => {
    setCiFilter("");
    setNominaFilter("");
    setPuestoFilter("");
    setSuperintendenciaFilter("");
    setActivoFilter("");
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const abrirModal = async (trabajador?: Trabajador) => {
    if (trabajador) {
      try {
        const trabajadorActualizado = await obtenerTrabajadorPorId(
          trabajador._id
        );
        setEditingTrabajador(trabajadorActualizado);
        setFormData({
          ci: trabajadorActualizado.ci,
          nomina: trabajadorActualizado.nomina,
          puesto: trabajadorActualizado.puesto,
          fecha_ingreso: trabajadorActualizado.fecha_ingreso.split("T")[0],
          superintendencia: trabajadorActualizado.superintendencia,
          activo: trabajadorActualizado.activo,
        });
      } catch (error) {
        console.error("Error al cargar trabajador:", error);
        setEditingTrabajador(trabajador);
        setFormData({
          ci: trabajador.ci,
          nomina: trabajador.nomina,
          puesto: trabajador.puesto,
          fecha_ingreso: trabajador.fecha_ingreso.split("T")[0],
          superintendencia: trabajador.superintendencia,
          activo: trabajador.activo,
        });
      }
    } else {
      setEditingTrabajador(null);
      setFormData(initialFormData);
    }
    setOpenModal(true);
  };

  const cerrarModal = () => {
    setOpenModal(false);
    setEditingTrabajador(null);
    setFormData(initialFormData);
  };

  const guardarTrabajador = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      if (editingTrabajador) {
        const updateData = {
          nomina: formData.nomina,
          puesto: formData.puesto,
          fecha_ingreso: formData.fecha_ingreso,
          superintendencia: formData.superintendencia,
          activo: formData.activo,
        };
        await actualizarTrabajador(editingTrabajador._id, updateData);
        mostrarNotificacion("Trabajador actualizado correctamente", "success");
      } else {
        await crearTrabajador({
          ci: formData.ci,
          nomina: formData.nomina,
          puesto: formData.puesto,
          fecha_ingreso: formData.fecha_ingreso,
          superintendencia: formData.superintendencia,
          activo: formData.activo,
        });
        mostrarNotificacion("Trabajador creado correctamente", "success");
      }

      cerrarModal();
      await cargarTrabajadores();
    } catch (error) {
      console.error("Error al guardar trabajador:", error);
      mostrarNotificacion(
        error instanceof Error
          ? error.message
          : "Error al guardar el trabajador",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarTrabajador = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este trabajador?"))
      return;

    try {
      setLoading(true);
      await eliminarTrabajador(id);
      mostrarNotificacion("Trabajador eliminado correctamente", "success");
      await cargarTrabajadores();
    } catch (error) {
      console.error("Error al eliminar trabajador:", error);
      mostrarNotificacion(
        error instanceof Error
          ? error.message
          : "Error al eliminar el trabajador",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const mostrarNotificacion = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setNotification({ open: true, message, severity });
  };

  const cerrarNotificacion = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const trabajadoresMostrados = filtrarTrabajadores();

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 3 }}>
        Gestión de Trabajadores
      </Typography>

      {/* PANEL DE FILTROS Y CONTROLES */}
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: "8px" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filtros y Controles
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
        </Grid>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={limpiarFiltros}
            >
              Limpiar Filtros
            </Button>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => abrirModal()}
            color="primary"
            disabled={loading}
          >
            Nuevo Trabajador
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
                    <TableCell align="center">Fecha Ingreso</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trabajadoresMostrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
                        page * rowsPerPage + rowsPerPage
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
                            {new Date(
                              trabajador.fecha_ingreso
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver detalle">
                              <IconButton color="info" size="small">
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Editar">
                              <IconButton
                                onClick={() => abrirModal(trabajador)}
                                color="primary"
                                size="small"
                                disabled={loading}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                              <IconButton
                                onClick={() =>
                                  handleEliminarTrabajador(trabajador._id)
                                }
                                color="error"
                                size="small"
                                disabled={loading}
                              >
                                <DeleteIcon />
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

      {/* MODAL PARA CREAR/EDITAR TRABAJADOR */}
      <Dialog open={openModal} onClose={cerrarModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTrabajador ? "Editar Trabajador" : "Nuevo Trabajador"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="CI *"
                value={formData.ci}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, ci: value });
                }}
                required
                disabled={!!editingTrabajador}
                error={!formData.ci}
                helperText={
                  !formData.ci
                    ? "Campo requerido"
                    : "Solo números (6-8 dígitos)"
                }
                inputProps={{ maxLength: 8 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nómina *"
                value={formData.nomina}
                onChange={(e) =>
                  setFormData({ ...formData, nomina: e.target.value })
                }
                required
                error={!formData.nomina}
                helperText={!formData.nomina ? "Campo requerido" : ""}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Puesto *"
                value={formData.puesto}
                onChange={(e) =>
                  setFormData({ ...formData, puesto: e.target.value })
                }
                required
                error={!formData.puesto}
                helperText={!formData.puesto ? "Campo requerido" : ""}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Fecha de Ingreso *"
                type="date"
                value={formData.fecha_ingreso}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_ingreso: e.target.value })
                }
                required
                error={!formData.fecha_ingreso}
                helperText={!formData.fecha_ingreso ? "Campo requerido" : ""}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Superintendencia *"
                value={formData.superintendencia}
                onChange={(e) =>
                  setFormData({ ...formData, superintendencia: e.target.value })
                }
                required
                error={!formData.superintendencia}
                helperText={!formData.superintendencia ? "Campo requerido" : ""}
              />
            </Grid>

            {editingTrabajador && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={formData.activo.toString()} // Solo para la UI (string)
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        activo: e.target.value === "true", // Convierte de vuelta a BOOLEAN
                      })
                    }
                    label="Estado"
                  >
                    <MenuItem value="true">Activo</MenuItem>
                    <MenuItem value="false">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: "1px solid #e0e0e0" }}>
          <Button
            onClick={cerrarModal}
            color="inherit"
            disabled={submitting}
            variant="outlined"
          >
            Cancelar
          </Button>

          <Button
            onClick={guardarTrabajador}
            variant="contained"
            disabled={submitting || !validateFormBasic()}
            startIcon={
              submitting ? <CircularProgress size={16} color="inherit" /> : null
            }
            color="primary"
          >
            {submitting
              ? "Guardando..."
              : editingTrabajador
              ? "Actualizar Trabajador"
              : "Crear Trabajador"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR FOR NOTIFICATIONS */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={cerrarNotificacion}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={cerrarNotificacion}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
