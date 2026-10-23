"use client";

import { useEffect, useRef, useState } from "react";
import { obtenerCadenaDeAreas } from "@/lib/actions/area-actions";
import {
  indexarCadenas,
  necesitaCadena,
  valoresDesdeElArea,
  type CadenaOrganizativa,
} from "@/lib/organizacion/cadenaOrganizativa";

interface OpcionesCadena {
  /** Las etiquetas de la lista de verificación (memorizadas: se comparan por identidad). */
  etiquetas: readonly string[];
  /** El área elegida en este momento. */
  area: string | undefined;
  /**
   * En edición, la primera área que llega es la **ya guardada** y no se toca
   * nada: lo que el inspector declaró aquel día es el registro. Si después
   * cambia el área, se vuelve a resolver.
   */
  esEdicion: boolean;
  /** Escribe el valor en el campo (estable: con `useCallback`). */
  aplicar: (etiqueta: string, valor: string) => void;
}

/**
 * Llena superintendencia y gerencia a partir del área elegida
 * (`lib/organizacion/cadenaOrganizativa.ts`). Lo usan Herramientas y Equipos
 * e IRO/ISOP.
 *
 * Se dejan editables: el maestro puede ir por detrás de una reorganización y
 * el inspector tiene que poder decir la verdad mientras se corrige. Sin la
 * cadena (si falla la consulta) el formulario sigue siendo usable.
 */
export function useCadenaOrganizativa({
  etiquetas,
  area,
  esEdicion,
  aplicar,
}: OpcionesCadena): void {
  const hace = necesitaCadena(etiquetas);
  const [porArea, setPorArea] = useState<Map<
    string,
    CadenaOrganizativa
  > | null>(null);

  // Se pide una sola vez por formulario: no cambia mientras se llena.
  useEffect(() => {
    if (!hace) return;
    let vigente = true;
    obtenerCadenaDeAreas()
      .then((datos) => {
        if (vigente) setPorArea(indexarCadenas(datos));
      })
      .catch((err: unknown) => {
        console.error("Error al cargar la cadena de áreas:", err);
      });
    return () => {
      vigente = false;
    };
  }, [hace]);

  /** Última área resuelta, para no repetir trabajo ni pisar ediciones. */
  const areaResuelta = useRef<string | null>(null);

  useEffect(() => {
    if (!area || !porArea || porArea.size === 0) return;

    if (areaResuelta.current === null && esEdicion) {
      areaResuelta.current = area;
      return;
    }
    if (areaResuelta.current === area) return;

    areaResuelta.current = area;
    for (const { etiqueta, valor } of valoresDesdeElArea(
      etiquetas,
      area,
      porArea,
    )) {
      aplicar(etiqueta, valor);
    }
  }, [area, porArea, etiquetas, esEdicion, aplicar]);
}
