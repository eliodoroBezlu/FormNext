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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Divider,
} from "@mui/material"
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  UploadFile as UploadFileIcon,
  Info as InfoIcon,
} from "@mui/icons-material"

import {
  obtenerEquipos,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo,
  migrarExcel,
  EquipoBackend,
  EquipoForm
} from "@/lib/actions/equipo-actions"
import { obtenerAreasCompletas, AreaBackend } from "@/lib/actions/area-actions"
import { obtenerUbicaciones, UbicacionBackend } from "@/lib/actions/ubicacion-actions"
import { obtenerClasificaciones, ClasificacionBackend } from "@/lib/actions/clasificacion-actions"
import { obtenerSuperintendencias, SuperintendenciaBackend } from "@/lib/actions/superintendecia-actions"
import { obtenerGerencias, GerenciaBackend } from "@/lib/actions/gerencia-actions"
import { obtenerConfigFormularios, ConfigFormularioBackend } from "@/lib/actions/config-formulario-actions"

const initialFormData: EquipoForm = {
  codigo: "",
  codigo_antiguo: "",
  codigo_parte: "",
  descripcion: "",
  marca: "",
  modelo: "",
  cantidad: 1,
  costo: 0,
  num_serie: "",
  frecuencia_uso: "",
  estado: "Operativo",
  observaciones: "",
  tipo_equipo: "",
  rfid: "",
  placa: "",
  ambito: "area",
  area_id: "",
  superintendencia_id: "",
  gerencia_id: "",
  subarea: "",
  responsable: "",
  ubicacion_id: "",
  clasificacion_id: "",
  especificaciones: {},
}

