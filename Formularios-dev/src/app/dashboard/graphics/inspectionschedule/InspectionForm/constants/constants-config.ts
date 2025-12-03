export const ESTADOS_CONFIG = {
  CUMPLIDO: { color: "success", icon: "CheckCircle" },
  FUERA_PLAZO: { color: "warning", icon: "Warning" },
  PENDIENTE: { color: "info", icon: "Schedule" },
  CRITICO: { color: "error", icon: "Error" },
  default: { color: "default", icon: "Schedule" }
} as const;

export const TABLE_COLUMNS = [
  "Formulario",
  "Lista de Instancias",
  "Gráfica por Área",
  "Gráfica por Inspecciones",
];

