"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Box, Alert, CircularProgress, Typography, Paper } from "@mui/material";
import { inspectorLoginAction } from "@/app/actions/auth";

// Beneficios con iconos SVG del diseño Claude
const benefits = [
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    ),
    title: "Formularios digitales",
    desc: "Captura en campo desde cualquier dispositivo",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="M22 4L12 14.01l-3-3" />
      </svg>
    ),
    title: "Aprobaciones en tiempo real",
    desc: "Flujo de revisión y firma sin papeles",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 3 3 5-5" />
      </svg>
    ),
    title: "Reportes automáticos",
    desc: "Indicadores y exportaciones",
  },
];

export default function Home() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleInspectorLogin = () => {
    setError(null);

    startTransition(async () => {
      try {
        const result = await inspectorLoginAction();

        if (result?.success) {
          console.log("✅ Inspector autenticado, redirigiendo...");
          router.push("/dashboard");
          router.refresh();
        } else {
          setError(result?.error || "Error al iniciar sesión como inspector");
        }
      } catch (err) {
        console.error("💥 Error inesperado en login de inspector:", err);
        setError("Error inesperado al iniciar sesión. Intenta de nuevo.");
      }
    });
  };

  const handleAccountLogin = () => {
    const redirect = new URLSearchParams(window.location.search).get(
      "redirect",
    );
    window.location.href = redirect
      ? `/api/auth/login?redirect=${encodeURIComponent(redirect)}`
      : "/api/auth/login";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        overflow: "hidden",
      }}
    >
      {/* Columna Izquierda: Branding y Beneficios (58%) */}
      <Box
        sx={{
          flex: { xs: "none", md: "0 0 58%" },
          background:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,.13) 1px, transparent 0) 0 0/26px 26px, linear-gradient(135deg,#4F46E5 0%,#6366F1 60%,#7C3AED 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: { xs: 4, sm: 6, md: 9 }, // padding 72px is 9 (9 * 8px = 72px)
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Círculos flotantes desenfocados */}
        <Box
          sx={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(255,255,255,.06)",
            top: -120,
            right: -100,
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(34,211,238,.12)",
            bottom: -90,
            left: -60,
            pointerEvents: "none",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 6 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                background: "rgba(255,255,255,.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(6px)",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </Box>
            <Typography
              component="span"
              sx={{
                fontSize: "15px",
                fontWeight: 600,
                letterSpacing: ".04em",
                opacity: 0.9,
              }}
            >
              Sync Fromularios
            </Typography>
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "32px", md: "42px" },
              lineHeight: 1.12,
              fontWeight: 800,
              letterSpacing: "-.025em",
              m: "0 0 16px",
              maxWidth: 560,
              color: "white",
            }}
          >
            Sistema de Gestión de Formularios
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: "17px",
              lineHeight: 1.6,
              opacity: 0.85,
              m: "0 0 48px",
              maxWidth: 480,
            }}
          >
            Gestión digital de inspecciones.
          </Typography>

          {/* Listado de Beneficios */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "22px",
              maxWidth: 440,
            }}
          >
            {benefits.map((benefit, i) => (
              <Box
                key={i}
                sx={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    background: "rgba(255,255,255,.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 auto",
                  }}
                >
                  {benefit.icon}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: "16px",
                      color: "white",
                      lineHeight: 1.2,
                    }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography
                    sx={{
                      opacity: 0.7,
                      fontSize: "14px",
                      color: "white",
                      mt: 0.5,
                    }}
                  >
                    {benefit.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Columna Derecha: Acceso (42%) */}
      <Box
        sx={{
          flex: 1,
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 6,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 380 }} className="fade-in">
          <Typography
            variant="h2"
            sx={{
              fontSize: "26px",
              fontWeight: 700,
              color: "text.primary",
              m: "0 0 6px",
            }}
          >
            Bienvenido
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: "14px", color: "text.secondary", m: "0 0 30px" }}
          >
            Seleccione su método de acceso
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Opción 1: Inspector Técnico */}
            <Paper
              onClick={!isPending ? handleInspectorLogin : undefined}
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderLeft: "4px solid #10B981", // verde success
                borderRadius: "16px",
                p: "20px 22px",
                cursor: isPending ? "not-allowed" : "pointer",
                boxShadow: "var(--shadow-sm)",
                transition: "all .18s ease-in-out",
                opacity: isPending ? 0.7 : 1,
                "&:hover": isPending
                  ? {}
                  : {
                      transform: "translateY(-2px)",
                      boxShadow: "var(--shadow-lg)",
                      borderColor: "divider",
                    },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  bgcolor: "rgba(16,185,129,.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 auto",
                }}
              >
                {isPending ? (
                  <CircularProgress size={24} color="success" />
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "16px",
                    color: "text.primary",
                  }}
                >
                  Inspector Técnico
                </Typography>
                <Typography
                  sx={{ fontSize: "13px", color: "text.secondary", mt: "2px" }}
                >
                  Acceso directo sin credenciales
                </Typography>
              </Box>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                style={{ color: "var(--text3, #94a3b8)" }}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Paper>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                my: "18px",
              }}
            >
              <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
              <Typography
                component="span"
                sx={{ fontSize: "13px", color: "text.secondary" }}
              >
                o
              </Typography>
              <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
            </Box>

            {/* Opción 2: Cuenta Personal */}
            <Paper
              onClick={!isPending ? handleAccountLogin : undefined}
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderLeft: "4px solid #6366F1", // indigo primary
                borderRadius: "16px",
                p: "20px 22px",
                cursor: isPending ? "not-allowed" : "pointer",
                boxShadow: "var(--shadow-sm)",
                transition: "all .18s ease-in-out",
                opacity: isPending ? 0.7 : 1,
                "&:hover": isPending
                  ? {}
                  : {
                      transform: "translateY(-2px)",
                      boxShadow: "var(--shadow-lg)",
                      borderColor: "divider",
                    },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  bgcolor: "rgba(99,102,241,.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 auto",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="8" cy="15" r="4" />
                  <path d="M10.85 12.15L19 4" />
                  <path d="M18 5l2 2M15 8l2 2" />
                </svg>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "16px",
                    color: "text.primary",
                  }}
                >
                  Cuenta Personal
                </Typography>
                <Typography
                  sx={{ fontSize: "13px", color: "text.secondary", mt: "2px" }}
                >
                  Ingrese con usuario y contraseña
                </Typography>
              </Box>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                style={{ color: "var(--text3, #94a3b8)" }}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Paper>
          </Box>

          <Typography
            sx={{
              fontSize: "12px",
              color: "text.secondary",
              textAlign: "center",
              mt: "30px",
              lineHeigh: 1.6,
            }}
          >
            El acceso de Inspector Técnico es para uso en campo. Para gestión y
            reportes utilice su Cuenta Personal.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
