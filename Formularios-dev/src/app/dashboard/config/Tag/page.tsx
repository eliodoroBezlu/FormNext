'use client'

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
  FormControlLabel,
  Checkbox,
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
  Visibility as VisibilityIcon,
} from "@mui/icons-material"
import { activarTag, actualizarTag, crearTag, desactivarTag, eliminarTag, obtenerTagPorId, obtenerTags, TagBackend, TagForm } from "@/lib/actions/tag-actions"

// Simulación de las acciones del servidor (reemplazar con las reales)
// const obtenerTags = async () => {
//   // Simular datos
//   return [
//     { _id: "1", tag: "TAG001", area: "Producción", activo: true, createdAt: "2024-01-01T00:00:00Z" },
//     { _id: "2", tag: "TAG002", area: "Almacén", activo: false, createdAt: "2024-01-02T00:00:00Z" },
//     { _id: "3", tag: "TAG003", area: "Producción", activo: true, createdAt: "2024-01-03T00:00:00Z" },
//   ]
// }




const initialFormData: TagForm = {
  tag: "",
  area: "",
  activo: true,
}

export default function GestionTags() {
  const [tags, setTags] = useState<TagBackend[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // Estados para el modal
  const [openModal, setOpenModal] = useState(false)
  const [editingTag, setEditingTag] = useState<TagBackend | null>(null)
  const [formData, setFormData] = useState<TagForm>(initialFormData)
  
  // Estados para filtros
  const [areaFilter, setAreaFilter] = useState("")
  const [tagFilter, setTagFilter] = useState("")
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
    cargarTags()
  }, [])

  const cargarTags = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await obtenerTags()
      setTags(data)
    } catch (error) {
      console.error("Error al cargar tags:", error)
      setError("No se pudieron cargar los tags")
      mostrarNotificacion("Error al cargar los tags", "error")
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = async () => {
    setPage(0) // Reset página
  }

  const filtrarTags = () => {
    let filtrados = tags

    // Filtro por área
    if (areaFilter.trim()) {
      filtrados = filtrados.filter(tag => 
        tag.area.toLowerCase().includes(areaFilter.toLowerCase().trim())
      )
    }

    // Filtro por tag
    if (tagFilter.trim()) {
      filtrados = filtrados.filter(tag => 
        tag.tag.toLowerCase().includes(tagFilter.toLowerCase().trim())
      )
    }

    // Filtro por estado activo
    if (activoFilter) {
      const isActive = activoFilter === 'true'
      filtrados = filtrados.filter(tag => tag.activo === isActive)
    }

    return filtrados
  }

  const limpiarFiltros = async () => {
    setAreaFilter("")
    setTagFilter("")
    setActivoFilter("")
    setPage(0)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const abrirModal = async (tag?: TagBackend) => {
    if (tag) {
      try {
        const tagActualizado = await obtenerTagPorId(tag._id)
        setEditingTag(tagActualizado)
        setFormData({
          tag: tagActualizado.tag,
          area: tagActualizado.area,
          activo: tagActualizado.activo,
        })
      } catch (error) {
        console.error("Error al cargar tag:", error)
        // Si falla, usar los datos que ya tenemos
        setEditingTag(tag)
        setFormData({
          tag: tag.tag,
          area: tag.area,
          activo: tag.activo,
        })
      }
    } else {
      setEditingTag(null)
      setFormData(initialFormData)
    }
    setOpenModal(true)
  }

  const cerrarModal = () => {
    setOpenModal(false)
    setEditingTag(null)
    setFormData(initialFormData)
  }

  const guardarTag = async () => {
    try {
      setLoading(true)
      
      if (editingTag) {
        // Actualizar tag existente
        await actualizarTag(editingTag._id, formData)
        mostrarNotificacion("Tag actualizado correctamente", "success")
      } else {
        // Crear nuevo tag
        await crearTag(formData)
        mostrarNotificacion("Tag creado correctamente", "success")
      }
      
      cerrarModal()
      await cargarTags() // Recargar lista
    } catch (error) {
      console.error("Error al guardar tag:", error)
      mostrarNotificacion(
        error instanceof Error ? error.message : "Error al guardar el tag", 
        "error"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarTag = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este tag?")) return
    
    try {
      setLoading(true)
      
      await eliminarTag(id)
      mostrarNotificacion("Tag eliminado correctamente", "success")
      await cargarTags() // Recargar lista
    } catch (error) {
      console.error("Error al eliminar tag:", error)
      mostrarNotificacion(
        error instanceof Error ? error.message : "Error al eliminar el tag", 
        "error"
      )
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstadoActivo = async (tag: TagBackend) => {
    try {
      setLoading(true)
      
      if (tag.activo) {
        // Desactivar tag
        await desactivarTag(tag._id)
        mostrarNotificacion("Tag desactivado correctamente", "success")
      } else {
        // Activar tag
        await activarTag(tag._id)
        mostrarNotificacion("Tag activado correctamente", "success")
      }
      
      await cargarTags() // Recargar lista
    } catch (error) {
      console.error("Error al cambiar estado:", error)
      mostrarNotificacion(
        error instanceof Error ? error.message : "Error al cambiar el estado del tag", 
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

  const tagsMostrados = filtrarTags()

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 3 }}>
        Gestión de Tags
      </Typography>

      {/* PANEL DE FILTROS Y CONTROLES */}
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: '8px' }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filtros y Controles
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid sx={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Área"
              variant="outlined"
              size="small"
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </Grid>
          
          <Grid sx={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Tag"
              variant="outlined"
              size="small"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </Grid>
          
          <Grid sx={{ xs: 12, md: 4 }}>
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
            Nuevo Tag
          </Button>
        </Box>
      </Paper>

      {/* TABLA DE TAGS */}
      <Paper elevation={2} sx={{ borderRadius: '8px' }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #e0e0e0', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="h6">
            Tags ({tagsMostrados.length})
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
                    <TableCell>Tag</TableCell>
                    <TableCell>Área</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="center">Fecha Creación</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tagsMostrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          No se encontraron tags con los filtros aplicados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tagsMostrados
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((tag, index) => (
                        <TableRow 
                          key={`${tag._id}-${page * rowsPerPage + index}`}
                          sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {tag.tag}
                            </Typography>
                          </TableCell>
                          <TableCell>{tag.area}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={tag.activo ? "Activo" : "Inactivo"} 
                              color={tag.activo ? "success" : "error"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {tag.createdAt ? new Date(tag.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver detalle">
                              <IconButton 
                                color="info"
                                size="small"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Editar">
                              <IconButton 
                                onClick={() => abrirModal(tag)} 
                                color="primary"
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title={tag.activo ? "Desactivar" : "Activar"}>
                              <IconButton
                                onClick={() => cambiarEstadoActivo(tag)}
                                color={tag.activo ? "error" : "success"}
                                size="small"
                              >
                                {tag.activo ? <PowerOffIcon /> : <PowerIcon />}
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Eliminar">
                              <IconButton
                                onClick={() => handleEliminarTag(tag._id)}
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
              count={tagsMostrados.length}
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

      {/* MODAL PARA CREAR/EDITAR TAG */}
      <Dialog open={openModal} onClose={cerrarModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTag ? 'Editar Tag' : 'Nuevo Tag'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid sx={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Tag *"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
                required
                error={!formData.tag}
                helperText={!formData.tag ? "Campo requerido. Solo letras mayúsculas y números" : "Solo letras mayúsculas y números"}
                inputProps={{ 
                  style: { textTransform: 'uppercase' },
                  pattern: '[A-Z0-9]*'
                }}
              />
            </Grid>
            
            <Grid sx={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Área *"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required
                error={!formData.area}
                helperText={!formData.area ? "Campo requerido" : ""}
              />
            </Grid>
            
            <Grid sx={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    color="primary"
                  />
                }
                label="Activo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={cerrarModal} variant="outlined">
            Cancelar
          </Button>
          <Button 
            onClick={guardarTag} 
            variant="contained"
            disabled={loading || !formData.tag || !formData.area}
          >
            {loading ? "Guardando..." : (editingTag ? "Actualizar" : "Crear")}
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