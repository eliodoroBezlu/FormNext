"use client";

import { useWatch, type Control } from "react-hook-form";
import type { FormBuilderData } from "@/types/formTypes";
import {
  estadisticasImagenes,
  totalPreguntas,
  totalPuntos,
} from "../../domain/models/estadisticasPlantilla";

/**
 * Suscripción a las cuentas de la plantilla. **Solo el componente que llama
 * a este hook se vuelve a dibujar al escribir** — por eso lo usan piezas
 * chicas (contadores, resumen de imágenes, botón de guardar) y nunca la raíz
 * del constructor, que redibujaría todas las preguntas en cada tecla.
 */
export function useEstadisticasPlantilla(control: Control<FormBuilderData>) {
  const [secciones, seccionesImagen, campos] = useWatch({
    control,
    name: ["sections", "simpleSections", "verificationFields"],
  });

  return {
    preguntas: totalPreguntas(secciones, seccionesImagen),
    puntos: totalPuntos(secciones),
    autocompletar: (campos ?? []).filter((c) => c?.type === "autocomplete").length,
    imagenes: estadisticasImagenes(seccionesImagen),
  };
}

/** Solo las imágenes: para quien no necesita el resto de las cuentas. */
export function useEstadisticasImagenes(control: Control<FormBuilderData>) {
  const seccionesImagen = useWatch({ control, name: "simpleSections" });
  return estadisticasImagenes(seccionesImagen);
}
