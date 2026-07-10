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
  TablePagination,
  TextField,
  Grid,
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
  Clear as ClearIcon,
} from "@mui/icons-material"
import {
  obtenerClasificaciones,
  crearClasificacion,
  actualizarClasificacion,
  eliminarClasificacion,
  ClasificacionBackend,
  ClasificacionForm
} from "@/lib/actions/clasificacion-actions"

const initialFormData: ClasificacionForm = {
  nombre: "",
  activo: true,
}

export default function GestionClasificaciones() {
  const [items, setItems] = useState<ClasificacionBackend[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // Modal states
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ClasificacionBackend | null>(null)
  const [formData, setFormData] = useState<ClasificacionForm>(initialFormData)
  
  // Filter states
  const [searchFilter, setSearchFilter] = useState("")

  // Notification state
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
    setLoading(true)
    setError(null)
    try {
      const data = await obtenerClasificaciones()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar clasificaciones")
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message: string, severity: "success" | "error" | "warning" | "info") => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  const handleOpenAddModal = () => {
    setEditingItem(null)
    setFormData(initialFormData)
    setOpenModal(true)
  }

  const handleOpenEditModal = (item: ClasificacionBackend) => {
    setEditingItem(item)
    setFormData({
      nombre: item.nombre,
      activo: item.activo,
    })
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setFormData(initialFormData)
    setEditingItem(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nombre.trim()) {
      showNotification("El nombre de la clasificación es requerido", "warning")
      return
    }

    try {
      if (editingItem) {
        await actualizarClasificacion(editingItem._id, formData)
        showNotification("Clasificación actualizada con éxito", "success")
      } else {
        await crearClasificacion(formData)
        showNotification("Clasificación creada con éxito", "success")
      }
      handleCloseModal()
      cargarDatos()
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Error al guardar clasificación", "error")
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta clasificación?")) {
      try {
        await eliminarClasificacion(id)
        showNotification("Clasificación eliminada con éxito", "success")
        cargarDatos()
      } catch (err) {
        showNotification(err instanceof Error ? err.message : "Error al eliminar clasificación", "error")
      }
    }
  }

  // Filter items
  const filteredItems = items.filter((item) => {
    return item.nombre.toLowerCase().includes(searchFilter.toLowerCase())
  })

  // Pagination Handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Gestión de Clasificaciones de Herramientas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal}
        >
          Agregar Clasificación
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 8, md: 6 }}>
            <TextField
              fullWidth
              label="Buscar por nombre..."
              variant="outlined"
              size="small"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              InputProps={{
                endAdornment: searchFilter && (
                  <IconButton onClick={() => setSearchFilter("")} size="small">
                    <ClearIcon />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 6 }} display="flex" justifyContent="flex-end">
            <Button variant="outlined" onClick={cargarDatos} disabled={loading}>
              Refrescar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={5}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre de Clasificación</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No se encontraron clasificaciones
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell sx={{ fontWeight: "medium" }}>{item.nombre}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={item.activo ? "Activo" : "Inactivo"}
                            color={item.activo ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEditModal(item)}
                            title="Editar"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(item._id)}
                            title="Eliminar"
                            size="small"
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredItems.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página"
            />
          </>
        )}
      </TableContainer>

      {/* Modal Agregar/Editar */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingItem ? "Editar Clasificación" : "Agregar Nueva Clasificación"}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Nombre de Clasificación"
                  variant="outlined"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Clasificación Activa"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Notificación Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}
