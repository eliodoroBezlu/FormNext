"use client";

import { useCallback, useEffect, useState } from "react";
import { linternasAdapter } from "../../infrastructure/adapters/linternasAdapter";
import type {
  EntregaLinterna,
  EstadoTrabajador,
  RegistrarEntregaPayload,
  StockLinternas,
} from "../../domain/models/Linterna";

/**
 * Estado y orquestación del módulo. Las vistas no hablan con el adaptador:
 * piden acciones aquí y reciben datos ya resueltos.
 */
export function useLinternas() {
  const [stock, setStock] = useState<StockLinternas>({
    cantidadDisponible: 0,
    ingresos: [],
  });
  const [estado, setEstado] = useState<EstadoTrabajador | null>(null);
  const [historial, setHistorial] = useState<EntregaLinterna[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refrescarStock = useCallback(async () => {
    setStock(await linternasAdapter.stock());
  }, []);

  useEffect(() => {
    // La promesa se encadena aquí en vez de llamar a `refrescarStock()`: el
    // analizador rastrea dentro de las funciones `async` y trata sus setState
    // como síncronos. Dentro de `.then` son correctos.
    let vigente = true;

    void linternasAdapter.stock().then((datos) => {
      if (vigente) setStock(datos);
    });

    return () => {
      vigente = false;
    };
  }, []);

  /** Carga estado e historial de una persona a la vez: la vista los muestra juntos. */
  const seleccionarTrabajador = useCallback(async (id: string) => {
    setCargando(true);
    setError(null);
    try {
      const [e, h] = await Promise.all([
        linternasAdapter.estadoDeTrabajador(id),
        linternasAdapter.historial(id),
      ]);
      setEstado(e);
      setHistorial(h);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al consultar.");
      setEstado(null);
      setHistorial([]);
    } finally {
      setCargando(false);
    }
  }, []);

  const limpiarSeleccion = useCallback(() => {
    setEstado(null);
    setHistorial([]);
    setError(null);
  }, []);

  const registrar = useCallback(
    async (payload: RegistrarEntregaPayload) => {
      setCargando(true);
      setError(null);
      try {
        const entrega = await linternasAdapter.registrar(payload);
        // El estado del trabajador y el stock cambian con cada entrega; sin
        // refrescar, la pantalla ofrecería una acción que ya no corresponde.
        await Promise.all([
          seleccionarTrabajador(payload.trabajador),
          refrescarStock(),
        ]);
        return entrega;
      } catch (err) {
        const mensaje =
          err instanceof Error ? err.message : "No se pudo registrar.";
        setError(mensaje);
        throw new Error(mensaje);
      } finally {
        setCargando(false);
      }
    },
    [refrescarStock, seleccionarTrabajador],
  );

  const ingresarStock = useCallback(
    async (cantidad: number, observacion?: string) => {
      setError(null);
      try {
        await linternasAdapter.ingresarStock(cantidad, observacion);
        await refrescarStock();
      } catch (err) {
        const mensaje =
          err instanceof Error ? err.message : "No se pudo registrar.";
        setError(mensaje);
        throw new Error(mensaje);
      }
    },
    [refrescarStock],
  );

  return {
    stock,
    estado,
    historial,
    cargando,
    error,
    setError,
    seleccionarTrabajador,
    limpiarSeleccion,
    registrar,
    ingresarStock,
    refrescarStock,
  };
}

/** Cola de pérdidas por resolver. */
export function useAprobacionesLinterna() {
  const [pendientes, setPendientes] = useState<EntregaLinterna[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refrescar = useCallback(async () => {
    setCargando(true);
    try {
      setPendientes(await linternasAdapter.pendientes());
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    // `cargando` ya nace en `true`; aquí no hay ningún setState síncrono.
    let vigente = true;

    linternasAdapter
      .pendientes()
      .then((lista) => {
        if (vigente) setPendientes(lista);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  const resolver = useCallback(
    async (
      id: string,
      aprobar: boolean,
      firmaAprobador?: string,
      comentario?: string,
      metodoFirma?: string,
    ) => {
      setError(null);
      try {
        await linternasAdapter.resolver(id, {
          aprobar,
          firmaAprobador,
          comentario,
          metodoFirma,
        });
        await refrescar();
      } catch (err) {
        const mensaje =
          err instanceof Error ? err.message : "No se pudo resolver.";
        setError(mensaje);
        throw new Error(mensaje);
      }
    },
    [refrescar],
  );

  return { pendientes, cargando, error, setError, resolver, refrescar };
}
