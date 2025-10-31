"use client"

import { TextField, Typography, Paper, Box } from "@mui/material"
import type { UseFormRegister, FieldErrors } from "react-hook-form"
import type { FormDataHerraEquipos } from "../types/IProps"

interface SupervisorSignatureProps {
  register: UseFormRegister<FormDataHerraEquipos>
  errors: FieldErrors<FormDataHerraEquipos>
}

export function SupervisorSignature({ register, errors }: SupervisorSignatureProps) {
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Firma del Supervisor
      </Typography>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <TextField
          label="Nombre del Supervisor"
          placeholder="Ingrese nombre completo"
          required
          fullWidth
          {...register("verification.supervisorName", {
            required: "El nombre del supervisor es obligatorio",
          })}
          error={!!errors.verification?.supervisorName}
          helperText={errors.verification?.supervisorName?.message}
        />

        <TextField
          label="Firma"
          placeholder="Firma digital o código"
          required
          fullWidth
          {...register("verification.supervisorSignature", {
            required: "La firma del supervisor es obligatoria",
          })}
          error={!!errors.verification?.supervisorSignature}
          helperText={errors.verification?.supervisorSignature?.message}
        />
      </Box>
    </Paper>
  )
}
