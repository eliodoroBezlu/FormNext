"use client";

import { useCallback, useEffect, useState } from "react";
import { mensajeParaUsuario } from "@/lib/errores/mensajeParaUsuario";
import {
  aplicarSincronizacion,
  pedirUltima,
  pedirVistaPrevia,
} from "../../infrastructure/adapters/trabajadoresIamAdapter";
import {
  hayCambiosDeRol,
  resumirResultado,
  seleccionInicial,
  type ResultadoDeAplicar,
  type Resumen,
  type UltimaSincronizacion,
  type VistaPrevia,
} from "../../domain/models/sincronizacionTrabajadores";

/**
 * Sincronización del padrón en dos pasos: abrir trae la vista previa (no
 * escribe); el admin elige y `aplicar` escribe lo elegido. Al terminar avisa
 * con `alTerminar` para que la pantalla recargue la lista.
 */
export function useSincronizarTrabajadores(alTerminar: () => void) {
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [aplicando, setAplicando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vista, setVista] = useState<VistaPrevia | null>(null);
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [supervisores, setSupervisores] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [resultado, setResultado] = useState<ResultadoDeAplicar | null>(null);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [ultima, setUltima] = useState<UltimaSincronizacion | null>(null);

  // La línea «Última sincronización» de la pantalla. Si falla, no se muestra.
  const refrescarUltima = useCallback(() => {
    pedirUltima().then(setUltima).catch(() => setUltima(null));
  }, []);

  useEffect(() => {
    refrescarUltima();
  }, [refrescarUltima]);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    setResultado(null);
    setResumen(null);
    try {
      const v = await pedirVistaPrevia();
      setVista(v);
      setSeleccion(seleccionInicial(v));
      setSupervisores(hayCambiosDeRol(v));
    } catch (e) {
      setError(mensajeParaUsuario(e, "No se pudo consultar el Portal IAM."));
    } finally {
      setCargando(false);
    }
  }, []);

  const abrir = useCallback(() => {
    setAbierto(true);
    setBusqueda("");
    void cargar();
  }, [cargar]);

  const cerrar = useCallback(() => {
    if (aplicando) return;
    setAbierto(false);
  }, [aplicando]);

  const alternar = useCallback((idIam: string) => {
    setSeleccion((actual) => {
      const nueva = new Set(actual);
      if (nueva.has(idIam)) nueva.delete(idIam);
      else nueva.add(idIam);
      return nueva;
    });
  }, []);

  /** Marca o desmarca de una vez los ids de un grupo (los visibles con la búsqueda). */
  const marcarVarios = useCallback((ids: string[], marcar: boolean) => {
    setSeleccion((actual) => {
      const nueva = new Set(actual);
      ids.forEach((id) => (marcar ? nueva.add(id) : nueva.delete(id)));
      return nueva;
    });
  }, []);

  const aplicar = useCallback(async () => {
    setAplicando(true);
    setError(null);
    try {
      const r = await aplicarSincronizacion([...seleccion], supervisores);
      setResultado(r);
      setResumen(resumirResultado(r));
      refrescarUltima();
      alTerminar();
    } catch (e) {
      setError(mensajeParaUsuario(e, "No se pudo aplicar la sincronización."));
    } finally {
      setAplicando(false);
    }
  }, [seleccion, supervisores, alTerminar, refrescarUltima]);

  return {
    abierto, abrir, cerrar,
    cargando, aplicando, error, recargar: cargar,
    vista, seleccion, alternar, marcarVarios, aplicar,
    supervisores, setSupervisores,
    busqueda, setBusqueda,
    resultado, resumen, ultima,
  };
}

export type EstadoSincronizacion = ReturnType<typeof useSincronizarTrabajadores>;
