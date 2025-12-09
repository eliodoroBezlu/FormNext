"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  Fade,
  Zoom,
} from "@mui/material";
import {
  CheckCircle,
  Description,
  Home,
  Visibility,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface SuccessScreenProps {
  title?: string;
  message?: string;
  subtitle?: string;
  showConfetti?: boolean;
  onViewDetails?: () => void;
  onBackToList?: () => void;
  onGoHome?: () => void;
  autoRedirect?: boolean;
  redirectDelay?: number;
  redirectPath?: string;
  detailsLabel?: string;
  listLabel?: string;
  homeLabel?: string;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  title = "¡Formulario Guardado Exitosamente!",
  message = "La inspección se ha registrado correctamente en el sistema.",
  subtitle = "Gracias por completar el formulario.",
  showConfetti = true,
  onViewDetails,
  onBackToList,
  onGoHome,
  autoRedirect = false,
  redirectDelay = 3000,
  redirectPath = "/dashboard",
  detailsLabel = "Ver Detalles",
  listLabel = "Volver al Listado",
  homeLabel = "Ir al Dashboard",
}) => {
  const router = useRouter();
  // Convertimos ms a segundos para el contador visual
  const [countdown, setCountdown] = useState(Math.ceil(redirectDelay / 1000));
  const [show, setShow] = useState(false);

  // Animación de entrada
  useEffect(() => {
    setShow(true);
  }, []);

  // 🔥 1. EFECTO DEL TEMPORIZADOR (Solo baja el contador)
  useEffect(() => {
    if (autoRedirect && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [autoRedirect, countdown]);

  // 🔥 2. EFECTO DE REDIRECCIÓN (Solo navega cuando llega a 0)
  useEffect(() => {
    if (autoRedirect && countdown === 0) {
      // Hacemos el push aquí, fuera del ciclo de renderizado del estado
      router.push(redirectPath);
    }
  }, [autoRedirect, countdown, redirectPath, router]);

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    }
  };

  const handleBackToList = () => {
    if (onBackToList) {
      onBackToList();
    } else {
      router.push("/dashboard/formularios-de-inspeccion");
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Fade in={show} timeout={800}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(135deg, #667eea 0%, #4b57a2ff 100%)",
            color: "white",
          }}
        >
          {/* Decoración de fondo */}
          {showConfetti && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                background: `
                  radial-gradient(circle at 20% 50%, white 2px, transparent 2px),
                  radial-gradient(circle at 80% 80%, white 2px, transparent 2px),
                  radial-gradient(circle at 40% 20%, white 1px, transparent 1px),
                  radial-gradient(circle at 90% 30%, white 1px, transparent 1px),
                  radial-gradient(circle at 60% 90%, white 2px, transparent 2px),
                  radial-gradient(circle at 10% 80%, white 1px, transparent 1px)
                `,
                backgroundSize: "100% 100%",
              }}
            />
          )}

          {/* Contenido principal */}
          <Zoom in={show} timeout={1000} style={{ transitionDelay: "200ms" }}>
            <Box sx={{ position: "relative", zIndex: 1 }}>
              {/* Icono de éxito */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: { xs: 100, md: 120 },
                  height: { xs: 100, md: 120 },
                  borderRadius: "50%",
                  bgcolor: "white",
                  mb: 3,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                }}
              >
                <CheckCircle
                  sx={{
                    fontSize: { xs: 60, md: 80 },
                    color: "#4caf50",
                  }}
                />
              </Box>

              {/* Título */}
              <Typography
                variant="h3"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.75rem", md: "2.5rem" },
                  textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                {title}
              </Typography>

              {/* Mensaje principal */}
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontSize: { xs: "1rem", md: "1.25rem" },
                  opacity: 0.95,
                }}
              >
                {message}
              </Typography>

              {/* Subtítulo */}
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  opacity: 0.85,
                  fontSize: { xs: "0.875rem", md: "1rem" },
                }}
              >
                {subtitle}
              </Typography>

              {/* Countdown para auto-redirect */}
              {autoRedirect && (
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: "rgba(255,255,255,0.2)",
                    borderRadius: 2,
                    backdropFilter: "blur(10px)",
                    display: "inline-block",
                  }}
                >
                  <Typography variant="body2">
                    Redirigiendo en <strong>{countdown}</strong> segundo
                    {countdown !== 1 ? "s" : ""}...
                  </Typography>
                </Box>
              )}

              {/* Botones de acción */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  justifyContent: "center",
                  mt: 4,
                }}
              >
                {onViewDetails && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Visibility />}
                    onClick={handleViewDetails}
                    sx={{
                      bgcolor: "white",
                      color: "primary.main",
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: { xs: "0.875rem", md: "1rem" },
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.9)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {detailsLabel}
                  </Button>
                )}

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Description />}
                  onClick={handleBackToList}
                  sx={{
                    borderColor: "white",
                    color: "white",
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,0.1)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {listLabel}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Home />}
                  onClick={handleGoHome}
                  sx={{
                    borderColor: "white",
                    color: "white",
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,0.1)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {homeLabel}
                </Button>
              </Box>
            </Box>
          </Zoom>
        </Paper>
      </Fade>
    </Container>
  );
};