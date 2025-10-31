"use client"

import { TextField, Typography, Paper, Box } from "@mui/material"
import type { UseFormRegister, FieldErrors } from "react-hook-form"
import type { FormDataHerraEquipos } from "../types/IProps"

interface InspectorSignatureProps {
  register: UseFormRegister<FormDataHerraEquipos>
  errors: FieldErrors<FormDataHerraEquipos>
}

export function InspectorSignature({ register, errors }: InspectorSignatureProps) {
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Firma del Inspector
      </Typography>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <TextField
          label="Nombre del Inspector"
          placeholder="Ingrese nombre completo"
          required
          fullWidth
          {...register("verification.inspectorName", {
            required: "El nombre del inspector es obligatorio",
          })}
          error={!!errors.verification?.inspectorName}
          helperText={errors.verification?.inspectorName?.message}
        />

        <TextField
          label="Firma"
          placeholder="Firma digital o código"
          required
          fullWidth
          {...register("verification.inspectorSignature", {
            required: "La firma del inspector es obligatoria",
          })}
          error={!!errors.verification?.inspectorSignature}
          helperText={errors.verification?.inspectorSignature?.message}
        />
      </Box>
    </Paper>
  )
}
