"use client"

import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Trabajador, TrabajadorForm } from "@/types/trabajador";
import {
  actualizarTrabajador,
  crearTrabajador,
  crearTrabajadorConUsuario,
  crearUsuarioParaTrabajadorExistente,
  eliminarTrabajador,
  obtenerTrabajadores,
  obtenerTrabajadorPorId,
} from "@/lib/actions/trabajador-actions";
import UserManagementModal from "@/components/organisms/user/UserManagementModal";
import { useUserRole } from "@/hooks/useUserRole";

const initialFormData: TrabajadorForm = {
  ci: "",
  nomina: "",
  puesto: "",
  fecha_ingreso: "",
  superintendencia: "",
  email: "",
  username: "",
  crear_usuario_keycloak: false,
  roles: ["user"],
  activo: true,
};

export default function GestionTrabajadores() {
  const { user } = useUserRole()
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para el modal principal
  const [openModal, setOpenModal] = useState(false);
  const [editingTrabajador, setEditingTrabajador] = useState<Trabajador | null>(null);
  const [formData, setFormData] = useState<TrabajadorForm>(initialFormData);

  // Estados para filtros
  const [ciFilter, setCiFilter] = useState("");
  const [nominaFilter, setNominaFilter] = useState("");
  const [puestoFilter, setPuestoFilter] = useState("");
  const [superintendenciaFilter, setSuperintendenciaFilter] = useState("");
  const [activoFilter, setActivoFilter] = useState("");
  const [tieneUsuarioFilter, setTieneUsuarioFilter] = useState("");

  // Estados para modal de crear usuario
  const [openCreateUserModal, setOpenCreateUserModal] = useState(false);
  const [selectedWorkerForUser, setSelectedWorkerForUser] = useState<Trabajador | null>(null);
  const [createUserForm, setCreateUserForm] = useState({
    email: "",
    username: "",
    password: "",
    temporary_password: true,
    roles: ["user"],
  });

  // Estados para modal de gestión avanzada
  const [openUserManagementModal, setOpenUserManagementModal] = useState(false);
  const [selectedWorkerForManagement, setSelectedWorkerForManagement] = useState<Trabajador | null>(null);

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

  const isAdmin = user?.roles?.includes("admin");
  useEffect(() => {
    cargarTrabajadores();
  }, []);

  // Validación de contraseña
  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: "Mínimo 8 caracteres" };
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const requirements = [];
    if (!hasUpper) requirements.push("mayúscula");
    if (!hasLower) requirements.push("minúscula");
    if (!hasNumber) requirements.push("número");
    if (!hasSpecial) requirements.push("símbolo");

    if (requirements.length > 0) {
      return {
        isValid: false,
        message: `Falta: ${requirements.join(", ")}`,
      };
    }

    return { isValid: true, message: "Contraseña válida" };
  };

  const validateForm = (): boolean => {
    const requiredFields = ["ci", "nomina", "puesto", "fecha_ingreso", "superintendencia"];

    for (const field of requiredFields) {
      if (!formData[field as keyof TrabajadorForm]?.toString().trim()) {
        mostrarNotificacion(`El campo ${field} es requerido`, "error");
        return false;
      }
    }

    const ciPattern = /^\d{6,8}$/;
    if (!ciPattern.test(formData.ci)) {
      mostrarNotificacion("El CI debe tener entre 6 y 8 dígitos", "error");
      return false;
    }

    if (formData.crear_usuario_keycloak && !formData.email?.trim()) {
      mostrarNotificacion("El email es requerido cuando se crea un usuario del sistema", "error");
      return false;
    }

    if (formData.email && formData.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        mostrarNotificacion("El email no tiene un formato válido", "error");
        return false;
      }
    }

    if (formData.username && formData.username.trim()) {
      const usernamePattern = /^[a-zA-Z0-9._-]+$/;
      if (!usernamePattern.test(formData.username)) {
        mostrarNotificacion("El username solo puede contener letras, números, puntos, guiones y guiones bajos", "error");
        return false;
      }
    }

    const today = new Date();
    const fechaIngreso = new Date(formData.fecha_ingreso);
    if (fechaIngreso > today) {
      mostrarNotificacion("La fecha de ingreso no puede ser futura", "error");
      return false;
    }

    return true;
  };

  const validateFormBasic = (): boolean => {
    const requiredFields = ["ci", "nomina", "puesto", "fecha_ingreso", "superintendencia"];

    for (const field of requiredFields) {
      if (!formData[field as keyof TrabajadorForm]?.toString().trim()) {
        return false;
      }
    }

    if (formData.crear_usuario_keycloak && !formData.email?.trim()) {
      return false;
    }

    return true;
  };

  const cargarTrabajadores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerTrabajadores();
      setTrabajadores(data);
    } catch (error) {
      console.error("Error al cargar trabajadores:", error);
      setError("No se pudieron cargar los trabajadores");
      mostrarNotificacion("Error al cargar los trabajadores", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtrarTrabajadores = () => {
    let filtrados = trabajadores;

    if (ciFilter.trim()) {
      filtrados = filtrados.filter((t) => t.ci.toLowerCase().includes(ciFilter.toLowerCase().trim()));
    }

    if (nominaFilter.trim()) {
      filtrados = filtrados.filter((t) => t.nomina.toLowerCase().includes(nominaFilter.toLowerCase().trim()));
    }

    if (puestoFilter.trim()) {
      filtrados = filtrados.filter((t) => t.puesto.toLowerCase().includes(puestoFilter.toLowerCase().trim()));
    }

    if (superintendenciaFilter.trim()) {
      filtrados = filtrados.filter((t) =>
        t.superintendencia.toLowerCase().includes(superintendenciaFilter.toLowerCase().trim())
      );
    }

    if (activoFilter) {
      const isActive = activoFilter === "true";
      filtrados = filtrados.filter((t) => t.activo === isActive);
    }

    if (tieneUsuarioFilter) {
      const hasUser = tieneUsuarioFilter === "true";
      filtrados = filtrados.filter((t) => t.tiene_acceso_sistema === hasUser);
    }

    return filtrados;
  };

  const limpiarFiltros = () => {
    setCiFilter("");
    setNominaFilter("");
    setPuestoFilter("");
    setSuperintendenciaFilter("");
    setActivoFilter("");
    setTieneUsuarioFilter("");
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const abrirModal = async (trabajador?: Trabajador) => {
    if (trabajador) {
      try {
        const trabajadorActualizado = await obtenerTrabajadorPorId(trabajador._id);
        setEditingTrabajador(trabajadorActualizado);
        setFormData({
          ci: trabajadorActualizado.ci,
          nomina: trabajadorActualizado.nomina,
          puesto: trabajadorActualizado.puesto,
          fecha_ingreso: trabajadorActualizado.fecha_ingreso.split("T")[0],
          superintendencia: trabajadorActualizado.superintendencia,
          email: "",
          username: trabajadorActualizado.username || "",
          crear_usuario_keycloak: false,
          roles: ["user"],
          activo: trabajadorActualizado.activo,
        });
      } catch (error) {
        console.error("Error al cargar trabajador:", error);
        setEditingTrabajador(trabajador);
        setFormData({
          ci: trabajador.ci,
          nomina: trabajador.nomina,
          puesto: trabajador.puesto,
          fecha_ingreso: trabajador.fecha_ingreso.split("T")[0],
          superintendencia: trabajador.superintendencia,
          email: "",
          username: trabajador.username || "",
          crear_usuario_keycloak: false,
          roles: ["user"],
          activo: trabajador.activo,
        });
      }
    } else {
      setEditingTrabajador(null);
      setFormData(initialFormData);
    }
    setOpenModal(true);
  };

  const cerrarModal = () => {
    setOpenModal(false);
    setEditingTrabajador(null);
    setFormData(initialFormData);
  };

  const guardarTrabajador = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      if (editingTrabajador) {
        const updateData = {
          nomina: formData.nomina,
          puesto: formData.puesto,
          fecha_ingreso: formData.fecha_ingreso,
          superintendencia: formData.superintendencia,
          activo: formData.activo,
        };
        await actualizarTrabajador(editingTrabajador._id, updateData);
        mostrarNotificacion("Trabajador actualizado correctamente", "success");
      } else {
        if (formData.crear_usuario_keycloak && isAdmin) {
          await crearTrabajadorConUsuario({
            ci: formData.ci,
            nomina: formData.nomina,
            puesto: formData.puesto,
            fecha_ingreso: formData.fecha_ingreso,
            superintendencia: formData.superintendencia,
            email: formData.email!,
            username: formData.username || "",
            crear_usuario_keycloak: true,
            roles: formData.roles || ["user"],
          });
          mostrarNotificacion("Trabajador y usuario creados correctamente", "success");
        } else {
          await crearTrabajador({
            ci: formData.ci,
            nomina: formData.nomina,
            puesto: formData.puesto,
            fecha_ingreso: formData.fecha_ingreso,
            superintendencia: formData.superintendencia,
          });
          mostrarNotificacion("Trabajador creado correctamente", "success");
        }
      }

      cerrarModal();
      await cargarTrabajadores();
    } catch (error) {
      console.error("Error al guardar trabajador:", error);
      mostrarNotificacion(
        error instanceof Error ? error.message : "Error al guardar el trabajador",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarTrabajador = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este trabajador?")) return;

    try {
      setLoading(true);
      await eliminarTrabajador(id);
      mostrarNotificacion("Trabajador eliminado correctamente", "success");
      await cargarTrabajadores();
    } catch (error) {
      console.error("Error al eliminar trabajador:", error);
      mostrarNotificacion(
        error instanceof Error ? error.message : "Error al eliminar el trabajador",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCrearUsuario = (trabajador: Trabajador) => {
    setSelectedWorkerForUser(trabajador);
    setCreateUserForm({
      email: "",
      username: "",
      password: "",
      temporary_password: true,
      roles: ["user"],
    });
    setOpenCreateUserModal(true);
  };

  const cerrarModalCrearUsuario = () => {
    setOpenCreateUserModal(false);
    setSelectedWorkerForUser(null);
    setCreateUserForm({
      email: "",
      username: "",
      password: "",
      temporary_password: true,
      roles: ["user"],
    });
  };

  const crearUsuarioParaTrabajador = async () => {
    if (!selectedWorkerForUser) return;

    const passwordValidation = validatePassword(createUserForm.password);
    if (!passwordValidation.isValid) {
      mostrarNotificacion(passwordValidation.message, "error");
      return;
    }

    try {
      setSubmitting(true);

      const requestData = {
        trabajadorId: selectedWorkerForUser._id,
        username: createUserForm.username,
        password: createUserForm.password,
        temporary_password: createUserForm.temporary_password,
        roles: createUserForm.roles,
        ...(createUserForm.email?.trim() && { email: createUserForm.email.trim() }),
      };

      await crearUsuarioParaTrabajadorExistente(requestData);
      mostrarNotificacion("Usuario creado correctamente para el trabajador", "success");
      cerrarModalCrearUsuario();
      await cargarTrabajadores();
    } catch (error) {
      console.error("Error al crear usuario:", error);
      mostrarNotificacion(
        error instanceof Error ? error.message : "Error al crear el usuario",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const abrirModalGestionUsuario = (trabajador: Trabajador) => {
    setSelectedWorkerForManagement(trabajador);
    setOpenUserManagementModal(true);
  };

  const cerrarModalGestionUsuario = () => {
    setOpenUserManagementModal(false);
    setSelectedWorkerForManagement(null);
  };

  const mostrarNotificacion = (message: string, severity: "success" | "error" | "warning" | "info") => {
    setNotification({ open: true, message, severity });
  };

  const cerrarNotificacion = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const trabajadoresMostrados = filtrarTrabajadores();

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 3 }}>
        Gestión de Trabajadores
      </Typography>

      {/* PANEL DE FILTROS Y CONTROLES */}
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: "8px" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filtros y Controles
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="CI"
              variant="outlined"
              size="small"
              value={ciFilter}
              onChange={(e) => setCiFilter(e.target.value)}
            />
          </Grid>

          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Nómina"
              variant="outlined"
              size="small"
              value={nominaFilter}
              onChange={(e) => setNominaFilter(e.target.value)}
            />
          </Grid>

          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Puesto"
              variant="outlined"
              size="small"
              value={puestoFilter}
              onChange={(e) => setPuestoFilter(e.target.value)}
            />
          </Grid>

          <Grid size={{xs:12, md:4}}>
            <TextField
              fullWidth
              label="Superintendencia"
              variant="outlined"
              size="small"
              value={superintendenciaFilter}
              onChange={(e) => setSuperintendenciaFilter(e.target.value)}
            />
          </Grid>

          <Grid size={{xs:12, md:4}}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select value={activoFilter} onChange={(e) => setActivoFilter(e.target.value)} label="Estado">
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{xs:12, md:4}}>
            <FormControl fullWidth size="small">
              <InputLabel>Usuario Sistema</InputLabel>
              <Select
                value={tieneUsuarioFilter}
                onChange={(e) => setTieneUsuarioFilter(e.target.value)}
                label="Usuario Sistema"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Con Usuario</MenuItem>
                <MenuItem value="false">Sin Usuario</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" gap={1}>
            <Button variant="outlined" startIcon={<ClearIcon />} onClick={limpiarFiltros}>
              Limpiar Filtros
            </Button>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => abrirModal()}
            color="primary"
            disabled={loading}
          >
            Nuevo Trabajador
          </Button>
        </Box>
      </Paper>

      {/* TABLA DE TRABAJADORES */}
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
          <Typography variant="h6">Trabajadores ({trabajadoresMostrados.length})</Typography>
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
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>CI</TableCell>
                    <TableCell>Nómina</TableCell>
                    <TableCell>Puesto</TableCell>
                    <TableCell>Superintendencia</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="center">Usuario Sistema</TableCell>
                    <TableCell align="center">Fecha Ingreso</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trabajadoresMostrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          No se encontraron trabajadores con los filtros aplicados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    trabajadoresMostrados
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((trabajador) => (
                        <TableRow key={trabajador._id} sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {trabajador.ci}
                            </Typography>
                          </TableCell>
                          <TableCell>{trabajador.nomina}</TableCell>
                          <TableCell>{trabajador.puesto}</TableCell>
                          <TableCell>{trabajador.superintendencia}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={trabajador.activo ? "Activo" : "Inactivo"}
                              color={trabajador.activo ? "success" : "error"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={trabajador.tiene_acceso_sistema ? "Con Usuario" : "Sin Usuario"}
                              color={trabajador.tiene_acceso_sistema ? "primary" : "default"}
                              size="small"
                              icon={trabajador.tiene_acceso_sistema ? <PersonIcon /> : undefined}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {new Date(trabajador.fecha_ingreso).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver detalle">
                              <IconButton color="info" size="small">
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Editar">
                              <IconButton
                                onClick={() => abrirModal(trabajador)}
                                color="primary"
                                size="small"
                                disabled={loading}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>

                            {isAdmin && !trabajador.tiene_acceso_sistema && (
                              <Tooltip title="Crear Usuario del Sistema">
                                <IconButton
                                  onClick={() => abrirModalCrearUsuario(trabajador)}
                                  color="success"
                                  size="small"
                                  disabled={loading}
                                >
                                  <PersonAddIcon />
                                </IconButton>
                              </Tooltip>
                            )}

                            {isAdmin && trabajador.tiene_acceso_sistema && (
                              <Tooltip title="Gestión Avanzada de Usuario">
                                <IconButton
                                  onClick={() => abrirModalGestionUsuario(trabajador)}
                                  color="secondary"
                                  size="small"
                                  disabled={loading}
                                >
                                  <SettingsIcon />
                                </IconButton>
                              </Tooltip>
                            )}

                            {isAdmin && (
                              <Tooltip title="Eliminar">
                                <IconButton
                                  onClick={() => handleEliminarTrabajador(trabajador._id)}
                                  color="error"
                                  size="small"
                                  disabled={loading}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            )}
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
              count={trabajadoresMostrados.length}
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

      {/* MODAL PARA CREAR/EDITAR TRABAJADOR */}
      <Dialog open={openModal} onClose={cerrarModal} maxWidth="md" fullWidth>
        <DialogTitle>{editingTrabajador ? "Editar Trabajador" : "Nuevo Trabajador"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{xs:12,sm:6}}>
              <TextField
                fullWidth
                label="CI *"
                value={formData.ci}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, ci: value });
                }}
                required
                disabled={!!editingTrabajador}
                error={!formData.ci}
                helperText={!formData.ci ? "Campo requerido" : "Solo números (6-8 dígitos)"}
                inputProps={{ maxLength: 8 }}
              />
            </Grid>

            <Grid size={{xs:12,sm:6}}>
              <TextField
                fullWidth
                label="Nómina *"
                value={formData.nomina}
                onChange={(e) => setFormData({ ...formData, nomina: e.target.value })}
                required
                error={!formData.nomina}
                helperText={!formData.nomina ? "Campo requerido" : ""}
              />
            </Grid>

            <Grid size={{xs:12,sm:6}}>
              <TextField
                fullWidth
                label="Puesto *"
                value={formData.puesto}
                onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                required
                error={!formData.puesto}
                helperText={!formData.puesto ? "Campo requerido" : ""}
              />
            </Grid>

            <Grid size={{xs:12,sm:6}}>
              <TextField
                fullWidth
                label="Fecha de Ingreso *"
                type="date"
                value={formData.fecha_ingreso}
                onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                required
                error={!formData.fecha_ingreso}
                helperText={!formData.fecha_ingreso ? "Campo requerido" : ""}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{xs:12,sm:6}}>
              <TextField
                fullWidth
                label="Superintendencia *"
                value={formData.superintendencia}
                onChange={(e) => setFormData({ ...formData, superintendencia: e.target.value })}
                required
                error={!formData.superintendencia}
                helperText={!formData.superintendencia ? "Campo requerido" : ""}
              />
            </Grid>

            {!editingTrabajador && isAdmin && (
              <>
                <Grid size={{xs:12,sm:6}}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.crear_usuario_keycloak}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            crear_usuario_keycloak: e.target.checked,
                          })
                        }
                        color="primary"
                      />
                    }
                    label="Crear usuario del sistema (acceso a la aplicación)"
                  />
                </Grid>

                {formData.crear_usuario_keycloak && (
                  <>
                    <Grid size={{xs:12,sm:6}}>
                      <TextField
                        fullWidth
                        label="Email *"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        error={formData.crear_usuario_keycloak && !formData.email}
                        helperText={formData.crear_usuario_keycloak && !formData.email ? "Campo requerido" : ""}
                      />
                    </Grid>

                    <Grid size={{xs:12,sm:6}}>
                      <TextField
                        fullWidth
                        label="Username (opcional)"
                        value={formData.username || ""}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        helperText="Si no se especifica, se generará automáticamente"
                      />
                    </Grid>

                    <Grid size={{xs:12,sm:6}}>
                      <FormControl fullWidth>
                        <InputLabel>Roles del Usuario</InputLabel>
                        <Select
                          multiple
                          value={formData.roles || ["user"]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              roles: typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value,
                            })
                          }
                          label="Roles del Usuario"
                        >
                          <MenuItem value="user">Usuario</MenuItem>
                          <MenuItem value="tecnico">Inspector</MenuItem>
                          <MenuItem value="supervisor">Supervisor</MenuItem>
                          <MenuItem value="superintendente">Superintendente</MenuItem>
                          <MenuItem value="admin">Administrador</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
              </>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: "1px solid #e0e0e0" }}>
          <Button onClick={cerrarModal} color="inherit" disabled={submitting} variant="outlined">
            Cancelar
          </Button>

          <Button
            onClick={guardarTrabajador}
            variant="contained"
            disabled={submitting || !validateFormBasic()}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
            color="primary"
          >
            {submitting ? "Guardando..." : editingTrabajador ? "Actualizar Trabajador" : "Crear Trabajador"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL PARA CREAR USUARIO PARA TRABAJADOR EXISTENTE */}
      <Dialog open={openCreateUserModal} onClose={cerrarModalCrearUsuario} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Usuario para {selectedWorkerForUser?.nomina}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{xs:12,sm:6}}>
              <TextField
                fullWidth
                label="Username *"
                value={createUserForm.username}
                onChange={(e) =>
                  setCreateUserForm({
                    ...createUserForm,
                    username: e.target.value,
                  })
                }
                required
                error={!createUserForm.username}
                helperText={!createUserForm.username ? "Campo requerido" : "Nombre de usuario para acceder al sistema"}
              />
            </Grid>

            <Grid size={{xs:12,sm:6}}>
              <TextField
                fullWidth
                label="Email (opcional)"
                type="email"
                value={createUserForm.email}
                onChange={(e) =>
                  setCreateUserForm({
                    ...createUserForm,
                    email: e.target.value,
                  })
                }
                helperText="Email para notificaciones (opcional)"
              />
            </Grid>

            <Grid size={{xs:12,sm:6}}>
              <TextField
                fullWidth
                label="Contraseña *"
                type="password"
                value={createUserForm.password}
                onChange={(e) =>
                  setCreateUserForm({
                    ...createUserForm,
                    password: e.target.value,
                  })
                }
                required
                error={Boolean(createUserForm.password && !validatePassword(createUserForm.password).isValid)}
                helperText={
                  createUserForm.password
                    ? validatePassword(createUserForm.password).message
                    : "Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo"
                }
              />
            </Grid>

            <Grid size={{xs:12,sm:6}}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={createUserForm.temporary_password}
                    onChange={(e) =>
                      setCreateUserForm({
                        ...createUserForm,
                        temporary_password: e.target.checked,
                      })
                    }
                  />
                }
                label="Contraseña temporal (el usuario debe cambiarla en el primer login)"
              />
            </Grid>

            <Grid size={{xs:12,sm:6}}>
              <FormControl fullWidth>
                <InputLabel>Roles del Usuario</InputLabel>
                <Select
                  multiple
                  value={createUserForm.roles}
                  onChange={(e) =>
                    setCreateUserForm({
                      ...createUserForm,
                      roles: typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value,
                    })
                  }
                  label="Roles del Usuario"
                >
                  <MenuItem value="user">Usuario</MenuItem>
                  <MenuItem value="tecnico">Inspector</MenuItem>
                  <MenuItem value="supervisor">Supervisor</MenuItem>
                  <MenuItem value="superintendente">Superintendente</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: "1px solid #e0e0e0" }}>
          <Button onClick={cerrarModalCrearUsuario} color="inherit" disabled={submitting} variant="outlined">
            Cancelar
          </Button>

          <Button
            onClick={crearUsuarioParaTrabajador}
            variant="contained"
            disabled={
              submitting ||
              !createUserForm.username ||
              !createUserForm.password ||
              !validatePassword(createUserForm.password).isValid
            }
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
            color="primary"
          >
            {submitting ? "Creando..." : "Crear Usuario"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE GESTIÓN AVANZADA DE USUARIO */}
      <UserManagementModal
        open={openUserManagementModal}
        onClose={cerrarModalGestionUsuario}
        trabajador={selectedWorkerForManagement}
        onSuccess={(message) => {
          mostrarNotificacion(message, "success");
          cargarTrabajadores();
        }}
        onError={(message) => mostrarNotificacion(message, "error")}
      />

      {/* SNACKBAR FOR NOTIFICATIONS */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={cerrarNotificacion}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={cerrarNotificacion} severity={notification.severity} variant="filled" sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}