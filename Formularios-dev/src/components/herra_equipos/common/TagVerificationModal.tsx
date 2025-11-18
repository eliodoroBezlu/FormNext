
"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Check, Info } from '@mui/icons-material';
import { checkEquipmentStatus } from '@/lib/actions/equipment-tracking';

interface TagVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerified: (result: {
    equipmentId: string;
    openForm: string;
    shouldRedirect: boolean;
    trackingData?: any;
  }) => void;
  templateCode: string;
  formName: string;
}

export function TagVerificationModal({
  open,
  onClose,
  onVerified,
  templateCode,
  formName,
}: TagVerificationModalProps) {
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleVerify = async () => {
    if (!tag.trim()) {
      setError('Por favor ingrese el TAG del equipo');
      return;
    }

    setLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      console.log("🔄 Verificando TAG:", tag.trim(), "para form:", templateCode);
      
      const result = await checkEquipmentStatus(tag.trim(), templateCode);

      console.log("📨 Resultado de verificación:", result);

      if (!result.success) {
        throw new Error(result.error || 'Error al verificar el equipo');
      }

      if (!result.data) {
        throw new Error('No se recibieron datos del servidor');
      }

      // ✅ SI HAY REDIRECCIÓN, cerrar modal y redirigir inmediatamente
      if (result.data.shouldRedirect) {
        console.log(`🔄 REDIRECCIÓN DETECTADA: ${templateCode} → ${result.data.openForm}`);
        
        onClose(); // Cerrar modal
        
        onVerified({
          equipmentId: tag.trim(),
          openForm: result.data.openForm,
          shouldRedirect: true,
          trackingData: result.data.trackingData,
        });
        
        return; // Salir sin mostrar resultado
      }

      // ✅ SIN REDIRECCIÓN, mostrar resultado en el modal
      console.log("✅ Sin redirección - mostrar resultado");
      setVerificationResult(result.data);

    } catch (err) {
      console.error('❌ Error en verificación:', err);
      setError(err instanceof Error ? err.message : 'Error al verificar el equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!verificationResult) return;

    onVerified({
      equipmentId: tag.trim(),
      openForm: verificationResult.openForm,
      shouldRedirect: false,
      trackingData: verificationResult.trackingData,
    });

    // Reset modal
    setTag('');
    setVerificationResult(null);
    setError(null);
  };

  const handleClose = () => {
    setTag('');
    setVerificationResult(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Info color="primary" />
          Verificación de Equipo
        </Box>
        <Typography variant="caption" color="text.secondary">
          {formName}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ingrese el TAG del equipo para verificar el tipo de inspección requerida
        </Typography>

        <TextField
          label="TAG del Equipo"
          value={tag}
          onChange={(e) => setTag(e.target.value.toUpperCase())}
          fullWidth
          disabled={loading || !!verificationResult}
          placeholder="Ej: TECLE-001"
          sx={{ mb: 2 }}
          autoFocus
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !verificationResult) {
              handleVerify();
            }
          }}
        />

        {loading && (
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Verificando equipo...</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {verificationResult && (
          <Box>
            <Alert 
              severity={
                verificationResult.message.includes('FRECUENTE') ? "warning" : "success"
              }
              sx={{ mb: 2 }}
            >
              {verificationResult.message}
            </Alert>

            {verificationResult.trackingData && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  📊 Estado del Equipo:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip 
                    label={`Pre-usos: ${verificationResult.trackingData.preUsoCount || 0}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip 
                    label={`Límite: ${verificationResult.trackingData.usageInterval || 6}`}
                    size="small"
                    variant="outlined"
                  />
                  {verificationResult.trackingData.remainingUses !== undefined && (
                    <Chip 
                      label={`Faltan: ${verificationResult.trackingData.remainingUses}`}
                      size="small"
                      color={
                        verificationResult.trackingData.remainingUses <= 1 ? "warning" : "default"
                      }
                    />
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        
        {!verificationResult ? (
          <Button 
            onClick={handleVerify} 
            variant="contained" 
            disabled={loading || !tag.trim()}
            startIcon={loading ? <CircularProgress size={16} /> : <Check />}
          >
            Verificar
          </Button>
        ) : (
          <Button 
            onClick={handleConfirm} 
            variant="contained" 
            color="primary"
            startIcon={<Check />}
          >
            Continuar con {verificationResult.openForm === '3.04.P37.F25' ? 'Frecuente' : 'Pre-uso'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
