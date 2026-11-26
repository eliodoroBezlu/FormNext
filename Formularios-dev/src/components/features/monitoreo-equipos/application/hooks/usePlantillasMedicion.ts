"use client";

import { useCallback, useEffect, useState } from "react";
import {
  monitoreoAdapter,
  motivosDeError,
} from "../../infrastructure/adapters/monitoreoAdapter";
import type { EntradaCatalogo, PlantillaMedicion } from "../../domain/models/Monitoreo";
import { payloadDePlantilla, type ValoresPlantilla } from "../../domain/plantillaMedicion";

/** Las plantillas de medición de espesores: listarlas, guardarlas y borrarlas. */
export function usePlantillasMedicion() {
  const [plantillas, setPlantillas] = useState<PlantillaMedicion[]>([]);
  const [tecnicas, setTecnicas] = useState<EntradaCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string[] | null>(null);

  const consultar = useCallback(
    () => Promise.all([monitoreoAdapter.plantillasMedicion(), monitoreoAdapter.catalogos()]),
    [],
  );
  const aplicar = useCallback(([p, c]: Awaited<ReturnType<typeof consultar>>) => {
    setPlantillas(p);
    setTecnicas(c.tecnica);
    setError(null);
  }, []);

  useEffect(() => {
    let vigente = true;
    consultar()
      .then((d) => {
        if (vigente) aplicar(d);
      })
      .catch((e: unknown) => {
        if (vigente) setError(motivosDeError(e));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [consultar, aplicar]);

  const recargar = useCallback(async () => aplicar(await consultar()), [consultar, aplicar]);

  /** Crea o actualiza. Devuelve los motivos si el servidor la rechaza. */
  const guardar = useCallback(
    async (valores: ValoresPlantilla, id?: string): Promise<string[] | null> => {
      try {
        await monitoreoAdapter.guardarPlantillaMedicion(payloadDePlantilla(valores), id);
        await recargar();
        return null;
      } catch (e) {
        return motivosDeError(e);
      }
    },
    [recargar],
  );

  const eliminar = useCallback(
    async (id: string) => {
      setCargando(true);
      try {
        await monitoreoAdapter.eliminarPlantillaMedicion(id);
        await recargar();
      } catch (e) {
        setError(motivosDeError(e));
      } finally {
        setCargando(false);
      }
    },
    [recargar],
  );

  /** Un diagrama del equipo: se guarda como foto (sin recortar). */
  const subirDiagrama = useCallback(
    (archivo: File) => monitoreoAdapter.subirImagen(archivo, "foto"),
    [],
  );

  return { plantillas, tecnicas, cargando, error, setError, guardar, eliminar, subirDiagrama };
}
