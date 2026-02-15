// app/dashboard/page.tsx - Dashboard Principal Mejorado

'use client'

import { useState, useEffect } from "react";
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Alert,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip
} from "@mui/material";
import { Typography } from "@/components/atoms/Typography";
import { useUserRole } from "@/hooks/useUserRole";
import Link from "next/link";

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { getMeAction } from "../actions/auth";

// Simulación del usuario - reemplaza esto con tu getMeAction real
interface User {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  roles: string[];
  isTwoFactorEnabled: boolean;
}

export default function DashboardHome() {
  const { userRole, hasRole } = useUserRole();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
useEffect(() => {
    const fetchUser = async () => {
      try {
        // Iniciamos la carga
        setLoading(true); 

        // Llamamos a la Server Action real
        const userData = await getMeAction();

        if (userData) {
          // Si nos devuelve el usuario, actualizamos el estado
          setUser(userData);
        } else {
          // Si devuelve null (sesión expirada/no logueado)
          setUser(null);
          // Nota: Si usas AuthGuard, probablemente ya haya redirigido al login,
          // pero es buena práctica limpiar el estado por si acaso.
        }

        console.log("✅ Usuario obtenido en Dashboard:", userData);
      } catch (error) {
        console.error("💥 Error al obtener los datos del usuario:", error);
        setUser(null);
      } finally {
        // Pase lo que pase (éxito o error), detenemos el loading
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const getWelcomeMessage = () => {
    switch (userRole) {
      case 'admin':
        return 'Panel de Administrador - Gestión completa del sistema';
      case 'supervisor':
        return 'Panel de Supervisor - Revisión y aprobación';
      case 'tecnico':
        return 'Panel de Operador - Formularios de inspección y mantenimiento';
      case 'viewer':
        return 'Panel de Visualización - Solo lectura';
      case 'superintendente':
        return 'Panel de Superintendente - Supervisión general del sistema';
      default:
        return 'Bienvenido al Dashboard';
    }
  };

  if (loading || !user) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Bienvenido, {user.fullName || user.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aquí está un resumen de tu cuenta y sistema
        </Typography>
      </Box>

      {/* Role Alert */}
      <Alert severity="info" icon={<AdminPanelSettingsIcon />}>
        {getWelcomeMessage()}
      </Alert>

      {/* Stats Grid - Información del Usuario */}
      <Grid container spacing={3}>
        {/* Estado de Cuenta */}
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Estado de Cuenta
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                    Activa
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Seguridad 2FA */}
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Seguridad 2FA
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                    {user.isTwoFactorEnabled ? 'Activo' : 'Inactivo'}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: user.isTwoFactorEnabled ? 'primary.main' : 'grey.400' }}>
                  <SecurityIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Rol */}
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Rol Principal
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mt: 1, textTransform: 'capitalize' }}>
                    {user.roles[0]}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Email */}
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                    {user.email ? '✓' : '✗'}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: user.email ? 'info.main' : 'grey.400' }}>
                  <EmailIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Información de Usuario */}
        <Grid size={{xs: 12, md: 6}}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Información de Usuario
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Username:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {user.username}
                  </Typography>
                </Box>

                {user.email && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                      Email:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {user.email}
                    </Typography>
                  </Box>
                )}

                {user.fullName && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                      Nombre:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {user.fullName}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Roles:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {user.roles.map((role) => (
                      <Chip 
                        key={role} 
                        label={role} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    ID:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {user.id.slice(0, 8)}...
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Seguridad */}
        <Grid size={{xs: 12, md: 6}}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <SecurityIcon color="success" />
                <Typography variant="h6" fontWeight="bold">
                  Seguridad
                </Typography>
              </Box>

              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: user.isTwoFactorEnabled ? 'success.light' : 'grey.300' }}>
                      {user.isTwoFactorEnabled ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <SecurityIcon color="disabled" />
                      )}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Autenticación de Dos Factores
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ color: user.isTwoFactorEnabled ? 'success.main' : 'text.secondary' }}
                      >
                        {user.isTwoFactorEnabled ? 'Activado ✓' : 'Desactivado'}
                      </Typography>
                    </Box>
                  </Box>
                  <Tooltip title="Configurar en Settings">
                    <IconButton 
                      component={Link} 
                      href="/dashboard/settings"
                      color="primary"
                      size="small"
                    >
                      <SettingsIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>

              {!user.isTwoFactorEnabled && (
                <Alert severity="warning" icon={<WarningAmberIcon />}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Recomendamos activar 2FA
                  </Typography>
                  <Typography variant="caption">
                    Protege tu cuenta con una capa adicional de seguridad
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Módulos según rol */}
        {hasRole('tecnico') && (
          <Grid >
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AssignmentIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Formularios de Inspección
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Accede a los formularios de inspección de herramientas, equipos y sistemas de emergencia.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {hasRole('supervisor') && (
          <Grid >
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <BarChartIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Reportes y Analytics
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Visualiza reportes y análisis de las inspecciones realizadas.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {hasRole('admin') && (
          <Grid >
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AdminPanelSettingsIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Administración del Sistema
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Configuración avanzada y gestión completa del sistema.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Estado del Sistema - Siempre visible */}
        <Grid >
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CheckCircleIcon color="success" />
                <Typography variant="h6" fontWeight="bold">
                  Estado del Sistema
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Tu rol actual: <strong style={{ textTransform: 'uppercase' }}>{userRole}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}