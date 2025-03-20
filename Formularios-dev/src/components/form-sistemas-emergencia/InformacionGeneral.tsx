import {
  Grid,
  TextField,
  Box,
  Typography,
  FormControl,
  Autocomplete,
} from "@mui/material";
import { type Control, Controller, type FieldErrors } from "react-hook-form";
import type { FormularioInspeccion } from "../../types/formTypes";

// Array de meses
const MESES = [
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

// Array de superintendencias
const SUPERINTENDENCIAS = [
  "Superintendencia de Mantenimiento - Eléctrico e Instrumentación Planta",
  "Superintendencia de Mantenimiento - Ingeniería de Confiabilidad",
  "Superintendencia de Mantenimiento - Mec. Plta. Chancado, Molienda y Lubricación",
  "Superintendencia de Mantenimiento - Mec. Plta. Flot., Filtros, Taller Gral. y RH",
  "Superintendencia de Mantenimiento - Planificación",
];

// Array de áreas (ejemplo con 100 áreas)
const AREAS = [
  "Chancado",
  "Confiabilidad",
  "Electrico",
  "Filtros",
  "Flotacion",
  "Generacion",
  "Instrumentacion",
  "Lubricacion",
  "Maq Herramientas",
  "Molienda",
  "Planificacion",
  "Recursos Hidricos",
  "Superintendencia",
  "Taller Soldadura",
  // ... (agrega más áreas hasta 100)
];

// Función para obtener el mes actual
const getMesActual = (): string => {
  const fechaActual = new Date();
  const mesIndex = fechaActual.getMonth(); // 0-11
  return MESES[mesIndex];
};

const PERIODOS = ["ENERO-JUNIO", "JULIO-DICIEMBRE"];

// Función para obtener el período actual
const getPeriodoActual = (): string => {
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth(); // 0-11
  return mesActual < 6 ? PERIODOS[0] : PERIODOS[1]; // ENERO-JUNIO o JULIO-DICIEMBRE
};

// Función para obtener el año actual
const getAñoActual = (): number => {
  return new Date().getFullYear();
};

interface InformacionGeneralProps {
  control: Control<FormularioInspeccion>;
  errors: FieldErrors<FormularioInspeccion>;
}

const InformacionGeneral = ({ control, errors }: InformacionGeneralProps) => {
  const mesActual = getMesActual(); // Calcula el mes actual
  const periodoActual = getPeriodoActual(); // Calcula el período actual
  const añoActual = getAñoActual(); // Calcula el año actual
  

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Información General
      </Typography>
      <Grid container spacing={2}>
        {/* Campo Superintendencia */}
        <Grid item xs={12} md={6}>
          <Controller
            name="superintendencia"
            control={control}
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.superintendencia}>
                <Autocomplete
                  {...field}
                  options={SUPERINTENDENCIAS}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Seleccionar Superintendencia"
                      error={!!errors.superintendencia}
                      helperText={errors.superintendencia?.message}
                    />
                  )}
                  onChange={(_, data) => field.onChange(data)} // Actualiza el valor del campo
                />
              </FormControl>
            )}
          />
        </Grid>

        {/* Campo Área */}
        <Grid item xs={12} md={6}>
          <Controller
            name="area"
            control={control}
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.area}>
                <Autocomplete
                  {...field}
                  options={AREAS}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Seleccionar Área"
                      error={!!errors.area}
                      helperText={errors.area?.message}
                    />
                  )}
                  onChange={(_, data) => field.onChange(data)} // Actualiza el valor del campo
                />
              </FormControl>
            )}
          />
        </Grid>

        {/* Campo TAG */}
        <Grid item xs={12} md={4}>
          <Controller
            name="tag"
            control={control}
            render={({ field }) => <TextField {...field} label="TAG" fullWidth />}
          />
        </Grid>

        {/* Campo Edificio */}
        <Grid item xs={12} md={4}>
          <Controller
            name="edificio"
            control={control}
            rules={{ required: "Este campo es obligatorio" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Edificio"
                fullWidth
                error={!!errors.edificio}
                helperText={errors.edificio?.message}
              />
            )}
          />
        </Grid>

        {/* Campo Responsable del Edificio */}
        <Grid item xs={12} md={4}>
          <Controller
            name="responsableEdificio"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Responsable del Edificio" fullWidth />
            )}
          />
        </Grid>

        {/* Mes Actual (Estático) */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle1">
              Mes: <strong>{mesActual}</strong>
            </Typography>
          </Box>
        </Grid>

        {/* Período Actual (Estático) */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle1">
              Período: <strong>{periodoActual}</strong>
            </Typography>
          </Box>
        </Grid>

        {/* Año Actual (Estático) */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle1">
              Año: <strong>{añoActual}</strong>
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InformacionGeneral;