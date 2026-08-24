'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ControlSemestral } from '../types/IControlSemestral';
import { obtenerDatosControlSemestral } from '../actions';
import { procesarDatosControl } from '../utils/semestreCalculations';

export function useControlSemestral() {
  const [datosControl, setDatosControl] = useState<ControlSemestral[]>([]);
  const [año, setAño] = useState<number>(new Date().getFullYear());
  /**
   * Año cuyos datos ya están pintados. De aquí se deriva el indicador de carga:
   * mientras lo pintado no corresponda al año elegido, se está cargando.
   *
   * Antes era un `setCargando(true)` síncrono dentro del efecto; derivarlo
   * evita ese render de más y acierta también al cambiar de año.
   */
  const [añoCargado, setAñoCargado] = useState<number | null>(null);
  const cargando = añoCargado !== año;
  const [error, setError] = useState<string | null>(null);

  const aplicar = useCallback(
    (datos: Awaited<ReturnType<typeof obtenerDatosControlSemestral>>) => {
      const { templates, instances } = datos;
      setDatosControl(procesarDatosControl(templates, instances, año));
      setError(null);
    },
    [año],
  );

  const avisarFallo = useCallback((err: unknown) => {
    console.error('Error cargando datos:', err);
    setError('Error al cargar los datos del dashboard');
  }, []);

  /** Recarga a petición (botón «Actualizar»). */
  const cargarDatos = useCallback(async () => {
    setAñoCargado(null);
    try {
      aplicar(await obtenerDatosControlSemestral());
    } catch (err) {
      avisarFallo(err);
    } finally {
      setAñoCargado(año);
    }
  }, [año, aplicar, avisarFallo]);

  useEffect(() => {
    // La promesa se encadena aquí: llamar a la función `async` haría que el
    // analizador viera sus setState como síncronos del efecto.
    let vigente = true;

    obtenerDatosControlSemestral()
      .then((datos) => {
        if (vigente) aplicar(datos);
      })
      .catch((err: unknown) => {
        if (vigente) avisarFallo(err);
      })
      .finally(() => {
        if (vigente) setAñoCargado(año);
      });

    return () => {
      vigente = false;
    };
  }, [año, aplicar, avisarFallo]);

  return { datosControl, año, setAño, cargando, error, cargarDatos };
}
