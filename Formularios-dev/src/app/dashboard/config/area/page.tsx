"use client"

import React, { useEffect, useState } from "react"
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
} from "@mui/material"
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  PowerOff as PowerOffIcon,
  Power as PowerIcon,
} from "@mui/icons-material"
import {
  crearArea,
  obtenerAreasCompletas, // ✅ CAMBIO: Usar obtenerAreasCompletas en lugar de obtenerAreas
  obtenerAreaPorId,
  actualizarArea,
  desactivarArea,
  activarArea,
  eliminarArea,
  type AreaBackend,
  type CreateAreaDto,
} from "@/lib/actions/area-actions"
import { obtenerSuperintendencias, SuperintendenciaBackend } from "@/lib/actions/superintendecia-actions"

interface AreaForm {
  nombre: string
  superintendencia: string
  activo: boolean
}

const initialFormData: AreaForm = {
  nombre: "",
  superintendencia: "",
  activo: true,
}

export default function GestionAreas() {
  const [areas, setAreas] = useState<AreaBackend[]>([])
  const [superintendencias, setSuperintendencias] = useState<SuperintendenciaBackend[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // Estados para el modal
  const [openModal, setOpenModal] = useState(false)
  const [editingArea, setEditingArea] = useState<AreaBackend | null>(null)
  const [formData, setFormData] = useState<AreaForm>(initialFormData)
  
  // Estados para filtros
  const [nombreFilter, setNombreFilter] = useState("")
  const [superintendenciaFilter, setSuperintendenciaFilter] = useState("")
  const [activoFilter, setActivoFilter] = useState("")
  
  // Estado para notificaciones
  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: "success" | "error" | "warning" | "info"
  }>({
    open: false,
    message: "",
    severity: "info",
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [areasData, superintendenciasData] = await Promise.all([
        obtenerAreasCompletas(), // ✅ CAMBIO: Usar obtenerAreasCompletas
        obtenerSuperintendencias(),
      ])
      
      setAreas(areasData)
      setSuperintendencias(superintendenciasData)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      setError("No se pudieron cargar los datos")
      mostrarNotificacion("Error al cargar los datos", "error")
    } finally {
      setLoading(false)
    }
  }

  const filtrarAreas = () => {
    let filtrados = areas

    // Filtro por nombre
    if (nombreFilter.trim()) {
      filtrados = filtrados.filter(area => 
        area.nombre.toLowerCase().includes(nombreFilter.toLowerCase().trim())
      )
    }

    // Filtro por superintendencia
    if (superintendenciaFilter.trim()) {
      filtrados = filtrados.filter(area => 
        area.superintendencia.nombre.toLowerCase().includes(superintendenciaFilter.toLowerCase().trim())
      )
    }

    // Filtro por estado activo
    if (activoFilter) {
      const isActive = activoFilter === 'true'
      filtrados = filtrados.filter(area => area.activo === isActive)
    }

    return filtrados
  }

  const limpiarFiltros = () => {
    setNombreFilter("")
    setSuperintendenciaFilter("")
    setActivoFilter("")
    setPage(0)
  }

  const aplicarFiltros = () => {
    setPage(0)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const abrirModal = async (area?: AreaBackend) => {
    if (area) {
      try {
        const areaActualizada = await obtenerAreaPorId(area._id)
        setEditingArea(areaActualizada)
        setFormData({
          nombre: areaActualizada.nombre,
          superintendencia: areaActualizada.superintendencia._id,
          activo: areaActualizada.activo,
        })
      } catch (error) {
        console.error("Error al cargar área:", error)
        setEditingArea(area)
        setFormData({
          nombre: area.nombre,
          superintendencia: area.superintendencia._id,
          activo: area.activo,
        })
      }
    } else {
      setEditingArea(null)
      setFormData(initialFormData)
    }
    setOpenModal(true)
  }

  const cerrarModal = () => {
    setOpenModal(false)
    setEditingArea(null)
    setFormData(initialFormData)
  }

  const guardarArea = async () => {
    try {
      setLoading(true)
      
      if (editingArea) {
        await actualizarArea(editingArea._id, formData)
        mostrarNotificacion("Área actualizada correctamente", "success")
      } else {
        await crearArea(formData as CreateAreaDto)
        mostrarNotificacion("Área creada correctamente", "success")
      }
      
      cerrarModal()
      await cargarDatos()
    } catch (error) {
      console.error("Error al guardar área:", error)
      mostrarNotificacion(
        error instanceof Error ? error.message : "Error al guardar el área", 
        "error"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarArea = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta área? Esta acción no se puede deshacer.")) return
    
    try {
      setLoading(true)
      
      await eliminarArea(id)
      mostrarNotificacion("Área eliminada correctamente", "success")
      await cargarDatos()
    } catch (error) {
      console.error("Error al eliminar área:", error)
      mostrarNotificacion(
        error instanceof Error ? error.message : "Error al eliminar el área", 
        "error"
      )
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstadoActivo = async (area: AreaBackend) => {
    try {
      setLoading(true)
      
      if (area.activo) {
        const resultado = await desactivarArea(area._id)
        if (resultado.exito) {
          mostrarNotificacion("Área desactivada correctamente", "success")
        } else {
          mostrarNotificacion(resultado.mensaje, "error")
          return
        }
      } else {
        await activarArea(area._id)
        mostrarNotificacion("Área activada correctamente", "success")
      }
      
      await cargarDatos()
    } catch (error) {
      console.error("Error al cambiar estado:", error)
      mostrarNotificacion(
        error instanceof Error ? error.message : "Error al cambiar el estado del área", 
        "error"
      )
    } finally {
      setLoading(false)
    }
  }

  const mostrarNotificacion = (message: string, severity: "success" | "error" | "warning" | "info") => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  const cerrarNotificacion = () => {
    setNotification(prev => ({ ...prev, open: false }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      aplicarFiltros()
    }
  }

  const areasMostradas = filtrarAreas()

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 3 }}>
        Gestión de Áreas
      </Typography>

      {/* PANEL DE FILTROS Y CONTROLES */}
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: '8px' }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filtros y Controles
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Nombre del Área"
              variant="outlined"
              size="small"
              value={nombreFilter}
              onChange={(e) => setNombreFilter(e.target.value)}
              onKeyPress={handleKeyPress}
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
              onKeyPress={handleKeyPress}
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
            startIcon={<AddIcon />} 
            onClick={() => abrirModal()}
            color="primary"
          >
            Nueva Área
          </Button>
        </Box>
      </Paper>

      {/* TABLA DE ÁREAS */}
      <Paper elevation={2} sx={{ borderRadius: '8px' }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #e0e0e0', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="h6">
            Áreas ({areasMostradas.length})
          </Typography>
        </Box>
        
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        
        {!loading && !error && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Nombre del Área</TableCell>
                    <TableCell>Superintendencia</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="center">Fecha Creación</TableCell>
                    <TableCell align="center">Creado Por</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {areasMostradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          No se encontraron áreas con los filtros aplicados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    areasMostradas
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((area) => (
                        <TableRow 
                          key={area._id}
                          sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {area.nombre}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {area.superintendencia?.nombre || 'N/A'}
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={area.activo ? "Activo" : "Inactivo"} 
                              color={area.activo ? "success" : "error"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {area.createdAt ? new Date(area.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell align="center">
                            {area.creadoPor || 'N/A'}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Editar">
                              <IconButton 
                                onClick={() => abrirModal(area)} 
                                color="primary"
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title={area.activo ? "Desactivar" : "Activar"}>
                              <IconButton
                                onClick={() => cambiarEstadoActivo(area)}
                                color={area.activo ? "error" : "success"}
                                size="small"
                              >
                                {area.activo ? <PowerOffIcon /> : <PowerIcon />}
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Eliminar">
                              <IconButton
                                onClick={() => handleEliminarArea(area._id)}
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
              count={areasMostradas.length}
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

      {/* MODAL PARA CREAR/EDITAR ÁREA */}
      <Dialog open={openModal} onClose={cerrarModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingArea ? 'Editar Área' : 'Nueva Área'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nombre del Área *"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                error={!formData.nombre}
                helperText={!formData.nombre ? "Campo requerido" : ""}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required error={!formData.superintendencia}>
                <InputLabel>Superintendencia *</InputLabel>
                <Select
                  value={formData.superintendencia}
                  onChange={(e) => setFormData({ ...formData, superintendencia: e.target.value })}
                  label="Superintendencia *"
                >
                  {superintendencias.map((sup) => (
                    <MenuItem key={sup._id} value={sup._id}>
                      {sup.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {!formData.superintendencia && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    Campo requerido
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={cerrarModal} variant="outlined">
            Cancelar
          </Button>
          <Button 
            onClick={guardarArea} 
            variant="contained"
            disabled={loading || !formData.nombre || !formData.superintendencia}
          >
            {loading ? "Guardando..." : (editingArea ? "Actualizar" : "Crear")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* NOTIFICACIONES */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={cerrarNotificacion}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={cerrarNotificacion} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}