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
  Lock as LockIcon, // Icono para usuarios sin permisos
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
import { useUserRole } from "@/hooks/useUserRole";

// Configuración visual de los estados
const ESTADOS_FORMULARIO = [
  { value: "borrador", label: "Borrador", color: "default" as const },
  { value: "completado", label: "Completado", color: "primary" as const },
  { value: "revisado", label: "Revisado", color: "warning" as const },
  { value: "aprobado", label: "Aprobado", color: "success" as const },
];

export default function ListarInspeccionesIroIsop() {
  const { user,  isLoading: authLoading } = useUserRole()
  const router = useRouter();

  // Estados de datos
  const [instancias, setInstancias] = useState<FormInstance[]>([]);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Estados de Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Estados de Filtros
  const [templateIdFilter, setTemplateIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [createdByFilter, setCreatedByFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [minComplianceFilter, setMinComplianceFilter] = useState("");
  const [maxComplianceFilter, setMaxComplianceFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [superintendenciaFilter, setSuperintendenciaFilter] = useState("");

  // 🔥 LÓGICA DE PERMISOS CORREGIDA (Fix TS2339)
  const puedeGestionar = () => {
    if (!user || authLoading) return false;

    const rolesPermitidos = ["admin", "supervisor", "superintendente"];
    
    // 🔥 TRUCO: Casteamos a 'any' para evitar el error de TypeScript
    // y buscamos los roles en session.roles o session.user.roles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customSession = user as any;
    const rolesUsuario = customSession.roles || customSession.user?.roles || [];
    
    if (Array.isArray(rolesUsuario)) {
      return rolesUsuario.some((rol: string) => rolesPermitidos.includes(rol));
    }
    // Caso raro donde roles sea un string
    return rolesPermitidos.includes(rolesUsuario as string);
  };

  const tienePermisos = puedeGestionar();

  // Carga inicial
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

      // Construir objeto de filtros
      const filters: GetInstancesFilters = {};
      if (templateIdFilter) filters.templateId = templateIdFilter;
      if (statusFilter) filters.status = statusFilter;
      if (createdByFilter) filters.createdBy = createdByFilter;
      if (dateFromFilter) filters.dateFrom = new Date(dateFromFilter);
      if (dateToFilter) filters.dateTo = new Date(dateToFilter);
      if (minComplianceFilter) filters.minCompliance = parseFloat(minComplianceFilter);
      if (maxComplianceFilter) filters.maxCompliance = parseFloat(maxComplianceFilter);
      if (areaFilter) filters.area = areaFilter;
      if (superintendenciaFilter) filters.superintendencia = superintendenciaFilter;

      // Paginación (Backend suele ser base-1)
      filters.page = page + 1;
      filters.limit = rowsPerPage;

      console.log("Enviando filtros:", filters);

      const response = await getInstances(filters);

      if (response.success && response.data) {
        // Manejo flexible de la respuesta (array directo o paginado)
        if (Array.isArray(response.data.data)) {
          setInstancias(response.data.data);
          setTotalItems(response.data.total || response.data.data.length);
          // Sincronizar página si el backend la devuelve
          if (response.data.page) setPage(response.data.page - 1);
        } else if (Array.isArray(response.data)) {
          setInstancias(response.data);
          setTotalItems(response.data.length);
        } else {
          console.error("Estructura inesperada:", response.data);
          setInstancias([]);
        }
        setMostrarResultados(true);
      } else {
        setInstancias([]);
        setError(response.error || "Error al obtener datos");
        setMostrarResultados(false);
      }
    } catch (error) {
      console.error("Error al buscar:", error);
      setError("No se pudieron cargar las instancias. Intente nuevamente.");
      setInstancias([]);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setTemplateIdFilter("");
    setStatusFilter("");
    setCreatedByFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setMinComplianceFilter("");
    setMaxComplianceFilter("");
    setAreaFilter("");
    setSuperintendenciaFilter("");
    setInstancias([]);
    setMostrarResultados(false);
    setError(null);
    setPage(0);
    setTotalItems(0);
  };

  // Manejadores de Paginación
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    setTimeout(buscarInstancias, 100);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setTimeout(buscarInstancias, 100);
  };

  // 🔥 ACCIONES Y RUTAS
  const handleVerDetalle = (id: string) => {
    router.push(`/dashboard/reports/report-iro-isop/editar/${id}?mode=view`);
  };

  const handleEditar = (instancia: FormInstance) => {
    // ✅ Redirige a la nueva ruta de edición
    router.push(`/dashboard/reports/report-iro-isop/editar/${instancia._id}`);
  };

  const handleDescargarPdf = async (id: string) => {
    try {
      await descargarPdfIroIsopCliente(id);
    } catch (error) {
      console.error("Error PDF:", error);
    }
  };

  const handleDescargarExcel = async (id: string) => {
    try {
      await descargarExcelIroIsopCliente(id);
    } catch (error) {
      console.error("Error Excel:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") buscarInstancias();
  };

  // Helpers de Renderizado
  const obtenerTemplateNombre = (templateId: string | { _id: string; name: string; code: string }): string => {
    if (typeof templateId === "object" && templateId._id) {
      return `${templateId.name} (${templateId.code})`;
    }
    const template = templates.find((t) => t._id === templateId);
    return template ? `${template.name} (${template.code})` : "Template desconocido";
  };

  const obtenerEstadoConfig = (status: string) => {
    return ESTADOS_FORMULARIO.find((e) => e.value === status) || ESTADOS_FORMULARIO[0];
  };

  const obtenerColorCumplimiento = (porcentaje: number): "error" | "warning" | "success" => {
    if (porcentaje < 70) return "error";
    if (porcentaje < 90) return "warning";
    return "success";
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 3 }}>
        Gestión de Instancias IRO - ISOP
      </Typography>

      {/* --- PANEL DE FILTROS --- */}
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: "8px" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filtros de búsqueda
        </Typography>

        <Grid container spacing={3}>
          {/* Template */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Template de Formulario</InputLabel>
              <Select
                value={templateIdFilter}
                onChange={(e) => setTemplateIdFilter(e.target.value)}
                label="Template de Formulario"
                disabled={loadingTemplates}
              >
                <MenuItem value="">Todos</MenuItem>
                {templates.map((t) => (
                  <MenuItem key={t._id} value={t._id}>
                    {t.name} ({t.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Estado */}
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                {ESTADOS_FORMULARIO.map((e) => (
                  <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Creado Por */}
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth label="Creado por" variant="outlined" size="small"
              value={createdByFilter} onChange={(e) => setCreatedByFilter(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </Grid>

          {/* Fechas */}
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth label="Fecha desde" type="date" variant="outlined" size="small"
              value={dateFromFilter} onChange={(e) => setDateFromFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth label="Fecha hasta" type="date" variant="outlined" size="small"
              value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Cumplimiento */}
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              fullWidth label="Min %" type="number" variant="outlined" size="small"
              value={minComplianceFilter} onChange={(e) => setMinComplianceFilter(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              fullWidth label="Max %" type="number" variant="outlined" size="small"
              value={maxComplianceFilter} onChange={(e) => setMaxComplianceFilter(e.target.value)}
            />
          </Grid>

          {/* Área y Superintendencia */}
          <Grid size={{ xs: 12, md: 3 }}>
            <AutocompleteCustom
              dataSource="area" label="Área" placeholder="Seleccione área"
              value={areaFilter} onChange={(val) => setAreaFilter(val || "")}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <AutocompleteCustom
              dataSource="superintendencia" label="Superintendencia" placeholder="Seleccione..."
              value={superintendenciaFilter} onChange={(val) => setSuperintendenciaFilter(val || "")}
            />
          </Grid>

          {/* Botones de Acción Filtros */}
          <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end" gap={1}>
            <Button variant="outlined" startIcon={<ClearIcon />} onClick={limpiarFiltros}>
              Limpiar
            </Button>
            <Button variant="contained" startIcon={<SearchIcon />} onClick={buscarInstancias} disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* --- ESTADOS DE CARGA Y ERROR --- */}
      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Box display="flex" justifyContent="center" py={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* --- ESTADÍSTICAS --- */}
      {mostrarResultados && !loading && instancias.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography color="textSecondary" variant="body2">Total Instancias</Typography>
                <Typography variant="h5" fontWeight="bold">{totalItems}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography color="textSecondary" variant="body2">Promedio Cumplimiento</Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {Math.round(instancias.reduce((acc, curr) => acc + (curr.overallCompliancePercentage || 0), 0) / instancias.length)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography color="textSecondary" variant="body2">Aprobados</Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {instancias.filter(i => i.status === 'aprobado').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography color="textSecondary" variant="body2">En Borrador</Typography>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {instancias.filter(i => i.status === 'borrador').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* --- TABLA DE RESULTADOS --- */}
      {mostrarResultados && !loading && (
        <Paper elevation={2} sx={{ borderRadius: "8px", overflow: "hidden" }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Resultados ({totalItems})</Typography>
            
            {/* 🔥 Botón protegido */}
            {tienePermisos && (
              <Button
                variant="contained"
                startIcon={<FormIcon />}
                onClick={() => router.push("/dashboard/report-iro-isop/nuevo")} // Asegúrate que esta ruta exista o usa el tab
                color="primary"
              >
                Nueva Instancia
              </Button>
            )}
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>Template</TableCell>
                  <TableCell>Área</TableCell>
                  <TableCell>Superintendencia</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Creado por</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="center">% Cumpl.</TableCell>
                  <TableCell align="center">Pts.</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {instancias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">No se encontraron resultados.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  instancias.map((instancia) => {
                    const estado = obtenerEstadoConfig(instancia.status || "borrador");
                    const vl = instancia.verificationList || {};
                    const area = vl["Área"] || vl["area"] || vl["Area Física"]||"-";
                    const superint = vl["Superintendencia"] || vl["superintendencia"] || "-";

                    return (
                      <TableRow key={instancia._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {obtenerTemplateNombre(instancia.templateId)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 150 }} className="truncate">{area}</TableCell>
                        <TableCell sx={{ maxWidth: 150 }} className="truncate">{superint}</TableCell>
                        <TableCell>
                          <Chip label={estado.label} color={estado.color} size="small" />
                        </TableCell>
                        <TableCell>{instancia.createdBy || "Sistema"}</TableCell>
                        <TableCell>
                          {instancia.createdAt ? new Date(instancia.createdAt).toLocaleDateString("es-ES") : "-"}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${(instancia.overallCompliancePercentage || 0).toFixed(0)}%`}
                            color={obtenerColorCumplimiento(instancia.overallCompliancePercentage || 0)}
                            size="small"
                            icon={<TrendingUpIcon />}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {instancia.totalObtainedPoints}/{instancia.totalApplicablePoints}
                        </TableCell>
                        
                        {/* 🔥 COLUMNA PROTEGIDA */}
                        <TableCell align="center">
                          {tienePermisos ? (
                            <Box display="flex" justifyContent="center">
                              <Tooltip title="Ver">
                                <IconButton onClick={() => handleVerDetalle(instancia._id)} color="info" size="small">
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Editar">
                                <IconButton onClick={() => handleEditar(instancia)} color="primary" size="small">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="PDF">
                                <IconButton onClick={() => handleDescargarPdf(instancia._id)} color="error" size="small">
                                  <PdfIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Excel">
                                <IconButton onClick={() => handleDescargarExcel(instancia._id)} color="success" size="small">
                                  <ExcelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Tooltip title="Sin permisos">
                              <LockIcon color="disabled" fontSize="small" />
                            </Tooltip>
                          )}
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
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas:"
            />
          )}
        </Paper>
      )}
    </Container>
  );
}