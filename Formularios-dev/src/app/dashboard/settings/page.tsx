'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 1. Importar router
import { 
  Box, 
  Card, 
  CardContent, 
  Paper,
  Chip,
  Button,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress
} from "@mui/material";
import { Typography } from "@/components/atoms/Typography";
import Link from "next/link";

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { getMeAction } from "@/app/actions/auth";

// Importa tu componente Setup2FASection si lo tienes
// import Setup2FASection from '@/components/Setup2FASection';

interface User {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  roles: string[];
  isTwoFactorEnabled?: boolean; // Opcional por si el backend no lo envía
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Inicializar router

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // 3. Llamada real al backend
        const userData = await getMeAction();

        if (userData) {
          setUser(userData);
        } else {
          // 4. Si el token no es válido, redirigir
          console.log("Sesión inválida en settings, redirigiendo...");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error cargando configuración:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Protección si user es null (durante redirect)
  if (!user) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header con botón de regreso */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Tooltip title="Volver al Dashboard">
            <IconButton 
              component={Link} 
              href="/dashboard"
              sx={{ color: 'text.secondary' }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Configuración
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ ml: 7 }}>
          Administra tu cuenta y preferencias de seguridad
        </Typography>
      </Box>

      {/* Secciones de Configuración */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Información Personal */}
        <Card elevation={2}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Información Personal
            </Typography>
            
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Username */}
              <Box>
                <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom>
                  Username
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Typography variant="body1" fontWeight="medium">
                    {user.username}
                  </Typography>
                </Paper>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Este es tu identificador único en la plataforma
                </Typography>
              </Box>

              {/* Email */}
              {user.email && (
                <Box>
                  <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom>
                    Email
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                    <Typography variant="body1" fontWeight="medium">
                      {user.email}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Nombre Completo */}
              {user.fullName && (
                <Box>
                  <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom>
                    Nombre Completo
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                    <Typography variant="body1" fontWeight="medium">
                      {user.fullName}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Roles */}
              <Box>
                <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom>
                  Roles
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {user.roles.map((role) => (
                    <Chip 
                      key={role} 
                      label={role} 
                      color="primary"
                      sx={{ fontWeight: 'bold' }}
                    />
                  ))}
                </Box>
              </Box>

              {/* ID de Usuario */}
              <Box>
                <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom>
                  ID de Usuario
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Typography 
                    variant="body1" 
                    sx={{ fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all' }}
                  >
                    {user.id}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Seguridad 2FA */}
        <Card elevation={2}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <SecurityIcon color="primary" />
              <Typography variant="h5" fontWeight="bold">
                Autenticación de Dos Factores (2FA)
              </Typography>
            </Box>

            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                bgcolor: 'action.hover',
                borderColor: user.isTwoFactorEnabled ? 'success.main' : 'warning.main',
                borderWidth: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {user.isTwoFactorEnabled ? (
                    <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                  ) : (
                    <CancelIcon color="warning" sx={{ fontSize: 40 }} />
                  )}
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Estado: {user.isTwoFactorEnabled ? 'Activado' : 'Desactivado'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.isTwoFactorEnabled 
                        ? 'Tu cuenta está protegida con 2FA' 
                        : 'Protege tu cuenta activando 2FA'
                      }
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant={user.isTwoFactorEnabled ? "outlined" : "contained"} 
                  color={user.isTwoFactorEnabled ? "error" : "primary"}
                  // Aquí conectarás la lógica real de activar/desactivar más adelante
                  disabled
                >
                  {user.isTwoFactorEnabled ? 'Desactivar' : 'Activar'}
                </Button>
              </Box>
            </Paper>

            {!user.isTwoFactorEnabled && (
              <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  Recomendamos activar la autenticación de dos factores
                </Typography>
                <Typography variant="caption">
                  La autenticación de dos factores añade una capa extra de seguridad a tu cuenta, 
                  requiriendo un código adicional además de tu contraseña.
                </Typography>
              </Alert>
            )}

            {/* Placeholder para futura implementación */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                💡 Funcionalidad de configuración 2FA disponible próximamente
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        {/* Cambiar Contraseña */}
        <Card elevation={2}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LockIcon color="primary" />
              <Typography variant="h5" fontWeight="bold">
                Cambiar Contraseña
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Actualiza tu contraseña regularmente para mantener tu cuenta segura
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              disabled
              startIcon={<LockIcon />}
            >
              Cambiar Contraseña
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Próximamente disponible
            </Typography>
          </CardContent>
        </Card>

        {/* Zona de Peligro */}
        <Card 
          elevation={2} 
          sx={{ 
            border: 2, 
            borderColor: 'error.main',
            bgcolor: 'error.50'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WarningAmberIcon color="error" />
              <Typography variant="h5" fontWeight="bold" color="error.main">
                Zona de Peligro
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Eliminar Cuenta
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de querer hacerlo.
              </Typography>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight="bold">
                  ⚠️ Esta acción es permanente e irreversible
                </Typography>
              </Alert>
              <Button 
                variant="contained" 
                color="error"
                disabled
                startIcon={<DeleteForeverIcon />}
              >
                Eliminar Cuenta
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}