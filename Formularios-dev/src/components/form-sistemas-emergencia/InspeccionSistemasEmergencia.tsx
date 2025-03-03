"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Box, Button, Typography, Paper, Container, TextField, Alert } from "@mui/material";
import {
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
  const [currentMes, setCurrentMes] = useState<Mes>(obtenerMesActual());
  const [loading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false); // Controla la visibilidad del formulario
  const [tag, setTag] = useState<string>(""); // Almacena el valor del tag
  const [error, setError] = useState<string | null>(null); // Manejo de errores
  const [formularioExistente, setFormularioExistente] = useState<FormularioInspeccion | null>(null);

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
      obtenerMesActual(),
    ),
  });

  useEffect(() => {
    // Actualizar el formulario cuando cambie el mes
    setValue("mesActual", currentMes);
  }, [currentMes, setValue]);

  const onSubmit = async (data: FormularioInspeccion) => {
    try {
      console.log("Formulario enviado:", data);
      const mesSeleccionado: Mes = "JUNIO"
      setCurrentMes(mesSeleccionado); // Actualizar el estado local
      setValue("mesActual", mesSeleccionado); 

      // Actualizar fecha de última modificación
      data.fechaUltimaModificacion = new Date();

      if (formularioExistente) {
        // Si el formulario ya existe, actualizar solo el mes actual
        await inspeccionService.actualizarMesPorTag(tag, currentMes, data.meses[currentMes]);
      } else {
        // Si no existe, crear un nuevo formulario
        await inspeccionService.crearFormSistemasEmergencia(data);
      }

      router.push("/dashboard/inspeccion-sistemas-emergencia");
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  };

  const handleTagSubmit = async () => {
    if (tag.trim() === "") {
      setError("Por favor, ingresa un valor para el TAG.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Datos a enviar al backend
      const datosIniciales = {
        tag,
        periodo: getPeriodoActual(),
        año: getAñoActual(),
      };

      // Verificar si existe el formulario en el backend
      const response = await inspeccionService.verificarTag(datosIniciales);

      if (response.existe) {
        // Si existe, cargar los datos del formulario existente
        setFormularioExistente(response.formulario);
        reset(response.formulario); // Prellenar el formulario con los datos existentes
      } else {
        // Si no existe, inicializar un nuevo formulario
        reset(crearFormularioInicial("", "", tag, "", "", getPeriodoActual(), getAñoActual(), currentMes));
      }

      // Mostrar el formulario principal
      setShowForm(true);
    } catch (error) {
      console.error("Error al verificar el TAG:", error);
      setError("Ocurrió un error al comunicarse con el servidor. Por favor, intenta más tarde.");
    } finally {
      setLoading(false);
    }
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

        {/* Mensaje de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Campo para el tag */}
        {!showForm && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Ingresa el TAG para continuar:
            </Typography>
            <TextField
              fullWidth
              label="TAG"
              value={tag || ""}
              onChange={(e) => setTag(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
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
            <InspeccionExtintores control={control} currentMes={currentMes} />

            {/* Información del Inspector */}
            <InformacionInspector
              control={control}
              currentMes={currentMes}
              setValue={setValue}
              errors={errors}
            />

            <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
              <Button variant="outlined" color="secondary" size="large">
                Cancelar
              </Button>
              <Button type="submit" variant="contained" color="primary" size="large">
                Guardar Inspección
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Container>
  );
}