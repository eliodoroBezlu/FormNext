'use client';

import React, { useState, useTransition } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Divider,
  Tooltip,
  Fab,
  Snackbar,
  Container
} from '@mui/material';
import {
  QrCode,
  Download,
  Visibility,
  ContentCopy,
  FileDownload,
  Link as LinkIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import { QRGenerateRequest } from '@/types/formTypes';
import { generarCodigoQR, obtenerUrlImagenQR, obtenerUrlSvgQR, validarUrl } from '@/app/actions/inspeccion';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 500,
  margin: '0 auto',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
}));

const QRImageContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  background: 'linear-gradient(45deg, #f0f0f0 0%, #ffffff 100%)',
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)',
    pointerEvents: 'none',
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  }
}));

interface QRGeneratorClientProps {
  className?: string;
}

export default function QRGeneratorClient({ className = '' }: QRGeneratorClientProps) {
  const [url, setUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleGenerateQR = () => {
    if (!url.trim()) {
      setError('Por favor ingresa una URL válida');
      return;
    }

    startTransition(async () => {
      try {
        setError('');
        
        // Validar URL primero
        const validacion = await validarUrl(url);
        if (!validacion.valida) {
          setError(validacion.mensaje || 'URL inválida');
          return;
        }

        // Generar QR
        const request: QRGenerateRequest = {
          text: url,
          width: 256,
          margin: 2,
          errorCorrectionLevel: 'M'
        };

        const response = await generarCodigoQR(request);
        
        if (response.success) {
          setQrCodeUrl(response.data.qrCode);
          showSnackbar('¡Código QR generado exitosamente!');
        } else {
          setError('Error al generar el código QR');
        }
      } catch (err) {
        setError('Error al conectar con el servidor');
        console.error('Error generating QR:', err);
      }
    });
  };

  const handleDownloadPNG = async () => {
    if (!url.trim()) return;

    try {
      const { url: imageUrl } = await obtenerUrlImagenQR(url, { width: 512, margin: 2 });
      
      // Fetch the image as blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      
      showSnackbar('Imagen PNG descargada');
    } catch (err) {
      console.error('Error downloading PNG:', err);
      setError('Error al descargar la imagen');
    }
  };

  const handleDownloadSVG = async () => {
    if (!url.trim()) return;

    try {
      const { url: svgUrl } = await obtenerUrlSvgQR(url, { width: 512 });
      
      // Fetch the SVG as blob
      const response = await fetch(svgUrl);
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `qr-code-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      
      showSnackbar('Archivo SVG descargado');
    } catch (err) {
      console.error('Error downloading SVG:', err);
      setError('Error al descargar el SVG');
    }
  };

  const handleViewImage = async () => {
    if (!url.trim()) return;

    try {
      const { url: imageUrl } = await obtenerUrlImagenQR(url, { width: 512, margin: 2 });
      window.open(imageUrl, '_blank');
    } catch (err) {
      console.error('Error viewing image:', err);
      setError('Error al abrir la imagen');
    }
  };
const copyQRToClipboard = async () => {
    if (!qrCodeUrl) return;

    try {
      // Función helper para convertir data URL a blob
      const dataURLToBlob = (dataURL: string): Blob => {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      };

      // Verificar si el navegador soporta la API de portapapeles
      if (!navigator.clipboard || !window.ClipboardItem) {
        throw new Error('API de portapapeles no soportada');
      }

      // Convertir data URL a blob
      const blob = dataURLToBlob(qrCodeUrl);
      
      // Copiar al portapapeles
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      showSnackbar('¡Código QR copiado al portapapeles!');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      
      // Fallback: Mostrar instrucciones al usuario
      if (err instanceof Error && err.message.includes('not supported')) {
        setError('Tu navegador no soporta copiar imágenes. Usa el botón de descarga.');
      } else {
        setError('Error al copiar. Intenta hacer clic derecho en la imagen y seleccionar "Copiar imagen".');
      }
    }
  };

  return (
    <Container maxWidth="sm" className={className}>
      <Box sx={{ py: 4 }}>
        <StyledCard elevation={0}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <QrCode sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
                Generador de Códigos QR
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Convierte cualquier URL en un código QR de alta calidad
              </Typography>
            </Box>

            {/* Input Section */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="URL o Enlace"
                placeholder="https://ejemplo.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerateQR()}
                disabled={isPending}
                variant="outlined"
                InputProps={{
                  startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderWidth: 2,
                    }
                  }
                }}
              />
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Action Buttons */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{xs:6}}>
                <ActionButton
                  fullWidth
                  variant="contained"
                  onClick={handleGenerateQR}
                  disabled={isPending || !url.trim()}
                  startIcon={isPending ? <CircularProgress size={18} /> : <QrCode />}
                  size="large"
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #1BA8CB 90%)',
                    }
                  }}
                >
                  {isPending ? 'Generando...' : 'Generar QR'}
                </ActionButton>
              </Grid>
              <Grid size={{xs:6}}>
                <ActionButton
                  fullWidth
                  variant="outlined"
                  onClick={handleViewImage}
                  disabled={!url.trim()}
                  startIcon={<Visibility />}
                  size="large"
                  sx={{
                    borderColor: 'success.main',
                    color: 'success.main',
                    '&:hover': {
                      borderColor: 'success.dark',
                      backgroundColor: 'success.main',
                      color: 'white',
                    }
                  }}
                >
                  Ver Imagen
                </ActionButton>
              </Grid>
            </Grid>

            {/* QR Code Display */}
            {qrCodeUrl && (
              <Box>
                <Divider sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tu código QR
                  </Typography>
                </Divider>
                
                <QRImageContainer elevation={1}>
                  <img 
                    src={qrCodeUrl} 
                    alt="Código QR generado" 
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto',
                      position: 'relative',
                      zIndex: 1,
                      borderRadius: 8
                    }}
                  />
                </QRImageContainer>

                {/* Download Actions */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
                    Descargar o Compartir
                  </Typography>
                  <Grid container spacing={1} justifyContent="center">
                    <Grid size={{}}>
                      <Tooltip title="Descargar PNG">
                        <Fab
                          size="medium"
                          onClick={handleDownloadPNG}
                          sx={{
                            background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
                            color: 'white',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #7B1FA2 30%, #C2185B 90%)',
                              transform: 'scale(1.1)',
                            }
                          }}
                        >
                          <Download />
                        </Fab>
                      </Tooltip>
                    </Grid>
                    <Grid size={{}}>
                      <Tooltip title="Descargar SVG">
                        <Fab
                          size="medium"
                          onClick={handleDownloadSVG}
                          sx={{
                            background: 'linear-gradient(45deg, #FF9800 30%, #F57C00 90%)',
                            color: 'white',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #F57C00 30%, #E65100 90%)',
                              transform: 'scale(1.1)',
                            }
                          }}
                        >
                          <FileDownload />
                        </Fab>
                      </Tooltip>
                    </Grid>
                    <Grid size={{}}>
                      <Tooltip title="Copiar al portapapeles">
                        <Fab
                          size="medium"
                          onClick={copyQRToClipboard}
                          sx={{
                            background: 'linear-gradient(45deg, #607D8B 30%, #455A64 90%)',
                            color: 'white',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #455A64 30%, #37474F 90%)',
                              transform: 'scale(1.1)',
                            }
                          }}
                        >
                          <ContentCopy />
                        </Fab>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
          </CardContent>
        </StyledCard>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          sx={{
            '& .MuiSnackbarContent-root': {
              backgroundColor: 'success.main',
              borderRadius: 2,
            }
          }}
        />
      </Box>
    </Container>
  );
}

// Hook personalizado para usar las server actions
export function useQRGenerator() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');

  const generateQR = (request: QRGenerateRequest) => {
    return new Promise((resolve, reject) => {
      startTransition(async () => {
        try {
          setError('');
          const response = await generarCodigoQR(request);
          resolve(response);
        } catch (err) {
          setError('Error al generar QR');
          reject(err);
        }
      });
    });
  };

  const validateUrl = async (url: string) => {
    try {
      setError('');
      return await validarUrl(url);
    } catch (err) {
      setError('Error al validar URL');
      throw err;
    }
  };

  return {
    generateQR,
    validateUrl,
    isPending,
    error,
    clearError: () => setError('')
  };
}