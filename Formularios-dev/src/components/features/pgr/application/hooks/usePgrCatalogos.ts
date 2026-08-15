"use client";

import { useCallback, useEffect, useState } from "react";
import {
  actualizarEntregableSugerido,
  actualizarGrupoResponsable,
  actualizarUnidadRecurso,
  crearEntregableSugerido,
  crearGrupoResponsable,
  crearUnidadRecurso,
  obtenerEntregablesSugeridos,
  obtenerGruposResponsables,
  obtenerMiembrosDelGrupo,
  obtenerUnidadesRecurso,
  type EntregableSugerido,
  type GrupoResponsable,
  type GrupoResponsableDto,
  type MiembroGrupo,
  type UnidadRecurso,
} from "../../infrastructure/adapters/pgrCatalogoAdapter";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info";
}

/**
 * Administración de los catálogos del PGR.
 *
 * Los tres se editan en la misma pantalla porque los tres responden a la misma
 * necesidad: que las unidades de recurso, los entregables y los grupos de
 * responsables se configuren en la base y no vivan como listas en el código.
 */
export function usePgrCatalogos() {
  const [unidades, setUnidades] = useState<UnidadRecurso[]>([]);
  const [entregables, setEntregables] = useState<EntregableSugerido[]>([]);
  const [grupos, setGrupos] = useState<GrupoResponsable[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  /**
   * Miembros ya resueltos, por grupo. Se piden bajo demanda: resolver los de
   * todos los grupos al abrir la pantalla sería una consulta al roster por
   * cada uno, y casi siempre interesa ver solo el que se está editando.
   */
  const [miembros, setMiembros] = useState<Record<string, MiembroGrupo[]>>({});

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const avisar = useCallback(
    (message: string, severity: SnackbarState["severity"]) =>
      setSnackbar({ open: true, message, severity }),
    [],
  );

  const cerrarSnackbar = useCallback(
    () => setSnackbar((s) => ({ ...s, open: false })),
    [],
  );

  const recargar = useCallback(async () => {
    setCargando(true);
    // Se piden en paralelo: son independientes entre sí.
    const [u, e, g] = await Promise.all([
      // `true` incluye las inactivas: acá se administran, así que hay que
      // poder ver y reactivar lo que se dio de baja.
      obtenerUnidadesRecurso(),
      obtenerEntregablesSugeridos(),
      obtenerGruposResponsables(),
    ]);
    setUnidades(u);
    setEntregables(e);
    setGrupos(g);
    setCargando(false);
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  /** Envuelve una escritura: avisa, recarga y devuelve si salió bien. */
  const ejecutar = useCallback(
    async (
      accion: () => Promise<{ success: boolean; error?: string }>,
      exito: string,
    ): Promise<boolean> => {
      setGuardando(true);
      try {
        const res = await accion();
        if (res.success) {
          avisar(exito, "success");
          await recargar();
          return true;
        }
        avisar(res.error ?? "No se pudo guardar", "error");
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [avisar, recargar],
  );

  // ── Unidades ──────────────────────────────────────────────────────────────

  const guardarUnidad = useCallback(
    (datos: { codigo: string; nombre: string }, id?: string) =>
      ejecutar(
        () =>
          id
            ? actualizarUnidadRecurso(id, datos)
            : crearUnidadRecurso(datos),
        id ? "Unidad actualizada" : "Unidad creada",
      ),
    [ejecutar],
  );

  const alternarUnidad = useCallback(
    (unidad: UnidadRecurso) =>
      ejecutar(
        () => actualizarUnidadRecurso(unidad._id, { activo: !unidad.activo }),
        unidad.activo ? "Unidad desactivada" : "Unidad activada",
      ),
    [ejecutar],
  );

  // ── Entregables ───────────────────────────────────────────────────────────

  const guardarEntregable = useCallback(
    (nombre: string, id?: string) =>
      ejecutar(
        () =>
          id
            ? actualizarEntregableSugerido(id, { nombre })
            : crearEntregableSugerido(nombre),
        id ? "Entregable actualizado" : "Entregable creado",
      ),
    [ejecutar],
  );

  const alternarEntregable = useCallback(
    (entregable: EntregableSugerido) =>
      ejecutar(
        () =>
          actualizarEntregableSugerido(entregable._id, {
            activo: !entregable.activo,
          }),
        entregable.activo ? "Entregable desactivado" : "Entregable activado",
      ),
    [ejecutar],
  );

  // ── Grupos ────────────────────────────────────────────────────────────────

  const guardarGrupo = useCallback(
    (datos: GrupoResponsableDto, id?: string) =>
      ejecutar(
        () =>
          id
            ? actualizarGrupoResponsable(id, datos)
            : crearGrupoResponsable(datos),
        id ? "Grupo actualizado" : "Grupo creado",
      ),
    [ejecutar],
  );

  const alternarGrupo = useCallback(
    (grupo: GrupoResponsable) =>
      ejecutar(
        () => actualizarGrupoResponsable(grupo._id, { activo: !grupo.activo }),
        grupo.activo ? "Grupo desactivado" : "Grupo activado",
      ),
    [ejecutar],
  );

  /**
   * Resuelve el grupo contra el roster. Es la comprobación que importa: una
   * regla mal configurada devuelve 0 miembros, y así se ve antes de usarla.
   */
  const resolverGrupo = useCallback(async (grupoId: string) => {
    const lista = await obtenerMiembrosDelGrupo(grupoId);
    setMiembros((previo) => ({ ...previo, [grupoId]: lista }));
    return lista;
  }, []);

  return {
    unidades,
    entregables,
    grupos,
    miembros,
    cargando,
    guardando,
    snackbar,
    cerrarSnackbar,
    recargar,
    guardarUnidad,
    alternarUnidad,
    guardarEntregable,
    alternarEntregable,
    guardarGrupo,
    alternarGrupo,
    resolverGrupo,
  };
}
