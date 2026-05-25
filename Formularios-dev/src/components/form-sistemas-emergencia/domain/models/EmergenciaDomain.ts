// src/components/form-sistemas-emergencia/domain/models/EmergenciaDomain.ts

import { MESES } from "@/lib/constants";
import { type Mes } from "../../../../types/formTypes";

// Array de superintendencias unificado
export const SUPERINTENDENCIAS = [
  "Superintendencia de Mantenimiento - Eléctrico e Instrumentación Planta",
  "Superintendencia de Mantenimiento - Ingeniería de Confiabilidad",
  "Superintendencia de Mantenimiento - Mec. Plta. Chancado, Molienda y Lubricación",
  "Superintendencia de Mantenimiento - Mec. Plta. Flot., Filtros, Taller Gral. y RH",
  "Superintendencia de Mantenimiento - Planificación",
];

// Helper para obtener el mes actual tipado
export const obtenerMesActual = (): Mes => {
  return MESES[new Date().getMonth()] as Mes;
};

// Helper para obtener el período actual semestral
export const getPeriodoActual = (): "ENERO-JUNIO" | "JULIO-DICIEMBRE" => {
  const mesActual = obtenerMesActual();
  const mesesPrimerSemestre = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO"];
  return mesesPrimerSemestre.includes(mesActual) ? "ENERO-JUNIO" : "JULIO-DICIEMBRE";
};

// Helper para obtener el año actual
export const getAñoActual = (): number => new Date().getFullYear();

// Helper para obtener el día del mes actual
export const getDiaActual = (): number => new Date().getDate();
