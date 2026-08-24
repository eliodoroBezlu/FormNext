// src/components/form-sistemas-emergencia/domain/models/EmergenciaDomain.ts

import { MESES } from "@/lib/constants";
import { type Mes } from "@/types/formTypes";

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

/**
 * Último día del mes en el que se admiten inspecciones nuevas.
 *
 * `null` = sin límite, que es el comportamiento vigente. La regla existió —la
 * interfaz aún muestra el aviso «Las inspecciones solo están habilitadas hasta
 * el día 10 de cada mes»— pero el código que la aplicaba tenía las dos ramas
 * del `if` puestas a `true`, así que llevaba tiempo sin surtir efecto.
 *
 * Para reactivarla basta poner `10` aquí. Antes de hacerlo, conviene decidir
 * qué pasa con quien empieza una inspección el día 10 y la termina el 11.
 */
export const LIMITE_DIA_INSPECCION: number | null = null;

/**
 * Si hoy se pueden crear inspecciones nuevas.
 *
 * Editar una ya existente nunca se bloquea: el límite es para dar de alta, no
 * para corregir lo ya cargado.
 */
export const dentroDelPeriodoDeInspeccion = (
  dia: number = getDiaActual(),
): boolean => LIMITE_DIA_INSPECCION === null || dia <= LIMITE_DIA_INSPECCION;
