// /app/inspeccion/login/page.tsx
// Acceso legacy de inspector técnico (temporal).
// Se eliminará gradualmente cuando todos los trabajadores tengan
// usuario + passkey en IAM Core.
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import { EngineeringOutlined } from '@mui/icons-material';
import { inspectorLoginAction } from '@/app/actions/auth';

export default function InspectorLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleInspectorLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await inspectorLoginAction();

      if (!result?.success) {
        setError(result?.error ?? 'No se pudo iniciar sesión como inspector.');
        setLoading(false);
        return;
      }

      // Cookies ya guardadas por la acción → ir al dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('💥 Error inesperado en login de inspector:', err);
      setError('Error inesperado al iniciar sesión. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'grey.50',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 5 },
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            width: 56, height: 56, mx: 'auto', mb: 2,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1565C0, #42A5F5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <EngineeringOutlined sx={{ color: 'white', fontSize: 30 }} />
        </Box>

        <Typography variant="h5" fontWeight={700} mb={1}>
          Acceso para Inspectores
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Inicia sesión como inspector técnico para registrar inspecciones.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleInspectorLogin}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <EngineeringOutlined />}
          sx={{ py: 1.3 }}
        >
          {loading ? 'Iniciando sesión…' : 'Iniciar sesión como inspector'}
        </Button>
      </Paper>
    </Box>
  );
}
