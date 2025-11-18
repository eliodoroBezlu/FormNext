"use client"

import { FormControl, InputLabel, Select, MenuItem, Typography, Paper, Box, FormHelperText, Chip } from "@mui/material"
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form"
import { ColorCodeConfig, FormDataHerraEquipos } from "../types/IProps"

interface ColorCodeSectionProps {
  config: ColorCodeConfig
  register: UseFormRegister<FormDataHerraEquipos>
  setValue: UseFormSetValue<FormDataHerraEquipos>
  watch: UseFormWatch<FormDataHerraEquipos>
  errors: FieldErrors<FormDataHerraEquipos>
  readonly?: boolean
}

const COLOR_OPTIONS = [
  { value: "rojo", label: "Rojo", color: "#ef4444" },
  { value: "amarillo", label: "Amarillo", color: "#eab308" },
  { value: "verde", label: "Verde", color: "#22c55e" },
  { value: "azul", label: "Azul", color: "#3b82f6" },
]

const TRIMESTRE_OPTIONS = [
  { value: "1", label: "Primer Trimestre (Ene-Mar)" },
  { value: "2", label: "Segundo Trimestre (Abr-Jun)" },
  { value: "3", label: "Tercer Trimestre (Jul-Sep)" },
  { value: "4", label: "Cuarto Trimestre (Oct-Dic)" },
]

export function ColorCodeSection({ config, setValue, watch, errors, readonly = false }: ColorCodeSectionProps) {
  if (!config.enabled) {
    return null
  }

  const selectedColor = watch("verification.codigoColor") as string
  const selectedTrimestre = watch("verification.trimestre") as string

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Código de Color
      </Typography>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <FormControl fullWidth required error={!!errors.verification?.codigoColor}>
          <InputLabel>Color</InputLabel>
          <Select
            value={selectedColor || ""}
            label="Color"
            onChange={(e) => setValue("verification.codigoColor", e.target.value)}
            disabled={readonly}
          >
            {COLOR_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    size="small"
                    sx={{
                      bgcolor: option.color,
                      width: 16,
                      height: 16,
                      "& .MuiChip-label": { display: "none" },
                    }}
                  />
                  {option.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
          {errors.verification?.codigoColor && (
            <FormHelperText>{errors.verification.codigoColor.message as string}</FormHelperText>
          )}
        </FormControl>

        {config.hasTrimestre && (
          <FormControl fullWidth required error={!!errors.verification?.trimestre}>
            <InputLabel>Trimestre</InputLabel>
            <Select
              value={selectedTrimestre || ""}
              label="Trimestre"
              onChange={(e) => setValue("verification.trimestre", e.target.value)}
              disabled={readonly}
            >
              {TRIMESTRE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.verification?.trimestre && (
              <FormHelperText>{errors.verification.trimestre.message as string}</FormHelperText>
            )}
          </FormControl>
        )}
      </Box>
    </Paper>
  )
}