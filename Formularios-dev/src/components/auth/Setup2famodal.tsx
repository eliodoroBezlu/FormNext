// components/Setup2FAModal.tsx - Modal para configurar 2FA con Material-UI

'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Dialog,
  DialogContent,
  DialogTitle,
  TextField, 
  Button, 
  Typography, 
  Alert,
  AlertTitle,
  Paper,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  CircularProgress,
  Chip,
} from '@mui/material';
import { 
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { api } from '@/lib/api';
import Image from 'next/image';
import { getErrorMessage } from '@/lib/utils/error-handler';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = 'loading' | 'qr' | 'verify' | 'success';

export default function Setup2FAModal({ open, onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('loading');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setup2FA();
    }
  }, [open]);

  async function setup2FA() {
    try {
      const data = await api.setup2FA();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep('qr');
    } catch (error) {
      setError(getErrorMessage(error) || 'Error al configurar 2FA');
      setStep('qr');
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.enable2FA(code);
      setBackupCodes(data.backupCodes);
      setStep('success');
    } catch (error) {
      setError(getErrorMessage(error) || 'Código inválido');
    } finally {
      setLoading(false);
    }
  }

  function handleComplete() {
    router.refresh();
    onClose();
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function downloadBackupCodes() {
    const content = `CÓDIGOS DE RESPALDO 2FA\n${'='.repeat(40)}\n\n${backupCodes.join('\n')}\n\n⚠️ IMPORTANTE: Guarda estos códigos en un lugar seguro.\nCada código solo puede usarse una vez.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-2fa-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const steps = ['Escanear QR', 'Verificar Código', 'Códigos de Respaldo'];
  const activeStep = step === 'qr' ? 0 : step === 'verify' ? 1 : 2;

  return (
    <Dialog 
      open={open} 
      onClose={step === 'success' ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Configurar 2FA
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Agrega una capa extra de seguridad
            </Typography>
          </Box>
          {step !== 'success' && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Stepper */}
        {step !== 'loading' && (
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {/* Loading */}
        {step === 'loading' && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress size={60} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
              Generando código QR...
            </Typography>
          </Box>
        )}

        {/* Paso 1: Escanear QR */}
        {step === 'qr' && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Paso 1: Escanea el código QR</AlertTitle>
              Usa Google Authenticator, Authy, Microsoft Authenticator o cualquier app compatible con TOTP
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, mb: 3 }}>
              {qrCode && (
                <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                  <Image
                    src={qrCode}
                    alt="QR Code para 2FA"
                    width={240}
                    height={240}
                    priority
                  />
                </Paper>
              )}

              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" color="text.secondary" textAlign="center" gutterBottom>
                  O ingresa este código manualmente:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      flex: 1, 
                      p: 1.5, 
                      textAlign: 'center',
                      bgcolor: 'action.hover'
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      fontFamily="monospace" 
                      fontWeight="bold"
                    >
                      {secret}
                    </Typography>
                  </Paper>
                  <IconButton 
                    onClick={() => copyToClipboard(secret)}
                    color="primary"
                    size="small"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={() => setStep('verify')}
                size="large"
              >
                Continuar →
              </Button>
            </Box>
          </Box>
        )}

        {/* Paso 2: Verificar Código */}
        {step === 'verify' && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Paso 2: Verifica el código</AlertTitle>
              Ingresa el código de 6 dígitos que aparece en tu app
            </Alert>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleVerify} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Código de Verificación"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                inputProps={{ 
                  maxLength: 6,
                  style: { 
                    textAlign: 'center', 
                    fontSize: '2rem',
                    letterSpacing: '0.5rem',
                    fontWeight: 'bold',
                    fontFamily: 'monospace'
                  }
                }}
                placeholder="000000"
                autoFocus
                disabled={loading}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setStep('qr')}
                  disabled={loading}
                  fullWidth
                >
                  ← Atrás
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || code.length !== 6}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Verificar'}
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {/* Paso 3: Éxito y Códigos de Respaldo */}
        {step === 'success' && (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                ¡2FA Activado Exitosamente!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tu cuenta ahora está más protegida
              </Typography>
            </Box>

            <Alert severity="warning" sx={{ mb: 3 }}>
              <AlertTitle>Códigos de Respaldo de Emergencia</AlertTitle>
              Guarda estos códigos en un lugar seguro. Cada uno puede usarse <strong>una sola vez</strong> si pierdes acceso a tu dispositivo.
            </Alert>

            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {backupCodes.map((backupCode, index) => (
                  <Chip
                    key={index}
                    label={`${index + 1}. ${backupCode}`}
                    variant="outlined"
                    sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                  />
                ))}
              </Box>
            </Paper>

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                fullWidth
              >
                Copiar
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadBackupCodes}
                fullWidth
              >
                Descargar
              </Button>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleComplete}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                }
              }}
            >
              ¡Entendido, Finalizar! ✓
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}