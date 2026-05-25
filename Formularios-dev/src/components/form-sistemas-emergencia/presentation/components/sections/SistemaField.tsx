// src/components/form-sistemas-emergencia/presentation/components/sections/SistemaField.tsx

import React from "react";
import { Typography, FormControl, InputLabel, Select, MenuItem, TextField, Grid, FormHelperText } from "@mui/material";
import { type Control, Controller, type UseFormSetValue, type FieldErrors, useWatch, type FieldPath } from "react-hook-form";
import type { FormularioInspeccion, SistemaPath } from "@/types/formTypes";
import EstadoInspeccionSelect from "./EstadoInspeccionSelect";

interface SistemaFieldProps {
  name: string;
  label: string;
  control: Control<FormularioInspeccion>;
  setValue: UseFormSetValue<FormularioInspeccion>;
  currentMes: string;
  type: "pasivos" | "activos";
  disabled?: boolean;
  errors?: FieldErrors<FormularioInspeccion>;
}

const cantidadOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const SistemaField = ({
  name,
  label,
  control,
  setValue,
  currentMes,
  type,
  disabled = false,
  errors,
}: SistemaFieldProps) => {
  const basePath =
    type === "pasivos"
      ? `meses.${currentMes}.inspeccionesActivos.sistemasPasivos.${name}`
      : `meses.${currentMes}.inspeccionesActivos.sistemasActivos.${name}`;

  // Usamos useWatch para monitorear en tiempo real la cantidad de esta fila exacta
  const cantidadVal = useWatch({
    control,
    name: `${basePath}.cantidad` as FieldPath<FormularioInspeccion>,
  });

  // Obtenemos los errores específicos para este campo mapeando dinámicamente sin usar any
  const sectionErrors = errors?.meses?.[currentMes]?.inspeccionesActivos?.[
    type === "pasivos" ? "sistemasPasivos" : "sistemasActivos"
  ] as Record<string, { cantidad?: { message?: string }; estado?: { message?: string } }> | undefined;

  const errorCantidad = sectionErrors?.[name]?.cantidad;
  const errorEstado = sectionErrors?.[name]?.estado;

  return (
    <Grid container spacing={2} sx={{ mb: 2, alignItems: "center" }}>
      <Grid size={{ xs: 12, sm: 3 }}>
        <Typography variant="body2" color={errorCantidad || errorEstado ? "error" : "textPrimary"}>
          {label}
        </Typography>
      </Grid>

      {/* Cantidad */}
      <Grid size={{ xs: 12, sm: 3 }}>
        <Controller
          name={`${basePath}.cantidad` as SistemaPath}
          control={control}
          rules={{ 
            required: "La cantidad es obligatoria",
            validate: (val) => {
              if (val === undefined || val === null || val === "") return "Seleccione la cantidad";
              return true;
            }
          }}
          render={({ field }) => (
            <FormControl fullWidth size="small" error={!!errorCantidad}>
              <InputLabel id={`${name}-cantidad-label`}>Cantidad</InputLabel>
              <Select
                labelId={`${name}-cantidad-label`}
                id={`${name}-cantidad-select`}
                value={field.value ?? ""}
                label="Cantidad"
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val);
                  
                  // Lógica reactiva de cantidad vs. estado usando comparación de tipo seguro
                  if (Number(val) === 0) {
                    setValue(`${basePath}.estado` as FieldPath<FormularioInspeccion>, "N/A", { shouldValidate: true, shouldDirty: true });
                  } else {
                    // Si cambia a > 0 y el estado actual es N/A o vacío, lo pre-llenamos a ✓
                    const currentEstado = control._formValues?.meses?.[currentMes]?.inspeccionesActivos?.[
                      type === "pasivos" ? "sistemasPasivos" : "sistemasActivos"
                    ]?.[name]?.estado;
                    if (currentEstado === "N/A" || !currentEstado) {
                      setValue(`${basePath}.estado` as FieldPath<FormularioInspeccion>, "✓", { shouldValidate: true, shouldDirty: true });
                    }
                  }
                }}
                disabled={disabled}
                error={!!errorCantidad}
              >
                {cantidadOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {errorCantidad && (
                <FormHelperText error>{errorCantidad.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>

      {/* Estado (Bueno/Malo) */}
      <Grid size={{ xs: 12, sm: 3 }}>
        <Controller
          name={`${basePath}.estado` as SistemaPath}
          control={control}
          rules={{ 
            required: "El estado es obligatorio",
            validate: (val) => {
              if (!val) return "El estado es obligatorio";
              return true;
            }
          }}
          render={({ field }) => (
            <EstadoInspeccionSelect
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              cantidad={cantidadVal as number | undefined}
              error={!!errorEstado}
              helperText={errorEstado?.message}
            />
          )}
        />
      </Grid>

      {/* Observaciones */}
      <Grid size={{ xs: 12, sm: 3 }}>
        <Controller
          name={`${basePath}.observaciones` as SistemaPath}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Observaciones"
              fullWidth
              size="small"
              variant="outlined"
              disabled={disabled}
              InputProps={{ readOnly: disabled }}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

export default SistemaField;
