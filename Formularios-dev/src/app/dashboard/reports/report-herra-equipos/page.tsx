"use client";

import type React from "react";
import { useState } from "react";
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
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Assignment as FormIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  deleteInspection,
  getInspectionById,
  getInspectionsHerraEquipos,
  InspectionResponse,
} from "@/lib/actions/inspection-herra-equipos";
import { descargarExcelHerraEquipoCliente, descargarPdfHerraEquipoCliente } from "@/lib/actions/client";

// Estados de formularios
// const ESTADOS_FORMULARIO = [
//   { value: "draft", label: "Borrador", color: "default" as const },
//   { value: "completed", label: "Completado", color: "success" as const },
// ];

// Mapeo de templates para mostrar nombres legibles
const TEMPLATE_NAMES: Record<string, string> = {
  "1.02.P06.F20": "Inspección de Cilindros",
  "1.02.P06.F39": "Inspección de Amoladora",
  "1.02.P06.F40": "Inspección de Esmeril",
  "1.02.P06.F42": "Inspección de Equipos de Soldar",
  "2.03.P10.F05": "Inspección de Taladro",
  "3.04.P04.F23": "Verificación Puente Grúa con Cabina",
  "3.04.P04.F35": "Inspección Puente Grúa Control Remoto",
  "3.04.P37.F19": "Inspección Pre-Uso Elementos de Izaje",
  "3.04.P37.F24": "Inspección Pre-Uso Tecles",
  "3.04.P37.F25": "Inspección Frecuente Tecles",
  "3.04.P48.F03": "Lista Verificación Vehículos",
  "1.02.P06.F33": "Inspección de Escaleras",
  "1.02.P06.F30": "Inspección de Andamios",
  "1.02.P06.F37": "Inspección Man Lift",
};

// Campos de verificación dinámicos por template
const VERIFICATION_FIELD_NAMES: Record<string, string> = {
  "3.04.P48.F03": "PLACA",
  "1.02.P06.F37": "PLACA/N° INTERNO",
  "3.04.P37.F24": "TAG",
  "3.04.P37.F25": "TAG",
  "3.04.P04.F23": "TAG del Puente Grúa",
  "3.04.P04.F35": "Tag del puente grúa",
  "1.02.P06.F33": "CÓDIGO DE LA ESCALERA",
  "1.02.P06.F39": "IDENTIFICACIÓN INTERNA DEL EQUIPO",
  "1.02.P06.F40": "UBICACIÓN FÍSICA EL EQUIPO",
  "1.02.P06.F42": "IDENTIFICACIÓN INTERNA DEL EQUIPO",
  "2.03.P10.F05": "CÓDIGO TALADRO",
  "1.02.P06.F20": "Lugar exacto del trabajo/depósito (lugar físico)",
  "1.02.P06.F30": "PROYECTO/Nº DE ORDEN DE TRABAJO",
};

