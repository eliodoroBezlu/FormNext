"use client";

import { useCallback, useMemo, useState } from "react";
import {
  filasVisibles,
  type NodoUbicacion,
} from "../../domain/models/arbolUbicaciones";

/**
 * Estado de la vista de árbol: qué nodos están expandidos, qué se busca y si
 * se muestran los dados de baja.
 *
 * Ocultar los dados de baja no deja huérfanos a la vista: el backend no deja
 * dar de baja un nodo con hijos activos, así que debajo de uno inactivo solo
 * puede haber inactivos.
 */
export function useArbolUbicaciones<T extends NodoUbicacion>(nodos: T[]) {
  const [expandidos, setExpandidos] = useState<ReadonlySet<string>>(new Set());
  const [busqueda, setBusqueda] = useState("");
  const [mostrarBajas, setMostrarBajas] = useState(false);

  const visibles = useMemo(
    () => (mostrarBajas ? nodos : nodos.filter((n) => n.activo)),
    [nodos, mostrarBajas],
  );

  const filas = useMemo(
    () => filasVisibles(visibles, expandidos, busqueda),
    [visibles, expandidos, busqueda],
  );

  const alternar = useCallback((id: string) => {
    setExpandidos((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  }, []);

  /** Expande `id` y sus ancestros: para mostrar un hijo recién creado. */
  const revelar = useCallback(
    (id: string) => {
      const nodo = nodos.find((n) => n._id === id);
      setExpandidos((prev) => new Set([...prev, id, ...(nodo?.ancestros ?? [])]));
    },
    [nodos],
  );

  const expandirTodo = useCallback(
    () => setExpandidos(new Set(nodos.map((n) => n._id))),
    [nodos],
  );

  const contraerTodo = useCallback(() => setExpandidos(new Set()), []);

  return {
    filas,
    expandidos,
    busqueda,
    setBusqueda,
    mostrarBajas,
    setMostrarBajas,
    alternar,
    revelar,
    expandirTodo,
    contraerTodo,
    hayBajas: nodos.some((n) => !n.activo),
  };
}
