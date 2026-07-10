'use client'

import React from "react"
import { Container } from "@mui/material"
import {
  Build as BuildIcon,
  Place as PlaceIcon,
  Category as CategoryIcon,
  ListAlt as ListAltIcon,
} from "@mui/icons-material"
import { useRouter } from "next/navigation"

import PageHeader from "@/components/layout/page-header/PageHeader"
import SettingsGrid from "@/components/features/settings/presentation/components/SettingsGrid"
import { SettingCardData } from "@/components/features/settings/presentation/components/SettingCard"

export default function InventarioEquiposConfigMenu() {
  const router = useRouter()

  const settingsData: SettingCardData[] = [
    {
      id: "equipos",
      title: "Gestión de Equipos",
      description: "Administra el listado de herramientas, cantidades, marcas y estado",
      icon: BuildIcon,
      color: "#2196f3",
      items: ["Listar", "Crear", "Editar", "Migrar Excel"],
    },
    {
      id: "ubicaciones",
      title: "Ubicaciones",
      description: "Gestiona los lugares físicos de almacenamiento y uso de los equipos",
      icon: PlaceIcon,
      color: "#4caf50",
      items: ["Listar", "Crear", "Editar", "Eliminar"],
    },
    {
      id: "clasificaciones",
      title: "Clasificaciones",
      description: "Configura las familias y agrupaciones de las herramientas",
      icon: CategoryIcon,
      color: "#ff9800",
      items: ["Listar", "Crear", "Editar", "Eliminar"],
    },
    {
      id: "config-formulario",
      title: "Campos Dinámicos",
      description: "Personaliza las especificaciones técnicas requeridas por tipo de equipo",
      icon: ListAltIcon,
      color: "#9c27b0",
      items: ["Configurar campos", "Tipos de dato", "Requeridos"],
    },
  ]

  const handleSettingClick = (settingId: string) => {
    router.push(`/dashboard/config/inventario-equipos/${settingId}`)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="Configuración de Inventario de Equipos"
        description="Personaliza y gestiona las herramientas, catalogos y especificaciones del sistema de inventario"
      />

      <SettingsGrid
        settings={settingsData}
        onSettingClick={handleSettingClick}
      />
    </Container>
  )
}
