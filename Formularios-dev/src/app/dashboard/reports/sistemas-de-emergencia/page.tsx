
"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
} from "@mui/material"
import { 
  Visibility as VisibilityIcon, 
  PictureAsPdf as PdfIcon, 
  TableChart as ExcelIcon, 
  Edit as EditIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material"
import { useRouter } from "next/navigation"
import { 
  descargarPdfCliente, 
  descargarExcelInspeccionesEmergenciaCliente 
} from "@/app/actions/client"
import { buscarAreas, obtenerSistemasEmergenciaReport } from "@/app/actions/inspeccion"
import type { FiltrosInspeccion, InspeccionServiceExport } from "@/types/formTypes"

// Lista de meses para el filtro
const MESES = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
]

// Lista de superintendencias predefinidas
const SUPERINTENDENCIAS = [
  "Superintendencia de Mantenimiento - Eléctrico e Instrumentación Planta",
  "Superintendencia de Mantenimiento - Ingeniería de Confiabilidad",
  "Superintendencia de Mantenimiento - Mec. Plta. Chancado, Molienda y Lubricación",
  "Superintendencia de Mantenimiento - Mec. Plta. Flot., Filtros, Taller Gral. y RH",
  "Superintendencia de Mantenimiento - Planificación",
]

export default function ListaInspecciones() {
  const [inspecciones, setInspecciones] = useState<InspeccionServiceExport[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAreas, setLoadingAreas] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // Estado para controlar la visibilidad de la tabla de resultados
  const [mostrarResultados, setMostrarResultados] = useState(false)
  
  // Estados para los filtros
  const [areaFilter, setAreaFilter] = useState("")
  const [superintendenciaFilter, setSuperintendenciaFilter] = useState("")
  const [mesFilter, setMesFilter] = useState("")
  const [documentCodeFilter, setDocumentCodeFilter] = useState("")
  
  // Lista para el desplegable de áreas
  const [areas, setAreas] = useState<string[]>([])
  
  const router = useRouter()

  useEffect(() => {
    // Cargar áreas al iniciar el componente
    cargarAreas()
  }, [])

  const cargarAreas = async () => {
    try {
      setLoadingAreas(true)
      // Utilizamos el servicio de búsqueda de áreas existente
      const areasData = await buscarAreas("")
      setAreas(areasData)
    } catch (error) {
      console.error("Error al cargar la lista de áreas:", error)
    } finally {
      setLoadingAreas(false)
    }
  }

  const filtrarInspecciones = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Crear el objeto de filtros con los valores de los campos
      const filtros: FiltrosInspeccion = {}
      
      if (areaFilter) filtros.area = areaFilter
      if (superintendenciaFilter) filtros.superintendencia = superintendenciaFilter
      if (mesFilter) filtros.mesActual = mesFilter
      if (documentCodeFilter) filtros.documentCode = documentCodeFilter
      
      // Realizar la consulta filtrada al backend
      const data = await obtenerSistemasEmergenciaReport(filtros)
      console.log(data)
      setInspecciones(data)
      setPage(0) // Resetear a la primera página cuando se filtran resultados
      setMostrarResultados(true) // Mostrar resultados después de buscar
    } catch (error) {
      console.error("Error al filtrar las inspecciones:", error)
      setError("No se pudieron cargar las inspecciones con los filtros seleccionados")
    } finally {
      setLoading(false)
    }
  }

  const limpiarFiltros = () => {
    setAreaFilter("")
    setSuperintendenciaFilter("")
    setMesFilter("")
    setDocumentCodeFilter("")
    setInspecciones([])
    setMostrarResultados(false) // Ocultar resultados al limpiar filtros
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleVerDetalle = (id: string) => {
    router.push(`/dashboard/inspecciones/${id}`)
  }

  const handleEditar = (inspeccion: InspeccionServiceExport) => {
    router.push(`/dashboard/inspecciones/editar/${inspeccion._id}`)
  }

  const handleDescargarPdf = async (id: string) => {
    try {
      await descargarPdfCliente(id)
    } catch (error) {
      console.error("Error al descargar el PDF:", error)
    }
  }

  const handleDescargarExcel = async (id: string) => {
    try {
      await descargarExcelInspeccionesEmergenciaCliente(id)
    } catch (error) {
      console.error("Error al descargar el Excel:", error)
    }
  }

  // Manejar la tecla Enter en el campo de código de documento
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      filtrarInspecciones()
    }
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 3 }}>
        Lista de Inspecciones
      </Typography>
      
      {/* PANEL DE FILTROS */}
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: '8px' }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filtros de búsqueda
        </Typography>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3}}>
            <FormControl fullWidth size="small">
              <InputLabel id="area-filter-label">Área</InputLabel>
              <Select
                labelId="area-filter-label"
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                label="Área"
                disabled={loadingAreas}
              >
                <MenuItem value="">Todas</MenuItem>
                {areas.map((area) => (
                  <MenuItem key={area} value={area}>
                    {area}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, md: 3}}>
            <FormControl fullWidth size="small">
              <InputLabel id="superintendencia-filter-label">Superintendencia</InputLabel>
              <Select
                labelId="superintendencia-filter-label"
                value={superintendenciaFilter}
                onChange={(e) => setSuperintendenciaFilter(e.target.value)}
                label="Superintendencia"
              >
                <MenuItem value="">Todas</MenuItem>
                {SUPERINTENDENCIAS.map((superintendencia) => (
                  <MenuItem key={superintendencia} value={superintendencia}>
                    {superintendencia}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, md: 3}}>
            <FormControl fullWidth size="small">
              <InputLabel id="mes-filter-label">Mes de inspección</InputLabel>
              <Select
                labelId="mes-filter-label"
                value={mesFilter}
                onChange={(e) => setMesFilter(e.target.value)}
                label="Mes de inspección"
              >
                <MenuItem value="">Todos</MenuItem>
                {MESES.map((mes) => (
                  <MenuItem key={mes} value={mes}>
                    {mes}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, md: 3}}>
            <TextField
              fullWidth
              label="Código de documento"
              variant="outlined"
              size="small"
              value={documentCodeFilter}
              onChange={(e) => setDocumentCodeFilter(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </Grid>
          
          <Grid size={{ xs: 12}} display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<ClearIcon />} 
              onClick={limpiarFiltros}
              sx={{ mr: 1 }}
            >
              Limpiar
            </Button>
            <Button 
              variant="contained" 
              startIcon={<SearchIcon />} 
              onClick={filtrarInspecciones}
              color="primary"
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
      
      {/* RESULTADOS DE BÚSQUEDA - Solo se muestra cuando mostrarResultados es true y no hay loading */}
      {mostrarResultados && !loading && (
        <Paper elevation={2} sx={{ borderRadius: '8px' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Resultados ({inspecciones.length})
            </Typography>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Área</TableCell>
                  <TableCell>Fecha de última modificación</TableCell>
                  <TableCell>Superintendencia</TableCell>
                  <TableCell>Tag</TableCell>
                  <TableCell>Responsable Edificio</TableCell>
                  <TableCell>Código Documento</TableCell>
                  <TableCell>Mes Actual</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inspecciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        No se encontraron inspecciones con los criterios de búsqueda
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  inspecciones
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((inspeccion, index) => (
                      <TableRow 
                        key={`${inspeccion._id}-${page * rowsPerPage + index}`}
                        sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                      >
                        <TableCell>{inspeccion.area}</TableCell>
                        <TableCell>{new Date(inspeccion.fechaUltimaModificacion).toLocaleDateString()}</TableCell>
                        <TableCell>{inspeccion.superintendencia}</TableCell>
                        <TableCell>{inspeccion.tag}</TableCell>
                        <TableCell>{inspeccion.responsableEdificio}</TableCell>
                        <TableCell>{inspeccion.documentCode}</TableCell>
                        <TableCell>{inspeccion.mesActual}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver detalle">
                            <IconButton
                              onClick={() => handleVerDetalle(inspeccion._id)}
                              color="primary"
                              size="small"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton 
                              onClick={() => handleEditar(inspeccion)} 
                              color="primary"
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Descargar PDF">
                            <IconButton
                              onClick={() => handleDescargarPdf(inspeccion.tag)}
                              color="secondary"
                              size="small"
                            >
                              <PdfIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Descargar Excel">
                            <IconButton
                              onClick={() => handleDescargarExcel(inspeccion._id)}
                              color="success"
                              size="small"
                            >
                              <ExcelIcon />
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
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={inspecciones.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página"
          />
        </Paper>
      )}
    </Container>
  )
}