export default function ListarInspeccionHerraEquipos() {
  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Estado para controlar la visibilidad de resultados
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Estados para los 5 filtros principales
  const [templateNameFilter, setTemplateNameFilter] = useState("");
  const [templateCodeFilter, setTemplateCodeFilter] = useState("");
  const [equipmentIdFilter, setEquipmentIdFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // Estados para modal de vista detallada
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<InspectionResponse | null>(null);

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

  const router = useRouter();

  const buscarInspecciones = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir filtros para el backend
      const filters: {
        templateCode?: string;
        startDate?: string;
        endDate?: string;
      } = {};

      if (templateCodeFilter) filters.templateCode = templateCodeFilter;
      if (startDateFilter) filters.startDate = startDateFilter;
      if (endDateFilter) filters.endDate = endDateFilter;

      console.log("Enviando filtros:", filters);

      const response = await getInspectionsHerraEquipos(filters);
      console.log("Response completa:", response);

      if (response.success && response.data) {
        let filtradas = response.data;

        // Aplicar filtros del lado del cliente
        if (templateNameFilter.trim()) {
          filtradas = filtradas.filter((insp) =>
            insp.templateName?.toLowerCase().includes(templateNameFilter.toLowerCase().trim())
          );
        }

        if (equipmentIdFilter.trim()) {
          filtradas = filtradas.filter((insp) => {
            const fieldName = VERIFICATION_FIELD_NAMES[insp.templateCode];
            if (!fieldName || !insp.verification) return false;
            
            const value = insp.verification[fieldName];
            return value?.toString().toLowerCase().includes(equipmentIdFilter.toLowerCase().trim());
          });
        }

        setInspections(filtradas);
        setTotalItems(filtradas.length);
        setMostrarResultados(true);
      } else {
        console.error("Error en response:", response);
        setInspections([]);
        setError(response.error || "Error desconocido");
        setMostrarResultados(false);
      }
    } catch (error) {
      console.error("Error al buscar inspecciones:", error);
      setError("No se pudieron cargar las inspecciones con los filtros seleccionados");
      setInspections([]);
      setMostrarResultados(false);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setTemplateNameFilter("");
    setTemplateCodeFilter("");
    setEquipmentIdFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setInspections([]);
    setMostrarResultados(false);
    setError(null);
    setPage(0);
    setTotalItems(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleVerDetalle = async (inspection: InspectionResponse) => {
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

  const handleEditar = (inspection: InspectionResponse) => {
    router.push(`/dashboard/config/inspecciones/editar/${inspection._id}`);
  };

  const handleDuplicar = async (inspection: InspectionResponse) => {
    try {
      setLoading(true);
      const result = await getInspectionById(inspection._id);

      if (result.success && result.data) {
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

        setTimeout(() => {
          router.push(`/dashboard/form-herra-equipos/${inspection.templateCode}`);
        }, 1000);
      }
    } catch (error) {
      console.error("Error al duplicar:", error);
      mostrarNotificacion("Error al duplicar la inspección", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta inspección?")) return;

    try {
      setLoading(true);
      const result = await deleteInspection(id);

      if (result.success) {
        mostrarNotificacion("Inspección eliminada correctamente", "success");
        await buscarInspecciones();
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

  const handleDescargarPdf = async (id: string) => {
    try {
      await descargarPdfHerraEquipoCliente(id);
      console.log("Descargando PDF para inspección:", id);
      mostrarNotificacion("Descargando pdf", "info");
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      mostrarNotificacion("Error al descargar el PDF", "error");
    }
  };

  const handleDescargarExcel = async (id: string) => {
    try {
      setLoading(true);
      mostrarNotificacion("Generando archivo Excel...", "info");
      await descargarExcelHerraEquipoCliente(id);
    } catch (error) {
      console.error("Error al descargar el Excel:", error);
      mostrarNotificacion(
        error instanceof Error ? error.message : "Error al descargar el Excel",
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
      buscarInspecciones();
    }
  };

  const getEquipmentId = (inspection: InspectionResponse): string => {
    const fieldName = VERIFICATION_FIELD_NAMES[inspection.templateCode];
    if (!fieldName || !inspection.verification) return "N/A";
    const value = inspection.verification[fieldName];
    return value ? value.toString() : "N/A";
  };

  const getSuperintendenciaOGerencia = (inspection: InspectionResponse): string => {
    if (!inspection.verification) return "N/A";
    
    const superintendencia = inspection.verification["SUPERINTENDENCIA"];
    const gerencia = inspection.verification["DIRECCIÓN/GERENCIA"] || 
                     inspection.verification["Gerencia"] ||
                     inspection.verification["DIRECCIÓN/GERENCIA y/o SUPERINTENDENCIA"] ||
                     inspection.verification["Vicepresidencia/Gerencia"] ||
                     inspection.verification["SUPERINTENDENCIA"] ||
                     inspection.verification["Dirección/Gerencia"] ||
                     inspection.verification["EMPRESA"];
    
    return (superintendencia?.toString() || gerencia?.toString() || "N/A");
  };

  const getArea = (inspection: InspectionResponse): string => {
    if (!inspection.verification) return "N/A";
    
    const area = inspection.verification["ÁREA"] || 
                 inspection.verification["Área"] ||
                 inspection.verification["Area"] ||
                 inspection.verification["AREA"] ||
                 inspection.verification["AREA FÍSICA DE UBICACIÓN DE LA ESCALERA"] ||
                 inspection.verification["UBICACIÓN FÍSICA DEL EQUIPO"];
    
    return area ? area.toString() : "N/A";
  };

  // Calcular inspecciones paginadas
  const inspeccionesPaginadas = inspections.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="xl">
      <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 3 }}>
        Gestión de Inspecciones - Herramientas y Equipos
      </Typography>

      {/* PANEL DE FILTROS - 5 CAMPOS */}
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: "8px" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filtros de búsqueda
        </Typography>

        <Grid container spacing={3}>
          {/* Nombre del Formulario */}
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="template-name-filter-label">Nombre del Formulario</InputLabel>
              <Select
                labelId="template-name-filter-label"
                value={templateNameFilter}
                onChange={(e) => setTemplateNameFilter(e.target.value)}
                label="Nombre del Formulario"
              >
                <MenuItem value="">Todos</MenuItem>
                {Object.entries(TEMPLATE_NAMES).map(([code, name]) => (
                  <MenuItem key={code} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Código del Formulario */}
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="template-code-filter-label">Código</InputLabel>
              <Select
                labelId="template-code-filter-label"
                value={templateCodeFilter}
                onChange={(e) => setTemplateCodeFilter(e.target.value)}
                label="Código"
              >
                <MenuItem value="">Todos</MenuItem>
                {Object.keys(TEMPLATE_NAMES).map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Campo de Verificación (TAG, Placa, Código, etc.) */}
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="TAG / Placa / Código"
              variant="outlined"
              size="small"
              value={equipmentIdFilter}
              onChange={(e) => setEquipmentIdFilter(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ej: TAG-123, ABC-001"
            />
          </Grid>

          {/* Fecha desde */}
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              label="Fecha desde"
              type="date"
              variant="outlined"
              size="small"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Fecha hasta */}
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              label="Fecha hasta"
              type="date"
              variant="outlined"
              size="small"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Botones de acción */}
          <Grid
            size={{ xs: 12 }}
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            gap={1}
          >
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={limpiarFiltros}
            >
              Limpiar
            </Button>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={buscarInspecciones}
              disabled={loading}
            >
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Estado de carga */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      )}

      {/* Estado de error */}
      {error && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* ESTADÍSTICAS RÁPIDAS */}
      {mostrarResultados && !loading && inspections.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography color="textSecondary" gutterBottom>
                  Total Inspecciones
                </Typography>
                <Typography variant="h4">{totalItems}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography color="textSecondary" gutterBottom>
                  Completadas
                </Typography>
                <Typography variant="h4" color="success.main">
                  {inspections.filter((i) => i.status === "completed").length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography color="textSecondary" gutterBottom>
                  En Borrador
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {inspections.filter((i) => i.status === "draft").length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* TABLA DE RESULTADOS */}
      {mostrarResultados && !loading && (
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
              Resultados ({totalItems})
            </Typography>
            <Button
              variant="contained"
              startIcon={<FormIcon />}
              onClick={() => router.push("/dashboard/form-herra-equipos")}
              color="primary"
            >
              Nueva Inspección
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>Fecha Inspección</TableCell>
                  <TableCell>Superintendencia/Gerencia</TableCell>
                  <TableCell>Área</TableCell>
                  <TableCell>Tipo de Inspección</TableCell>
                  <TableCell>Código + Revisión</TableCell>
                  <TableCell>TAG/Placa/Código</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inspeccionesPaginadas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        No se encontraron inspecciones con los criterios de búsqueda
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  inspeccionesPaginadas.map((inspection) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                   // const template = inspection.templateId as any;
                    
                    return (
                      <TableRow
                        key={inspection._id}
                        sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                      >
                        <TableCell>
                          {inspection.submittedAt
                            ? new Date(inspection.submittedAt).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "N/A"}
                        </TableCell>
                        <TableCell>{getSuperintendenciaOGerencia(inspection)}</TableCell>
                        <TableCell>{getArea(inspection)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {TEMPLATE_NAMES[inspection.templateCode] || inspection.templateName || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {inspection.templateCode}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              Rev. {(inspection.templateId as any)?.revision || "N/A"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getEquipmentId(inspection)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver detalle">
                            <IconButton
                              onClick={() => handleVerDetalle(inspection)}
                              color="primary"
                              size="small"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              onClick={() => handleEditar(inspection)}
                              color="primary"
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Duplicar">
                            <IconButton
                              onClick={() => handleDuplicar(inspection)}
                              color="secondary"
                              size="small"
                            >
                              <CopyIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Descargar PDF">
                            <IconButton
                              onClick={() => handleDescargarPdf(inspection._id)}
                              color="secondary"
                              size="small"
                            >
                              <PdfIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Descargar Excel">
                            <IconButton
                              onClick={() => handleDescargarExcel(inspection._id)}
                              color="success"
                              size="small"
                            >
                              <ExcelIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              onClick={() => handleEliminar(inspection._id)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalItems > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
            />
          )}
        </Paper>
      )}

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
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    Código Template:
                  </Typography>
                  <Typography variant="body1">
                    {selectedInspection.templateCode || "N/A"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
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
                      selectedInspection.status === "completed" ? "success" : "warning"
                    }
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    Superintendencia/Gerencia:
                  </Typography>
                  <Typography variant="body1">
                    {getSuperintendenciaOGerencia(selectedInspection)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    Área:
                  </Typography>
                  <Typography variant="body1">
                    {getArea(selectedInspection)}
                  </Typography>
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