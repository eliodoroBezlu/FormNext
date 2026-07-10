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
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material"
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from "@mui/icons-material"
import {
  obtenerConfigFormularios,
  crearConfigFormulario,
  actualizarConfigFormulario,
  eliminarConfigFormulario,
  ConfigFormularioBackend,
  CampoFormulario
} from "@/lib/actions/config-formulario-actions"

const campoTipos = [
  { value: "text", label: "Texto Plano" },
  { value: "number", label: "Número" },
  { value: "select", label: "Selección Única (Select)" },
  { value: "boolean", label: "Booleano (Sí/No)" },
]

export default function ConfigFormularios() {
  const [configs, setConfigs] = useState<ConfigFormularioBackend[]>([])
  const [selectedConfig, setSelectedConfig] = useState<ConfigFormularioBackend | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal states for New Form Config
  const [openNewFormModal, setOpenNewFormModal] = useState(false)
  const [newFormTipo, setNewFormTipo] = useState("")

  // Modal states for Fields
  const [openFieldModal, setOpenFieldModal] = useState(false)
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null)
  const [fieldData, setFieldData] = useState<CampoFormulario>({
    name: "",
    label: "",
    type: "text",
    required: false,
    options: [],
  })
  const [optionsText, setOptionsText] = useState("") // comma-separated options

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
      const data = await obtenerConfigFormularios()
      setConfigs(data)
      if (data.length > 0) {
        // Preservar la selección si es posible
        if (selectedConfig) {
          const updated = data.find(c => c.tipo_equipo === selectedConfig.tipo_equipo)
          setSelectedConfig(updated || data[0])
        } else {
          setSelectedConfig(data[0])
        }
      } else {
        setSelectedConfig(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar configuraciones")
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

  // --- CRUD Config ---
  const handleCreateConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFormTipo.trim()) return

    try {
      const newConfig: ConfigFormularioBackend = {
        tipo_equipo: newFormTipo.trim(),
        campos: [],
      }
      await crearConfigFormulario(newConfig)
      showNotification("Configuración de formulario creada", "success")
      setOpenNewFormModal(false)
      setNewFormTipo("")
      await cargarDatos()
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Error al crear configuración", "error")
    }
  }

  const handleDeleteConfig = async (tipo: string) => {
    if (window.confirm(`¿Está seguro de que desea eliminar toda la configuración del formulario para '${tipo}'?`)) {
      try {
        await eliminarConfigFormulario(tipo)
        showNotification("Configuración eliminada", "success")
        if (selectedConfig?.tipo_equipo === tipo) {
          setSelectedConfig(null)
        }
        await cargarDatos()
      } catch (err) {
        showNotification(err instanceof Error ? err.message : "Error al eliminar configuración", "error")
      }
    }
  }

  // --- CRUD Fields ---
  const handleOpenAddField = () => {
    setEditingFieldIndex(null)
    setFieldData({
      name: "",
      label: "",
      type: "text",
      required: false,
      options: [],
    })
    setOptionsText("")
    setOpenFieldModal(true)
  }

  const handleOpenEditField = (index: number, field: CampoFormulario) => {
    setEditingFieldIndex(index)
    setFieldData({ ...field })
    setOptionsText(field.options ? field.options.join(", ") : "")
    setOpenFieldModal(true)
  }

  const handleFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fieldData.name.trim() || !fieldData.label.trim()) {
      showNotification("Nombre e Identificador del campo son requeridos", "warning")
      return
    }

    if (!selectedConfig) return

    // Transform comma-separated options to string array
    let processedOptions: string[] = []
    if (fieldData.type === "select" && optionsText.trim()) {
      processedOptions = optionsText
        .split(",")
        .map(opt => opt.trim())
        .filter(opt => opt !== "")
    }

    const finalField: CampoFormulario = {
      ...fieldData,
      name: fieldData.name.trim().replace(/\s+/g, "_").toLowerCase(), // Format name slug
      options: processedOptions,
    }

    const updatedCampos = [...selectedConfig.campos]
    if (editingFieldIndex !== null) {
      updatedCampos[editingFieldIndex] = finalField
    } else {
      // Evitar duplicación de identificador
      if (updatedCampos.some(f => f.name === finalField.name)) {
        showNotification(`El identificador '${finalField.name}' ya está en uso`, "error")
        return
      }
      updatedCampos.push(finalField)
    }

    setSelectedConfig({
      ...selectedConfig,
      campos: updatedCampos,
    })
    setOpenFieldModal(false)
  }

  const handleDeleteField = (index: number) => {
    if (!selectedConfig) return
    const updatedCampos = selectedConfig.campos.filter((_, idx) => idx !== index)
    setSelectedConfig({
      ...selectedConfig,
      campos: updatedCampos,
    })
  }

  // --- Guardar cambios en Backend ---
  const handleSaveConfigChanges = async () => {
    if (!selectedConfig) return
    setLoading(true)
    try {
      await actualizarConfigFormulario(selectedConfig.tipo_equipo, selectedConfig)
      showNotification("Configuración de formulario guardada con éxito", "success")
      await cargarDatos()
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Error al guardar cambios", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Configurador de Formularios Dinámicos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenNewFormModal(true)}
        >
          Nuevo Formulario
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Panel Izquierdo: Lista de Formularios */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Tipos de Equipos
            </Typography>
            {loading && configs.length === 0 ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress size={24} />
              </Box>
            ) : configs.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No hay formularios creados.
              </Typography>
            ) : (
              <Box display="flex" flexDirection="column" gap={1} mt={2}>
                {configs.map((config) => (
                  <Box
                    key={config.tipo_equipo}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    p={1.5}
                    sx={{
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: selectedConfig?.tipo_equipo === config.tipo_equipo ? "primary.main" : "divider",
                      backgroundColor: selectedConfig?.tipo_equipo === config.tipo_equipo ? "primary.50" : "transparent",
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                    onClick={() => setSelectedConfig(config)}
                  >
                    <Typography variant="body1" fontWeight={selectedConfig?.tipo_equipo === config.tipo_equipo ? "bold" : "regular"}>
                      {config.tipo_equipo}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteConfig(config.tipo_equipo)
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Panel Derecho: Campos del Formulario Seleccionado */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            {selectedConfig ? (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} borderBottom={1} borderColor="divider" pb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Campos para: {selectedConfig.tipo_equipo}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Define los campos de especificación adicionales que tendrá esta herramienta.
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenAddField}>
                      Agregar Campo
                    </Button>
                    <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSaveConfigChanges} disabled={loading}>
                      Guardar Cambios
                    </Button>
                  </Box>
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Identificador</TableCell>
                        <TableCell>Etiqueta (UI)</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell align="center">Requerido</TableCell>
                        <TableCell>Opciones (Select)</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedConfig.campos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                            No hay campos definidos para este formulario. Haz clic en &quot;Agregar Campo&quot;.
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedConfig.campos.map((campo, index) => (
                          <TableRow key={campo.name}>
                            <TableCell><Chip label={campo.name} size="small" variant="outlined" /></TableCell>
                            <TableCell sx={{ fontWeight: 'medium' }}>{campo.label}</TableCell>
                            <TableCell>{campoTipos.find(t => t.value === campo.type)?.label || campo.type}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={campo.required ? "Sí" : "No"}
                                color={campo.required ? "error" : "default"}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {campo.type === "select" && campo.options && campo.options.length > 0 ? (
                                <Box display="flex" gap={0.5} flexWrap="wrap">
                                  {campo.options.map(opt => (
                                    <Chip key={opt} label={opt} size="small" />
                                  ))}
                                </Box>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton color="primary" size="small" onClick={() => handleOpenEditField(index, campo)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton color="error" size="small" onClick={() => handleDeleteField(index)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <Typography color="textSecondary">
                  Selecciona un tipo de equipo del panel izquierdo para configurar sus especificaciones.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Modal Crear Nueva Configuración */}
      <Dialog open={openNewFormModal} onClose={() => setOpenNewFormModal(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleCreateConfig}>
          <DialogTitle>Nuevo Formulario de Equipo</DialogTitle>
          <DialogContent dividers>
            <TextField
              fullWidth
              label="Tipo de Herramienta / Equipo"
              variant="outlined"
              placeholder="Ej: Esmeril, Cilindro"
              value={newFormTipo}
              onChange={(e) => setNewFormTipo(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenNewFormModal(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">Crear</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal Agregar/Editar Campo */}
      <Dialog open={openFieldModal} onClose={() => setOpenFieldModal(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleFieldSubmit}>
          <DialogTitle>
            {editingFieldIndex !== null ? "Editar Campo de Especificación" : "Agregar Campo de Especificación"}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Identificador (ID para DB)"
                  variant="outlined"
                  placeholder="Ej: carga_maxima"
                  value={fieldData.name}
                  onChange={(e) => setFieldData({ ...fieldData, name: e.target.value })}
                  disabled={editingFieldIndex !== null}
                  helperText="Solo letras, números y guión bajo (_). Sin espacios."
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Etiqueta del Campo (UI)"
                  variant="outlined"
                  placeholder="Ej: Carga Máxima"
                  value={fieldData.label}
                  onChange={(e) => setFieldData({ ...fieldData, label: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Campo</InputLabel>
                  <Select
                    value={fieldData.type}
                    label="Tipo de Campo"
                    onChange={(e) => setFieldData({ ...fieldData, type: e.target.value })}
                  >
                    {campoTipos.map(t => (
                      <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} display="flex" alignItems="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={fieldData.required}
                      onChange={(e) => setFieldData({ ...fieldData, required: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Este campo es obligatorio"
                />
              </Grid>

              {fieldData.type === "select" && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Opciones de Selección (Separadas por comas)"
                    variant="outlined"
                    placeholder="Ej: Tipo A, Tipo B, Tipo C"
                    value={optionsText}
                    onChange={(e) => setOptionsText(e.target.value)}
                    helperText="Ingresa los valores permitidos para el menú desplegable."
                    required
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenFieldModal(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">Agregar</Button>
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
