"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  obtenerAreasCompletas,
  type AreaBackend,
} from "@/lib/actions/area-actions";
import { obtenerSuperintendencias } from "@/lib/actions/superintendecia-actions";
import type { SuperintendenciaBackend } from "@/lib/actions/superintendecia-actions";
import {
  crearPgr,
  actualizarPgr,
  obtenerPgrPorId,
} from "../../infrastructure/adapters/pgrAdapter";
import {
  pgrBorradorSchema,
  pgrConfiguracionSchema,
  pgrCreacionSchema,
  PgrConfiguracionFormData,
  programacionVacia,
} from "../../domain/schemas/pgrConfiguracionSchema";
import {
  obtenerEntregablesSugeridos,
  obtenerGruposResponsables,
  obtenerUnidadesRecurso,
  type EntregableSugerido,
  type GrupoResponsable,
  type UnidadRecurso,
} from "../../infrastructure/adapters/pgrCatalogoAdapter";
import { normalizarProgramacion } from "../../domain/pgrHelpers";
import { ActividadEstado, PgrEstado } from "../../domain/models/IProps";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

const DEFAULT_VALUES: PgrConfiguracionFormData = {
  empresa: "",
  vicepresidencia: "",
  gerencia: "",
  superintendencia: "",
  gestion: "2026",
  areas: [],
  supervisor: "",
  responsable: "",
  mesCorte: 12,
  ventanaGestion: 12,
  // Vacío: al crear, las actividades salen de consolidar las matrices en el
  // paso 2. En edición este valor lo pisa el `reset()` con las del plan.
  actividades: [],
};

/**
 * Orquesta el formulario de configuración inicial de un PGR: carga de
 * catálogos (áreas / superintendencias), carga del plan existente en modo
 * edición, validación (Zod, single source of truth con el backend DTO) y
 * envío (crear / actualizar) con feedback vía snackbar.
 */
