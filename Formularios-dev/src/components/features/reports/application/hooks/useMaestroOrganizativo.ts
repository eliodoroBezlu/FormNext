"use client";

import { useEffect, useMemo, useState } from "react";
import {
  areasDelMaestro,
  superintendenciaDelArea,
  superintendenciasDelMaestro,
  type CadenaOrganizativa,
} from "@/lib/organizacion/cadenaOrganizativa";
import {
  obtenerMaestroOrganizativo,
  type MaestroOrganizativo,
} from "../../infrastructure/adapters/maestroOrganizativoAdapter";

export interface UsoMaestroOrganizativo {
  cargando: boolean;
  superintendencias: string[];
  /** Áreas del maestro; solo las de la superintendencia, si se indica. */
  areasDe: (superintendencia?: string) => string[];
  /** Superintendencia del área según el maestro (`null` si no la conoce o aún no cargó). */
  superintendenciaDe: (area: string) => string | null;
  porArea: Map<string, CadenaOrganizativa>;
}

const VACIO: MaestroOrganizativo = { cadenas: [], porArea: new Map() };

/** El maestro Área → Superintendencia para los filtros y las columnas de los reportes. */
export function useMaestroOrganizativo(): UsoMaestroOrganizativo {
  const [maestro, setMaestro] = useState<MaestroOrganizativo | null>(null);

  useEffect(() => {
    let vigente = true;
    obtenerMaestroOrganizativo()
      .then((m) => {
        if (vigente) setMaestro(m);
      })
      .catch((err: unknown) => {
        // Sin maestro los reportes siguen funcionando: el filtro compara el nombre guardado.
        console.error("Error al cargar el maestro de áreas:", err);
        if (vigente) setMaestro(VACIO);
      });
    return () => {
      vigente = false;
    };
  }, []);

  return useMemo(() => {
    const { cadenas, porArea } = maestro ?? VACIO;
    return {
      cargando: maestro === null,
      superintendencias: superintendenciasDelMaestro(cadenas),
      areasDe: (superintendencia?: string) => areasDelMaestro(cadenas, superintendencia),
      superintendenciaDe: (area: string) => superintendenciaDelArea(area, porArea),
      porArea,
    };
  }, [maestro]);
}
