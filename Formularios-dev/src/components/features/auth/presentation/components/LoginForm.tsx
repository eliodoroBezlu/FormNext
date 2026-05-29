'use client'

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  AlertTitle,
  CircularProgress,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Login as LoginIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { loginAction } from '@/app/actions/auth';
import { inspectorLoginAction } from '@/app/actions/auth';
import Verify2FAForm from './Verify2faForm';

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
  const [isPendingTecnico, startTransitionTecnico] = useTransition();
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

  function handleTecnicoLogin() {
    setError(null);

    startTransitionTecnico(async () => {
      const result = await inspectorLoginAction();

      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(result.error || 'Error al iniciar sesión como técnico');
      }
    });
  }

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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          fullWidth
          label="Username"
          name="username"
          required
          autoComplete="username"
          disabled={isPending || isPendingTecnico}
          InputProps={{
            startAdornment: (
              <PersonIcon sx={{ color: 'action.active', mr: 1 }} />
            ),
          }}
          placeholder="usuario123"
        />

        <TextField
          fullWidth
          type="password"
          label="Contraseña"
          name="password"
          required
          autoComplete="current-password"
          disabled={isPending || isPendingTecnico}
          InputProps={{
            startAdornment: (
              <LockIcon sx={{ color: 'action.active', mr: 1 }} />
            ),
          }}
          placeholder="••••••••"
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isPending || isPendingTecnico}
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

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          o
        </Typography>
      </Divider>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleTecnicoLogin}
        disabled={isPending || isPendingTecnico}
        startIcon={
          isPendingTecnico 
            ? <CircularProgress size={20} color="inherit" /> 
            : <BuildIcon />
        }
        sx={{
          py: 1.5,
          background: 'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #388e3c 0%, #145214 100%)',
          },
          fontWeight: 600,
          fontSize: '1rem'
        }}
      >
        {isPendingTecnico ? 'Iniciando sesión...' : 'Iniciar como Técnico'}
      </Button>
    </Paper>
  );
}
