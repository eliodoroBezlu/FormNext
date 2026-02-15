// components/auth/RegisterForm.tsx - Formulario de Registro con Material-UI

'use client'

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { registerAction } from '@/app/actions/auth';

export default function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerAction(formData);

      if (result.success) {
        setSuccess(result.message || 'Usuario registrado exitosamente');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(result.error || 'Error al registrar usuario');
      }
    });
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
          <PersonAddIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
          Crear Cuenta
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Únete a nuestra plataforma
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>¡Éxito!</AlertTitle>
          {success}
        </Alert>
      )}

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Username */}
        <Box>
          <TextField
            fullWidth
            label="Username"
            name="username"
            required
            disabled={isPending}
            inputProps={{
              minLength: 3,
              maxLength: 30,
              pattern: '[a-zA-Z0-9_-]+'
            }}
            placeholder="usuario123"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Solo letras, números, guiones y guiones bajos (3-30 caracteres)
          </Typography>
        </Box>

        {/* Email */}
        <Box>
          <TextField
            fullWidth
            type="email"
            label="Email"
            name="email"
            disabled={isPending}
            placeholder="email@ejemplo.com"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Opcional
          </Typography>
        </Box>

        {/* Full Name */}
        <Box>
          <TextField
            fullWidth
            label="Nombre Completo"
            name="fullName"
            disabled={isPending}
            placeholder="Juan Pérez"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Opcional
          </Typography>
        </Box>

        {/* Password */}
        <Box>
          <TextField
            fullWidth
            type="password"
            label="Contraseña"
            name="password"
            required
            disabled={isPending}
            inputProps={{
              minLength: 8
            }}
            placeholder="••••••••"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Mínimo 8 caracteres, incluye mayúsculas, minúsculas, números y símbolos
          </Typography>
        </Box>

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
              Registrando...
            </Box>
          ) : (
            'Registrarse'
          )}
        </Button>
      </Box>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" passHref>
            <Typography 
              component="span" 
              variant="body2" 
              color="primary"
              sx={{ 
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Inicia sesión
            </Typography>
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
}