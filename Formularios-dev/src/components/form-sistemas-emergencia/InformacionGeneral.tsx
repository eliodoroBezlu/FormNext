import { Grid, TextField, Box, Typography } from "@mui/material";
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
              <TextField
                {...field}
                label="Superintendencia"
                fullWidth
                error={!!errors.superintendencia}
                helperText={errors.superintendencia?.message}
              />
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
              <TextField
                {...field}
                label="Área"
                fullWidth
                error={!!errors.area}
                helperText={errors.area?.message}
              />
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
            render={({ field }) => <TextField {...field} label="Responsable del Edificio" fullWidth />}
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