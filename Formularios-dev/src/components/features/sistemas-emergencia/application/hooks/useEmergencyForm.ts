// src/components/form-sistemas-emergencia/application/hooks/useEmergencyForm.ts

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { TAGS_CON_SELECCION_EXTINTORES } from "@/lib/constants";
import type {
  ExtintorBackend,
  FormularioInspeccion,
  TagConEstado,
  Mes,
} from "@/types/formTypes";
import {
  crearFormularioInicial,
} from "@/types/formTypes";
import {
  obtenerMesActual,
  getPeriodoActual,
  getAñoActual,
  getDiaActual,
} from "@/components/features/sistemas-emergencia/domain/models/EmergenciaDomain";
import { emergencyAdapter } from "@/components/features/sistemas-emergencia/infrastructure/adapters/emergencyAdapter";
import { type InspectionFormProps } from "@/components/features/sistemas-emergencia/types/IProps";

export const useEmergencyForm = ({
  onCancel,
  initialData,
  isEditMode = false,
  readonly = false,
  idInstancia,
  onSaveUpdate,
  onTagSelected,
  preselectedTag,
  preselectedArea,
  preselectedExtintores,
}: InspectionFormProps) => {
  const currentMes = initialData?.mesActual || obtenerMesActual();
  const submitInProgress = useRef(false);

  const [dentroPeriodoValido, setDentroPeriodoValido] = useState(true);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // --- CONFIGURACIÓN DEL FORMULARIO (React Hook Form) ---
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    subscribe,
    formState: { errors, isDirty },
  } = useForm<FormularioInspeccion>({
    mode: "onTouched",
    defaultValues: initialData || crearFormularioInicial(
      "", "", "", "", "",
      getPeriodoActual(),
      getAñoActual(),
      currentMes
    ),
  });

  // --- GUARDIÁN ANTE PÉRDIDA DE CAMBIOS ---
  useEffect(() => {
    if (!isDirty || readonly) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, readonly]);

  // --- ESTADOS LOCALES ---
  const [formState, setFormState] = useState({
    loading: false,
    submitting: false,
    showForm: !!initialData,
    error: null as string | null,
    successMessage: null as string | null,
    esFormularioExistente: isEditMode,
    soloExtintores: false,
  });

  const [areaData, setAreaData] = useState({
    tag: initialData?.tag || "",
    area: initialData?.area || "",
    areaOptions: [] as string[],
    tagOptions: [] as string[],
    extintores: [] as ExtintorBackend[],
    tagsConEstado: [] as TagConEstado[],
    extintoresSeleccionados: [] as ExtintorBackend[],
    tagsData: [] as TagConEstado[],
    totalExtintoresActivos: 0,
    tagUbicaciones: {} as Record<string, string>,
    todosExtintoresDelArea: [] as ExtintorBackend[],
  });

  // --- AUTO-SAVE BORRADOR EN LOCALSTORAGE ---
  useEffect(() => {
    if (readonly || !areaData.tag || isEditMode) return;

    // `subscribe` en vez de `watch(cb)`: hace lo mismo pero sin re-renderizar
    // el formulario en cada tecla — el borrador solo necesita escribirse en
    // localStorage, no repintar la UI.
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        if (values.tag) {
          localStorage.setItem(
            `draft_emergencia_${values.tag}`,
            JSON.stringify(values),
          );
        }
      },
    });
    return unsubscribe;
  }, [subscribe, areaData.tag, readonly, isEditMode]);

  // --- EFECTO: CARGA INICIAL (EDICIÓN) ---
  useEffect(() => {
    if (initialData && initialData.tag) {
      const initEditData = async () => {
        try {
          setFormState((prev) => ({ ...prev, loading: true }));
          
          let extintoresBase: ExtintorBackend[] = [];
          
          // Obtener la definición de extintores desde el adaptador
          const tagResponse = await emergencyAdapter.getExtintoresByTag(initialData.tag);
          extintoresBase = tagResponse.extintores || [];

          let extSeleccionados: ExtintorBackend[] = [];
          
          if (TAGS_CON_SELECCION_EXTINTORES.some(t => t.toLowerCase() === initialData.tag.toLowerCase())) {
             const inspeccionados = initialData.meses[currentMes]?.inspeccionesExtintor || [];
             extSeleccionados = inspeccionados as unknown as ExtintorBackend[];
          }

          setAreaData((prev) => ({
            ...prev,
            tag: initialData.tag,
            area: initialData.area,
            extintores: extintoresBase,
            extintoresSeleccionados: extSeleccionados,
            totalExtintoresActivos: tagResponse.totalExtintoresActivosArea || 0,
          }));

        } catch (error) {
          console.error("Error al inicializar datos de edición:", error);
        } finally {
          setFormState((prev) => ({ ...prev, loading: false }));
        }
      };

      initEditData();
    }
  }, [initialData, currentMes]);

  // --- EFECTO: CARGAR ÁREAS (CREACIÓN) ---
  useEffect(() => {
    if (!initialData) {
      const cargarAreas = async () => {
        try {
          setFormState((prev) => ({ ...prev, loading: true }));
          const areas = await emergencyAdapter.getAreas();
          setAreaData((prev) => ({ ...prev, areaOptions: areas }));
        } catch (error) {
          console.error("Error al cargar áreas:", error);
          setFormState((prev) => ({ ...prev, error: "Error al cargar áreas." }));
        } finally {
          setFormState((prev) => ({ ...prev, loading: false }));
        }
      };
      cargarAreas();
    }
  }, [initialData]);

  // --- EFECTO: VALIDACIÓN DE FECHA ---
  useEffect(() => {
    if (isEditMode || readonly) {
      setDentroPeriodoValido(true);
      return;
    }
    const diaActual = getDiaActual();
    if (diaActual > 10) {
      setDentroPeriodoValido(true); 
    } else {
      setDentroPeriodoValido(true);
    }
  }, [isEditMode, readonly]);

  // --- EFECTO: ACTUALIZAR MES EN FORMULARIO ---
  useEffect(() => {
    if (!initialData) {
      setValue("mesActual", currentMes);
    }
  }, [currentMes, setValue, initialData]);

  // --- SELECCIÓN DE ÁREA ---
  const handleAreaChange = useCallback(async (selectedArea: string) => {
    try {
      setFormState((prev) => ({ ...prev, loading: true, error: null }));
      
      // 1. Obtener tags del área, inspecciones del mes, y TODOS los extintores del área en paralelo
      const [tagsDelArea, tagsInspeccionados, areaExtintoresData] = await Promise.all([
        emergencyAdapter.getTagsByArea(selectedArea),
        emergencyAdapter.verifyInspections(selectedArea, currentMes),
        emergencyAdapter.getExtintoresByArea(selectedArea),
      ]);

      const todosExtintores = areaExtintoresData.extintores || [];
      const tagUbicacionesMap: Record<string, string> = {};

      // 2. Procesar los tags en memoria con los extintores ya cargados
      const tagsConEstado = tagsDelArea.map((tag) => {
        const extintoresDelTag = todosExtintores.filter(
          (ext) => ext.tag && ext.tag.toLowerCase() === tag.toLowerCase()
        );
        
        const totalActivos = extintoresDelTag.length;
        const extintoresPendientes = extintoresDelTag.filter((ext) => !ext.inspeccionado).length;

        const estaInspeccionado = Array.isArray(tagsInspeccionados)
          ? tagsInspeccionados.some(
              (t: { tag: string; inspeccionado: boolean }) =>
                t.tag && t.tag.toLowerCase() === tag.toLowerCase() && t.inspeccionado
            )
          : false;

        if (extintoresDelTag.length > 0) {
          tagUbicacionesMap[tag] = extintoresDelTag[0].Ubicacion || "";
        } else {
          tagUbicacionesMap[tag] = "";
        }

        return {
          tag,
          extintoresPendientes,
          totalActivos,
          inspeccionado: estaInspeccionado,
        };
      });

      const primerTag = tagsDelArea.length > 0 ? tagsDelArea[0] : "";
      
      // Filtrar en memoria los extintores pendientes para el primer tag
      const extintoresPrimerTag = primerTag
        ? todosExtintores.filter(
            (ext) => ext.tag && ext.tag.toLowerCase() === primerTag.toLowerCase() && !ext.inspeccionado
          )
        : [];
      
      const totalActivosPrimerTag = primerTag
        ? todosExtintores.filter(
            (ext) => ext.tag && ext.tag.toLowerCase() === primerTag.toLowerCase()
          ).length
        : 0;

      setAreaData((prev) => ({
        ...prev,
        area: selectedArea,
        tag: primerTag,
        tagOptions: tagsDelArea,
        tagsConEstado: tagsConEstado,
        extintores: extintoresPrimerTag,
        totalExtintoresActivos: totalActivosPrimerTag,
        tagUbicaciones: tagUbicacionesMap,
        extintoresSeleccionados: [],
        todosExtintoresDelArea: todosExtintores, // Guardar para cambios de tag rápidos
      }));

      setValue("tag", primerTag);
    } catch (error) {
      console.error("Error al obtener datos del área:", error);
      setFormState((prev) => ({ ...prev, error: "Error al cargar datos del área." }));
    } finally {
      setFormState((prev) => ({ ...prev, loading: false }));
    }
  }, [setValue, currentMes]);

  // --- SELECCIÓN DE TAG ---
  const handleTagChange = useCallback(async (selectedTag: string) => {
    try {
      setFormState((prev) => ({ ...prev, loading: true, error: null }));
      
      // Intentar usar los extintores ya cargados del área para evitar peticiones de red
      if (areaData.todosExtintoresDelArea && areaData.todosExtintoresDelArea.length > 0) {
        const extintoresDelTag = areaData.todosExtintoresDelArea.filter(
          (ext) => ext.tag && ext.tag.toLowerCase() === selectedTag.toLowerCase() && !ext.inspeccionado
        );
        const totalActivos = areaData.todosExtintoresDelArea.filter(
          (ext) => ext.tag && ext.tag.toLowerCase() === selectedTag.toLowerCase()
        ).length;

        setAreaData((prev) => ({
          ...prev,
          tag: selectedTag,
          extintores: extintoresDelTag,
          totalExtintoresActivos: totalActivos,
          extintoresSeleccionados: [],
        }));
      } else {
        // Fallback en caso de que no existan extintores precargados
        const tagExtintores = await emergencyAdapter.getExtintoresByTag(selectedTag);

        setAreaData((prev) => ({
          ...prev,
          tag: selectedTag,
          extintores: tagExtintores.extintores || [],
          totalExtintoresActivos: tagExtintores.totalExtintoresActivosArea || 0,
          extintoresSeleccionados: [],
        }));
      }
      
      setValue("tag", selectedTag);
    } catch (error) {
      console.error("Error al cambiar tag:", error);
    } finally {
      setFormState((prev) => ({ ...prev, loading: false }));
    }
  }, [setValue, areaData.todosExtintoresDelArea]);

  // --- DETERMINAR ESTADO DEL TAG (✓, ↻, ⌛) ---
  const determinarEstadoTag = useCallback((tag: string) => {
    const tagInfo = areaData.tagsConEstado.find((item) => item.tag === tag);
    if (!tagInfo) return "pendiente";
    if (tagInfo.totalActivos === 0) return "completado";
    if (tagInfo.extintoresPendientes === 0) return "completado";
    if (tagInfo.extintoresPendientes === tagInfo.totalActivos) return "pendiente";
    return "parcial";
  }, [areaData.tagsConEstado]);

  const todosExtintoresSinInspeccionar = useCallback(() => {
    if (!areaData.extintores.length) return true;
    return !areaData.extintores.some((ext) => ext.inspeccionado === true);
  }, [areaData.extintores]);

  const handleExtintoresSeleccionados = useCallback((seleccionados: ExtintorBackend[]) => {
    setAreaData((prev) => ({ ...prev, extintoresSeleccionados: seleccionados }));
  }, []);

  // --- CONTINUAR AL FORMULARIO ---
  const handleTagSubmit = useCallback(async (tagOverride?: unknown, areaOverride?: string) => {
    const isStringTag = typeof tagOverride === "string";
    const targetTag = isStringTag ? tagOverride : areaData.tag;
    const targetArea = (isStringTag && typeof areaOverride === "string") ? areaOverride : areaData.area;

    if (!targetTag || typeof targetTag !== "string" || !targetTag.trim()) {
      setFormState((prev) => ({ ...prev, error: "Seleccione un TAG." }));
      return;
    }

    if (onTagSelected && !isStringTag) {
      onTagSelected(targetTag, targetArea, areaData.extintoresSeleccionados);
      return;
    }

    try {
      setFormState((prev) => ({ ...prev, loading: true, error: null }));

      const datosIniciales = {
        tag: targetTag,
        periodo: getPeriodoActual(),
        año: getAñoActual(),
        mesActual: currentMes,
        area: targetArea,
      };

      const response = await emergencyAdapter.verifyTag(datosIniciales);
      const formularioExiste = response.existe;

      const mostrarSoloExtintores = !!(
        formularioExiste &&
        todosExtintoresSinInspeccionar() &&
        response.formulario &&
        response.formulario.meses?.[currentMes]?.inspeccionesExtintor?.length > 0
      );

      // Si se proveen extintores preseleccionados (por ejemplo, desde los query params de la URL)
      let extintoresSeleccionadosIniciales = areaData.extintoresSeleccionados;
      if (preselectedExtintores && preselectedExtintores.trim() !== "") {
        const codigos = preselectedExtintores.split(",").map(c => c.trim().toLowerCase());
        const todosExt = response.extintores?.extintores || [];
        extintoresSeleccionadosIniciales = todosExt.filter(
          ext => ext.CodigoExtintor && codigos.includes(ext.CodigoExtintor.toLowerCase())
        );
      }

      setAreaData((prev) => ({
        ...prev,
        tag: targetTag,
        area: targetArea,
        extintores: response.extintores?.extintores || [],
        extintoresSeleccionados: extintoresSeleccionadosIniciales,
        totalExtintoresActivos: response.extintores?.totalExtintoresActivosArea || 0,
      }));

      // Determinar los extintores a mostrar en el formulario
      const requiereSeleccion = TAGS_CON_SELECCION_EXTINTORES.some(t => t.toLowerCase() === targetTag.toLowerCase());
      const extintoresAUsar = requiereSeleccion && extintoresSeleccionadosIniciales.length > 0
        ? extintoresSeleccionadosIniciales
        : (response.extintores?.extintores || []);


      const extintoresInicialesMapeados = extintoresAUsar.map(ext => ({
        fechaInspeccion: new Date().toISOString().split("T")[0],
        codigo: ext.CodigoExtintor || "",
        ubicacion: ext.Ubicacion || "",
        inspeccionMensual: "✓" as const,
        manguera: "✓" as const,
        cilindro: "✓" as const,
        indicadorPresion: "✓" as const,
        gatilloChavetaPrecinto: "✓" as const,
        senalizacionSoporte: "✓" as const,
        observaciones: "",
      }));

      const formularioInicial = crearFormularioInicial(
        response.superintendencia || "",
        targetArea,
        targetTag,
        response.formulario?.responsableEdificio || "",
        response.formulario?.edificio || "",
        getPeriodoActual(),
        getAñoActual(),
        currentMes
      );

      formularioInicial.meses[currentMes].inspeccionesExtintor = extintoresInicialesMapeados;

      if (formularioExiste && response.formulario) {
        const mesAlmacenado = response.formulario.mesActual;
        if (mesAlmacenado === currentMes && !response.extintores?.extintores?.length) {
          setFormState((prev) => ({ ...prev, error: "El formulario ya existe.", loading: false }));
          return;
        }

        // Inicializar el mes actual si no existe en el objeto meses del formulario
        if (!response.formulario.meses) {
          response.formulario.meses = {} as FormularioInspeccion['meses'];
        }
        if (!response.formulario.meses[currentMes]) {
          response.formulario.meses[currentMes] = {
            inspeccionesActivos: {
              sistemasPasivos: {
                puertasEmergencia: { cantidad: 0, estado: "N/A", observaciones: "" },
                senaleticaViasEvacuacion: { cantidad: 0, estado: "N/A", observaciones: "" },
                planosEvacuacion: { cantidad: 0, estado: "N/A", observaciones: "" },
                registroPersonalEvacuacion: { cantidad: 0, estado: "N/A", observaciones: "" },
                numerosEmergencia: { cantidad: 0, estado: "N/A", observaciones: "" },
                luzEmergencia: { cantidad: 0, estado: "N/A", observaciones: "" },
                puntoReunion: { cantidad: 0, estado: "N/A", observaciones: "" },
              },
              sistemasActivos: {
                kitDerrame: { cantidad: 0, estado: "N/A", observaciones: "" },
                lavaOjos: { cantidad: 0, estado: "N/A", observaciones: "" },
                duchasEmergencia: { cantidad: 0, estado: "N/A", observaciones: "" },
                desfibriladorAutomatico: { cantidad: 0, estado: "N/A", observaciones: "" },
              },
              observaciones: "",
            },
            inspeccionesExtintor: [],
            inspector: { nombre: "", firma: null },
          } as NonNullable<FormularioInspeccion['meses'][Mes]>;
        }

        // Poblar la lista del mes si está vacía
        if (!response.formulario.meses[currentMes].inspeccionesExtintor || response.formulario.meses[currentMes].inspeccionesExtintor.length === 0) {
          response.formulario.meses[currentMes].inspeccionesExtintor = extintoresInicialesMapeados;
        }

        setFormState((prev) => ({
          ...prev,
          esFormularioExistente: formularioExiste,
          soloExtintores: mostrarSoloExtintores,
          showForm: true,
          loading: false,
        }));
      } else {
        setFormState((prev) => ({
          ...prev,
          esFormularioExistente: false,
          soloExtintores: false,
          showForm: true,
          loading: false,
        }));
      }

      // --- LOGICA DE RESTAURACIÓN DE BORRADOR DESDE LOCALSTORAGE ---
      let borradorRestaurado = false;
      if (typeof window !== "undefined" && !initialData) {
        const key = `draft_emergencia_${targetTag}`;
        const draftStr = localStorage.getItem(key);
        if (draftStr) {
          try {
            const draftObj = JSON.parse(draftStr) as FormularioInspeccion;
            if (draftObj && draftObj.mesActual === currentMes && draftObj.tag === targetTag) {
              
              // Si requiere selección de extintores y hay seleccionados, forzar que el borrador tenga la selección actual
              if (requiereSeleccion && extintoresSeleccionadosIniciales.length > 0) {
                if (!draftObj.meses) {
                  draftObj.meses = {} as FormularioInspeccion['meses'];
                }
                if (!draftObj.meses[currentMes]) {
                  draftObj.meses[currentMes] = {
                    inspeccionesActivos: {
                      sistemasPasivos: {
                        puertasEmergencia: { cantidad: 0, estado: "N/A", observaciones: "" },
                        senaleticaViasEvacuacion: { cantidad: 0, estado: "N/A", observaciones: "" },
                        planosEvacuacion: { cantidad: 0, estado: "N/A", observaciones: "" },
                        registroPersonalEvacuacion: { cantidad: 0, estado: "N/A", observaciones: "" },
                        numerosEmergencia: { cantidad: 0, estado: "N/A", observaciones: "" },
                        luzEmergencia: { cantidad: 0, estado: "N/A", observaciones: "" },
                        puntoReunion: { cantidad: 0, estado: "N/A", observaciones: "" },
                      },
                      sistemasActivos: {
                        kitDerrame: { cantidad: 0, estado: "N/A", observaciones: "" },
                        lavaOjos: { cantidad: 0, estado: "N/A", observaciones: "" },
                        duchasEmergencia: { cantidad: 0, estado: "N/A", observaciones: "" },
                        desfibriladorAutomatico: { cantidad: 0, estado: "N/A", observaciones: "" },
                      },
                      observaciones: "",
                    },
                    inspeccionesExtintor: [],
                    inspector: { nombre: "", firma: null },
                  } as NonNullable<FormularioInspeccion['meses'][Mes]>;
                }
                const mesData = draftObj.meses[currentMes]!;
                mesData.inspeccionesExtintor = extintoresInicialesMapeados;
              }

              reset(draftObj);
              borradorRestaurado = true;
              setHasRestoredDraft(true);
            }
          } catch (e) {
            console.error("Error al cargar borrador desde localStorage", e);
          }
        }
      }

      if (!borradorRestaurado) {
        setHasRestoredDraft(false);
        if (formularioExiste && response.formulario) {
          reset(response.formulario);
        } else {
          reset(formularioInicial);
        }
      }

    } catch (error) {
      console.error("Error al verificar tag:", error);
      setFormState((prev) => ({ ...prev, error: "Error de servidor.", loading: false }));
    }
  }, [areaData.tag, areaData.area, areaData.extintoresSeleccionados, preselectedExtintores, onTagSelected, currentMes, reset, todosExtintoresSinInspeccionar, initialData]);

  // --- LIMPIAR BORRADOR Y VOLVER AL ESTADO ORIGINAL ---
  const clearDraft = useCallback(() => {
    if (typeof window !== "undefined" && areaData.tag) {
      localStorage.removeItem(`draft_emergencia_${areaData.tag}`);
      setHasRestoredDraft(false);
      
      const restaurarOriginal = async () => {
        try {
          setFormState((prev) => ({ ...prev, loading: true }));
          const datosIniciales = {
            tag: areaData.tag,
            periodo: getPeriodoActual(),
            año: getAñoActual(),
            mesActual: currentMes,
            area: areaData.area,
          };
          const response = await emergencyAdapter.verifyTag(datosIniciales);
          const formularioExiste = response.existe;

          const requiereSeleccion = TAGS_CON_SELECCION_EXTINTORES.some(t => t.toLowerCase() === areaData.tag.toLowerCase());
          let extintoresAUsar = requiereSeleccion && areaData.extintoresSeleccionados.length > 0
            ? areaData.extintoresSeleccionados
            : (response.extintores?.extintores || []);

          if (requiereSeleccion && extintoresAUsar.length === 0 && preselectedExtintores && preselectedExtintores.trim() !== "") {
            const codigos = preselectedExtintores.split(",").map(c => c.trim().toLowerCase());
            const todosExt = response.extintores?.extintores || [];
            extintoresAUsar = todosExt.filter(
              ext => ext.CodigoExtintor && codigos.includes(ext.CodigoExtintor.toLowerCase())
            );
          }

          const extintoresInicialesMapeados = extintoresAUsar.map(ext => ({
            fechaInspeccion: new Date().toISOString().split("T")[0],
            codigo: ext.CodigoExtintor || "",
            ubicacion: ext.Ubicacion || "",
            inspeccionMensual: "✓" as const,
            manguera: "✓" as const,
            cilindro: "✓" as const,
            indicadorPresion: "✓" as const,
            gatilloChavetaPrecinto: "✓" as const,
            senalizacionSoporte: "✓" as const,
            observaciones: "",
          }));

          const formularioInicial = crearFormularioInicial(
            response.superintendencia || "",
            areaData.area,
            areaData.tag,
            response.formulario?.responsableEdificio || "",
            response.formulario?.edificio || "",
            getPeriodoActual(),
            getAñoActual(),
            currentMes
          );
          formularioInicial.meses[currentMes].inspeccionesExtintor = extintoresInicialesMapeados;

          if (formularioExiste && response.formulario) {
            if (!response.formulario.meses) {
              response.formulario.meses = {} as FormularioInspeccion['meses'];
            }
            if (!response.formulario.meses[currentMes]) {
              response.formulario.meses[currentMes] = {
                inspeccionesActivos: {
                  sistemasPasivos: {
                    puertasEmergencia: { cantidad: 0, estado: "N/A", observaciones: "" },
                    senaleticaViasEvacuacion: { cantidad: 0, estado: "N/A", observaciones: "" },
                    planosEvacuacion: { cantidad: 0, estado: "N/A", observaciones: "" },
                    registroPersonalEvacuacion: { cantidad: 0, estado: "N/A", observaciones: "" },
                    numerosEmergencia: { cantidad: 0, estado: "N/A", observaciones: "" },
                    luzEmergencia: { cantidad: 0, estado: "N/A", observaciones: "" },
                    puntoReunion: { cantidad: 0, estado: "N/A", observaciones: "" },
                  },
                  sistemasActivos: {
                    kitDerrame: { cantidad: 0, estado: "N/A", observaciones: "" },
                    lavaOjos: { cantidad: 0, estado: "N/A", observaciones: "" },
                    duchasEmergencia: { cantidad: 0, estado: "N/A", observaciones: "" },
                    desfibriladorAutomatico: { cantidad: 0, estado: "N/A", observaciones: "" },
                  },
                  observaciones: "",
                },
                inspeccionesExtintor: [],
                inspector: { nombre: "", firma: null },
              } as NonNullable<FormularioInspeccion['meses'][Mes]>;
            }
            if (!response.formulario.meses[currentMes].inspeccionesExtintor || response.formulario.meses[currentMes].inspeccionesExtintor.length === 0) {
              response.formulario.meses[currentMes].inspeccionesExtintor = extintoresInicialesMapeados;
            }
            reset(response.formulario);
          } else {
            reset(formularioInicial);
          }
        } catch (e) {
          console.error("Error al restaurar formulario original", e);
        } finally {
          setFormState((prev) => ({ ...prev, loading: false }));
        }
      };
      restaurarOriginal();
    }
  }, [areaData.tag, areaData.area, areaData.extintoresSeleccionados, preselectedExtintores, currentMes, reset]);

  // --- EFECTO: CARGA AUTOMÁTICA DE TAG PRESELECCIONADO (SUB-ROUTES) ---
  useEffect(() => {
    if (preselectedTag && !initialData && !formState.showForm) {
      handleTagSubmit(preselectedTag, preselectedArea || "");
    }
  }, [preselectedTag, preselectedArea, initialData, formState.showForm, handleTagSubmit]);

  // --- SUBMIT FINAL ---
  const onSubmit = async (data: FormularioInspeccion) => {
    if (formState.submitting || readonly) return;

    try {
      setFormState((prev) => ({
        ...prev,
        loading: true,
        submitting: true,
        error: null,
      }));

      if (isEditMode && idInstancia && onSaveUpdate) {
        await onSaveUpdate(idInstancia, data);
        
        setFormState((prev) => ({
          ...prev,
          successMessage: "¡Inspección actualizada correctamente!",
          loading: false,
        }));
        
        setTimeout(() => {
          onCancel(); 
        }, 1500);
      } else {
        if (formState.esFormularioExistente) {
          if (formState.soloExtintores) {
            const extintoresPayload = {
              tag: areaData.tag,
              extintores: data.meses[currentMes].inspeccionesExtintor,
              area: areaData.area,
            };
            await emergencyAdapter.updateExtintoresByTag(areaData.tag, extintoresPayload);
          }
          await emergencyAdapter.updateMesByTag(
            areaData.tag,
            currentMes,
            data.meses[currentMes],
            areaData.area
          );
        } else {
          await emergencyAdapter.createForm(data);
        }
        if (typeof window !== "undefined") {
          localStorage.removeItem(`draft_emergencia_${areaData.tag}`);
        }
        setShowSuccessScreen(true);
      }

    } catch (error) {
      console.error("Error en submit:", error);
      setFormState((prev) => ({
        ...prev,
        error: "Error al guardar. Intente nuevamente.",
        loading: false,
        submitting: false,
      }));
    } finally {
      submitInProgress.current = false;
    }
  };

  return {
    currentMes,
    dentroPeriodoValido,
    showSuccessScreen,
    setShowSuccessScreen,
    formState,
    setFormState,
    areaData,
    setAreaData,
    handleAreaChange,
    handleTagChange,
    handleTagSubmit,
    determinarEstadoTag,
    handleExtintoresSeleccionados,
    onSubmit,
    // React Hook Form
    control,
    handleSubmit,
    setValue,
    reset,
    errors,
    isDirty,
    // Borradores
    hasRestoredDraft,
    clearDraft,
  };
};
