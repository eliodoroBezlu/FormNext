"use client";

import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  TextField,
  Paper,
} from "@mui/material";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { FormDataHerraEquipos, OutOfServiceConfig } from "../types/IProps";

interface OutOfServiceSectionProps {
  config: OutOfServiceConfig;
  register: UseFormRegister<FormDataHerraEquipos>;
  errors: FieldErrors<FormDataHerraEquipos>;
  readonly?: boolean;
}

const responseOptions = {
  "yes-no": [
    { value: "yes", label: "SI" },
    { value: "no", label: "NO" },
  ],
  "yes-no-na": [
    { value: "yes", label: "SI" },
    { value: "no", label: "NO" },
    { value: "na", label: "N/A" },
  ],
  "yes-no-na-nr": [
    { value: "yes", label: "SI" },
    { value: "no", label: "NO" },
    { value: "na", label: "N/A" },
    { value: "nr", label: "NR" },
  ],
  "AP-MAN-RECH": [
    { value: "apto", label: "APTO" },
    { value: "mantenimiento", label: "MANTENIMIENTO" },
    { value: "rechazado", label: "RECHAZADO" },
  ],
} as const;

export function OutOfServiceSection({
  config,
  register,
  errors,
  readonly = false,
}: OutOfServiceSectionProps) {
  const options = responseOptions[config.responseType || "yes-no"];
  const fields = config.fields || {};

  // ✅ Verificar si hay campos adicionales
  const hasAdditionalFields = 
    fields.showDate || 
    fields.showObservations ||
    fields.showTag ||
    fields.showInspector ||
    fields.showCapacidad ||
    fields.showTipo;

  // ✅ Verificar si se debe mostrar el Radio Group (conclusión)
  const showRadioGroup = config.showConclusion !== false; // Por defecto true si no se especifica

  // ✅ Si no hay radio group ni campos adicionales, no renderizar nada
  if (!showRadioGroup && !hasAdditionalFields) {
    return null;
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      {/* Radio Group Principal - Condicional */}
      {showRadioGroup && (
        <FormControl
          component="fieldset"
          error={!!errors.outOfService?.status}
          required={config.required}
          disabled={readonly}
          fullWidth
          sx={{ mb: hasAdditionalFields ? 3 : 0 }}
        >
          <FormLabel 
            component="legend" 
            sx={{ mb: 2, fontWeight: 600, fontSize: "1rem" }}
          >
            {config.label || "Fuera de Servicio:"}
          </FormLabel>

          <RadioGroup
            row
            defaultValue={config.defaultValue}
            {...register("outOfService.status", {
              required: config.required ? "Este campo es obligatorio" : false,
            })}
            sx={{ gap: 3, ml: 1 }}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontWeight: 500,
                    fontSize: "0.95rem",
                  },
                }}
              />
            ))}
          </RadioGroup>

          {errors.outOfService?.status && (
            <FormHelperText error>
              {String(errors.outOfService.status.message || "Este campo es obligatorio")}
            </FormHelperText>
          )}
        </FormControl>
      )}

      {/* Campos Adicionales en Grid */}
      {hasAdditionalFields && (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          {/* Campo Fecha */}
          {fields.showDate && (
            <TextField
              type="date"
              label={fields.dateLabel || "Fecha"}
              required={fields.dateRequired}
              disabled={readonly}
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register("outOfService.date", {
                required: fields.dateRequired ? "La fecha es obligatoria" : false,
              })}
              error={!!errors.outOfService?.date}
              helperText={
                errors.outOfService?.date?.message
                  ? String(errors.outOfService.date.message)
                  : undefined
              }
            />
          )}

          {/* Campo Tag */}
          {fields.showTag && (
            <TextField
              label={fields.tagLabel || "Tag"}
              required={fields.tagRequired}
              disabled={readonly}
              fullWidth
              placeholder="Ingrese el tag..."
              {...register("outOfService.tag", {
                required: fields.tagRequired ? "El tag es obligatorio" : false,
              })}
              error={!!errors.outOfService?.tag}
              helperText={
                errors.outOfService?.tag?.message
                  ? String(errors.outOfService.tag.message)
                  : undefined
              }
            />
          )}

          {/* Campo Inspector */}
          {fields.showInspector && (
            <TextField
              label={fields.inspectorLabel || "Inspector"}
              required={fields.inspectorRequired}
              disabled={readonly}
              fullWidth
              placeholder="Nombre del inspector..."
              {...register("outOfService.inspector", {
                required: fields.inspectorRequired ? "El inspector es obligatorio" : false,
              })}
              error={!!errors.outOfService?.inspector}
              helperText={
                errors.outOfService?.inspector?.message
                  ? String(errors.outOfService.inspector.message)
                  : undefined
              }
            />
          )}

          {/* Campo Capacidad */}
          {fields.showCapacidad && (
            <TextField
              label={fields.capacidadLabel || "Capacidad"}
              required={fields.capacidadRequired}
              disabled={readonly}
              fullWidth
              placeholder="Ej: 5 toneladas"
              {...register("outOfService.capacidad", {
                required: fields.capacidadRequired ? "La capacidad es obligatoria" : false,
              })}
              error={!!errors.outOfService?.capacidad}
              helperText={
                errors.outOfService?.capacidad?.message
                  ? String(errors.outOfService.capacidad.message)
                  : undefined
              }
            />
          )}

          {/* Campo Tipo */}
          {fields.showTipo && (
            <TextField
              label={fields.tipoLabel || "Tipo"}
              required={fields.tipoRequired}
              disabled={readonly}
              fullWidth
              placeholder="Tipo de equipo..."
              {...register("outOfService.tipo", {
                required: fields.tipoRequired ? "El tipo es obligatorio" : false,
              })}
              error={!!errors.outOfService?.tipo}
              helperText={
                errors.outOfService?.tipo?.message
                  ? String(errors.outOfService.tipo.message)
                  : undefined
              }
            />
          )}

          {/* Campo Observaciones - Ocupa toda la fila si existe */}
          {fields.showObservations && (
            <TextField
              label={fields.observationsLabel || "Observaciones"}
              required={fields.observationsRequired}
              disabled={readonly}
              fullWidth
              multiline
              rows={3}
              placeholder={fields.observationsPlaceholder || "Ingrese observaciones adicionales..."}
              sx={{ gridColumn: { md: "1 / -1" } }}
              {...register("outOfService.observations", {
                required: fields.observationsRequired ? "Las observaciones son obligatorias" : false,
                maxLength: fields.observationsMaxLength
                  ? {
                      value: fields.observationsMaxLength,
                      message: `Máximo ${fields.observationsMaxLength} caracteres`,
                    }
                  : undefined,
              })}
              error={!!errors.outOfService?.observations}
              helperText={
                errors.outOfService?.observations?.message
                  ? String(errors.outOfService.observations.message)
                  : undefined
              }
            />
          )}
        </Box>
      )}
    </Paper>
  );
}