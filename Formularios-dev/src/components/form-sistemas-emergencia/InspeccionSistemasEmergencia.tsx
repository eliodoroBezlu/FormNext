"use client";

import { useEffect, useState, useCallback } from "react";
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
import { inspeccionService } from "../../services/inspeccionService";
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
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

const TAG_OPTIONS = [
  "710BL713", "710BL718", "710BL712", "710BL723", "710BL724",
  "710BL725", "710BL726", "710BL727", "710BL728", "710BL729",
  "710BL741", "780BL001", "710BL721", "710BL711", "710BL740"
];

const AREAS_CON_SELECCION_EXTINTORES = ["Electrico", "Generacion"];

// Helper functions
const obtenerMesActual = (): Mes => MESES[new Date().getMonth()];

const getPeriodoActual = (): "ENERO-JUNIO" | "JULIO-DICIEMBRE" => {
  return new Date().getMonth() < 6 ? "ENERO-JUNIO" : "JULIO-DICIEMBRE";
};

const getAñoActual = (): number => new Date().getFullYear();

export function InspeccionSistemasEmergencia() {
  const router = useRouter();
  const currentMes = obtenerMesActual();
  
  // Form state
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormularioInspeccion>({
    defaultValues: crearFormularioInicial(
      "", "", "", "", "", getPeriodoActual(), getAñoActual(), currentMes
    ),
  });

  // Component state
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tag, setTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [esFormularioExistente, setEsFormularioExistente] = useState(false);
  const [area, setArea] = useState("");
  const [areaOptions, setAreaOptions] = useState<string[]>([]);
  const [extintores, setExtintores] = useState<ExtintorBackend[]>([]);
  const [extintoresSeleccionados, setExtintoresSeleccionados] = useState<ExtintorBackend[]>([]);
  const [soloExtintores, setSoloExtintores] = useState(false);

  // Load areas on component mount
  useEffect(() => {
    const cargarAreas = async () => {
      try {
        const areas = await inspeccionService.buscarAreas("");
        setAreaOptions(areas);
      } catch (error) {
        console.error("Error al cargar áreas:", error);
      }
    };

    cargarAreas();
  }, []);

  // Update form when month changes
  useEffect(() => {
    setValue("mesActual", currentMes);
  }, [currentMes, setValue]);

  // Set tag based on area
  useEffect(() => {
    const obtenerTagPorArea = async () => {
      if (!area) return;
      
      try {
        const tagEncontrado = await inspeccionService.obtenerTagPorArea(area);
        if (tagEncontrado) {
          setTag(tagEncontrado);
          setValue('tag', tagEncontrado);
        }
      } catch (error) {
        console.error('Error al obtener tag:', error);
      }
    };

    obtenerTagPorArea();
  }, [area, setValue]);

  // Handle extintores based on area
  useEffect(() => {
    if (!area) return;
    
    if (!AREAS_CON_SELECCION_EXTINTORES.includes(area)) {
      setExtintoresSeleccionados(extintores);
    } else {
      setExtintoresSeleccionados([]);
    }
  }, [area, extintores]);

  // Handlers
  const handleExtintoresSeleccionados = useCallback((seleccionados: ExtintorBackend[]) => {
    setExtintoresSeleccionados(seleccionados);
  }, []);

  const handleAreaChange = useCallback(async (selectedArea: string) => {
    setArea(selectedArea);
    
    try {
      const tagEncontrado = await inspeccionService.obtenerTagPorArea(selectedArea);
      if (tagEncontrado) {
        setTag(tagEncontrado);
        setValue('tag', tagEncontrado);
      }
      
      const areaExtintores = await inspeccionService.obtenerExtintoresPorArea(selectedArea);
      setExtintores(areaExtintores);
    } catch (error) {
      console.error('Error al obtener datos del área:', error);
    }
  }, [setValue]);

  const todosExtintoresSinInspeccionar = useCallback(() => {
    if (!extintores || extintores.length === 0) return true;
    return extintores.every(ext => ext.inspeccionado === false);
  }, [extintores]);

  const handleTagSubmit = async () => {
    if (tag.trim() === "") {
      setError("Por favor, ingresa un valor para el TAG.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const datosIniciales = {
        tag,
        periodo: getPeriodoActual(),
        año: getAñoActual(),
        mesActual: currentMes,
        area
      };

      const response = await inspeccionService.verificarTag(datosIniciales);
      
      const mostrarSoloExtintores = response.existe && 
      !todosExtintoresSinInspeccionar() &&
      response.formulario.meses?.[currentMes]?.inspeccionesExtintor?.length > 0;

       const formularioExiste = response.existe;
      // const tieneDatosMesActual = formularioExiste && 
      //                      response.formulario.meses?.[currentMes] && 
      //                      Object.keys(response.formulario.meses[currentMes]).length > 0;
      setExtintores(response.extintores || []);
      
      const formularioInicial = crearFormularioInicial(
        response.superintendencia || "",
        area,
        tag,
        "",
        "",
        getPeriodoActual(),
        getAñoActual(),
        currentMes
      );
      if (response.existe) {
        setEsFormularioExistente(formularioExiste);
        const mesAlmacenado = response.formulario.mesActual;

        if (mesAlmacenado === currentMes && (extintores.length == 0)) {
          setError("El formulario ya existe para este mes. No es necesario realizar cambios.");
          return;
        }

          // Si existe el formulario pero faltan inspeccionar extintores
        if (mesAlmacenado === currentMes && (extintores.length > 0)) {
          setSoloExtintores(mostrarSoloExtintores);
        }

        reset(formularioInicial);
        setShowForm(true);
      } else {
        setEsFormularioExistente(false);
        reset(formularioInicial);
        setShowForm(true);
      }
    } catch (error) {
      console.error("Error al verificar el TAG:", error);
      setError("Ocurrió un error al comunicarse con el servidor. Por favor, intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormularioInspeccion) => {
    try {
      if (soloExtintores) {
        // Solo enviar datos de extintores
        const extintoresData = {
          tag: tag,
          extintores: data.meses[currentMes].inspeccionesExtintor
        };
        
        await inspeccionService.actualizarExtintoresPorTag(tag, extintoresData);
        console.log("Datos a enviar (extintores):", extintoresData);
      } else if (esFormularioExistente) {
        // Actualizar todo el mes
        await inspeccionService.actualizarMesPorTag(tag, currentMes, data.meses[currentMes]);
      } else {
        // Crear nuevo formulario completo
        await inspeccionService.crearFormSistemasEmergencia(data);
      }
      
      setSuccessMessage("¡Inspección guardada correctamente!");
      
      setTimeout(() => {
        resetForm();
        router.push("/dashboard/inspeccion-sistemas-emergencia");
      }, 3000);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setError("Error al guardar la inspección. Intente nuevamente.");
    }
  };

  const resetForm = () => {
    setSuccessMessage(null);
    reset(crearFormularioInicial("", "", "", "", "", getPeriodoActual(), getAñoActual(), currentMes));
    setShowForm(false);
    setTag("");
    setArea("");
    setError(null);
    setExtintores([]);
    setExtintoresSeleccionados([]);
  };

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
          <Alert severity="info" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!showForm ? (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Ingrese primero el área y por defecto se completará el TAG
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="tag-label">TAG</InputLabel>
                  <Select
                    labelId="tag-label"
                    id="tag-select"
                    value={tag}
                    label="TAG"
                    onChange={(e) => setTag(e.target.value as string)}
                  >
                    {TAG_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
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

              <Grid item xs={12} sm={6}>
                {area && (
                  AREAS_CON_SELECCION_EXTINTORES.includes(area) ? (
                    <ExtintoresChecklist 
                      area={area} 
                      extintores={extintores}
                      onExtintoresSeleccionados={handleExtintoresSeleccionados}
                    />
                  ) : (
                    <Paper elevation={2} sx={{ p: 2, height: '100%', minHeight: '56px' }}>
                      <Alert severity="info">
                      Para el área &quot;{area}&quot; no es necesario seleccionar extintores.

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
              disabled={loading || !area}
            >
              {loading ? "Verificando..." : "Continuar"}
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Mostrar InformacionGeneral solo si es formulario nuevo */}
            {!esFormularioExistente && (
              <InformacionGeneral control={control} errors={errors} />
            )}

            {/* Mostrar SistemasPasivos y Activos si:
                - Es formulario nuevo O
                - No hay datos para el mes actual
            */}
            {(!esFormularioExistente || !soloExtintores) && (
              <>
                <SistemasPasivos control={control} currentMes={currentMes} />
                <SistemasActivos control={control} currentMes={currentMes} />
              </>
            )}

            {/* Siempre mostrar extintores */}
            <InspeccionExtintores 
              control={control} 
              currentMes={currentMes}  
              extintores={AREAS_CON_SELECCION_EXTINTORES.includes(area) ? extintoresSeleccionados : extintores}
            />

            {/* Mostrar InformacionInspector si:
                - Es formulario nuevo O
                - No hay datos para el mes actual
            */}
            {(!esFormularioExistente || !soloExtintores) && (
              <InformacionInspector
                control={control}
                currentMes={currentMes}
                setValue={setValue}
                errors={errors}
              />
            )}

            <Box sx={{ mt: 4 }}>
              <Grid container spacing={2} justifyContent="space-between">
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    fullWidth
                    onClick={resetForm}
                  >
                    Cancelar
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={loading}
                  >
                    {soloExtintores ? "Guardar Inspección de Extintores" : "Guardar Inspección"}
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