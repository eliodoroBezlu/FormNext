"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { mensajeParaUsuario } from "@/lib/errores/mensajeParaUsuario";
import {
  darDeBajaEquipo,
  exportarInventario,
  guardarEquipo,
  importarInventario,
  listarCatalogos,
  listarEquipos,
} from "../../infrastructure/adapters/inventarioAdapter";
import type {
  CatalogosInventario,
  Equipo,
  EquipoPayload,
} from "../../domain/models/Equipo";
import {
  filtrarEquipos,
  filtrosVacios,
  tiposEnUso,
  type FiltrosEquipos,
} from "../../domain/filtrosEquipos";

export type Severidad = "success" | "error" | "warning" | "info";
export interface Aviso {
  mensaje: string;
  severidad: Severidad;
}

/** Por encima de esto el backend arma el Excel sin fotos (`EquiposExcelService.LIMITE_FOTOS`). */
export const LIMITE_FOTOS_EXPORTACION = 150;

const catalogosVacios = (): CatalogosInventario => ({
  areas: [],
  superintendencias: [],
  gerencias: [],
  ubicaciones: [],
  clasificaciones: [],
  configs: [],
});

/**
 * El inventario de equipos: la lista, sus catálogos, los filtros y las
 * acciones (guardar, dar de baja, importar y exportar el Excel).
 */
export function useInventarioEquipos() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [catalogos, setCatalogos] = useState<CatalogosInventario>(catalogosVacios);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importando, setImportando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const [filtros, setFiltros] = useState<FiltrosEquipos>(filtrosVacios);
  const [pagina, setPagina] = useState(0);
  const [porPagina, setPorPagina] = useState(10);

  const avisar = useCallback((mensaje: string, severidad: Severidad) => setAviso({ mensaje, severidad }), []);

  const recargar = useCallback(async () => {
    try {
      setEquipos(await listarEquipos());
      setError(null);
    } catch (e) {
      setError(mensajeParaUsuario(e, "No se pudieron cargar los equipos"));
    }
  }, []);

  const recargarCatalogos = useCallback(async () => {
    try {
      setCatalogos(await listarCatalogos());
    } catch (e) {
      // Sin catálogos la lista sigue sirviendo; el formulario avisa lo que falte.
      console.error("Error al cargar catálogos del inventario:", e);
    }
  }, []);

  useEffect(() => {
    let vigente = true;
    listarEquipos()
      .then((datos) => {
        if (vigente) setEquipos(datos);
      })
      .catch((e: unknown) => {
        if (vigente) setError(mensajeParaUsuario(e, "No se pudieron cargar los equipos"));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    listarCatalogos()
      .then((datos) => {
        if (vigente) setCatalogos(datos);
      })
      .catch((e: unknown) => console.error("Error al cargar catálogos del inventario:", e));
    return () => {
      vigente = false;
    };
  }, []);

  /** Guarda y recarga la lista, para que el próximo código propuesto ya cuente este. */
  const guardar = useCallback(
    async (payload: EquipoPayload, id?: string): Promise<Equipo> => {
      const guardado = await guardarEquipo(payload, id);
      await recargar();
      return guardado;
    },
    [recargar],
  );

  const darDeBaja = useCallback(
    async (equipo: Equipo) => {
      try {
        await darDeBajaEquipo(equipo._id);
        avisar(`Se eliminó ${equipo.codigo}`, "success");
        await recargar();
      } catch (e) {
        avisar(mensajeParaUsuario(e, "No se pudo eliminar el equipo"), "error");
      }
    },
    [avisar, recargar],
  );

  const importar = useCallback(
    async (archivo?: File) => {
      setImportando(true);
      try {
        const r = await importarInventario(archivo);
        if (r.exito) {
          avisar(`Importación lista: ${r.creados} creados, ${r.actualizados} actualizados`, "success");
          await Promise.all([recargar(), recargarCatalogos()]);
        } else {
          avisar("La importación no se completó", "error");
        }
      } catch (e) {
        avisar(mensajeParaUsuario(e, "No se pudo importar el Excel"), "error");
      } finally {
        setImportando(false);
      }
    },
    [avisar, recargar, recargarCatalogos],
  );

  const filtrados = useMemo(() => filtrarEquipos(equipos, filtros), [equipos, filtros]);
  const tipos = useMemo(() => tiposEnUso(equipos), [equipos]);
  const visibles = useMemo(
    () => filtrados.slice(pagina * porPagina, pagina * porPagina + porPagina),
    [filtrados, pagina, porPagina],
  );

  const exportar = useCallback(async () => {
    setExportando(true);
    try {
      await exportarInventario(filtrados.map((e) => e._id));
      avisar("Excel generado", "success");
    } catch (e) {
      avisar(mensajeParaUsuario(e, "No se pudo exportar el inventario"), "error");
    } finally {
      setExportando(false);
    }
  }, [avisar, filtrados]);

  const cambiarFiltro = useCallback(<K extends keyof FiltrosEquipos>(campo: K, valor: FiltrosEquipos[K]) => {
    setFiltros((f) => ({ ...f, [campo]: valor }));
    setPagina(0);
  }, []);

  const cambiarPorPagina = useCallback((n: number) => {
    setPorPagina(n);
    setPagina(0);
  }, []);

  return {
    equipos,
    catalogos,
    cargando,
    error,
    importando,
    exportando,
    aviso,
    avisar,
    cerrarAviso: () => setAviso(null),
    filtros,
    cambiarFiltro,
    tipos,
    filtrados,
    visibles,
    pagina,
    setPagina,
    porPagina,
    cambiarPorPagina,
    guardar,
    darDeBaja,
    importar,
    exportar,
  };
}
