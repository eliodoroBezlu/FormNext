// src/components/molecules/personal-involucrado/PersonalInvolucrado.tsx

import React from "react";
import { Box, Grid, Paper, Typography, TextField, IconButton } from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import AutocompleteTrabajador from "@/components/molecules/autocomplete-trabajador/AutocompleteTrabajador";
import { Controller, useFieldArray, Control, FieldValues } from "react-hook-form";
import { TrabajadorOption } from "@/components/molecules/autocomplete-trabajador/AutocompleteTrabajador";
import { Button } from "@/components/atoms/button/Button";

interface PersonalInvolucradoProps<T extends FieldValues> {
  control: Control<T>;
  name: string;
  onTrabajadorSelect: (index: number, trabajador: TrabajadorOption | null) => void;
  disabled?: boolean; // 🔥 1. Agregamos la prop opcional
}

export const PersonalInvolucrado = <T extends FieldValues>({
  control,
  name,
  onTrabajadorSelect,
  disabled = false, // 🔥 2. Valor por defecto false
}: PersonalInvolucradoProps<T>) => {
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as never,
  });

  const handleAddRow = () => {
    append({ nombre: "", ci: "" } as never);
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
        LISTA DEL PERSONAL INVOLUCRADO EN EL TRABAJO:
      </Typography>
      <Paper elevation={3} sx={{ p: 2, border: "2px solid #000" }}>
        <Grid container spacing={2}>
          {fields.map((field, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={field.id}>
              <Box
                sx={{
                  p: 2,
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                  position: "relative",
                }}
              >
                {/* 🔥 3. Ocultar botón eliminar si está disabled */}
                {!disabled && fields.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => remove(index)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}

                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ pr: 4 }}
                >
                  Persona {index + 1}
                </Typography>

                {/* Nombre y Apellido */}
                <Controller
                  name={`${name}.${index}.nombre` as never}
                  control={control}
                  rules={{
                    validate: (value) => {
                      // Si está disabled, saltamos validación o la mantenemos según prefieras
                      if (disabled) return true; 

                      const formValues = control._formValues as Record<string, unknown>;
                      const personalArray = formValues[name] as Array<{ ci?: string }>;
                      const ciValue = personalArray?.[index]?.ci;
                      
                      if (ciValue && !value) {
                        return "Nombre es requerido si se ingresa C.I.";
                      }
                      if (!ciValue && value) {
                        return "C.I. es requerido si se ingresa Nombre";
                      }
                      return true;
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <AutocompleteTrabajador
                      label="Nombre y Apellido"
                      placeholder="Seleccione o escriba un nombre"
                      value={field.value || null}
                      onChange={(nomina, trabajador) => {
                        field.onChange(nomina);
                        onTrabajadorSelect(index, trabajador ?? null);
                      }}
                      onBlur={field.onBlur}
                      required={false}
                      error={!!error}
                      helperText={error?.message}
                      disabled={disabled} // 🔥 4. Pasar disabled al Autocomplete
                    />
                  )}
                />

                {/* C.I. */}
                <Controller
                  name={`${name}.${index}.ci` as never}
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (disabled) return true;

                      const formValues = control._formValues as Record<string, unknown>;
                      const personalArray = formValues[name] as Array<{ nombre?: string }>;
                      const nombreValue = personalArray?.[index]?.nombre;
                      
                      if (nombreValue && !value) {
                        return "C.I. es requerido si se ingresa Nombre";
                      }
                      if (!nombreValue && value) {
                        return "Nombre es requerido si se ingresa C.I.";
                      }
                      return true;
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="C.I."
                      placeholder="C.I."
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      error={!!error}
                      helperText={error?.message}
                      disabled={disabled} // 🔥 5. Pasar disabled al TextField
                    />
                  )}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* 🔥 6. Ocultar botón Agregar si está disabled */}
        {!disabled && (
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddRow}
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                padding: { xs: "6px 12px", sm: "8px 16px" },
              }}
            >
              Agregar Persona
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};