'use client';

import React from 'react';
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

import { useQrGenerator } from '@/components/features/qr-generator/application/hooks/useQrGenerator';

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
  const {
    url,
    setUrl,
    qrCodeUrl,
    error,
    isPending,
    snackbarOpen,
    snackbarMessage,
    closeSnackbar,
    handleGenerateQR,
    handleDownloadPNG,
    handleDownloadSVG,
    handleViewImage,
    copyQRToClipboard,
  } = useQrGenerator();

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
                      boxShadow: 'none',
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
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        message={snackbarMessage}
      />
    </Container>
  );
}
