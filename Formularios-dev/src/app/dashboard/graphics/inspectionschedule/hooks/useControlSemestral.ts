'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ControlSemestral } from '../types/IControlSemestral';
import { obtenerDatosControlSemestral } from '../actions';
import { procesarDatosControl } from '../utils/semestreCalculations';

export function useControlSemestral() {
  const [datosControl, setDatosControl] = useState<ControlSemestral[]>([]);
  const [año, setAño] = useState<number>(new Date().getFullYear());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const { templates, instances } = await obtenerDatosControlSemestral();
      const controlData = procesarDatosControl(templates, instances, año);
      setDatosControl(controlData);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setCargando(false);
    }
  }, [año]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return { datosControl, año, setAño, cargando, error, cargarDatos };
}