export default function GestionEquipos() {
  const [equipos, setEquipos] = useState<EquipoBackend[]>([])
  const [loading, setLoading] = useState(false)
  const [migrationLoading, setMigrationLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Catálogos
  const [areas, setAreas] = useState<AreaBackend[]>([])
  const [ubicaciones, setUbicaciones] = useState<UbicacionBackend[]>([])
  const [clasificaciones, setClasificaciones] = useState<ClasificacionBackend[]>([])
  // Catálogos de los ámbitos superiores: un equipo puede pertenecer a una
  // superintendencia o a la gerencia, no solo a un área.
  const [superintendencias, setSuperintendencias] = useState<SuperintendenciaBackend[]>([])
  const [gerencias, setGerencias] = useState<GerenciaBackend[]>([])
  const [configs, setConfigs] = useState<ConfigFormularioBackend[]>([])

  // Paginación
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Filtros
  const [searchFilter, setSearchFilter] = useState("")
  const [areaFilter, setAreaFilter] = useState("")
  const [ubicacionFilter, setUbicacionFilter] = useState("")
  const [tipoFilter, setTipoFilter] = useState("")

  // Modales
  const [openModal, setOpenModal] = useState(false)
  const [editingEquipo, setEditingEquipo] = useState<EquipoBackend | null>(null)
  const [formData, setFormData] = useState<EquipoForm>(initialFormData)

  // Modal para ver Especificaciones
  const [selectedSpecsEquipo, setSelectedSpecsEquipo] = useState<EquipoBackend | null>(null)

  // Configuración dinámica activa para el formulario
  const [activeConfig, setActiveConfig] = useState<ConfigFormularioBackend | null>(null)

  // Notificaciones
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
    cargarCatalogos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await obtenerEquipos()
      setEquipos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar equipos")
    } finally {
      setLoading(false)
    }
  }

  const cargarCatalogos = async () => {
    try {
      const [areasData, ubiData, classData, configData, supData, gerData] =
        await Promise.all([
          obtenerAreasCompletas(),
          obtenerUbicaciones(),
          obtenerClasificaciones(),
          obtenerConfigFormularios(),
          obtenerSuperintendencias(),
          obtenerGerencias(),
        ])
      setAreas(areasData)
      setUbicaciones(ubiData)
      setClasificaciones(classData)
      setConfigs(configData)
      setSuperintendencias(Array.isArray(supData) ? supData : [])
      setGerencias(gerData)
    } catch (err) {
      console.error("Error al cargar catálogos:", err)
    }
  }

  const showNotification = (message: string, severity: "success" | "error" | "warning" | "info") => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  // --- Manejo del cambio de Tipo de Equipo en el formulario ---
  const handleTipoEquipoChange = (tipo: string) => {
    setFormData((prev) => ({ ...prev, tipo_equipo: tipo, especificaciones: {} }))
    const matchedConfig = configs.find((c) => c.tipo_equipo === tipo)
    setActiveConfig(matchedConfig || null)
  }

  // --- Handlers de Modales ---
  const handleOpenAddModal = () => {
    setEditingEquipo(null)
    setFormData(initialFormData)
    setActiveConfig(null)
    setOpenModal(true)
  }

  const handleOpenEditModal = (equipo: EquipoBackend) => {
    setEditingEquipo(equipo)
    const matchedConfig = configs.find((c) => c.tipo_equipo === equipo.tipo_equipo)
    setActiveConfig(matchedConfig || null)

    setFormData({
      codigo: equipo.codigo,
      codigo_antiguo: equipo.codigo_antiguo || "",
      codigo_parte: equipo.codigo_parte || "",
      descripcion: equipo.descripcion,
      marca: equipo.marca || "",
      modelo: equipo.modelo || "",
      cantidad: equipo.cantidad,
      costo: equipo.costo || 0,
      num_serie: equipo.num_serie || "",
      frecuencia_uso: equipo.frecuencia_uso || "",
      estado: equipo.estado || "Operativo",
      observaciones: equipo.observaciones || "",
      tipo_equipo: equipo.tipo_equipo,
      rfid: equipo.rfid || "",
      placa: equipo.placa || "",
      ambito: equipo.ambito ?? "area",
      area_id: equipo.area_id?._id || "",
      superintendencia_id: equipo.superintendencia_id?._id || "",
      gerencia_id: equipo.gerencia_id?._id || "",
      subarea: equipo.subarea || "",
      responsable: equipo.responsable || "",
      ubicacion_id: equipo.ubicacion_id?._id || "",
      clasificacion_id: equipo.clasificacion_id?._id || "",
      especificaciones: equipo.especificaciones || {},
    })
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setFormData(initialFormData)
    setEditingEquipo(null)
    setActiveConfig(null)
  }

  // --- Submit del Formulario ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.codigo.trim() || !formData.descripcion.trim()) {
      showNotification("El código y la descripción son requeridos", "warning")
      return
    }

    try {
      if (editingEquipo) {
        await actualizarEquipo(editingEquipo._id, formData)
        showNotification("Equipo actualizado con éxito", "success")
      } else {
        await crearEquipo(formData)
        showNotification("Equipo creado con éxito", "success")
      }
      handleCloseModal()
      cargarDatos()
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Error al guardar el equipo", "error")
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar este equipo?")) {
      try {
        await eliminarEquipo(id)
        showNotification("Equipo eliminado con éxito", "success")
        cargarDatos()
      } catch (err) {
        showNotification(err instanceof Error ? err.message : "Error al eliminar el equipo", "error")
      }
    }
  }

  // --- Ejecución de Migración de Excel ---
  const handleMigrarExcelLocal = async () => {
    if (window.confirm("¿Desea iniciar la migración del inventario utilizando el archivo local de plantillas (Inventario.xlsx)?")) {
      setMigrationLoading(true)
      try {
        const res = await migrarExcel()
        if (res.exito) {
          showNotification(`Migración exitosa: ${res.creados} creados, ${res.actualizados} actualizados`, "success")
          cargarDatos()
          cargarCatalogos()
        } else {
          showNotification("La migración no se completó exitosamente", "error")
        }
      } catch (err) {
        showNotification(err instanceof Error ? err.message : "Error en migración", "error")
      } finally {
        setMigrationLoading(false)
      }
    }
  }

  const handleSubirExcelArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const formDataUpload = new FormData()
    formDataUpload.append("file", file)

    setMigrationLoading(true)
    try {
      const res = await migrarExcel(formDataUpload)
      if (res.exito) {
        showNotification(`Migración exitosa: ${res.creados} creados, ${res.actualizados} actualizados`, "success")
        cargarDatos()
        cargarCatalogos()
      } else {
        showNotification("La migración no se completó exitosamente", "error")
      }
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Error en migración", "error")
    } finally {
      setMigrationLoading(false)
      // Reset input
      e.target.value = ""
    }
  }

  // --- Filtros ---
  const filteredEquipos = equipos.filter((item) => {
    const matchSearch =
      item.codigo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (item.marca && item.marca.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (item.modelo && item.modelo.toLowerCase().includes(searchFilter.toLowerCase()))

    const matchArea = areaFilter === "" || item.area_id?._id === areaFilter
    const matchUbicacion = ubicacionFilter === "" || item.ubicacion_id?._id === ubicacionFilter
    const matchTipo = tipoFilter === "" || item.tipo_equipo === tipoFilter

    return matchSearch && matchArea && matchUbicacion && matchTipo
  })

  // List of unique types for the filter dropdown
  const uniqueTipos = Array.from(new Set(equipos.map((e) => e.tipo_equipo))).sort()

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Inventario de Herramientas y Equipos
        </Typography>
        <Box display="flex" gap={1.5} flexWrap="wrap">
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<UploadFileIcon />}
            onClick={handleMigrarExcelLocal}
            disabled={migrationLoading}
          >
            Migrar Inventario.xlsx Local
          </Button>

          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            disabled={migrationLoading}
          >
            Subir Inventario Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={handleSubirExcelArchivo}
            />
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
            disabled={migrationLoading}
          >
            Agregar Equipo
          </Button>
        </Box>
      </Box>

      {migrationLoading && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<CircularProgress size={18} />}>
          Migrando datos del inventario de Excel y cargando relaciones a MongoDB... Por favor espere.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Panel de Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Buscar por Código, Descripción..."
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
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Área</InputLabel>
              <Select
                value={areaFilter}
                label="Área"
                onChange={(e) => setAreaFilter(e.target.value)}
              >
                <MenuItem value=""><em>Todas</em></MenuItem>
                {areas.map((a) => (
                  <MenuItem key={a._id} value={a._id}>{a.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Ubicación</InputLabel>
              <Select
                value={ubicacionFilter}
                label="Ubicación"
                onChange={(e) => setUbicacionFilter(e.target.value)}
              >
                <MenuItem value=""><em>Todas</em></MenuItem>
                {ubicaciones.map((u) => (
                  <MenuItem key={u._id} value={u._id}>{u.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de Equipo</InputLabel>
              <Select
                value={tipoFilter}
                label="Tipo de Equipo"
                onChange={(e) => setTipoFilter(e.target.value)}
              >
                <MenuItem value=""><em>Todos</em></MenuItem>
                {uniqueTipos.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de Equipos */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={5}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Tipo de Equipo</TableCell>
                  <TableCell>Marca / Modelo</TableCell>
                  <TableCell>Área</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell>Clasificación</TableCell>
                  <TableCell align="center">Cantidad</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Especificaciones</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEquipos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                      No se encontraron equipos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEquipos
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell><Chip label={item.codigo} size="small" color="primary" variant="outlined" /></TableCell>
                        <TableCell sx={{ fontWeight: "medium" }}>{item.descripcion}</TableCell>
                        <TableCell><Chip label={item.tipo_equipo} size="small" variant="outlined" /></TableCell>
                        <TableCell>{item.marca || "-"} / {item.modelo || "-"}</TableCell>
                        <TableCell>{item.area_id?.nombre || "-"}</TableCell>
                        <TableCell>{item.ubicacion_id?.nombre || "-"}</TableCell>
                        <TableCell>{item.clasificacion_id?.nombre || "-"}</TableCell>
                        <TableCell align="center">{item.cantidad}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={item.estado || "Operativo"}
                            color={item.estado === "Operativo" ? "success" : "error"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {Object.keys(item.especificaciones || {}).length > 0 ? (
                            <IconButton color="info" size="small" onClick={() => setSelectedSpecsEquipo(item)}>
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                          <IconButton color="primary" size="small" onClick={() => handleOpenEditModal(item)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton color="error" size="small" onClick={() => handleDelete(item._id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredEquipos.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página"
            />
          </>
        )}
      </TableContainer>

      {/* Modal Agregar/Editar Equipo */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingEquipo ? "Editar Equipo" : "Agregar Nuevo Equipo"}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {/* Sección Comunes */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" fontWeight="bold" color="primary">
                  Información Básica del Equipo
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Código Único (Cód. Nuevo Asig)"
                  variant="outlined"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Placa"
                  variant="outlined"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                  helperText="Solo vehículos. Es un dato distinto del número interno."
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Código Antiguo"
                  variant="outlined"
                  value={formData.codigo_antiguo}
                  onChange={(e) => setFormData({ ...formData, codigo_antiguo: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Código de Parte"
                  variant="outlined"
                  value={formData.codigo_parte}
                  onChange={(e) => setFormData({ ...formData, codigo_parte: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  label="Descripción del Equipo"
                  variant="outlined"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Cantidad"
                  variant="outlined"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: Number(e.target.value) })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Marca"
                  variant="outlined"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Modelo"
                  variant="outlined"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Número de Serie"
                  variant="outlined"
                  value={formData.num_serie}
                  onChange={(e) => setFormData({ ...formData, num_serie: e.target.value })}
                />
              </Grid>

              {/* Relaciones */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth required>
                  <InputLabel>Pertenece a</InputLabel>
                  <Select
                    value={formData.ambito ?? "area"}
                    label="Pertenece a"
                    onChange={(e) =>
                      // Al cambiar de nivel se limpian las otras referencias:
                      // un equipo pertenece a uno solo.
                      setFormData({
                        ...formData,
                        ambito: e.target.value as EquipoForm["ambito"],
                        area_id: "",
                        superintendencia_id: "",
                        gerencia_id: "",
                      })
                    }
                  >
                    <MenuItem value="area">Un área</MenuItem>
                    <MenuItem value="superintendencia">
                      Una superintendencia (lo ven todas sus áreas)
                    </MenuItem>
                    <MenuItem value="gerencia">
                      La gerencia (lo ven todos)
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                {(formData.ambito ?? "area") === "area" && (
                  <FormControl fullWidth required>
                    <InputLabel>Área</InputLabel>
                    <Select
                      value={formData.area_id ?? ""}
                      label="Área"
                      onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
                    >
                      {areas.map((a) => (
                        <MenuItem key={a._id} value={a._id}>{a.nombre}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {formData.ambito === "superintendencia" && (
                  <FormControl fullWidth required>
                    <InputLabel>Superintendencia</InputLabel>
                    <Select
                      value={formData.superintendencia_id ?? ""}
                      label="Superintendencia"
                      onChange={(e) =>
                        setFormData({ ...formData, superintendencia_id: e.target.value })
                      }
                    >
                      {superintendencias.map((s) => (
                        <MenuItem key={s._id} value={s._id}>{s.nombre}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {formData.ambito === "gerencia" && (
                  <FormControl fullWidth required>
                    <InputLabel>Gerencia</InputLabel>
                    <Select
                      value={formData.gerencia_id ?? ""}
                      label="Gerencia"
                      onChange={(e) =>
                        setFormData({ ...formData, gerencia_id: e.target.value })
                      }
                    >
                      {gerencias.map((g) => (
                        <MenuItem key={g._id} value={g._id}>{g.nombre}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth required>
                  <InputLabel>Ubicación</InputLabel>
                  <Select
                    value={formData.ubicacion_id}
                    label="Ubicación"
                    onChange={(e) => setFormData({ ...formData, ubicacion_id: e.target.value })}
                  >
                    {ubicaciones.map((u) => (
                      <MenuItem key={u._id} value={u._id}>{u.nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth required>
                  <InputLabel>Clasificación</InputLabel>
                  <Select
                    value={formData.clasificacion_id}
                    label="Clasificación"
                    onChange={(e) => setFormData({ ...formData, clasificacion_id: e.target.value })}
                  >
                    {clasificaciones.map((c) => (
                      <MenuItem key={c._id} value={c._id}>{c.nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Estado y Otros */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={formData.estado}
                    label="Estado"
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <MenuItem value="Operativo">Operativo</MenuItem>
                    <MenuItem value="Inoperativo">Inoperativo</MenuItem>
                    <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Frecuencia de Uso"
                  variant="outlined"
                  value={formData.frecuencia_uso}
                  onChange={(e) => setFormData({ ...formData, frecuencia_uso: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Costo"
                  variant="outlined"
                  value={formData.costo}
                  onChange={(e) => setFormData({ ...formData, costo: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Observaciones"
                  variant="outlined"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                />
              </Grid>

              {/* Selector de Tipo de Equipo Dinámico */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                  Especificaciones Técnicas del Tipo de Equipo
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Equipo / Herramienta</InputLabel>
                  <Select
                    value={formData.tipo_equipo}
                    label="Tipo de Equipo / Herramienta"
                    onChange={(e) => handleTipoEquipoChange(e.target.value)}
                  >
                    {configs.map((c) => (
                      <MenuItem key={c.tipo_equipo} value={c.tipo_equipo}>{c.tipo_equipo}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Render de especificaciones dinámicas */}
              {activeConfig && activeConfig.campos.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Box p={2} sx={{ backgroundColor: "action.hover", borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      {activeConfig.campos.map((campo) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={campo.name}>
                          {campo.type === "select" ? (
                            <FormControl fullWidth required={campo.required} size="small">
                              <InputLabel>{campo.label}</InputLabel>
                              <Select
                                value={formData.especificaciones?.[campo.name] || ""}
                                label={campo.label}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    especificaciones: {
                                      ...formData.especificaciones,
                                      [campo.name]: e.target.value,
                                    },
                                  })
                                }
                              >
                                {campo.options?.map((opt) => (
                                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              label={campo.label}
                              type={campo.type === "number" ? "number" : "text"}
                              value={formData.especificaciones?.[campo.name] || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  especificaciones: {
                                    ...formData.especificaciones,
                                    [campo.name]: e.target.value,
                                  },
                                })
                              }
                              required={campo.required}
                            />
                          )}
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grid>
              )}
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

      {/* Modal para Ver Especificaciones Técnicas */}
      <Dialog open={!!selectedSpecsEquipo} onClose={() => setSelectedSpecsEquipo(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Especificaciones Técnicas - {selectedSpecsEquipo?.codigo}
        </DialogTitle>
        <DialogContent dividers>
          {selectedSpecsEquipo && (
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="caption" color="textSecondary">Descripción</Typography>
                <Typography variant="body1" fontWeight="bold">{selectedSpecsEquipo.descripcion}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">Tipo de Equipo</Typography>
                <Typography variant="body1" fontWeight="bold">{selectedSpecsEquipo.tipo_equipo}</Typography>
              </Box>
              <Divider />
              <Typography variant="subtitle2" fontWeight="bold" color="primary">Atributos Dinámicos</Typography>
              <Grid container spacing={1.5}>
                {Object.entries(selectedSpecsEquipo.especificaciones || {}).map(([key, val]) => (
                  <Grid size={{ xs: 12 }} display="flex" justifyContent="space-between" key={key}>
                    <Typography variant="body2" color="textSecondary">{key}:</Typography>
                    <Typography variant="body2" fontWeight="bold">{val ? val.toString() : "-"}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSpecsEquipo(null)}>Cerrar</Button>
        </DialogActions>
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
