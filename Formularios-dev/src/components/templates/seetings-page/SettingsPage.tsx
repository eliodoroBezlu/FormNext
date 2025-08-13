"use client"

import React from 'react';
import { Container } from '@mui/material';
import {
    // Security as SecurityIcon,
    // Notifications as NotificationsIcon,
    // Palette as PaletteIcon,
    // Visibility as VisibilityIcon,
    // FlashOn as FlashOnIcon,
    // Language as LanguageIcon,
     Settings as SettingsIcon,
  EditDocument as EditDocumentIcon,  
} from '@mui/icons-material';

import { SettingCardData } from '@/components/molecules/seeting-card/SettingCard';
//import QuickActionsSection, { QuickActionData } from '@/components/organisms/quick-actin-section/QuickActionsSection';
import PageHeader from '@/components/organisms/page-header.tsx/PageHeader';
import SettingsGrid from '@/components/organisms/settings-grid/SettingsGrid';
import { useRouter } from 'next/navigation';

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
       icon: SettingsIcon,
       color: "#4caf50",
       items: ["Crear", "editar", "eliminar"],
     },
    // {
    //   id: "notifications",
    //   title: "Notificaciones",
    //   description: "Controla cómo y cuándo recibes notificaciones por email y push",
    //   icon: NotificationsIcon,
    //   color: "#ff9800",
    //   items: ["Email", "Push", "SMS", "Frecuencia"],
    // },
    // {
    //   id: "appearance",
    //   title: "Apariencia",
    //   description: "Personaliza el tema, colores y diseño de tu dashboard",
    //   icon: PaletteIcon,
    //   color: "#9c27b0",
    //   items: ["Tema claro/oscuro", "Colores", "Fuentes", "Layout"],
    // },
    // {
    //   id: "privacy",
    //   title: "Privacidad",
    //   description: "Configuración de privacidad, visibilidad del perfil y datos personales",
    //   icon: VisibilityIcon,
    //   color: "#f44336",
    //   items: ["Perfil público", "Datos personales", "Cookies", "Analíticas"],
    // },
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
      
      <SettingsGrid settings={settingsData} onSettingClick={handleSettingClick} />
      
      {/* <QuickActionsSection actions={quickActionsData} /> */}
    </Container>
  );
};

export default SettingsPage;