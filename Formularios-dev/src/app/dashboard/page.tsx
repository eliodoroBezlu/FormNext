// app/dashboard/page.tsx - Dashboard Principal Mejorado (SaaS Premium)

"use client";

import { useState, useEffect } from "react";
import {
  Box,
  LinearProgress,
  Typography,
} from "@mui/material";
import { useUserRole } from "@/hooks/useUserRole";
import Link from "next/link";
import { getMeAction } from "../actions/auth";

interface User {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  roles: string[];
  isTwoFactorEnabled: boolean;
}

const serviceItems = [
  {
    id: "inspeccion",
    title: "Nueva Inspección",
    subtitle: "Inspecciones de Seguridad",
    href: "/dashboard/formularios-de-inspeccion",
    color: "#06B6D4",
    roles: ["admin", "supervisor", "tecnico", "superintendente"],
    icon: (
      <svg width="45" height="45" viewBox="0 0 64 64" fill="none">
        <rect x="16" y="8" width="32" height="48" rx="4" fill="rgba(30, 62, 102, 0.04)" stroke="#1e3e66" strokeWidth="2.5" />
        <path d="M26 8v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke="#1e3e66" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="24" y1="20" x2="40" y2="20" stroke="#1e3e66" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="24" y1="28" x2="40" y2="28" stroke="#1e3e66" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="24" y1="36" x2="34" y2="36" stroke="#1e3e66" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 46l4 4 8-8" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "herramientas",
    title: "Herramientas",
    subtitle: "Equipos y Accesorios",
    href: "/dashboard/form-herra-equipos",
    color: "#06B6D4",
    roles: ["admin", "supervisor", "tecnico", "superintendente"],
    icon: (
      <svg width="45" height="45" viewBox="0 0 64 64" fill="none">
        <path d="M42 22l-4.5 4.5m0 0l-12 12a4 4 0 1 1-5.6-5.6l12-12m5.6-5.6L42 22m0 0a6 6 0 0 0-8.5-8.5l-2.5 2.5m11 6l2.5-2.5a6 6 0 0 0-8.5-8.5" stroke="#1e3e66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 42L12 52" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M48 16L24 40" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="46" y="12" width="6" height="8" rx="1" transform="rotate(45 46 12)" fill="rgba(6, 182, 212, 0.1)" stroke="#06B6D4" strokeWidth="2" />
        <path d="M24 40l-4 4" stroke="#64748B" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "planes",
    title: "Planes",
    subtitle: "Acciones Correctivas",
    href: "/dashboard/plan-accion",
    color: "#10B981",
    roles: ["admin", "supervisor", "superintendente"],
    icon: (
      <svg width="45" height="45" viewBox="0 0 64 64" fill="none">
        <rect x="14" y="14" width="36" height="38" rx="4" fill="rgba(16, 185, 129, 0.04)" stroke="#1e3e66" strokeWidth="2.5" />
        <line x1="14" y1="24" x2="50" y2="24" stroke="#1e3e66" strokeWidth="2.5" />
        <line x1="24" y1="10" x2="24" y2="16" stroke="#1e3e66" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="40" y1="10" x2="40" y2="16" stroke="#1e3e66" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="38" r="8" stroke="#1e3e66" strokeWidth="2.5" />
        <circle cx="32" cy="38" r="3" fill="#06b6d4" />
      </svg>
    ),
  },
  {
    id: "pgr",
    title: "PGR",
    subtitle: "Gestión de Riesgos",
    href: "/dashboard/pgr",
    color: "#F59E0B",
    roles: ["admin", "superintendente"],
    icon: (
      <svg width="45" height="45" viewBox="0 0 64 64" fill="none">
        <path d="M32 10s14 4 14 18c0 12-14 24-14 24S18 40 18 28c0-14 14-18 14-18z" fill="rgba(245, 158, 11, 0.04)" stroke="#1e3e66" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M32 20v10" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="36" r="2.5" fill="#06b6d4" />
      </svg>
    ),
  },
  {
    id: "qr",
    title: "Generador QR",
    subtitle: "Códigos de Equipos",
    href: "/dashboard/qr-generator",
    color: "#8B5CF6",
    roles: ["admin", "supervisor", "tecnico", "superintendente"],
    icon: (
      <svg width="45" height="45" viewBox="0 0 64 64" fill="none">
        <rect x="22" y="10" width="20" height="40" rx="3" fill="rgba(139, 92, 246, 0.04)" stroke="#1e3e66" strokeWidth="2.5" />
        <line x1="26" y1="14" x2="38" y2="14" stroke="#1e3e66" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="32" cy="44" r="2" fill="#06b6d4" />
        <rect x="27" y="22" width="10" height="10" stroke="#1e3e66" strokeWidth="2" />
        <rect x="29" y="24" width="6" height="6" fill="#06b6d4" />
      </svg>
    ),
  },
  {
    id: "reportes",
    title: "Métricas",
    subtitle: "Gráficas y Analíticas",
    href: "/dashboard/graphics/emergencyinspections",
    color: "#EC4899",
    roles: ["admin", "superintendente"],
    icon: (
      <svg width="45" height="45" viewBox="0 0 64 64" fill="none">
        <rect x="12" y="12" width="40" height="28" rx="3" fill="rgba(236, 72, 153, 0.04)" stroke="#1e3e66" strokeWidth="2.5" />
        <path d="M24 40v8M40 40v8" stroke="#1e3e66" strokeWidth="2.5" />
        <line x1="20" y1="48" x2="44" y2="48" stroke="#1e3e66" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="20" y1="32" x2="20" y2="24" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="26" y1="32" x2="26" y2="18" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="32" x2="32" y2="28" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="38" y1="32" x2="38" y2="20" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="44" y1="32" x2="44" y2="26" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "reportes-pdf",
    title: "Reportes",
    subtitle: "Historial e Informes",
    href: "/dashboard/reports/sistemas-de-emergencia",
    color: "#EF4444",
    roles: ["admin", "supervisor", "superintendente"],
    icon: (
      <svg width="45" height="45" viewBox="0 0 64 64" fill="none">
        <rect x="16" y="10" width="32" height="44" rx="4" fill="rgba(239, 68, 68, 0.04)" stroke="#1e3e66" strokeWidth="2.5" />
        <path d="M24 20h16M24 28h16M24 36h16" stroke="#1e3e66" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 44h10" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M38 44l2 2 4-4" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "configuracion",
    title: "Configuración",
    subtitle: "Administración",
    href: "/dashboard/config",
    color: "#64748B",
    roles: ["admin"],
    icon: (
      <svg width="45" height="45" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="8" fill="rgba(100, 116, 139, 0.04)" stroke="#1e3e66" strokeWidth="2.5" />
        <circle cx="32" cy="32" r="3" stroke="#06b6d4" strokeWidth="2" />
        <path d="M32 20v4M32 40v4M20 32h4M40 32h4m-18.4-7.6l2.8 2.8m11.2 11.2l2.8 2.8m-14 0l-2.8 2.8M37.6 26.4l-2.8 2.8" stroke="#1e3e66" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function DashboardHome() {
  const { userRole } = useUserRole();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getMeAction();
        if (userData) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("💥 Error al obtener los datos del usuario:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const getWelcomeMessage = () => {
    switch (userRole) {
      case "admin":
        return "Panel de Administrador — Gestión completa del sistema";
      case "supervisor":
        return "Panel de Supervisor — Revisión, control y aprobación";
      case "tecnico":
        return "Panel de Operador — Formularios de inspección y registro en planta";
      case "superintendente":
        return "Panel de Superintendente — Supervisión general y analíticas de planta";
      default:
        return "Bienvenido al Dashboard";
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const hasAccess = (allowedRoles: string[]) => {
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  };

  if (loading || !user) {
    return (
      <Box sx={{ width: "100%", mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }} className="fade-in">
      {/* Header Premium */}
      <Box sx={{ mb: "4px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: "6px" }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "-.02em",
              margin: 0,
              color: "text.primary",
            }}
          >
            {getGreeting()},{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #6366F1, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {user.fullName || user.username}
            </span>{" "}
            👋
          </Typography>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#fff",
              background: "#6366F1",
              padding: "4px 10px",
              borderRadius: "8px",
              letterSpacing: ".02em",
            }}
          >
            {userRole ? userRole.toUpperCase() : "INVITADO"}
          </span>
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "14px" }}>
          {getWelcomeMessage()}
        </Typography>
      </Box>

      {/* Título de Servicios del Sistema (Estilo de la imagen con línea horizontal que se extiende) */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1, mt: 2 }}>
        <Box sx={{ width: "12px", height: "2.5px", bgcolor: "#1e3e66" }} />
        <Typography
          variant="h3"
          sx={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#1e3e66",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          Servicios
        </Typography>
        <Box sx={{ flex: 1, height: "1.5px", bgcolor: "rgba(30, 62, 102, 0.15)" }} />
      </Box>

      {/* Grid de Servicios Circulares */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: { xs: "center", md: "flex-start" },
          gap: "28px",
          mb: 4,
          mt: 1,
        }}
      >
        {serviceItems
          .filter(item => hasAccess(item.roles))
          .map(item => (
            <Box
              key={item.id}
              component={Link}
              href={item.href}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: { xs: 175, sm: 185 },
                height: { xs: 175, sm: 185 },
                borderRadius: "50%",
                border: "2px solid",
                borderColor: "rgba(30, 62, 102, 0.2)",
                bgcolor: "background.paper",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.02)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                textDecoration: "none",
                cursor: "pointer",
                textAlign: "center",
                p: "18px",
                "&:hover": {
                  transform: "scale(1.04) translateY(-4px)",
                  boxShadow: "0px 10px 20px rgba(30, 62, 102, 0.12)",
                  borderColor: "#1e3e66",
                  bgcolor: "rgba(30, 62, 102, 0.03)",
                  "& svg": {
                    transform: "scale(1.08)",
                  },
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: "8px",
                  "& svg": {
                    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  },
                }}
              >
                {item.icon}
              </Box>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#1e3e66",
                  lineHeight: 1.2,
                  px: 0.5,
                }}
              >
                {item.title}
              </Typography>
              <Box
                sx={{
                  width: "35px",
                  height: "2.5px",
                  bgcolor: item.color,
                  my: "8px",
                  borderRadius: "2px",
                }}
              />
              <Typography
                sx={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "text.secondary",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  px: 0.5,
                }}
              >
                {item.subtitle}
              </Typography>
            </Box>
          ))}
      </Box>
    </Box>
  );
}
