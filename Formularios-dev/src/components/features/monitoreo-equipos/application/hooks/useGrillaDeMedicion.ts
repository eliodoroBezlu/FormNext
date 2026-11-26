"use client";

import { useEffect } from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import {
  EMISIVIDAD_POR_DEFECTO,
  grillaCalza,
  grillaDeTexto,
  type ValoresReporte,
} from "../../domain/formularioReporte";
import type { MedicionEnPantalla } from "./useReporteMonitoreo";

/**
 * Pone en el formulario la grilla que llega con la plantilla del tag y la
 * técnica, o la quita si se cambió la técnica. La del propio reporte la pone
 * `reset`. Si la plantilla vuelve a llegar igual (p. ej. al cambiar la fecha),
 * lo ya escrito se conserva. Si el reporte todavía no tiene técnica, toma la
 * de la plantilla (un tag con una sola, elegido desde su ficha).
 */
export function useGrillaDeMedicion(
  medicion: MedicionEnPantalla | null,
  /** El reporte ya guardado tiene su grilla: no se toca. */
  grillaPropia: boolean,
  getValues: UseFormGetValues<ValoresReporte>,
  setValue: UseFormSetValue<ValoresReporte>,
) {
  const estructura = medicion?.estructura ?? null;
  const tecnica = medicion?.tecnica;
  useEffect(() => {
    if (tecnica && !getValues("tecnica")) {
      setValue("tecnica", tecnica, { shouldDirty: true });
    }
  }, [tecnica, getValues, setValue]);

  useEffect(() => {
    if (grillaPropia) return;
    if (!estructura) {
      if (getValues("medicion_valores").length > 0) {
        setValue("medicion_valores", []);
        if (!getValues("lecturas.emisividad")) {
          setValue("lecturas.emisividad", EMISIVIDAD_POR_DEFECTO);
        }
      }
      return;
    }
    if (!grillaCalza(getValues("medicion_valores"), estructura)) {
      setValue("medicion_valores", grillaDeTexto(estructura), { shouldDirty: true });
    }
    // La emisividad es de la cámara térmica; en ultrasonido no va.
    if (getValues("lecturas.emisividad") === EMISIVIDAD_POR_DEFECTO) {
      setValue("lecturas.emisividad", "");
    }
  }, [estructura, grillaPropia, getValues, setValue]);
}
