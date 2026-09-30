"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ubicacionesAdapter,
  type UbicacionBackend,
  type UbicacionForm,
} from "../../infrastructure/adapters/ubicacionesAdapter";

export interface AvisoUbicaciones {
  mensaje: string;
  severidad: "success" | "error" | "warning" | "info";
}

const mensajeDe = (error: unknown, porDefecto: string) =>
  error instanceof Error ? error.message : porDefecto;

/**
 * Datos y operaciones de la pantalla de gestión de ubicaciones.
 *
 * Carga la lista **con** las dadas de baja (para poder restaurarlas) y
 * recarga después de cada operación: mover o renombrar cambia la `ruta` de
 * todo un subárbol, y recalcularla aquí duplicaría la regla del backend.
 *
 * Cada operación devuelve `true` si salió bien, para que el diálogo que la
 * disparó sepa si cerrarse.
 */
export function useGestionUbicaciones() {
  const [ubicaciones, setUbicaciones] = useState<UbicacionBackend[]>([]);
  // Arranca en `true`: la página está cargando desde el primer render.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<AvisoUbicaciones | null>(null);

  /** Solo consulta y devuelve; no toca el estado. */
  const consultar = useCallback(() => ubicacionesAdapter.listarTodas(), []);

  const aplicar = useCallback((datos: UbicacionBackend[]) => {
    setUbicaciones(datos);
    setError(null);
  }, []);

  const avisarFallo = useCallback((e: unknown) => {
    setError(mensajeDe(e, "Error al cargar ubicaciones"));
  }, []);

  /** Recarga a petición, tras cada operación o con el botón. */
  const recargar = useCallback(async () => {
    setLoading(true);
    try {
      aplicar(await consultar());
    } catch (e) {
      avisarFallo(e);
    } finally {
      setLoading(false);
    }
  }, [consultar, aplicar, avisarFallo]);

  useEffect(() => {
    // La promesa se encadena aquí: llamar a la función `async` haría que
    // el analizador viera su `setLoading(true)` como setState síncrono.
    let vigente = true;
    consultar()
      .then((datos) => {
        if (vigente) aplicar(datos);
      })
      .catch((e: unknown) => {
        if (vigente) avisarFallo(e);
      })
      .finally(() => {
        if (vigente) setLoading(false);
      });
    return () => {
      vigente = false;
    };
  }, [consultar, aplicar, avisarFallo]);

  const ejecutar = useCallback(
    async <R>(accion: () => Promise<R>, exito: string | ((resultado: R) => string)): Promise<boolean> => {
      try {
        const resultado = await accion();
        setAviso({
          mensaje: typeof exito === "function" ? exito(resultado) : exito,
          severidad: "success",
        });
        await recargar();
        return true;
      } catch (e) {
        setAviso({ mensaje: mensajeDe(e, "No se pudo completar la operación"), severidad: "error" });
        return false;
      }
    },
    [recargar],
  );

  const crear = useCallback(
    (data: UbicacionForm) => ejecutar(() => ubicacionesAdapter.crear(data), "Ubicación creada"),
    [ejecutar],
  );

  const actualizar = useCallback(
    (id: string, data: UbicacionForm) =>
      ejecutar(() => ubicacionesAdapter.actualizar(id, data), "Ubicación actualizada"),
    [ejecutar],
  );

  const darDeBaja = useCallback(
    (nodo: UbicacionBackend) =>
      ejecutar(() => ubicacionesAdapter.darDeBaja(nodo._id), `'${nodo.ruta}' dada de baja`),
    [ejecutar],
  );

  const restaurar = useCallback(
    (nodo: UbicacionBackend) =>
      ejecutar(() => ubicacionesAdapter.restaurar(nodo._id), `'${nodo.ruta}' restaurada`),
    [ejecutar],
  );

  const fusionar = useCallback(
    (origen: UbicacionBackend, destino: UbicacionBackend) =>
      ejecutar(
        () => ubicacionesAdapter.fusionar(origen._id, destino._id),
        (r) =>
          `'${origen.ruta}' fusionada en '${destino.ruta}': ${r.equiposMovidos} equipo(s) y ${r.ubicacionesMovidas} ubicación(es) movidos`,
      ),
    [ejecutar],
  );

  const cerrarAviso = useCallback(() => setAviso(null), []);

  return {
    ubicaciones,
    loading,
    error,
    aviso,
    cerrarAviso,
    recargar,
    crear,
    actualizar,
    darDeBaja,
    restaurar,
    fusionar,
  };
}
