"use client";

import { useEffect, useState } from "react";
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

// Importación de componentes

import { inspeccionService } from "../../services/inspeccionService";
import { useRouter } from "next/navigation";
import InformacionGeneral from "./InformacionGeneral";
import SistemasPasivos from "./SsitemasPasivos";
import SistemasActivos from "./SistemasActivos";
import InspeccionExtintores from "./InspeccionExtintores";
import InformacionInspector from "./InformacionInspector";

// Función auxiliar para obtener el mes actual como tipo Mes
const obtenerMesActual = (): Mes => {
  const meses: Mes[] = [
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
  return meses[new Date().getMonth()];
};

const tagOptions = [
  "710BL713",
  "710BL718",
  "710BL712",
  "710BL723",
  "710BL724",
  "710BL725",
  "710BL726",
  "710BL727",
  "710BL728",
  "710BL729",
  "710BL741",
  "780BL001",
  "710BL721",
  "710BL711",
  "710BL740", // Added as requested
];

// Función para obtener el período actual
const getPeriodoActual = (): "ENERO-JUNIO" | "JULIO-DICIEMBRE" => {
  const mesActual = new Date().getMonth();
  return mesActual < 6 ? "ENERO-JUNIO" : "JULIO-DICIEMBRE";
};

// Función para obtener el año actual
const getAñoActual = (): number => {
  return new Date().getFullYear();
};






export function InspeccionSistemasEmergencia() {
  const router = useRouter();
  const [currentMes] = useState<Mes>(obtenerMesActual());
  const [loading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false); // Controla la visibilidad del formulario
  const [tag, setTag] = useState<string>(""); // Almacena el valor del tag
  const [error, setError] = useState<string | null>(null); // Manejo de errores
  const [esFormularioExistente, setEsFormularioExistente] = useState<boolean>(false);
  const [area, setArea] = useState<string>("");
  //const [areas, setAreas] = useState<string[]>([]); // Estado para las áreas
  const [areaOptions, setAreaOptions] = useState<string[]>([]);
  const [extintores, setExtintores] = useState<ExtintorBackend[]>([]);  // Estado para los extintores
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
 


  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormularioInspeccion>({
    defaultValues: crearFormularioInicial(
      "", // superintendencia
      "", // area
      "", // tag
      "", // responsableEdificio
      "", // edificio
      getPeriodoActual(),
      getAñoActual(),
      obtenerMesActual()
    ),
  });

  useEffect(() => {
    // Actualizar el formulario cuando cambie el mes
    setValue("mesActual", currentMes);
  }, [currentMes, setValue]);

  useEffect(() => {
    const obtenerTagPorArea = async () => {
      if (area) {
        try {
          const tagEncontrado = await inspeccionService.obtenerTagPorArea(area);
          if (tagEncontrado) {
            setTag(tagEncontrado);
            setValue('tag', tagEncontrado); // Actualiza el valor en react-hook-form
          }
        } catch (error) {
          console.error('Error al obtener tag:', error);
        }
      }
    };

    obtenerTagPorArea();
  }, [area, setValue]);


  
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
        mesActual: obtenerMesActual(),
        area: area
      };  
      console.log(datosIniciales)

      const response = await inspeccionService.verificarTag(datosIniciales);
      console.log("Respuesta del backend:", response);
      
      

      if (response.existe) {
        setEsFormularioExistente(true);
        const mesAlmacenado = response.formulario.mesActual;

        if (mesAlmacenado === obtenerMesActual()) {
          console.log("Los meses coinciden. Mostrando mensaje de error.");
          setError(
            "El formulario ya existe para este mes. No es necesario realizar cambios."
          );
          return; // No continúa con la carga del formulario
        }

        // Si el mes no coincide, prellenar solo TAG, superintendencia y área
        reset(
          crearFormularioInicial(
            response.superintendencia || "",
            area,
            tag,
            "",
            "",
            getPeriodoActual(),
            getAñoActual(),
            obtenerMesActual()
          )
        );
        setExtintores(response.extintores || []);
        

        setShowForm(true);
      } else {
        setEsFormularioExistente(false);
        // Si el TAG no existe, prellenar solo el TAG y valores iniciales
        reset(
          crearFormularioInicial(
            response.superintendencia || "",
            area,
            tag,
            "",
            "",
            getPeriodoActual(),
            getAñoActual(),
            obtenerMesActual()
          )
        );
        setExtintores(response.extintores || []); 
        console.log("Extintores recibidos:", response.extintores);
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
      console.log("Formulario enviado:", data);
  
  
      // Obtener el mes actual
      const mesActual = obtenerMesActual();
  
      // Preparar los datos del mes actual
      const datosMesActual = data.meses[mesActual];
      
  
      // Enviar los datos al backend para actualizar el mes
      if (esFormularioExistente) {
        const response = await inspeccionService.actualizarMesPorTag(
          tag, // El tag del formulario
          mesActual, // El mes actual
          datosMesActual // Los datos del mes actual
        );
  
        console.log("Respuesta del backend (actualización):", response);
      } else {
        // Si no existe, crear un nuevo formulario
        await inspeccionService.crearFormSistemasEmergencia(data);
      }
       // Mostrar mensaje de éxito
       setSuccessMessage("¡Inspección guardada correctamente!");
        
       // Resetear después de 3 segundos
       setTimeout(() => {
         setSuccessMessage(null);
         reset(crearFormularioInicial("", "", "", "", "", getPeriodoActual(), getAñoActual(), obtenerMesActual()));
         setShowForm(false);
         setTag("");
         setArea("");
       }, 3000);
  
      // Resetear el formulario y mostrar el campo de búsqueda del TAG
      reset(crearFormularioInicial("", "", "", "", "", getPeriodoActual(), getAñoActual(), obtenerMesActual()));
      setShowForm(false); // Ocultar el formulario
      setTag(""); // Limpiar el campo del TAG
      setArea(""); // Limpiar el campo del área
      setError(null); // Limpiar cualquier mensaje de error
  
      router.push("/dashboard/inspeccion-sistemas-emergencia");
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  };

  useEffect(() => {
    const cargarAreas = async () => {
      try {
        const areas = await inspeccionService.buscarAreas(""); // Obtener todas las áreas
        setAreaOptions(areas);
      } catch (error) {
        console.error("Error al cargar áreas:", error);
      }
    };

    cargarAreas();
  }, []);
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Formulario de Inspección de Seguridad
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Código: 3.02.P01.F17 - Rev. 2
        </Typography>
        {/* Mensaje de éxito */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Mensaje de error */}
        {error && (
          <Alert severity="info" key={error} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        

        {/* Campo para el tag */}
        {!showForm && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Ingrese primero el area y por defecto le llenara el tag
              Ingresa el TAG y Área para continuar:
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="tag-label">TAG</InputLabel>
                <Select
                  labelId="tag-label"
                  id="tag-select"
                  value={tag || ""}
                  label="TAG"
                  onChange={(e) => setTag(e.target.value as string)}
                >
                  {tagOptions.map((tagOption) => (
                    <MenuItem key={tagOption} value={tagOption}>
                      {tagOption}
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
                    value={area || ""}
                    label="Área"
                    onChange={async (e) => {
                      const selectedArea = e.target.value as string;
                      setArea(selectedArea);
                      
                      // Obtener el tag automáticamente
                      try {
                        const tagEncontrado = await inspeccionService.obtenerTagPorArea(selectedArea);
                        if (tagEncontrado) {
                          setTag(tagEncontrado);
                          setValue('tag', tagEncontrado);
                        }
                      } catch (error) {
                        console.error('Error al obtener tag:', error);
                      }
                    }}
                  >
                    {areaOptions.map((areaOption) => (
                      <MenuItem key={areaOption} value={areaOption}>
                        {areaOption}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              onClick={handleTagSubmit}
              disabled={loading}
            >
              {loading ? "Verificando..." : "Continuar"}
            </Button>
          </Box>
        )}

        {/* Formulario principal */}
        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Selector de Mes */}

            {/* Información General */}
            <InformacionGeneral control={control} errors={errors} />

            {/* Sistemas Pasivos */}
            <SistemasPasivos control={control} currentMes={currentMes} />

            {/* Sistemas Activos */}
            <SistemasActivos control={control} currentMes={currentMes} />

            {/* Extintores */}
            <InspeccionExtintores control={control} currentMes={currentMes}  extintores={extintores}/>

            {/* Información del Inspector */}
            <InformacionInspector
              control={control}
              currentMes={currentMes}
              setValue={setValue}
              errors={errors}
            />

            <Box sx={{ mt: 4 }}>
              <Grid container spacing={2} justifyContent="space-between">
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    fullWidth
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
                  >
                    Guardar Inspección
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