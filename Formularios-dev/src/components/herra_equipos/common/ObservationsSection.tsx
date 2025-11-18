"use client"

import { TextField, Typography, Paper } from "@mui/material"
import type { UseFormRegister, FieldErrors } from "react-hook-form"
import type { GeneralObservationsConfig, FormDataHerraEquipos } from "../types/IProps"

interface ObservationsSectionProps {
  config: GeneralObservationsConfig
  register: UseFormRegister<FormDataHerraEquipos>
  errors: FieldErrors<FormDataHerraEquipos>
  readonly?: boolean
}

export function ObservationsSection({ config, register, errors, readonly=false }: ObservationsSectionProps) {
  if (!config.enabled) {
    return null
  }

  const defaultLabel = config.required 
    ? "Observaciones generales" 
    : "Observaciones generales (Opcional)"

  return (
     <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {config.label || defaultLabel}
      </Typography>

      <TextField
        label={config.label || defaultLabel}
        placeholder={config.placeholder || "Ingrese observaciones adicionales..."}
        multiline
        rows={4}
        fullWidth
        required={config.required}
        {...register("generalObservations", { // ✅ Cambio aquí
          required: config.required ? "Las observaciones son obligatorias" : false,
          minLength: config.required ? {
            value: 10,
            message: "Las observaciones deben tener al menos 10 caracteres",
          } : undefined,
          maxLength: config.maxLength ? {
            value: config.maxLength,
            message: `Las observaciones no deben exceder ${config.maxLength} caracteres`,
          } : undefined,
        })}
        error={!!errors.generalObservations} // ✅ Cambio aquí
        helperText={
          errors.generalObservations?.message as string || // ✅ Cambio aquí
          config.helperText || 
          undefined
        }
      />
    </Paper>
  )
}