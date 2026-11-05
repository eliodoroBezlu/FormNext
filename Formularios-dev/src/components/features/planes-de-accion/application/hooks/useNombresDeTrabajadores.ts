"use client";

import { useEffect, useState } from "react";
import { obtenerNombresDeTrabajadores } from "../../infrastructure/adapters/trabajadoresAdapter";

/**
 * Los nombres de todos los trabajadores, cargados al abrir un formulario.
 * `null` mientras llegan; si fallan, lista vacía (el campo deja escribir).
 */
export function useNombresDeTrabajadores(abierto: boolean): string[] | null {
  const [nombres, setNombres] = useState<string[] | null>(null);

  useEffect(() => {
    if (!abierto) return;
    let vigente = true;
    obtenerNombresDeTrabajadores()
      .then((lista) => {
        if (vigente) setNombres(lista);
      })
      .catch(() => {
        if (vigente) setNombres([]);
      });
    return () => {
      vigente = false;
    };
  }, [abierto]);

  return nombres;
}
