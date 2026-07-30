"use client";

import { useCallback, useMemo, useState } from "react";
import {
  obtenerPlanes,
  obtenerInspecciones,
  crearPlan as crearPlanAdapter,
  actualizarPlan as actualizarPlanAdapter,
  eliminarPlan as eliminarPlanAdapter,
  generarPlanDesdeInstancia,
  agregarTarea as agregarTareaAdapter,
  actualizarTarea as actualizarTareaAdapter,
  eliminarTarea as eliminarTareaAdapter,
  aprobarTarea as aprobarTareaAdapter,
  aprobarPlanGlobal as aprobarPlanGlobalAdapter,
  obtenerAreas,
  ActionResult,
  PopulatedFormInstance,
} from "../../infrastructure/adapters/planesAccionAdapter";
import {
  AddTareaDTO,
  CreatePlanDeAccionDTO,
  GenerarPlanesOptions,
  PlanDeAccion,
  PlanSummary as PlanSummaryType,
  TareaObservacion,
  UpdatePlanDeAccionDTO,
  UpdateTareaDTO,
} from "../../domain/models/IProps";
import type { AreaBackend } from "@/lib/actions/area-actions";
import { useUserRole } from "@/hooks/useUserRole";
import { Role } from "@/lib/routePermissions";

export type { PopulatedFormInstance };
export type TabValue = "abierto" | "en-progreso" | "cerrado" | "aprobado";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export function usePlanesAccion() {
  const [planes, setPlanes] = useState<PlanDeAccion[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>("abierto");
  const [selectedPlan, setSelectedPlan] = useState<PlanDeAccion | null>(null);

  const [inspecciones, setInspecciones] = useState<PopulatedFormInstance[]>(
    [],
  );
  const [loadingInspecciones, setLoadingInspecciones] = useState(false);

  const [areas, setAreas] = useState<AreaBackend[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);

  const [filtroArea, setFiltroArea] = useState<string>("");
  const [filtroAnio, setFiltroAnio] = useState<string>("");

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const { user, userRole } = useUserRole();
  const isAdmin = userRole === Role.ADMIN;
  const isSuperintendente = userRole === Role.SUPERINTENDENTE;
  const isSupervisor = userRole === Role.SUPERVISOR;
  const puedeAprobarPlan = isAdmin || isSuperintendente;

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState["severity"]) =>
      setSnackbar({ open: true, message, severity }),
    [],
  );

  const closeSnackbar = useCallback(
    () => setSnackbar((prev) => ({ ...prev, open: false })),
    [],
  );

  const loadPlanes = useCallback(async () => {
    setIsPending(true);
    setError(null);
    try {
      const result = await obtenerPlanes();
      setPlanes(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar planes");
    } finally {
      setIsPending(false);
    }
  }, []);

  const cargarInspecciones = useCallback(async () => {
    setLoadingInspecciones(true);
    try {
      const data = await obtenerInspecciones();
      setInspecciones(data);
    } catch {
      setInspecciones([]);
    } finally {
      setLoadingInspecciones(false);
    }
  }, []);

  const cargarAreas = useCallback(async () => {
    setLoadingAreas(true);
    try {
      const data = await obtenerAreas();
      setAreas(data);
    } catch {
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  }, []);

  // Áreas que le corresponden al usuario según su rol: Admin ve todas,
  // Superintendente solo las de su propia superintendencia.
  const areasVisibles = useMemo(() => {
    const activas = areas.filter((a) => a.activo);
    if (isSuperintendente && user?.superintendencia) {
      return activas.filter(
        (a) => a.superintendencia?.nombre === user.superintendencia,
      );
    }
    return activas;
  }, [areas, isSuperintendente, user?.superintendencia]);

  const nombresAreasVisibles = useMemo(
    () => new Set(areasVisibles.map((a) => a.nombre)),
    [areasVisibles],
  );

  // Planes visibles según rol: Admin todos, Superintendente solo los de sus
  // áreas, Supervisor solo aquellos donde figura como responsable de cierre
  // de al menos una tarea.
  const planesVisibles = useMemo(() => {
    if (isSupervisor) {
      // El Supervisor nunca debe ver un plan que el Superintendente no
      // aprobó globalmente todavía (el backend ya aplica esta misma regla
      // al listar; esto es una segunda barrera defensiva en el cliente).
      return planes.filter(
        (p) =>
          p.estadoAprobacion === "aprobado" &&
          p.tareas.some(
            (t) => t.responsableAreaCierreUsername === user?.username,
          ),
      );
    }
    if (isSuperintendente) {
      return planes.filter((p) => nombresAreasVisibles.has(p.areaFisica));
    }
    return planes;
  }, [planes, isSupervisor, isSuperintendente, user?.username, nombresAreasVisibles]);

  const areasParaFiltro = useMemo(() => {
    if (isSupervisor) {
      return [...new Set(planesVisibles.map((p) => p.areaFisica))].sort();
    }
    return [...new Set(areasVisibles.map((a) => a.nombre))].sort();
  }, [isSupervisor, planesVisibles, areasVisibles]);

  const añosDisponibles = useMemo(
    () =>
      [
        ...new Set(
          planesVisibles.map((p) =>
            new Date(p.fechaCreacion).getFullYear().toString(),
          ),
        ),
      ].sort((a, b) => Number(b) - Number(a)),
    [planesVisibles],
  );

  const instanceIdsUsadas = useMemo(
    () =>
      new Set(
        planes.map((plan) => plan.instanceId).filter((id): id is string => !!id),
      ),
    [planes],
  );

  const inspeccionesDisponibles = useMemo(() => {
    const noUsadas = inspecciones.filter(
      (inspeccion) => !instanceIdsUsadas.has(inspeccion._id),
    );
    if (!isSuperintendente) return noUsadas;
    return noUsadas.filter((inspeccion) => {
      const area =
        inspeccion.verificationList?.["Área"] ||
        inspeccion.verificationList?.["Lugar"];
      return !!area && nombresAreasVisibles.has(area);
    });
  }, [inspecciones, instanceIdsUsadas, isSuperintendente, nombresAreasVisibles]);

  const summary = useMemo<PlanSummaryType>(() => {
    const totalPlanes = planesVisibles.length;
    const planesAbiertos = planesVisibles.filter(
      (p) => p.estado === "abierto",
    ).length;
    const planesEnProgreso = planesVisibles.filter(
      (p) => p.estado === "en-progreso",
    ).length;
    const planesCerrados = planesVisibles.filter(
      (p) => p.estado === "cerrado",
    ).length;
    return {
      totalPlanes,
      planesAbiertos,
      planesEnProgreso,
      planesCerrados,
      porcentajeCierre:
        totalPlanes > 0 ? (planesCerrados / totalPlanes) * 100 : 0,
    };
  }, [planesVisibles]);

  const filteredPlanes = useMemo(
    () =>
      planesVisibles.filter((plan) => {
        if (activeTab === "aprobado") {
          if (
            !(
              plan.tareas.length > 0 &&
              plan.tareas.every((t: TareaObservacion) => t.aprobado === true)
            )
          ) {
            return false;
          }
        } else if (plan.estado !== activeTab) {
          return false;
        }

        if (filtroArea && plan.areaFisica !== filtroArea) return false;

        if (
          filtroAnio &&
          new Date(plan.fechaCreacion).getFullYear().toString() !== filtroAnio
        ) {
          return false;
        }

        return true;
      }),
    [planesVisibles, activeTab, filtroArea, filtroAnio],
  );

  const handleViewPlan = useCallback(
    (plan: PlanDeAccion) => setSelectedPlan(plan),
    [],
  );
  const handleBackToList = useCallback(() => setSelectedPlan(null), []);

  const crearPlan = useCallback(
    async (data: CreatePlanDeAccionDTO): Promise<ActionResult<PlanDeAccion>> => {
      setIsPending(true);
      try {
        const result = await crearPlanAdapter(data);
        if (result.success && result.data) {
          showSnackbar("✅ Plan creado exitosamente", "success");
          setSelectedPlan(result.data);
          await loadPlanes();
        } else {
          showSnackbar(`❌ ${result.error}`, "error");
        }
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [loadPlanes, showSnackbar],
  );

  const actualizarPlanHeader = useCallback(
    async (
      planId: string,
      data: UpdatePlanDeAccionDTO,
    ): Promise<ActionResult<PlanDeAccion>> => {
      setIsPending(true);
      try {
        const result = await actualizarPlanAdapter(planId, data);
        if (result.success && result.data) {
          // Solo refresca `selectedPlan` si ya se estaba viendo ese plan
          // (vista de detalle); si el header se edita desde una card en la
          // lista, no navega automáticamente a la vista de detalle.
          setSelectedPlan((prev) => (prev ? (result.data as PlanDeAccion) : prev));
          showSnackbar("✅ Datos organizacionales actualizados", "success");
          await loadPlanes();
        } else {
          showSnackbar(`❌ ${result.error}`, "error");
        }
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [loadPlanes, showSnackbar],
  );

  const eliminarPlan = useCallback(
    async (planId: string): Promise<ActionResult<void>> => {
      setIsPending(true);
      try {
        const result = await eliminarPlanAdapter(planId);
        if (result.success) {
          if (selectedPlan?._id === planId) setSelectedPlan(null);
          showSnackbar("✅ Plan dado de baja exitosamente", "success");
          await loadPlanes();
        } else {
          showSnackbar(`❌ ${result.error}`, "error");
        }
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [loadPlanes, selectedPlan, showSnackbar],
  );

  const generarPlan = useCallback(
    async (
      instanceId: string,
      opciones: GenerarPlanesOptions,
    ): Promise<ActionResult<PlanDeAccion>> => {
      setIsPending(true);
      try {
        const result = await generarPlanDesdeInstancia(instanceId, opciones);
        if (result.success && result.data) {
          if (result.data.tareas.length === 0) {
            showSnackbar(
              "⚠️ No se encontraron observaciones que cumplan los criterios.",
              "warning",
            );
          } else {
            showSnackbar(
              `✅ Plan generado con ${result.data.tareas.length} tarea${result.data.tareas.length !== 1 ? "s" : ""}`,
              "success",
            );
            setSelectedPlan(result.data);
          }
          await loadPlanes();
        } else {
          const errorMessage = result.error || "Error al generar plan";
          if (errorMessage.includes("no se encontraron observaciones")) {
            showSnackbar(
              "⚠️ No se encontraron observaciones que cumplan los criterios.",
              "warning",
            );
          } else if (errorMessage.includes("not found")) {
            showSnackbar("❌ La inspección seleccionada no existe", "error");
          } else {
            showSnackbar(`❌ ${errorMessage}`, "error");
          }
        }
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [loadPlanes, showSnackbar],
  );

  const agregarTarea = useCallback(
    async (data: AddTareaDTO) => {
      if (!selectedPlan) return;
      setIsPending(true);
      try {
        const result = await agregarTareaAdapter(selectedPlan._id, data);
        if (result.success && result.data) {
          setSelectedPlan(result.data);
          showSnackbar("✅ Tarea agregada exitosamente", "success");
        } else {
          showSnackbar(`❌ ${result.error}`, "error");
          throw new Error(result.error);
        }
      } finally {
        setIsPending(false);
      }
    },
    [selectedPlan, showSnackbar],
  );

  const actualizarTarea = useCallback(
    async (tareaId: string, data: UpdateTareaDTO) => {
      if (!selectedPlan) return;
      setIsPending(true);
      try {
        const result = await actualizarTareaAdapter(
          selectedPlan._id,
          tareaId,
          data,
        );
        if (result.success && result.data) {
          setSelectedPlan(result.data);
          showSnackbar("✅ Tarea actualizada exitosamente", "success");
        } else {
          showSnackbar(`❌ ${result.error}`, "error");
          throw new Error(result.error);
        }
      } finally {
        setIsPending(false);
      }
    },
    [selectedPlan, showSnackbar],
  );

  const eliminarTarea = useCallback(
    async (tareaId: string) => {
      if (!selectedPlan) return;
      setIsPending(true);
      try {
        const result = await eliminarTareaAdapter(selectedPlan._id, tareaId);
        if (result.success && result.data) {
          setSelectedPlan(result.data);
          showSnackbar("✅ Tarea dada de baja exitosamente", "success");
        } else {
          showSnackbar(`❌ ${result.error}`, "error");
          throw new Error(result.error);
        }
      } finally {
        setIsPending(false);
      }
    },
    [selectedPlan, showSnackbar],
  );

  const aprobarTarea = useCallback(
    async (tareaId: string) => {
      if (!selectedPlan) return;
      setIsPending(true);
      try {
        const result = await aprobarTareaAdapter(selectedPlan._id, tareaId);
        if (result.success && result.data) {
          setSelectedPlan(result.data);
          showSnackbar("✅ Tarea aprobada exitosamente", "success");
        } else {
          showSnackbar(`❌ ${result.error}`, "error");
          throw new Error(result.error);
        }
      } finally {
        setIsPending(false);
      }
    },
    [selectedPlan, showSnackbar],
  );

  const aprobarPlanGlobal = useCallback(
    async (planId: string, observaciones?: string) => {
      setIsPending(true);
      try {
        const result = await aprobarPlanGlobalAdapter(planId, observaciones);
        if (result.success && result.data) {
          setSelectedPlan(result.data);
          showSnackbar("✅ Plan aprobado exitosamente", "success");
          await loadPlanes();
        } else {
          showSnackbar(`❌ ${result.error}`, "error");
        }
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [loadPlanes, showSnackbar],
  );

  return {
    planes,
    planesVisibles,
    isPending,
    error,
    activeTab,
    setActiveTab,
    selectedPlan,
    handleViewPlan,
    handleBackToList,
    inspecciones,
    loadingInspecciones,
    instanceIdsUsadas,
    inspeccionesDisponibles,
    summary,
    filteredPlanes,
    snackbar,
    closeSnackbar,
    loadPlanes,
    cargarInspecciones,
    crearPlan,
    actualizarPlanHeader,
    eliminarPlan,
    generarPlan,
    agregarTarea,
    actualizarTarea,
    eliminarTarea,
    aprobarTarea,
    aprobarPlanGlobal,
    // Roles y scoping
    isAdmin,
    isSuperintendente,
    isSupervisor,
    puedeAprobarPlan,
    // Filtros de área / año
    loadingAreas,
    cargarAreas,
    areasParaFiltro,
    añosDisponibles,
    filtroArea,
    setFiltroArea,
    filtroAnio,
    setFiltroAnio,
  };
}
