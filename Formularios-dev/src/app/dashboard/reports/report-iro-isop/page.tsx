"use client";

import type React from "react";
import { useEffect, useState } from "react";
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
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Assignment as FormIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { FormInstance, FormTemplate } from "@/types/formTypes";
import { getTemplates } from "@/lib/actions/template-actions";
import {
  getInstances,
  GetInstancesFilters,
} from "@/lib/actions/instance-actions";
import { descargarExcelIroIsopCliente, descargarPdfIroIsopCliente } from "@/lib/actions/client";
import AutocompleteCustom from "@/components/molecules/autocomplete-custom/AutocompleteCustom";

// Estados de formularios
const ESTADOS_FORMULARIO = [
  { value: "borrador", label: "Borrador", color: "default" as const },
  { value: "completado", label: "Completado", color: "primary" as const },
  { value: "revisado", label: "Revisado", color: "warning" as const },
  { value: "aprobado", label: "Aprobado", color: "success" as const },
];

export default function ListarInspeccionesIroIsop() {
  const [instancias, setInstancias] = useState<FormInstance[]>([]);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  //const [totalPages, setTotalPages] = useState(0);

  // Estado para controlar la visibilidad de resultados
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Estados para los filtros
  const [templateIdFilter, setTemplateIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  //const [typeFilter, setTypeFilter] = useState("");
  const [createdByFilter, setCreatedByFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [minComplianceFilter, setMinComplianceFilter] = useState("");
  const [maxComplianceFilter, setMaxComplianceFilter] = useState("");

  const [areaFilter, setAreaFilter] = useState("");
  const [superintendenciaFilter, setSuperintendenciaFilter] = useState("");

  const router = useRouter();

  useEffect(() => {
    cargarTemplates();
  }, []);

  const cargarTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const templatesData = await getTemplates();
      if (templatesData.success && templatesData.data) {
        setTemplates(
          Array.isArray(templatesData.data) ? templatesData.data : []
        );
      } else {
        console.error("Error al cargar templates:", templatesData.error);
        setTemplates([]);
      }
    } catch (error) {
      console.error("Error al cargar templates:", error);
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const buscarInstancias = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir filtros
      const filters: GetInstancesFilters = {};
      if (templateIdFilter) filters.templateId = templateIdFilter;
      if (statusFilter) filters.status = statusFilter;
      if (createdByFilter) filters.createdBy = createdByFilter;
      if (dateFromFilter) filters.dateFrom = new Date(dateFromFilter);
      if (dateToFilter) filters.dateTo = new Date(dateToFilter);
      if (minComplianceFilter)
        filters.minCompliance = parseFloat(minComplianceFilter);
      if (maxComplianceFilter)
        filters.maxCompliance = parseFloat(maxComplianceFilter);

      if (areaFilter) filters.area = areaFilter;
      if (superintendenciaFilter)
        filters.superintendencia = superintendenciaFilter;

      // Corregir la paginación - el backend parece usar página basada en 1
      filters.page = page + 1;
      filters.limit = rowsPerPage;

      console.log("Enviando filtros:", filters);

      const response = await getInstances(filters);
      console.log("Response completa:", response);

      if (response.success && response.data) {
        // Verificar la estructura de los datos
        console.log("Datos recibidos:", response.data);

        // Si response.data es un array directo
        if (Array.isArray(response.data.data)) {
          setInstancias(response.data.data);
          setTotalItems(response.data.total || response.data.data.length);
          //setTotalPages(response.data.totalPages || Math.ceil((response.data.total || response.data.data.length) / rowsPerPage));
          // El backend devuelve página basada en 1, pero el frontend usa basada en 0
          setPage((response.data.page || 1) - 1);
        } else if (Array.isArray(response.data)) {
          // Si response.data es directamente el array
          setInstancias(response.data);
          setTotalItems(response.data.length);
          //setTotalPages(Math.ceil(response.data.length / rowsPerPage));
        } else {
          console.error("Estructura de datos inesperada:", response.data);
          setInstancias([]);
          setError("Estructura de datos inesperada del servidor");
        }

        setMostrarResultados(true);
      } else {
        console.error("Error en response:", response);
        setInstancias([]);
        setError(response.error || "Error desconocido");
        setMostrarResultados(false);
      }
    } catch (error) {
      console.error("Error al buscar instancias:", error);
      setError(
        "No se pudieron cargar las instancias con los filtros seleccionados"
      );
      setInstancias([]);
      setMostrarResultados(false);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setTemplateIdFilter("");
    setStatusFilter("");
    //setTypeFilter("");
    setCreatedByFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setMinComplianceFilter("");
    setMaxComplianceFilter("");
    setAreaFilter(""); // ✅ NUEVO
    setSuperintendenciaFilter("");
    setInstancias([]);
    setMostrarResultados(false);
    setError(null);
    setPage(0);
    setTotalItems(0);
    //setTotalPages(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    // Después de cambiar la página, buscar de nuevo
    setTimeout(buscarInstancias, 100);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    // Después de cambiar las filas por página, buscar de nuevo
    setTimeout(buscarInstancias, 100);
  };

  const handleVerDetalle = (id: string) => {
    router.push(`/dashboard/formularios/instancias/${id}`);
  };

  const handleEditar = (instancia: FormInstance) => {
    router.push(`/dashboard/formularios/instancias/editar/${instancia._id}`);
  };

  const handleDescargarPdf = async (id: string) => {
    try {
      await descargarPdfIroIsopCliente(id);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  };

  const handleDescargarExcel = async (id: string) => {
    try {
      console.log("Descargando Excel para instancia:", id);
      await descargarExcelIroIsopCliente(id);
    } catch (error) {
      console.error("Error al descargar el Excel:", error);
    }
  };

  const obtenerTemplateNombre = (
    templateId: string | { _id: string; name: string; code: string }
  ): string => {
    // Verificar si templateId es un objeto o un string
    let id: string;
    if (typeof templateId === "object" && templateId._id) {
      // Si es un objeto con la información completa
      return `${templateId.name} (${templateId.code})`;
    } else if (typeof templateId === "string") {
      id = templateId;
    } else {
      return "Template no válido";
    }

    const template = templates.find((t) => t._id === id);
    return template
      ? `${template.name} (${template.code})`
      : "Template no encontrado";
  };

  const obtenerEstadoConfig = (status: string) => {
    return (
      ESTADOS_FORMULARIO.find((e) => e.value === status) ||
      ESTADOS_FORMULARIO[0]
    );
  };

  const obtenerColorCumplimiento = (
    porcentaje: number
  ): "error" | "warning" | "success" => {
    if (porcentaje < 70) return "error";
    if (porcentaje < 90) return "warning";
    return "success";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      buscarInstancias();
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 3 }}>
        Gestión de Instancias de Formularios
      </Typography>

      {/* PANEL DE FILTROS */}
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: "8px" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filtros de búsqueda
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="template-filter-label">
                Template de Formulario
              </InputLabel>
              <Select
                labelId="template-filter-label"
                value={templateIdFilter}
                onChange={(e) => setTemplateIdFilter(e.target.value)}
                label="Template de Formulario"
                disabled={loadingTemplates}
              >
                <MenuItem value="">Todos</MenuItem>
                {templates.map((template) => (
                  <MenuItem key={template._id} value={template._id}>
                    {template.name} ({template.code}) - Rev. {template.revision}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Estado</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                {ESTADOS_FORMULARIO.map((estado) => (
                  <MenuItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Creado por"
              variant="outlined"
              size="small"
              value={createdByFilter}
              onChange={(e) => setCreatedByFilter(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Fecha desde"
              type="date"
              variant="outlined"
              size="small"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Fecha hasta"
              type="date"
              variant="outlined"
              size="small"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              label="Cumplimiento mín. (%)"
              type="number"
              variant="outlined"
              size="small"
              value={minComplianceFilter}
              onChange={(e) => setMinComplianceFilter(e.target.value)}
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              label="Cumplimiento máx. (%)"
              type="number"
              variant="outlined"
              size="small"
              value={maxComplianceFilter}
              onChange={(e) => setMaxComplianceFilter(e.target.value)}
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <AutocompleteCustom
              dataSource="area"
              label="Área"
              placeholder="Seleccione o escriba un área"
              value={areaFilter}
              onChange={(value) => setAreaFilter(value || "")}
            />
          </Grid>

          {/* ✅ CAMBIO: Filtro de Superintendencia con Autocomplete */}
          <Grid size={{ xs: 12, md: 3 }}>
            <AutocompleteCustom
              dataSource="superintendencia"
              label="Superintendencia"
              placeholder="Seleccione o escriba una superintendencia"
              value={superintendenciaFilter}
              onChange={(value) => setSuperintendenciaFilter(value || "")}
            />
          </Grid>

          <Grid
            size={{ xs: 12, md: 5 }}
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
              onClick={buscarInstancias}
              disabled={loading}
            >
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Estado de carga */}
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

      {/* Estado de error */}
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

      {/* ESTADÍSTICAS RÁPIDAS */}
      {mostrarResultados && !loading && instancias.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography color="textSecondary" gutterBottom>
                  Total Instancias
                </Typography>
                <Typography variant="h4">{totalItems}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography color="textSecondary" gutterBottom>
                  Promedio Cumplimiento
                </Typography>
                <Typography variant="h4" color="primary">
                  {instancias.length > 0
                    ? Math.round(
                        instancias.reduce(
                          (sum, inst) =>
                            sum + (inst.overallCompliancePercentage || 0),
                          0
                        ) / instancias.length
                      )
                    : 0}
                  %
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography color="textSecondary" gutterBottom>
                  Aprobados
                </Typography>
                <Typography variant="h4" color="success.main">
                  {instancias.filter((i) => i.status === "aprobado").length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography color="textSecondary" gutterBottom>
                  En Borrador
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {instancias.filter((i) => i.status === "borrador").length}
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
              Instancias de Formularios ({totalItems})
            </Typography>
            <Button
              variant="contained"
              startIcon={<FormIcon />}
              onClick={() =>
                router.push("/dashboard/formularios-de-inspeccion")
              }
              color="primary"
            >
              Nueva Instancia
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>Template</TableCell>
                  <TableCell>Área</TableCell> 
                  <TableCell>Superintendencia</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Creado por</TableCell>
                  <TableCell>Fecha Creación</TableCell>
                  <TableCell align="center">Cumplimiento</TableCell>
                  <TableCell align="center">Puntaje</TableCell>
                  <TableCell align="center">N/A</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {instancias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                      {" "}
                      {/* ✅ Cambiar de 8 a 10 */}
                      <Typography variant="body1" color="textSecondary">
                        No se encontraron instancias con los criterios de
                        búsqueda
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  instancias.map((instancia) => {
                    const estadoConfig = obtenerEstadoConfig(
                      instancia.status || "borrador"
                    );

                    // ✅ NUEVO: Extraer área y superintendencia de verificationList
                    const verificationList = instancia.verificationList || {};
                    const area =
                      verificationList["Área"] ||
                      verificationList["area"] ||
                      "-";
                    const superintendencia =
                      verificationList["Superintendencia"] ||
                      verificationList["superintendencia"] ||
                      "-";

                    return (
                      <TableRow
                        key={instancia._id}
                        sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {obtenerTemplateNombre(instancia.templateId)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 200 }}
                          >
                            {area}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 250 }}
                          >
                            {superintendencia}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={estadoConfig.label}
                            color={estadoConfig.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {instancia.createdBy || "Sistema"}
                        </TableCell>
                        <TableCell>
                          {instancia.createdAt
                            ? new Date(instancia.createdAt).toLocaleDateString(
                                "es-ES"
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${(
                              instancia.overallCompliancePercentage || 0
                            ).toFixed(1)}%`}
                            color={obtenerColorCumplimiento(
                              instancia.overallCompliancePercentage || 0
                            )}
                            size="small"
                            icon={<TrendingUpIcon />}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {instancia.totalObtainedPoints || 0} /{" "}
                            {instancia.totalApplicablePoints || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="textSecondary">
                            {instancia.totalNaCount || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver detalle">
                            <IconButton
                              onClick={() => handleVerDetalle(instancia._id)}
                              color="primary"
                              size="small"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              onClick={() => handleEditar(instancia)}
                              color="primary"
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Descargar PDF">
                            <IconButton
                              onClick={() => handleDescargarPdf(instancia._id)}
                              color="secondary"
                              size="small"
                            >
                              <PdfIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Descargar Excel">
                            <IconButton
                              onClick={() =>
                                handleDescargarExcel(instancia._id)
                              }
                              color="success"
                              size="small"
                            >
                              <ExcelIcon />
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
            />
          )}
        </Paper>
      )}
    </Container>
  );
}
