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
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { deleteInspection, getInspectionById, getInspectionsHerraEquipos, updateInspection } from "@/lib/actions/inspection-herra-equipos";

interface Inspection {
  _id: string;
  templateCode: string;
  templateName?: string;
  status: "draft" | "completed";
  submittedAt: string;
  submittedBy?: string;
  location?: string;
  project?: string;
  verification: Record<string, string | number>;
  createdAt?: string;
  updatedAt?: string;
}

export default function GestionInspecciones() {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para filtros
  const [templateCodeFilter, setTemplateCodeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [submittedByFilter, setSubmittedByFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // Estados para modal de vista detallada
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<any>(null);

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
    cargarInspecciones();
  }, []);

  const cargarInspecciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getInspectionsHerraEquipos();

      if (result.success && result.data) {
        setInspections(result.data);
      } else {
        throw new Error(result.error || "Error al cargar inspecciones");
      }
    } catch (error) {
      console.error("Error al cargar inspecciones:", error);
      setError("No se pudieron cargar las inspecciones");
      mostrarNotificacion("Error al cargar las inspecciones", "error");
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    try {
      setLoading(true);
      setPage(0);

      const filters: any = {};
      if (templateCodeFilter) filters.templateCode = templateCodeFilter;
      if (statusFilter) filters.status = statusFilter;
      if (submittedByFilter) filters.submittedBy = submittedByFilter;
      if (startDateFilter) filters.startDate = startDateFilter;
      if (endDateFilter) filters.endDate = endDateFilter;

      const result = await getInspectionsHerraEquipos(filters);

      if (result.success && result.data) {
        setInspections(result.data);
      }
    } catch (error) {
      console.error("Error al aplicar filtros:", error);
      mostrarNotificacion("Error al aplicar filtros", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtrarInspecciones = () => {
    let filtradas = inspections;

    if (locationFilter.trim()) {
      filtradas = filtradas.filter((insp) =>
        insp.location?.toLowerCase().includes(locationFilter.toLowerCase().trim())
      );
    }

    return filtradas;
  };

  const limpiarFiltros = async () => {
    setTemplateCodeFilter("");
    setStatusFilter("");
    setSubmittedByFilter("");
    setLocationFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setPage(0);
    await cargarInspecciones();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const verDetalle = async (inspection: Inspection) => {
    try {
      setLoading(true);
      const result = await getInspectionById(inspection._id);

      if (result.success && result.data) {
        setSelectedInspection(result.data);
        setOpenDetailModal(true);
      } else {
        throw new Error(result.error || "Error al cargar detalle");
      }
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      mostrarNotificacion("Error al cargar el detalle de la inspección", "error");
    } finally {
      setLoading(false);
    }
  };

  const editarInspeccion = (inspection: Inspection) => {
    // Redirigir a una página de edición con el ID
    router.push(`/dashboard/config/inspecciones/editar/${inspection._id}`);
  };

  const duplicarInspeccion = async (inspection: Inspection) => {
    try {
      setLoading(true);
      const result = await getInspectionById(inspection._id);

      if (result.success && result.data) {
        // Guardar en localStorage para pre-llenar el formulario
        const draftData = {
          ...result.data,
          status: "draft",
          submittedAt: new Date().toISOString(),
        };
        
        localStorage.setItem(
          `draft_duplicate_${inspection.templateCode}`,
          JSON.stringify(draftData)
        );

        mostrarNotificacion("Inspección duplicada, redirigiendo...", "info");
        
        // Redirigir al formulario con el código del template
        setTimeout(() => {
          router.push(`/dashboard/form-med-amb/${inspection.templateCode}`);
        }, 1000);
      }
    } catch (error) {
      console.error("Error al duplicar:", error);
      mostrarNotificacion("Error al duplicar la inspección", "error");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (inspection: Inspection) => {
    if (!confirm(`¿Cambiar estado a ${inspection.status === "draft" ? "completado" : "borrador"}?`)) {
      return;
    }

    try {
      setLoading(true);
      const newStatus = inspection.status === "draft" ? "completed" : "draft";

      const result = await updateInspection(inspection._id, {}, newStatus);

      if (result.success) {
        mostrarNotificacion(
          `Inspección marcada como ${newStatus === "completed" ? "completada" : "borrador"}`,
          "success"
        );
        await cargarInspecciones();
      } else {
        throw new Error(result.error || "Error al cambiar estado");
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      mostrarNotificacion(
        error instanceof Error ? error.message : "Error al cambiar el estado",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarInspeccion = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta inspección?")) return;

    try {
      setLoading(true);
      const result = await deleteInspection(id);

      if (result.success) {
        mostrarNotificacion("Inspección eliminada correctamente", "success");
        await cargarInspecciones();
      } else {
        throw new Error(result.error || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error al eliminar inspección:", error);
      mostrarNotificacion(
        error instanceof Error ? error.message : "Error al eliminar la inspección",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = async (inspection: Inspection) => {
    mostrarNotificacion("Función de exportación en desarrollo", "info");
    // TODO: Implementar exportación a PDF
  };

  const mostrarNotificacion = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const cerrarNotificacion = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      aplicarFiltros();
    }
  };

  const inspeccionesMostradas = filtrarInspecciones();

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 3 }}>
        Gestión de Inspecciones
      </Typography>

      {/* PANEL DE FILTROS Y CONTROLES */}
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: "8px" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filtros y Controles
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Código de Template"
              variant="outlined"
              size="small"
              value={templateCodeFilter}
              onChange={(e) => setTemplateCodeFilter(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="draft">Borrador</MenuItem>
                <MenuItem value="completed">Completado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Ubicación"
              variant="outlined"
              size="small"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Usuario"
              variant="outlined"
              size="small"
              value={submittedByFilter}
              onChange={(e) => setSubmittedByFilter(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Fecha Inicio"
              type="date"
              variant="outlined"
              size="small"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Fecha Fin"
              type="date"
              variant="outlined"
              size="small"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
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
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={aplicarFiltros}
              color="secondary"
            >
              Buscar
            </Button>
          </Box>

          <Button
            variant="contained"
            onClick={() => router.push("/dashboard/form-med-amb")}
            color="primary"
          >
            Nueva Inspección
          </Button>
        </Box>
      </Paper>

      {/* TABLA DE INSPECCIONES */}
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
            Inspecciones ({inspeccionesMostradas.length})
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
                    <TableCell>Código Template</TableCell>
                    <TableCell>Nombre Template</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Ubicación</TableCell>
                    <TableCell>Proyecto</TableCell>
                    <TableCell align="center">Fecha Envío</TableCell>
                    <TableCell align="center">Usuario</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inspeccionesMostradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          No se encontraron inspecciones con los filtros aplicados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    inspeccionesMostradas
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((inspection) => (
                        <TableRow
                          key={inspection._id}
                          sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {inspection.templateCode}
                            </Typography>
                          </TableCell>
                          <TableCell>{inspection.templateName || "N/A"}</TableCell>
                          <TableCell>
                            <Chip
                              label={
                                inspection.status === "completed"
                                  ? "Completado"
                                  : "Borrador"
                              }
                              color={
                                inspection.status === "completed"
                                  ? "success"
                                  : "warning"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{inspection.location || "N/A"}</TableCell>
                          <TableCell>{inspection.project || "N/A"}</TableCell>
                          <TableCell align="center">
                            {new Date(inspection.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="center">
                            {inspection.submittedBy || "N/A"}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver detalle">
                              <IconButton
                                onClick={() => verDetalle(inspection)}
                                color="info"
                                size="small"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Editar">
                              <IconButton
                                onClick={() => editarInspeccion(inspection)}
                                color="primary"
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Duplicar">
                              <IconButton
                                onClick={() => duplicarInspeccion(inspection)}
                                color="secondary"
                                size="small"
                              >
                                <CopyIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Exportar PDF">
                              <IconButton
                                onClick={() => exportarPDF(inspection)}
                                color="success"
                                size="small"
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                              <IconButton
                                onClick={() => handleEliminarInspeccion(inspection._id)}
                                color="error"
                                size="small"
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
              count={inspeccionesMostradas.length}
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

      {/* MODAL DE DETALLE */}
      <Dialog
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalle de Inspección</DialogTitle>
        <DialogContent>
          {selectedInspection && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Información General
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs:  6}}>
                  <Typography variant="body2" color="textSecondary">
                    Código Template:
                  </Typography>
                  <Typography variant="body1">
                    {selectedInspection.templateCode}
                  </Typography>
                </Grid>
                <Grid size={{ xs:  6}}>
                  <Typography variant="body2" color="textSecondary">
                    Estado:
                  </Typography>
                  <Chip
                    label={
                      selectedInspection.status === "completed"
                        ? "Completado"
                        : "Borrador"
                    }
                    color={
                      selectedInspection.status === "completed"
                        ? "success"
                        : "warning"
                    }
                    size="small"
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Datos de Verificación
              </Typography>
              <Box
                sx={{
                  bgcolor: "#f5f5f5",
                  p: 2,
                  borderRadius: 1,
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                <pre>{JSON.stringify(selectedInspection.verification, null, 2)}</pre>
              </Box>

              {selectedInspection.generalObservations && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Observaciones Generales
                  </Typography>
                  <Typography variant="body1">
                    {selectedInspection.generalObservations}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* NOTIFICACIONES */}
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