// components/Setup2FASection.tsx - Sección de configuración 2FA con Material-UI

'use client'

import { useState } from 'react';
import { 
  Box, 
  Card,
  CardContent,
  Button, 
  Typography, 
  Alert,
  AlertTitle,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Shield as ShieldIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import Setup2FAModal from './Setup2famodal';
import Disable2FAModal from './Disable2famodal ';

interface User {
  id: string;
  username: string;
  email?: string;
  isTwoFactorEnabled: boolean;
}

interface Props {
  user: User;
}

export default function Setup2FASection({ user }: Props) {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);

  return (
    <>
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <SecurityIcon color="primary" />
            <Typography variant="h5" fontWeight="bold">
              Autenticación de Dos Factores (2FA)
            </Typography>
          </Box>

          {/* Estado y Descripción */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 3, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Estado de 2FA
                </Typography>
                <Chip
                  icon={user.isTwoFactorEnabled ? <CheckCircleIcon /> : <CancelIcon />}
                  label={user.isTwoFactorEnabled ? 'Activado' : 'Desactivado'}
                  color={user.isTwoFactorEnabled ? 'success' : 'default'}
                  variant={user.isTwoFactorEnabled ? 'filled' : 'outlined'}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {user.isTwoFactorEnabled
                  ? 'La autenticación de dos factores está activa. Tu cuenta está protegida con una capa adicional de seguridad.'
                  : 'Agrega una capa adicional de seguridad a tu cuenta. Necesitarás un código temporal además de tu contraseña para iniciar sesión.'}
              </Typography>
            </Box>

            {/* Botón de Acción */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              {user.isTwoFactorEnabled ? (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setShowDisableModal(true)}
                  sx={{ minWidth: 140 }}
                >
                  Desactivar 2FA
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setShowSetupModal(true)}
                  sx={{
                    minWidth: 140,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a4193 100%)',
                    }
                  }}
                >
                  Activar 2FA
                </Button>
              )}
            </Box>
          </Box>

          {/* Información cuando está desactivado */}
          {!user.isTwoFactorEnabled && (
            <Alert severity="info" icon={<ShieldIcon />} sx={{ mb: 0 }}>
              <AlertTitle>¿Por qué activar 2FA?</AlertTitle>
              <List dense sx={{ mt: 1 }}>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2">
                        <strong>Protección contra robo de contraseñas:</strong> Incluso si alguien conoce tu contraseña, no podrá acceder sin el código 2FA
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2">
                        <strong>Compatible con apps populares:</strong> Google Authenticator, Authy, Microsoft Authenticator y más
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2">
                        <strong>Códigos de respaldo:</strong> Recibirás códigos de emergencia por si pierdes acceso a tu dispositivo
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2">
                        <strong>Fácil de configurar:</strong> Solo toma 2 minutos escanear un código QR
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </Alert>
          )}

          {/* Info cuando está activado */}
          {user.isTwoFactorEnabled && (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              <AlertTitle>Tu cuenta está protegida</AlertTitle>
              <Typography variant="body2">
                Necesitarás tu contraseña y un código temporal de tu app de autenticación para iniciar sesión.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      <Setup2FAModal 
        open={showSetupModal} 
        onClose={() => setShowSetupModal(false)} 
      />

      <Disable2FAModal 
        open={showDisableModal} 
        onClose={() => setShowDisableModal(false)} 
      />
    </>
  );
}