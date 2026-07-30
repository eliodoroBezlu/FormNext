// app/dashboard/page.tsx - Dashboard Principal Mejorado (SaaS Premium)

"use client";

import { useState, useEffect } from "react";
import { Box, LinearProgress, Typography } from "@mui/material";
import { useUserRole } from "@/hooks/useUserRole";
import Link from "next/link";
import { getMeAction } from "../actions/auth";
import { ActivityFeed } from "@/components/features/dashboard/presentation/components/ActivityFeed";
import {
  NuevaInspeccionIcon,
  HerramientasIcon,
  PlanesIcon,
  PgrIcon,
  QrIcon,
  MetricasIcon,
  ReportesPdfIcon,
  ConfiguracionIcon,
  MisInspeccionesIcon,
} from "@/components/features/dashboard/presentation/components/serviceIcons";

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
    icon: NuevaInspeccionIcon,
  },
  {
    id: "herramientas",
    title: "Herramientas",
    subtitle: "Equipos y Accesorios",
    href: "/dashboard/form-herra-equipos",
    color: "#06B6D4",
    roles: ["admin", "supervisor", "tecnico", "superintendente"],
    icon: HerramientasIcon,
  },
  {
    id: "planes",
    title: "Planes",
    subtitle: "Acciones Correctivas",
    href: "/dashboard/plan-accion",
    color: "#10B981",
    roles: ["admin", "supervisor", "superintendente"],
    icon: PlanesIcon,
  },
  {
    id: "pgr",
    title: "PGR",
    subtitle: "Gestión de Riesgos",
    href: "/dashboard/pgr",
    color: "#F59E0B",
    roles: ["admin", "superintendente"],
    icon: PgrIcon,
  },
  {
    id: "qr",
    title: "Generador QR",
    subtitle: "Códigos de Equipos",
    href: "/dashboard/qr-generator",
    color: "#8B5CF6",
    roles: ["admin"],
    icon: QrIcon,
  },
  {
    id: "reportes",
    title: "Métricas",
    subtitle: "Gráficas y Analíticas",
    href: "/dashboard/graphics/emergencyinspections",
    color: "#EC4899",
    roles: ["admin", "superintendente"],
    icon: MetricasIcon,
  },
  {
    id: "reportes-pdf",
    title: "Reportes",
    subtitle: "Historial e Informes",
    href: "/dashboard/reports/sistemas-de-emergencia",
    color: "#EF4444",
    roles: ["admin", "supervisor", "superintendente"],
    icon: ReportesPdfIcon,
  },
  {
    id: "configuracion",
    title: "Configuración",
    subtitle: "Administración",
    href: "/dashboard/config",
    color: "#64748B",
    roles: ["admin"],
    icon: ConfiguracionIcon,
  },
  {
    id: "Mis inspecciones",
    title: "Mis inspecciones / area",
    subtitle: "Mis inspecciones y del area tambien",
    href: "/dashboard/mis-inspecciones",
    color: "#10B981",
    roles: ["admin", "supervisor", "superintendente", "tecnico"],
    icon: MisInspeccionesIcon,
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
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: "24px" }}
      className="fade-in"
    >
      {/* Header Premium */}
      <Box sx={{ mb: "4px" }}>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: "6px" }}
        >
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
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontSize: "14px" }}
        >
          {getWelcomeMessage()}
        </Typography>
      </Box>

      {/* Título de Servicios del Sistema (Estilo de la imagen con línea horizontal que se extiende) */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1, mt: 2 }}
      >
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
        <Box
          sx={{ flex: 1, height: "1.5px", bgcolor: "rgba(30, 62, 102, 0.15)" }}
        />
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
          .filter((item) => hasAccess(item.roles))
          .map((item) => (
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

      {/* ✅ Feed de Actividad Reciente */}
      <ActivityFeed />
    </Box>
  );
}
