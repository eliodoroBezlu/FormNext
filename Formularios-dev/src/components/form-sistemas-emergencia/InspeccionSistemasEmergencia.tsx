"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ExtintorBackend,
  type FormularioInspeccion,
  type Mes,
  crearFormularioInicial,
} from "../../types/formTypes";
import {
  actualizarExtintoresPorTag,
  obtenerTagsPorArea,
  buscarAreas,
  obtenerExtintoresPorArea,
  verificarTag,
  actualizarMesPorTag,
  crearFormSistemasEmergencia,
} from "@/app/actions/inspeccion";

import { useRouter } from "next/navigation";

// Components
import InformacionGeneral from "./InformacionGeneral";
import SistemasPasivos from "./SsitemasPasivos";
import SistemasActivos from "./SistemasActivos";
import InspeccionExtintores from "./InspeccionExtintores";
import InformacionInspector from "./InformacionInspector";
import ExtintoresChecklist from "./ExtintoresChecklist";

// Constants
const MESES: Mes[] = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

const TAGS_CON_SELECCION_EXTINTORES  = [
    "710BL723-E1", 
    "710BL723-E2",
    "710BL723-E3",
    "710BL723-E4", 
    "710BL723-E5", 
    "710BL723-E6", 
    "710BL723-E7", 
    "710BL723-E8", 
    "710BL723-E9",
    "710BL740-OM1",
    "710BL740-OM2", 
  ];

// Helper functions
const obtenerMesActual = (): Mes => MESES[new Date().getMonth()];
const getPeriodoActual = (): "ENERO-JUNIO" | "JULIO-DICIEMBRE" => {
  return new Date().getMonth() < 6 ? "ENERO-JUNIO" : "JULIO-DICIEMBRE";
};
const getAñoActual = (): number => new Date().getFullYear();
const getDiaActual = (): number => new Date().getDate();

