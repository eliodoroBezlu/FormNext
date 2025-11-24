import { Mes } from "@/types/formTypes";

// Constants
export const MESES: Mes[] = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

export const TAGS_CON_SELECCION_EXTINTORES = [
  "710BL723-E1",
  "710BL723-E2",
  "710BL723-E3",
  "710BL723-E4",
  "710BL723-E5",
  "710BL723-E6",
  "710BL723-E7",
  "710BL723-E8",
  "710BL723-E9",
  "710BL723-E10",
  "710BL723-E11",
  "710BL723-E12",
  "710BL740-OM1",
  "710BL740-OM2",
  "710BL712-TS1",
  "710BL712-TS2",
  "710BL718",
  "710BL718-RH2",
  "780BL001"
];

export const valoracionOptions = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "N/A", label: "N/A" },
];

export const valoracionCriterio = [
  {
    valoracion: 0,
    criterio:
      "El ítem NO cumple o cumple menos del 50% de las veces (el ítem tiene más de dos desviaciones)",
  },
  {
    valoracion: 1,
    criterio:
      "El ítem cumple entre el 51% al 70% de las veces (el ítem tiene dos desviaciones)",
  },
  {
    valoracion: 2,
    criterio:
      "El ítem cumple entre el 71% al 90% de las veces (el ítem tiene máximo una desviación)",
  },
  {
    valoracion: 3,
    criterio:
      "El ítem cumple a cabalidad más del 91% (el ítem no tiene desviaciones)",
  },
  {
    valoracion: "N/A" as const,
    criterio:
      "El ítem no es aplicable o la actividad no se pudo observar durante la inspección",
  },
];

export const FAMILIAS_PELIGRO = [
  "Accesos Inseguros",
  "Agentes Biológicos",
  "Agentes Físicos",
  "Agentes Químicos",
  "Almacenamiento",
  "Ambiente de Trabajo",
  "Área de Caballerizas",
  "Área de Descanso",
  "Área de Trabajo",
  "Áreas de Tránsito",
  "Carga Suspendida",
  "Condiciones Ambientales",
  "Desorden",
  "Documentación",
  "Energía almacenada",
  "Equipo contra incendio",
  "Equipo o Línea energizada",
  "Equipo, Dispositivo o Herramienta",
  "Escaleras y Andamios",
  "Estructuras y Guardas",
  "Gases Comprimidos",
  "Herramientas Eléctricas",
  "Herramientas Manuales",
  "Iluminación",
  "Inestabilidad de terreno",
  "Instalaciones Eléctricas",
  "Instrumentos y Equipos de medición",
  "Manejo Manual de Cargas",
  "Manejo Materiales",
  "Manipulación de Químicos",
  "Maquinaria y Equipos",
  "Materiales Peligrosos",
  "Movimiento de Tierra",
  "Piscinas y Fuentes de Agua",
  "Presencia de Terceros",
  "Protección Personal",
  "Proyección de Fragmentos",
  "Proyección de Fluidos",
  "Remoción de Guardas",
  "Ruido",
  "Superficies de Trabajo",
  "Sustancias Peligrosas",
  "Trabajar Solo",
  "Trabajo de Alto Riesgo",
  "Trabajo en Altura",
  "Trabajo en Caliente",
  "Trabajo en Espacios Confinados",
  "Trabajo en Frío",
  "Tránsito de Personas",
  "Transporte de Personas",
  "Vehículos Automotores",
  "Vías de Escape",
  "Otros",
];


export const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"; 

if (typeof window !== 'undefined') {
  console.log('🔍 NEXT_PUBLIC_API_URL desde constants:', process.env.NEXT_PUBLIC_API_URL);
  console.log('🔍 API_BASE_URL final:', API_BASE_URL);
}