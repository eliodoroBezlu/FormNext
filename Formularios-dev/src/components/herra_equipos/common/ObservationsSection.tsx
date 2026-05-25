"use client"

import { useState } from "react"
import { TextField, Typography, Paper } from "@mui/material"
import type { UseFormRegister, FieldErrors } from "react-hook-form"
import type { GeneralObservationsConfig, FormDataHerraEquipos } from "../types/IProps"

interface ObservationsSectionProps {
  config: GeneralObservationsConfig
  register: UseFormRegister<FormDataHerraEquipos>
  errors: FieldErrors<FormDataHerraEquipos>
  readonly?: boolean
}

export function ObservationsSection({
  config,
  register,
  errors,
  readonly = false,
}: ObservationsSectionProps) {
  const [charCount, setCharCount] = useState(0)

  if (!config.enabled) return null

  const label = config.label
    ? config.label
    : config.required
      ? "Observaciones generales"
      : "Observaciones generales (Opcional)"

  const { onChange: registerOnChange, ...restRegister } = register(
    "generalObservations",
    {
      required: config.required ? "Las observaciones son obligatorias" : false,
      minLength: config.required
        ? { value: 10, message: "Las observaciones deben tener al menos 10 caracteres" }
        : undefined,
      maxLength: config.maxLength
        ? { value: config.maxLength, message: `No debe exceder ${config.maxLength} caracteres` }
        : undefined,
    },
  )

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <TextField
        label={label}
        placeholder={config.placeholder || "Ingrese observaciones adicionales..."}
        multiline
        rows={4}
        fullWidth
        disabled={readonly}
        required={config.required}
        onChange={(e) => {
          setCharCount(e.target.value.length)
          registerOnChange(e)
        }}
        {...restRegister}
        error={!!errors.generalObservations}
        helperText={
          (errors.generalObservations?.message as string) ||
          config.helperText ||
          undefined
        }
        inputProps={{
          maxLength: config.maxLength || undefined,
          "aria-required": config.required ? "true" : undefined,
          "aria-invalid": !!errors.generalObservations ? "true" : undefined,
        }}
      />
      {config.maxLength && !readonly && (
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: "block", textAlign: "right", mt: 0.5 }}
        >
          {charCount}/{config.maxLength}
        </Typography>
      )}
    </Paper>
  )
}