export function InspeccionSistemasEmergencia() {
  const router = useRouter();
  const currentMes = obtenerMesActual();
  const submitInProgress = useRef(false);
  const [dentroPeriodoValido, setDentroPeriodoValido] = useState(true);

  // Form state
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormularioInspeccion>({
    defaultValues: crearFormularioInicial(
      "",
      "",
      "",
      "",
      "",
      getPeriodoActual(),
      getAñoActual(),
      currentMes
    ),
  });

  // Component state
  const [formState, setFormState] = useState({
    loading: false,
    submitting: false, // Estado específico para controlar el envío del formulario
    showForm: false,
    error: null as string | null,
    successMessage: null as string | null,
    esFormularioExistente: false,
    soloExtintores: false,
  });

  const [areaData, setAreaData] = useState({
    tag: "",
    area: "",
    areaOptions: [] as string[],
    tagOptions: [] as string[],
    extintores: [] as ExtintorBackend[],
    extintoresSeleccionados: [] as ExtintorBackend[],
  });

  useEffect(() => {
    const diaActual = getDiaActual();
    if (diaActual > 10) {
      setDentroPeriodoValido(true);
      setFormState((prev) => ({
        ...prev,
        error:
          "No es posible realizar inspecciones después del día 10 del mes actual.",
      }));
    } else {
      setDentroPeriodoValido(true);
    }
  }, []);
  // Load areas on component mount
  useEffect(() => {
    const cargarAreas = async () => {
      try {
        const areas = await buscarAreas("");
        setAreaData((prev) => ({ ...prev, areaOptions: areas }));
      } catch (error) {
        console.error("Error al cargar áreas:", error);
        setFormState((prev) => ({
          ...prev,
          error: "Error al cargar áreas. Por favor, recargue la página.",
        }));
      }
    };

    cargarAreas();
  }, []);

  // Update form when month changes
  useEffect(() => {
    setValue("mesActual", currentMes);
  }, [currentMes, setValue]);

  // Handle extintores based on area
  useEffect(() => {
    if (!areaData.tag) return;

    if (!TAGS_CON_SELECCION_EXTINTORES .includes(areaData.tag)) {
      setAreaData((prev) => ({
        ...prev,
        extintoresSeleccionados: prev.extintores,
      }));
    }
  }, [areaData.tag, areaData.extintores]);

  // Handlers
  const handleExtintoresSeleccionados = useCallback(
    (seleccionados: ExtintorBackend[]) => {
      setAreaData((prev) => ({
        ...prev,
        extintoresSeleccionados: seleccionados,
      }));
    },
    []
  );

  const handleAreaChange = useCallback(
    async (selectedArea: string) => {
      try {
        setFormState((prev) => ({ ...prev, loading: true, error: null }));
  
        const tagsDelArea = await obtenerTagsPorArea(selectedArea);

        
        const primerTag = tagsDelArea.length > 0 ? tagsDelArea[0] : "";
        const areaExtintores = await obtenerExtintoresPorArea(primerTag);
  
        // Seleccionamos el primer tag automáticamente
  
        setAreaData((prev) => ({
          ...prev,
          area: selectedArea,
          tag: primerTag,
          tagOptions: tagsDelArea,
          extintores: areaExtintores,
        }));
  
        setValue("tag", primerTag);
      } catch (error) {
        console.error("Error al obtener datos del área:", error);
        setFormState((prev) => ({
          ...prev,
          error: "Error al obtener datos del área. Intente nuevamente.",
        }));
      } finally {
        setFormState((prev) => ({ ...prev, loading: false }));
      }
    },
    [setValue]
  );
  

  const handleTagChange = useCallback(
    async (selectedTag: string) => {
      try {
        setFormState((prev) => ({ ...prev, loading: true, error: null }));
        
        // Obtener extintores por tag
        const tagExtintores = await obtenerExtintoresPorArea(selectedTag);
        
        setAreaData((prev) => ({ 
          ...prev, 
          tag: selectedTag,
          extintores: tagExtintores
        }));
        setValue("tag", selectedTag);
      } catch (error) {
        console.error("Error al obtener extintores del tag:", error);
        setFormState((prev) => ({
          ...prev,
          error: "Error al obtener extintores del tag. Intente nuevamente.",
        }));
      } finally {
        setFormState((prev) => ({ ...prev, loading: false }));
      }
    },
    [setValue]
  );

  const todosExtintoresSinInspeccionar = useCallback(() => {
    
    if (!areaData.extintores.length) {
      return true;
    }
    
    // Verificar si hay al menos un extintor inspeccionado
    const hayAlgunoInspeccionado = areaData.extintores.some((ext) => ext.inspeccionado === true);
    
    // Si hay alguno inspeccionado, no todos están sin inspeccionar
    return !hayAlgunoInspeccionado;
  }, [areaData.extintores]);

  const handleTagSubmit = async () => {
  if (!areaData.tag.trim()) {
    setFormState((prev) => ({
      ...prev,
      error: "Por favor, ingresa un valor para el TAG.",
    }));
    return;
  }

  try {
    setFormState((prev) => ({ ...prev, loading: true, error: null }));

    const datosIniciales = {
      tag: areaData.tag,
      periodo: getPeriodoActual(),
      año: getAñoActual(),
      mesActual: currentMes,
      area: areaData.area,
    };

    const response = await verificarTag(datosIniciales);

    const formularioExiste = response.existe;

   
    // const tieneDatosMesActual =
    //   formularioExiste &&
    //   response.formulario.meses?.[currentMes] &&
    //   Object.keys(response.formulario.meses[currentMes]).length > 0;

    const mostrarSoloExtintores =
      formularioExiste &&
      todosExtintoresSinInspeccionar() &&
      response.formulario.meses?.[currentMes]?.inspeccionesExtintor?.length > 0;
    

    setAreaData((prev) => ({
      ...prev,
      extintores: response.extintores || [],
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

    if (formularioExiste) {
      const mesAlmacenado = response.formulario.mesActual;

      if (mesAlmacenado === currentMes && !response.extintores.length) {
        setFormState((prev) => ({
          ...prev,
          error:
            "El formulario ya existe para este mes. No es necesario realizar cambios.",
          loading: false,
        }));
        return;
      }

      // Guardamos estos estados explícitamente
      const newFormState = {
        ...formState,
        esFormularioExistente: formularioExiste,
        soloExtintores: mostrarSoloExtintores,
        showForm: true,
        loading: false,
      };
      
      setFormState(newFormState);
    } else {
      setFormState((prev) => ({
        ...prev,
        esFormularioExistente: false,
        soloExtintores: false,
        showForm: true,
        loading: false,
      }));
    }

    reset(formularioInicial);
  } catch (error) {
    console.error("Error al verificar el TAG:", error);
    setFormState((prev) => ({
      ...prev,
      error:
        "Ocurrió un error al comunicarse con el servidor. Por favor, intenta más tarde.",
      loading: false,
    }));
  }
};

  const onSubmit = async (data: FormularioInspeccion) => {
    if (formState.submitting) return;

    try {
      setFormState((prev) => ({
        ...prev,
        loading: true,
        submitting: true, // Marcar como enviando
        error: null,
      }));

      if (soloExtintores) {
        // Solo enviar datos de extintores
        const extintoresData = {
          tag: areaData.tag,
          extintores: data.meses[currentMes].inspeccionesExtintor,
        };

        await actualizarExtintoresPorTag(areaData.tag, extintoresData);
      } else if (esFormularioExistente) {
        // Actualizar todo el mes
        await actualizarMesPorTag(
          areaData.tag,
          currentMes,
          data.meses[currentMes]
        );
      } else {
        // Crear nuevo formulario completo
        await crearFormSistemasEmergencia(data);
      }

      setFormState((prev) => ({
        ...prev,
        successMessage: "¡Inspección guardada correctamente!",
        loading: false,
      }));

      setTimeout(() => {
        resetForm();
        router.push("/dashboard/inspeccion-sistemas-emergencia");
      }, 2000);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setFormState((prev) => ({
        ...prev,
        error: "Error al guardar la inspección. Intente nuevamente.",
        loading: false,
        submitting: false,
      }));
    } finally {
      submitInProgress.current = false;
    }
  };

  const resetForm = () => {
    setFormState({
      loading: false,
      submitting: false, // Asegurarse de reiniciar estado de envío
      showForm: false,
      error: null,
      successMessage: null,
      esFormularioExistente: false,
      soloExtintores: false,
    });

    setAreaData({
      tag: "",
      area: "",
      areaOptions: areaData.areaOptions,
      extintores: [],
      tagOptions: [],
      extintoresSeleccionados: [],
    });

    reset(
      crearFormularioInicial(
        "",
        "",
        "",
        "",
        "",
        getPeriodoActual(),
        getAñoActual(),
        currentMes
      )
    );
    submitInProgress.current = false;
  };

  const {
    loading,
    showForm,
    error,
    successMessage,
    esFormularioExistente,
    soloExtintores,
  } = formState;
  const {
    tag,
    area,
    areaOptions,
    extintores,
    tagOptions,
    extintoresSeleccionados,
  } = areaData;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Formulario de Inspección de Seguridad
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Código: 3.02.P01.F17 - Rev. 2
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!dentroPeriodoValido ? (
          <Box sx={{ mb: 4 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Las inspecciones solo están habilitadas hasta el día 10 de cada
              mes. Por favor, espere hasta el próximo mes para realizar una
              nueva inspección.
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                router.push("/dashboard/inspeccion-sistemas-emergencia")
              }
            >
              Volver al Panel
            </Button>
          </Box>
        ) : !showForm ? (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Seleccione primero el área y el TAG se completará automáticamente
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth disabled={tagOptions.length === 0}>
                  <InputLabel id="tag-label">TAG</InputLabel>
                  <Select
                    labelId="tag-label"
                    id="tag-select"
                    value={tag}
                    label="TAG"
                    onChange={(e) => handleTagChange(e.target.value as string)}
                  >
                    {tagOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="area-label">Área</InputLabel>
                  <Select
                    labelId="area-label"
                    id="area-select"
                    value={area}
                    label="Área"
                    onChange={(e) => handleAreaChange(e.target.value as string)}
                  >
                    {areaOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                {area && tag && (
                  TAGS_CON_SELECCION_EXTINTORES .includes(tag) ? (
                    <ExtintoresChecklist
                      tag={tag}  // Asegura que el tag se pasa como área
                      extintores={extintores}
                      onExtintoresSeleccionados={handleExtintoresSeleccionados}
                    />
                  ) : (
                    <Paper
                      elevation={2}
                      sx={{ p: 2, height: "100%", minHeight: "56px" }}
                    >
                      <Alert severity="info">
                        Para el TAG &quot;{tag}&quot; no es necesario
                        seleccionar extintores.
                      </Alert>
                    </Paper>
                  )
                )}
              </Grid>
            </Grid>

            <Button
              variant="contained"
              color="primary"
              onClick={handleTagSubmit}
              disabled={loading || !tag}
            >
              {loading ? "Verificando..." : "Continuar"}
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Mostrar InformacionGeneral solo si es formulario nuevo */}
            <InformacionGeneral 
              control={control} 
              errors={errors} 
              soloLectura={esFormularioExistente} // Pasar prop soloLectura como true si es formulario existente
            />

            {/* Mostrar SistemasPasivos y Activos si no es solo extintores */}
            {!soloExtintores && (
              <>
                <SistemasPasivos control={control} currentMes={currentMes} />
                <SistemasActivos control={control} currentMes={currentMes} />
              </>
            )}

            {/* Siempre mostrar extintores */}
            <InspeccionExtintores
              control={control}
              currentMes={currentMes}
              extintores={
                TAGS_CON_SELECCION_EXTINTORES .includes(tag)
                  ? extintoresSeleccionados
                  : extintores
              }
            />

            {/* Mostrar InformacionInspector si no es solo extintores */}
            {!soloExtintores && (
              <InformacionInspector
                control={control}
                currentMes={currentMes}
                setValue={setValue}
                errors={errors}
              />
            )}

            <Box sx={{ mt: 4 }}>
              <Grid container spacing={2} justifyContent="space-between">
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    fullWidth
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={formState.loading || formState.submitting}
                  >
                    {formState.loading || formState.submitting
                      ? "Guardando..."
                      : formState.soloExtintores
                      ? "Guardar Inspección de Extintores"
                      : "Guardar Inspección"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </form>
        )}
      </Paper>
    </Container>
  );
}
