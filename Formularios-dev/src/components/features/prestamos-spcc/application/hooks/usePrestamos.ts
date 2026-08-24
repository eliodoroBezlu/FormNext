"use client";

import { useCallback, useEffect, useState } from "react";
import { prestamosAdapter } from "../../infrastructure/adapters/prestamosAdapter";
import type {
  CrearSolicitudPayload,
  DevolverItemPayload,
  EntregarPayload,
  EquipoPrestable,
  SolicitudPrestamo,
} from "../../domain/models/Prestamo";

export function usePrestamos() {
  const [solicitudes, setSolicitudes] = useState<SolicitudPrestamo[]>([]);
  const [disponibles, setDisponibles] = useState<EquipoPrestable[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const MENSAJE_CARGA_FALLIDA = "No se pudieron cargar los préstamos.";

  /**
   * Solo consulta y devuelve; no toca el estado.
   *
   * Separarlo permite que cada llamante decida qué hacer con el resultado —el
   * efecto de montaje comprueba antes si la respuesta sigue siendo relevante,
   * cosa que no puede hacer si la función ya escribió el estado por su cuenta.
   *
   * En paralelo: son consultas independientes y encadenarlas solo sumaría
   * esperas.
   */
  const consultar = useCallback(
    () =>
      Promise.all([
        prestamosAdapter.solicitudes(),
        prestamosAdapter.disponibles(),
      ]),
    [],
  );

  const aplicar = useCallback(
    ([lista, libres]: [SolicitudPrestamo[], EquipoPrestable[]]) => {
      setSolicitudes(lista);
      setDisponibles(libres);
      setError(null);
    },
    [],
  );

  /** Recarga a petición: activa el indicador de carga y aplica el resultado. */
  const refrescar = useCallback(async () => {
    setCargando(true);
    try {
      aplicar(await consultar());
    } catch (e) {
      setError(e instanceof Error ? e.message : MENSAJE_CARGA_FALLIDA);
    } finally {
      setCargando(false);
    }
  }, [consultar, aplicar]);

  // --- CARGA INICIAL ---
  useEffect(() => {
    // `cargando` ya nace en `true`, así que aquí no hace falta activarlo: el
    // efecto no ejecuta ningún setState de forma síncrona, solo dentro de los
    // callbacks de la promesa.
    let vigente = true;

    consultar()
      .then((datos) => {
        // Si el componente se desmontó —o se volvió a montar— mientras la
        // petición estaba en vuelo, esta respuesta ya no interesa: aplicarla
        // pisaría datos más nuevos.
        if (vigente) aplicar(datos);
      })
      .catch((e: unknown) => {
        if (!vigente) return;
        // Sin este catch, un fallo de red dejaba el indicador de carga girando
        // para siempre y sin ningún mensaje.
        setError(e instanceof Error ? e.message : MENSAJE_CARGA_FALLIDA);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [consultar, aplicar]);

  /**
   * Todas las acciones refrescan al terminar.
   *
   * Es a propósito: cada una cambia qué equipos quedan libres, y una lista
   * desactualizada llevaría al usuario a pedir algo que acaba de salir.
   */
  const ejecutar = useCallback(
    async (accion: () => Promise<unknown>): Promise<boolean> => {
      setError(null);
      try {
        await accion();
        await refrescar();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ocurrió un error.");
        return false;
      }
    },
    [refrescar],
  );

  return {
    solicitudes,
    disponibles,
    cargando,
    error,
    limpiarError: () => setError(null),
    refrescar,
    crear: (p: CrearSolicitudPayload) =>
      ejecutar(() => prestamosAdapter.crear(p)),
    entregar: (id: string, payload: EntregarPayload = {}) =>
      ejecutar(() => prestamosAdapter.entregar(id, payload)),
    devolver: (id: string, items: DevolverItemPayload[]) =>
      ejecutar(() => prestamosAdapter.devolver(id, items)),
    cancelar: (id: string, motivo?: string) =>
      ejecutar(() => prestamosAdapter.cancelar(id, motivo)),
  };
}
