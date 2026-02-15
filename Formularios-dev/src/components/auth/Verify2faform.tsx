// components/auth/Verify2FAForm.tsx - Verificación de código 2FA con Material-UI

'use client'

import { useState, useTransition, useRef, useEffect } from 'react';
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
  Avatar
} from '@mui/material';
import { 
  LockOpen as LockOpenIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { verify2FAAction } from '@/app/actions/auth';

interface Props {
  tempToken: string;
}

export default function Verify2FAForm({ tempToken }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    const newCode = [...code];

    for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
      newCode[i] = pastedData[i];
    }

    setCode(newCode);
    
    const nextEmpty = newCode.findIndex(c => !c);
    const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
    inputRefs.current[focusIndex]?.focus();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    startTransition(async () => {
      const result = await verify2FAAction(tempToken, fullCode);

      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(result.error || 'Código inválido');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
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
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
          }}
        >
          <LockOpenIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
          Verificación 2FA
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ingresa el código de 6 dígitos desde tu aplicación de autenticación
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
        {/* Code Inputs */}
        <Box>
          <Typography 
            variant="body2" 
            fontWeight={600} 
            color="text.secondary" 
            sx={{ mb: 2, textAlign: 'center' }}
          >
            Código de Verificación
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            {code.map((digit, index) => (
              <TextField
                key={index}
                inputRef={(el) => {
                  inputRefs.current[index] = el;
                }}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isPending}
                inputProps={{
                  maxLength: 1,
                  inputMode: 'numeric',
                  autoComplete: 'off',
                  style: { 
                    textAlign: 'center', 
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    padding: '12px'
                  }
                }}
                sx={{
                  width: 56,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderWidth: 2,
                      borderColor: 'primary.main'
                    }
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isPending || code.some(d => !d)}
          sx={{
            py: 1.5,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            },
            fontWeight: 600,
            fontSize: '1rem'
          }}
        >
          {isPending ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              Verificando...
            </Box>
          ) : (
            'Verificar Código'
          )}
        </Button>
      </Box>

      {/* Help Alert */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 3 }}>
        <AlertTitle>¿Problemas para acceder?</AlertTitle>
        <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.5 } }}>
          <li>
            <Typography variant="caption">
              Verifica que el código no haya expirado (30 segundos)
            </Typography>
          </li>
          <li>
            <Typography variant="caption">
              Asegúrate que la hora del dispositivo esté sincronizada
            </Typography>
          </li>
          <li>
            <Typography variant="caption">
              Usa un código de respaldo si es necesario
            </Typography>
          </li>
        </Box>
      </Alert>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button 
          variant="text" 
          size="small"
          sx={{ fontWeight: 600 }}
        >
          Usar código de respaldo →
        </Button>
      </Box>
    </Paper>
  );
}