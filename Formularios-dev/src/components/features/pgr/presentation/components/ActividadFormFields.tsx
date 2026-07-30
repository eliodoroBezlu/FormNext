"use client";

import { Control, Controller, FieldErrors } from "react-hook-form";
import { Grid, IconButton, Paper, TextField, useTheme } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { PgrConfiguracionFormData } from "../../domain/schemas/pgrConfiguracionSchema";
import { ProgramacionMatriz } from "./ProgramacionMatriz";

export interface ActividadFormFieldsProps {
  control: Control<PgrConfiguracionFormData>;
  index: number;
  errors: FieldErrors<PgrConfiguracionFormData>["actividades"];
  onRemove: (index: number) => void;
  /** Mes de corte del PGR, para atenuar los meses fuera de periodo. */
  mesCorte?: number;
  /** Suma programada de la actividad, mostrada como chip de resumen. */
  totalProgramado?: number;
}

export function ActividadFormFields({
  control,
  index,
  errors,
  onRemove,
  mesCorte,
  totalProgramado,
}: ActividadFormFieldsProps) {
  const theme = useTheme();
  const actividadErrors = errors?.[index];
  const hasAnyError = !!actividadErrors;

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: theme.palette.action.hover }}
      data-question-error={hasAnyError ? "true" : undefined}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
          <Controller
            name={`actividades.${index}.verificador`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Verificador"
                fullWidth
                size="small"
                error={!!actividadErrors?.verificador}
                helperText={actividadErrors?.verificador?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <Controller
            name={`actividades.${index}.descripcion`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Actividad"
                placeholder="Descripción de la actividad"
                fullWidth
                size="small"
                error={!!actividadErrors?.descripcion}
                helperText={actividadErrors?.descripcion?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
          <Controller
            name={`actividades.${index}.responsable`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Responsable"
                fullWidth
                size="small"
                error={!!actividadErrors?.responsable}
                helperText={actividadErrors?.responsable?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
          <Controller
            name={`actividades.${index}.recurso`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Recurso"
                fullWidth
                size="small"
                error={!!actividadErrors?.recurso}
                helperText={actividadErrors?.recurso?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
          <Controller
            name={`actividades.${index}.entregable`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Entregable"
                fullWidth
                size="small"
                error={!!actividadErrors?.entregable}
                helperText={actividadErrors?.entregable?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 2, md: 0.5 }} alignContent="center" textAlign="center">
          <IconButton color="error" type="button" onClick={() => onRemove(index)}>
            <DeleteIcon />
          </IconButton>
        </Grid>

        <Grid size={12}>
          <ProgramacionMatriz
            control={control}
            actividadIndex={index}
            mesCorte={mesCorte}
            totalProgramado={totalProgramado}
            error={
              // El refine del schema cuelga del array, no de un mes concreto
              (actividadErrors?.programacion as { message?: string } | undefined)
                ?.message
            }
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
