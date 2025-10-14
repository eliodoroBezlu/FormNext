"use client";

import React from "react";
import { Container } from "@mui/material";
import {
  FireExtinguisher as FireExtinguisherIcon,
  LocalOffer as TagIcon,
  EditDocument as EditDocumentIcon,
  Domain as DomanIcon,
  Accessibility as AccessibilityIcon
} from "@mui/icons-material";


import { SettingCardData } from "@/components/molecules/seeting-card/SettingCard";
//import QuickActionsSection, { QuickActionData } from '@/components/organisms/quick-actin-section/QuickActionsSection';
import PageHeader from "@/components/organisms/page-header.tsx/PageHeader";
import SettingsGrid from "@/components/organisms/settings-grid/SettingsGrid";
import { useRouter } from "next/navigation";

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const settingsData: SettingCardData[] = [
    {
      id: "IRO-ISOP",
      title: "Inspecciones IRO's e ISOP",
      description: "Configura tus inspecciones y personaliza los formularios",
      icon: EditDocumentIcon,
      color: "#2196f3",
      items: ["Crear", "Editar", "Eliminar"],
    },
    {
      id: "Extintores",
      title: "Configuración de Extintores",
      description: "Gestiona tipos, ubicaciones y mantenimientos de extintores",
      icon: FireExtinguisherIcon,
      color: "#4caf50",
      items: ["Crear", "editar", "eliminar"],
    },
    {
      id: "Tag",
      title: "Tag",
      description: "Configura y administra los tags ",
      icon: TagIcon,
      color: "#ff9800",
      items: ["Crear", "editar", "eliminar"],
    },
    {
      id: "area",
      title: "Area",
      description: "Configura y administra las areas ",
      icon: DomanIcon,
      color: "#9c27b0",
      items: ["Crear", "editar", "eliminar"],
    },
    {
      id: "superintendencia",
      title: "Superintendencia",
      description: "Configura y administra las superintendencias ",
      icon: DomanIcon,
      color: "#f44336",
      items: ["Crear", "editar", "eliminar"],
    },
    {
      id: "trabajador",
      title: "Trabajador y Usuario",
      description: "Configura al trabajador y el usuario",
      icon: AccessibilityIcon,
      color: "#9c27b0",
      items: ["Tema claro/oscuro", "Colores", "Fuentes", "Layout"],
    },
    {
      id: "herramientas",
      title: "Configuracion herramientas y equipos",
      description: "Configura el template de las herramientas y equipos",
      icon: TagIcon,
      color: "#f44336",
      items: ["Crear", "editar", "eliminar"],
    },
    // {
    //   id: "integrations",
    //   title: "Integraciones",
    //   description: "Conecta con aplicaciones externas y administra APIs",
    //   icon: FlashOnIcon,
    //   color: "#ff5722",
    //   items: ["Apps conectadas", "API Keys", "Webhooks", "Sincronización"],
    // },
    // {
    //   id: "billing",
    //   title: "Facturación",
    //   description: "Administra tu suscripción, métodos de pago y historial de facturas",
    //   icon: LanguageIcon,
    //   color: "#3f51b5",
    //   items: ["Suscripción", "Métodos de pago", "Facturas", "Uso"],
    // },
    // {
    //   id: "advanced",
    //   title: "Configuración Avanzada",
    //   description: "Configuraciones técnicas, exportar datos y configuración de desarrollador",
    //   icon: SettingsIcon,
    //   color: "#607d8b",
    //   items: ["Exportar datos", "API", "Logs", "Configuración técnica"],
    // },
  ];

  //   const quickActionsData: QuickActionData[] = [
  //     {
  //       title: "Cambiar Contraseña",
  //       description: "Última actualización hace 3 meses",
  //       buttonText: "Cambiar",
  //       onButtonClick: () => console.log("Cambiar contraseña"),
  //     },
  //     {
  //       title: "Descargar Datos",
  //       description: "Exporta toda tu información",
  //       buttonText: "Descargar",
  //       onButtonClick: () => console.log("Descargar datos"),
  //     },
  //     {
  //       title: "Soporte",
  //       description: "¿Necesitas ayuda?",
  //       buttonText: "Contactar",
  //       onButtonClick: () => console.log("Contactar soporte"),
  //     },
  //   ];

  const handleSettingClick = (settingId: string) => {
    console.log(`Clicked setting: ${settingId}`);
    router.push(`/dashboard/config/${settingId}`);
    // Aquí puedes agregar navegación o abrir modales
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="Configuración"
        description="Administra todas las configuraciones de tu cuenta y aplicación desde un solo lugar"
      />

      <SettingsGrid
        settings={settingsData}
        onSettingClick={handleSettingClick}
      />

      {/* <QuickActionsSection actions={quickActionsData} /> */}
    </Container>
  );
};

export default SettingsPage;
