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
import { activarSuperintendencia, actualizarSuperintendencia, crearSuperintendencia, CreateSuperintendenciaDto, desactivarSuperintendencia, eliminarSuperintendencia, obtenerSuperintendenciaPorId, obtenerSuperintendencias, SuperintendenciaBackend } from "@/lib/actions/superintendecia-actions"

interface SuperintendenciaForm {
  nombre: string
  activo: boolean
}

const initialFormData: SuperintendenciaForm = {
  nombre: "",
  activo: true,
}

export default function GestionSuperintendencias() {
  const [superintendencias, setSuperintendencias] = useState<SuperintendenciaBackend[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // Estados para el modal
  const [openModal, setOpenModal] = useState(false)
  const [editingSuperintendencia, setEditingSuperintendencia] = useState<SuperintendenciaBackend | null>(null)
  const [formData, setFormData] = useState<SuperintendenciaForm>(initialFormData)
  
  // Estados para filtros
  const [nombreFilter, setNombreFilter] = useState("")
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
    cargarSuperintendencias()
  }, [])

  const cargarSuperintendencias = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await obtenerSuperintendencias()
      setSuperintendencias(data)
    } catch (error) {
      console.error("Error al cargar superintendencias:", error)
      setError("No se pudieron cargar las superintendencias")
      mostrarNotificacion("Error al cargar las superintendencias", "error")
    } finally {
      setLoading(false)
    }
  }

  const filtrarSuperintendencias = () => {
    let filtrados = superintendencias

    // Filtro por nombre
    if (nombreFilter.trim()) {
      filtrados = filtrados.filter(sup => 
        sup.nombre.toLowerCase().includes(nombreFilter.toLowerCase().trim())
      )
    }

    // Filtro por estado activo
    if (activoFilter) {
      const isActive = activoFilter === 'true'
      filtrados = filtrados.filter(sup => sup.activo === isActive)
    }

    return filtrados
  }

  const limpiarFiltros = () => {
    setNombreFilter("")
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

  const abrirModal = async (superintendencia?: SuperintendenciaBackend) => {
    if (superintendencia) {
      try {
        const superintendenciaActualizada = await obtenerSuperintendenciaPorId(superintendencia._id)
        setEditingSuperintendencia(superintendenciaActualizada)
        setFormData({
          nombre: superintendenciaActualizada.nombre,
          activo: superintendenciaActualizada.activo,
        })
      } catch (error) {
        console.error("Error al cargar superintendencia:", error)
        setEditingSuperintendencia(superintendencia)
        setFormData({
          nombre: superintendencia.nombre,
          activo: superintendencia.activo,
        })
      }
    } else {
      setEditingSuperintendencia(null)
      setFormData(initialFormData)
    }
    setOpenModal(true)
  }

  const cerrarModal = () => {
    setOpenModal(false)
    setEditingSuperintendencia(null)
    setFormData(initialFormData)
  }

  const guardarSuperintendencia = async () => {
    try {
      setLoading(true)
      
      if (editingSuperintendencia) {
        await actualizarSuperintendencia(editingSuperintendencia._id, formData)
        mostrarNotificacion("Superintendencia actualizada correctamente", "success")
      } else {
        await crearSuperintendencia(formData as CreateSuperintendenciaDto)
        mostrarNotificacion("Superintendencia creada correctamente", "success")
      }
      
      cerrarModal()
      await cargarSuperintendencias()
    } catch (error) {
      console.error("Error al guardar superintendencia:", error)
      mostrarNotificacion(
        error instanceof Error ? error.message : "Error al guardar la superintendencia", 
        "error"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarSuperintendencia = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta superintendencia? Esta acción no se puede deshacer y eliminará también todas las áreas asociadas.")) return
    
    try {
      setLoading(true)
      
      await eliminarSuperintendencia(id)
      mostrarNotificacion("Superintendencia eliminada correctamente", "success")
      await cargarSuperintendencias()
    } catch (error) {
      console.error("Error al eliminar superintendencia:", error)
      mostrarNotificacion(
        error instanceof Error ? error.message : "Error al eliminar la superintendencia", 
        "error"
      )
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstadoActivo = async (superintendencia: SuperintendenciaBackend) => {
    try {
      setLoading(true)
      
      if (superintendencia.activo) {
        const resultado = await desactivarSuperintendencia(superintendencia._id)
        if (resultado.exito) {
          mostrarNotificacion("Superintendencia desactivada correctamente", "success")
        } else {
          mostrarNotificacion(resultado.mensaje, "error")
          return
        }
      } else {
        await activarSuperintendencia(superintendencia._id)
        mostrarNotificacion("Superintendencia activada correctamente", "success")
      }
      
      await cargarSuperintendencias()
    } catch (error) {
      console.error("Error al cambiar estado:", error)
      mostrarNotificacion(
        error instanceof Error ? error.message : "Error al cambiar el estado de la superintendencia", 
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

  const superintendenciasMostradas = filtrarSuperintendencias()

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 3 }}>
        Gestión de Superintendencias
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
              label="Nombre de la Superintendencia"
              variant="outlined"
              size="small"
              value={nombreFilter}
              onChange={(e) => setNombreFilter(e.target.value)}
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
            Nueva Superintendencia
          </Button>
        </Box>
      </Paper>

      {/* TABLA DE SUPERINTENDENCIAS */}
      <Paper elevation={2} sx={{ borderRadius: '8px' }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #e0e0e0', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="h6">
            Superintendencias ({superintendenciasMostradas.length})
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
                    <TableCell>Nombre</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="center">Fecha Creación</TableCell>
                    <TableCell align="center">Última Actualización</TableCell>
                    <TableCell align="center">Creado Por</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {superintendenciasMostradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          No se encontraron superintendencias con los filtros aplicados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    superintendenciasMostradas
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((superintendencia) => (
                        <TableRow 
                          key={superintendencia._id}
                          sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {superintendencia.nombre}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={superintendencia.activo ? "Activo" : "Inactivo"} 
                              color={superintendencia.activo ? "success" : "error"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {superintendencia.createdAt ? new Date(superintendencia.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell align="center">
                            {superintendencia.updatedAt ? new Date(superintendencia.updatedAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell align="center">
                            {superintendencia.creadoPor || 'N/A'}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Editar">
                              <IconButton 
                                onClick={() => abrirModal(superintendencia)} 
                                color="primary"
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title={superintendencia.activo ? "Desactivar" : "Activar"}>
                              <IconButton
                                onClick={() => cambiarEstadoActivo(superintendencia)}
                                color={superintendencia.activo ? "error" : "success"}
                                size="small"
                              >
                                {superintendencia.activo ? <PowerOffIcon /> : <PowerIcon />}
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Eliminar">
                              <IconButton
                                onClick={() => handleEliminarSuperintendencia(superintendencia._id)}
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
              count={superintendenciasMostradas.length}
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

      {/* MODAL PARA CREAR/EDITAR SUPERINTENDENCIA */}
      <Dialog open={openModal} onClose={cerrarModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSuperintendencia ? 'Editar Superintendencia' : 'Nueva Superintendencia'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre de la Superintendencia *"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                error={!formData.nombre}
                helperText={!formData.nombre ? "Campo requerido" : ""}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={cerrarModal} variant="outlined">
            Cancelar
          </Button>
          <Button 
            onClick={guardarSuperintendencia} 
            variant="contained"
            disabled={loading || !formData.nombre}
          >
            {loading ? "Guardando..." : (editingSuperintendencia ? "Actualizar" : "Crear")}
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