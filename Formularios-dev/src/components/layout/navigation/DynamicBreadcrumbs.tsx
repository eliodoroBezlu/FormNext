"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Breadcrumbs, Link, Typography, Box } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import LinkNext from "next/link";

function getSegmentLabel(segment: string): string {
  const segmentLower = segment.toLowerCase();

  // Si es un ID de MongoDB (24 caracteres hexadecimales)
  if (/^[0-9a-fA-F]{24}$/.test(segment)) {
    return "Detalle";
  }

  // Mapeo específico de códigos de plantillas
  const templatesMap: Record<string, string> = {
    "1.02.p06.f30": "INSPECCIÓN DE ANDAMIOS",
    "1.02.p06.f33": "INSPECCIÓN DE MAN LIFT",
    "arn-001": "INSPECCIÓN DE ARNÉS",
    "esc-001": "INSPECCIÓN DE ESCALERAS",
    "ext-001": "INSPECCIÓN DE EXTINTORES",
  };
  if (templatesMap[segmentLower]) {
    return templatesMap[segmentLower];
  }

  // Mapeo general de rutas estáticas
  const map: Record<string, string> = {
    "dashboard": "Dashboard",
    "form-herra-equipos": "Herramientas y Equipos",
    "in-progress": "En Progreso",
    "pending-approval": "Pendientes de Aprobación",
    "formularios-de-inspeccion": "Formularios de Inspección",
    "sistemas-emergencia": "Sistemas de Emergencia",
    "config": "Configuración",
    "area": "Áreas",
    "extintores": "Extintores",
    "herramientas": "Herramientas",
    "inspecciones": "Inspecciones",
    "gestion": "Gestión",
    "superintendencia": "Superintendencia",
    "tag": "TAGs",
    "trabajador": "Trabajadores",
    "plan-accion": "Planes de Acción",
    "pgr": "PGR",
    "graphics": "Gráficos",
    "reports": "Reportes",
    "settings": "Ajustes",
    "emergencyinspections": "Sistemas de Emergencia",
    "inspectionschedule": "IRO's ISOP",
    "report-herra-equipos": "Herramientas y Equipos",
    "report-iro-isop": "IRO's ISOP",
    "sistemas-de-emergencia": "Sistemas de Emergencia",
    "qr-generator": "Generador de QR",
    "aprobacion": "Aprobación",
    "configuracion": "Configuración",
    "seguimiento": "Seguimiento",
  };

  return map[segmentLower] || segment.replace(/-/g, " ").toUpperCase();
}

export function DynamicBreadcrumbs() {
  const pathname = usePathname();

  // No mostrar breadcrumbs en la pantalla principal del Dashboard
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return null;
  }

  // Filtrar los segmentos de la ruta
  const segments = pathname.split("/").filter(Boolean);

  // Crear la lista de items
  const breadcrumbItems = segments.map((segment, index) => {
    // Reconstruir el path hasta este segmento
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = getSegmentLabel(segment);
    const isLast = index === segments.length - 1;

    return {
      label,
      href,
      isLast,
    };
  });

  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: "text.secondary" }} />}
        aria-label="breadcrumb"
      >
        {/* Siempre iniciar con el enlace a Dashboard si el primer segmento no es dashboard */}
        {segments[0] !== "dashboard" && (
          <Link
            component={LinkNext}
            underline="hover"
            color="text.secondary"
            href="/dashboard"
            sx={{ display: "flex", alignItems: "center", fontSize: "0.875rem", fontWeight: 500 }}
          >
            Dashboard
          </Link>
        )}

        {breadcrumbItems.map((item, index) => {
          if (item.isLast) {
            return (
              <Typography
                key={index}
                color="text.primary"
                sx={{ display: "flex", alignItems: "center", fontSize: "0.875rem", fontWeight: 600 }}
              >
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              component={LinkNext}
              underline="hover"
              color="text.secondary"
              href={item.href}
              sx={{ display: "flex", alignItems: "center", fontSize: "0.875rem", fontWeight: 500 }}
            >
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
