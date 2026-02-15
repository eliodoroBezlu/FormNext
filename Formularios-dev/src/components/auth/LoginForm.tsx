// components/auth/LoginForm.tsx - Formulario de Login con Material-UI

'use client'

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
//import Link from 'next/link';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  AlertTitle,
  CircularProgress,
  Avatar
} from '@mui/material';
import { 
  Login as LoginIcon,
  Person as PersonIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { loginAction } from '@/app/actions/auth';
import Verify2FAForm from './Verify2faform';

interface LoginResult {
  success: boolean;
  error?: string;
  data?: {
    requires2FA: boolean;
    tempToken: string;
  };
}

export default function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState<string>('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData) as LoginResult;

      if (result.success) {
        if (result.data?.requires2FA) {
          setRequires2FA(true);
          setTempToken(result.data.tempToken);
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    });
  }

  // Si requiere 2FA, mostrar formulario de verificación
  if (requires2FA) {
    return <Verify2FAForm tempToken={tempToken} />;
  }

  return (
    <Paper 
      elevation={6} 
      sx={{ 
        width: '100%', 
        maxWidth: 480, 
        mx: 'auto',
        p: 4,
        borderRadius: 3
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar 
          sx={{ 
            width: 64, 
            height: 64, 
            mx: 'auto', 
            mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <LoginIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
          Bienvenido
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Inicia sesión en tu cuenta
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Username */}
        <TextField
          fullWidth
          label="Username"
          name="username"
          required
          autoComplete="username"
          disabled={isPending}
          InputProps={{
            startAdornment: (
              <PersonIcon sx={{ color: 'action.active', mr: 1 }} />
            ),
          }}
          placeholder="usuario123"
        />

        {/* Password */}
        <TextField
          fullWidth
          type="password"
          label="Contraseña"
          name="password"
          required
          autoComplete="current-password"
          disabled={isPending}
          InputProps={{
            startAdornment: (
              <LockIcon sx={{ color: 'action.active', mr: 1 }} />
            ),
          }}
          placeholder="••••••••"
        />

        {/* Remember & Forgot Password */}
        {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={<Checkbox size="small" />}
            label={<Typography variant="body2">Recordarme</Typography>}
          />
          <Link href="#" passHref>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ 
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              ¿Olvidaste tu contraseña?
            </Typography>
          </Link>
        </Box> */}

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isPending}
          sx={{
            py: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a4193 100%)',
            },
            fontWeight: 600,
            fontSize: '1rem'
          }}
        >
          {isPending ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              Iniciando sesión...
            </Box>
          ) : (
            'Iniciar Sesión'
          )}
        </Button>
      </Box>

      {/* Divider */}
      {/* <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          O
        </Typography>
      </Divider> */}

      {/* Footer */}
      {/* <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          ¿No tienes cuenta?{' '}
          <Link href="/register" passHref>
            <Typography 
              component="span" 
              variant="body2" 
              color="primary"
              sx={{ 
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Regístrate gratis
            </Typography>
          </Link>
        </Typography>
      </Box> */}
    </Paper>
  );
}