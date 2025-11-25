"use client"

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tab,
  Tabs,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { Trabajador } from '@/types/trabajador';
import {
  obtenerInfoUsuario,
  actualizarContrasenaUsuario,
  actualizarRolesUsuario,
  desactivarUsuario,
  activarUsuario,
  desvincularUsuario,
} from '@/lib/actions/trabajador-actions';

interface UserManagementModalProps {
  open: boolean;
  onClose: () => void;
  trabajador: Trabajador | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface KeycloakUserInfo {
  username: string;
  email?: string;
  enabled: boolean;
  emailVerified: boolean;
  createdTimestamp: number;
}

interface TrabajadorInfo {
  ci: string;
  nomina: string;
  tiene_acceso_sistema: boolean;
}

interface UserInfo {
  trabajador_info: TrabajadorInfo;
  keycloak_info: KeycloakUserInfo;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UserManagementModal({
  open,
  onClose,
  trabajador,
  onSuccess,
  onError,
}: UserManagementModalProps) {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Estados para formularios
  const [passwordForm, setPasswordForm] = useState({
    new_password: '',
    temporary: true,
  });

  const [rolesForm, setRolesForm] = useState<string[]>(['user']);

  const [disableForm, setDisableForm] = useState({
    reason: '',
  });

  const [unlinkForm, setUnlinkForm] = useState({
    reason: '',
  });

  const loadUserInfo = useCallback(async () => {
    if (!trabajador) return;

    try {
      setLoading(true);
      const info = await obtenerInfoUsuario(trabajador._id);
      setUserInfo(info as UserInfo);
      // Cargar roles actuales (esto requeriría una API adicional)
      setRolesForm(['user']); // Por defecto
    } catch {
      onError('Error cargando información del usuario');
    } finally {
      setLoading(false);
    }
  }, [trabajador, onError]);

  useEffect(() => {
    if (open && trabajador && trabajador.tiene_acceso_sistema) {
      loadUserInfo();
    }
  }, [open, trabajador, loadUserInfo]);

  const handlePasswordUpdate = async () => {
    if (!trabajador || !passwordForm.new_password) return;

    try {
      setLoading(true);
      await actualizarContrasenaUsuario(trabajador._id, passwordForm);
      onSuccess('Contraseña actualizada correctamente');
      setPasswordForm({ new_password: '', temporary: true });
      await loadUserInfo();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Error actualizando contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleRolesUpdate = async () => {
    if (!trabajador || rolesForm.length === 0) return;

    try {
      setLoading(true);
      await actualizarRolesUsuario(trabajador._id, { roles: rolesForm });
      onSuccess('Roles actualizados correctamente');
      await loadUserInfo();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Error actualizando roles');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableUser = async () => {
    if (!trabajador || !disableForm.reason) return;

    try {
      setLoading(true);
      await desactivarUsuario(trabajador._id, disableForm.reason);
      onSuccess('Usuario desactivado correctamente');
      setDisableForm({ reason: '' });
      await loadUserInfo();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Error desactivando usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableUser = async () => {
    if (!trabajador) return;

    try {
      setLoading(true);
      await activarUsuario(trabajador._id);
      onSuccess('Usuario activado correctamente');
      await loadUserInfo();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Error activando usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkUser = async () => {
    if (!trabajador || !unlinkForm.reason) return;

    const confirmed = confirm(
      '¿Estás seguro de que quieres desvincular este usuario? Esta acción desactivará el acceso al sistema.'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      await desvincularUsuario(trabajador._id, unlinkForm.reason);
      onSuccess('Usuario desvinculado correctamente');
      onClose(); // Cerrar modal después de desvincular
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Error desvinculando usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!trabajador || !trabajador.tiene_acceso_sistema) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Alert severity="info">
            Este trabajador no tiene usuario del sistema asociado.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Gestión de Usuario - {trabajador.nomina}
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab 
            icon={<PersonIcon />} 
            label="Información" 
            id="user-tab-0"
            aria-controls="user-tabpanel-0"
          />
          <Tab 
            icon={<KeyIcon />} 
            label="Contraseña" 
            id="user-tab-1"
            aria-controls="user-tabpanel-1"
          />
          <Tab 
            icon={<SecurityIcon />} 
            label="Roles" 
            id="user-tab-2"
            aria-controls="user-tabpanel-2"
          />
          <Tab 
            icon={<HistoryIcon />} 
            label="Estado" 
            id="user-tab-3"
            aria-controls="user-tabpanel-3"
          />
        </Tabs>
      </Box>

      {/* TAB 1: INFORMACIÓN */}
      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : userInfo ? (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Información del Trabajador
                  </Typography>
                  <Typography><strong>CI:</strong> {userInfo.trabajador_info.ci}</Typography>
                  <Typography><strong>Nómina:</strong> {userInfo.trabajador_info.nomina}</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography component="span">
                      <strong>Acceso Sistema:</strong>
                    </Typography>
                    <Chip 
                      size="small" 
                      color={userInfo.trabajador_info.tiene_acceso_sistema ? "success" : "error"}
                      label={userInfo.trabajador_info.tiene_acceso_sistema ? "Activo" : "Inactivo"}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Información de Keycloak
                  </Typography>
                  <Typography><strong>Username:</strong> {userInfo.keycloak_info.username}</Typography>
                  <Typography><strong>Email:</strong> {userInfo.keycloak_info.email || 'No configurado'}</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography component="span">
                      <strong>Estado:</strong>
                    </Typography>
                    <Chip 
                      size="small" 
                      color={userInfo.keycloak_info.enabled ? "success" : "error"}
                      label={userInfo.keycloak_info.enabled ? "Habilitado" : "Deshabilitado"}
                    />
                  </Box>
                  <Typography>
                    <strong>Email Verificado:</strong> {userInfo.keycloak_info.emailVerified ? "Sí" : "No"}
                  </Typography>
                  <Typography>
                    <strong>Creado:</strong> {new Date(userInfo.keycloak_info.createdTimestamp).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="warning">No se pudo cargar la información del usuario</Alert>
        )}
      </TabPanel>

      {/* TAB 2: CONTRASEÑA */}
      <TabPanel value={tabValue} index={1}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Actualizar Contraseña
          </Typography>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nueva Contraseña"
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ 
                  ...passwordForm, 
                  new_password: e.target.value 
                })}
                helperText="Mínimo 8 caracteres"
                error={passwordForm.new_password.length > 0 && passwordForm.new_password.length < 8}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={passwordForm.temporary}
                    onChange={(e) => setPasswordForm({ 
                      ...passwordForm, 
                      temporary: e.target.checked 
                    })}
                  />
                }
                label="Contraseña temporal (el usuario deberá cambiarla en el próximo login)"
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Button
                variant="contained"
                onClick={handlePasswordUpdate}
                disabled={loading || passwordForm.new_password.length < 8}
                startIcon={loading ? <CircularProgress size={16} /> : null}
              >
                {loading ? "Actualizando..." : "Actualizar Contraseña"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </TabPanel>

      {/* TAB 3: ROLES */}
      <TabPanel value={tabValue} index={2}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Gestión de Roles
          </Typography>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Roles del Usuario</InputLabel>
                <Select
                  multiple
                  value={rolesForm}
                  onChange={(e) => setRolesForm(
                    typeof e.target.value === 'string' 
                      ? e.target.value.split(',') 
                      : e.target.value
                  )}
                  label="Roles del Usuario"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="user">Usuario</MenuItem>
                  <MenuItem value="inspector">Inspector</MenuItem>
                  <MenuItem value="supervisor">Supervisor</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Button
                variant="contained"
                onClick={handleRolesUpdate}
                disabled={loading || rolesForm.length === 0}
                startIcon={loading ? <CircularProgress size={16} /> : null}
              >
                {loading ? "Actualizando..." : "Actualizar Roles"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </TabPanel>

      {/* TAB 4: ESTADO */}
      <TabPanel value={tabValue} index={3}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Gestión de Estado del Usuario
          </Typography>
          
          <Grid container spacing={3}>
            {/* Activar/Desactivar */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Activar/Desactivar Usuario
                  </Typography>
                  
                  {userInfo?.keycloak_info?.enabled ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Desactivar temporalmente el acceso del usuario al sistema.
                      </Typography>
                      
                      <TextField
                        fullWidth
                        label="Motivo de desactivación"
                        value={disableForm.reason}
                        onChange={(e) => setDisableForm({ reason: e.target.value })}
                        margin="normal"
                        multiline
                        rows={2}
                      />
                      
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          color="warning"
                          onClick={handleDisableUser}
                          disabled={loading || !disableForm.reason}
                          startIcon={loading ? <CircularProgress size={16} /> : null}
                        >
                          {loading ? "Desactivando..." : "Desactivar Usuario"}
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        El usuario está desactivado. Puedes reactivarlo.
                      </Typography>
                      
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleEnableUser}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} /> : null}
                      >
                        {loading ? "Activando..." : "Activar Usuario"}
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>
            
            {/* Desvincular */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom color="error">
                    Desvincular Usuario
                  </Typography>
                  
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Esta acción desvinculará permanentemente el usuario del trabajador. 
                    El usuario se mantendrá en Keycloak pero desactivado.
                  </Alert>
                  
                  <TextField
                    fullWidth
                    label="Motivo de desvinculación"
                    value={unlinkForm.reason}
                    onChange={(e) => setUnlinkForm({ reason: e.target.value })}
                    margin="normal"
                    multiline
                    rows={2}
                    required
                  />
                  
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleUnlinkUser}
                      disabled={loading || !unlinkForm.reason}
                      startIcon={loading ? <CircularProgress size={16} /> : null}
                    >
                      {loading ? "Desvinculando..." : "Desvincular Usuario"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </TabPanel>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}