export function usePgrConfiguracion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const esCreacion = !editId;

  /**
   * Qué tan estricta es la validación, según el botón que se apretó.
   *
   * Un borrador admite actividades a medias —las consolidadas nacen sin
   * responsable, recurso ni programación—; la completitud recién se exige al
   * enviar a aprobación, que es el mismo corte que hace el backend. Va en una
   * ref y no en estado porque cambia justo antes de validar y no debe
   * provocar un render.
   */
  const modoValidacion = useRef<"borrador" | "aprobacion">("borrador");

  const resolver = useCallback<Resolver<PgrConfiguracionFormData>>(
    (values, context, options) => {
      const esquema = esCreacion
        ? pgrCreacionSchema
        : modoValidacion.current === "aprobacion"
          ? pgrConfiguracionSchema
          : pgrBorradorSchema;
      return zodResolver(esquema)(values, context, options);
    },
    [esCreacion],
  );

  const form = useForm<PgrConfiguracionFormData>({
    resolver,
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { isDirty, isSubmitting },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "actividades",
  });

  const [estadoPlan, setEstadoPlan] = useState<
    PgrEstado.BORRADOR | PgrEstado.CORREGIR
  >(PgrEstado.BORRADOR);
  const [comentariosRechazo, setComentariosRechazo] = useState("");
  const [areasList, setAreasList] = useState<AreaBackend[]>([]);
  const [superintendenciasList, setSuperintendenciasList] = useState<
    SuperintendenciaBackend[]
  >([]);
  const [isLoadingPlan, setIsLoadingPlan] = useState(!!editId);
  const [isPending, setIsPending] = useState(false);

  // Catálogos configurables: no hay listas de unidades ni de entregables en el
  // código, salen de la base y se administran desde el panel.
  const [unidades, setUnidades] = useState<UnidadRecurso[]>([]);
  const [entregablesSugeridos, setEntregablesSugeridos] = useState<
    EntregableSugerido[]
  >([]);
  const [gruposResponsables, setGruposResponsables] = useState<
    GrupoResponsable[]
  >([]);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState["severity"]) =>
      setSnackbar({ open: true, message, severity }),
    [],
  );

  const closeSnackbar = useCallback(
    () => setSnackbar((prev) => ({ ...prev, open: false })),
    [],
  );

  // --- Catálogos (áreas / superintendencias) ---
  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const dataArea = await obtenerAreasCompletas();
        if (Array.isArray(dataArea)) setAreasList(dataArea);
      } catch (err) {
        console.error("Error fetching áreas", err);
        showSnackbar("No se pudieron cargar las áreas disponibles", "warning");
      }

      try {
        const dataSup = await obtenerSuperintendencias();
        if (Array.isArray(dataSup)) setSuperintendenciasList(dataSup);
      } catch (err) {
        console.error("Error fetching superintendencias", err);
        showSnackbar(
          "No se pudieron cargar las superintendencias disponibles",
          "warning",
        );
      }
    };

    fetchCatalogos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Catálogos del PGR (unidades, entregables, grupos) ---
  const superintendencia = useWatch({ control, name: "superintendencia" });

  useEffect(() => {
    // Los adaptadores devuelven `[]` ante un error: un catálogo caído no debe
    // impedir editar el resto del formulario.
    void obtenerUnidadesRecurso().then(setUnidades);
    void obtenerEntregablesSugeridos().then(setEntregablesSugeridos);
  }, []);

  useEffect(() => {
    // Los grupos dependen de la superintendencia elegida.
    void obtenerGruposResponsables(superintendencia || undefined).then(
      setGruposResponsables,
    );
  }, [superintendencia]);

  // --- Carga del plan existente (modo edición) ---
  useEffect(() => {
    if (!editId) return;

    setIsLoadingPlan(true);
    obtenerPgrPorId(editId)
      .then((data) => {
        if (data.estado === PgrEstado.CORREGIR) {
          setEstadoPlan(PgrEstado.CORREGIR);
          const motivos = data.actividades
            .filter(
              (act) =>
                act.estadoAprobacion === ActividadEstado.RECHAZADO &&
                act.motivoRechazo,
            )
            .map((act) => `- ${act.descripcion}: ${act.motivoRechazo}`)
            .join("\n");
          setComentariosRechazo(motivos);
        } else {
          setEstadoPlan(PgrEstado.BORRADOR);
        }

        reset({
          empresa: data.empresa,
          vicepresidencia: data.vicepresidencia,
          gerencia: data.gerencia,
          superintendencia: data.superintendencia,
          gestion: data.gestion,
          areas: data.areas || [],
          mesCorte: data.mesCorte ?? 12,
          ventanaGestion: data.ventanaGestion ?? 12,
          actividades: data.actividades.map((act) => ({
            _id: act._id,
            descripcion: act.descripcion,
            verificador: act.verificador,
            // Los cuatro son listas en el modelo. Los planes anteriores a la
            // migración pueden no traerlas; se completan vacías.
            areas: act.areas ?? [],
            responsables: act.responsables ?? [],
            recursos: act.recursos ?? [],
            entregables: act.entregables ?? [],
            historialTrazabilidad: act.historialTrazabilidad || "",
            // Los planes anteriores a la matriz solo tienen `mesesProgramados`.
            // Se completan los 12 meses para que el formulario siempre tenga
            // una fila por mes y RHF pueda indexarlas por posición.
            programacion: normalizarProgramacion(act),
          })),
        });
      })
      .catch((err) => {
        console.error("Error al cargar plan para edición", err);
        showSnackbar("No se pudo cargar el plan PGR para edición", "error");
      })
      .finally(() => setIsLoadingPlan(false));
  }, [editId, reset, showSnackbar]);

  // --- Guardián de salida (Patrón 3) ---
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // --- Scroll al primer error (Patrón 2 — Double-Frame) ---
  const handleInvalidSubmit = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(
          '[data-question-error="true"], [aria-invalid="true"]',
        );
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          const focusable = el.querySelector<HTMLElement>(
            "input, textarea, button[aria-pressed]",
          );
          (focusable ?? el).focus?.();
        }
      });
    });
  }, []);

  const agregarActividad = useCallback(() => {
    // `getValues` y no `watch`: aquí solo se necesita el valor actual en el
    // momento del clic, no una suscripción que re-renderice el formulario.
    const selectedAreas = getValues("areas") || [];
    const areaText =
      selectedAreas.length > 0
        ? selectedAreas.map((a) => `AREA ${a.toUpperCase()}`).join(", ")
        : "";

    append({
      verificador: areaText ? `${areaText} - ` : "",
      descripcion: areaText ? ` - ${areaText}` : "",
      // Vacío = todas las áreas de la superintendencia. Es el caso habitual;
      // acotar el alcance es la excepción que se marca a mano.
      areas: [],
      responsables: [],
      recursos: [],
      entregables: [],
      programacion: programacionVacia(),
    });
  }, [append, getValues]);

  const guardarPlan = useCallback(
    async (data: PgrConfiguracionFormData, action: PgrEstado) => {
      setIsPending(true);
      try {
        const payload = {
          empresa: data.empresa,
          vicepresidencia: data.vicepresidencia,
          gerencia: data.gerencia,
          superintendencia: data.superintendencia,
          gestion: data.gestion,
          areas: data.areas,
          actividades: data.actividades,
          estado: action,
        };

        const result = editId
          ? await actualizarPgr(editId, payload)
          : await crearPgr(payload);

        if (result.success) {
          // Recién creado: se sigue al paso 2 en vez de volver a la lista. Es
          // donde las matrices de riesgo aprobadas de la superintendencia se
          // vuelven actividades; el PGR tiene que existir antes porque la
          // consolidación escribe dentro de él.
          const nuevoId = !editId ? result.data?._id : undefined;
          if (nuevoId) {
            showSnackbar(
              "PGR creado. Ahora consolidá las matrices de riesgo.",
              "success",
            );
            router.push(`/dashboard/pgr/consolidacion/${nuevoId}`);
          } else {
            showSnackbar("Plan guardado exitosamente", "success");
            router.push("/dashboard/pgr");
          }
        } else {
          showSnackbar(result.error || "Error al guardar el plan", "error");
        }
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [editId, router, showSnackbar],
  );

  const submitBorrador = handleSubmit(
    (data) => guardarPlan(data, PgrEstado.BORRADOR),
    handleInvalidSubmit,
  );

  const submitAprobacion = handleSubmit(
    (data) => guardarPlan(data, PgrEstado.EN_REVISION),
    handleInvalidSubmit,
  );

  // El modo se fija antes de disparar la validación: `handleSubmit` llama al
  // resolver de forma síncrona al invocarse.
  const guardarBorrador = useCallback(() => {
    modoValidacion.current = "borrador";
    return submitBorrador();
  }, [submitBorrador]);

  const enviarAAprobacion = useCallback(() => {
    modoValidacion.current = "aprobacion";
    return submitAprobacion();
  }, [submitAprobacion]);

  return {
    form,
    fields,
    remove,
    agregarActividad,
    esCreacion,
    estadoPlan,
    comentariosRechazo,
    areasList,
    superintendenciasList,
    unidades,
    entregablesSugeridos,
    gruposResponsables,
    isLoadingPlan,
    isPending: isPending || isSubmitting,
    isEditMode: !!editId,
    watch,
    guardarBorrador,
    enviarAAprobacion,
    snackbar,
    closeSnackbar,
  };
}
