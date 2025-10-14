// SOLUCIÓN COMPLETA para PersonalInvolucrado.tsx

// 1. Cambiar la interfaz y el componente para que sea genérico:

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
}

// Cambiar de React.FC a función genérica:
export const PersonalInvolucrado = <T extends FieldValues>({
  control,
  name,
  onTrabajadorSelect,
}: PersonalInvolucradoProps<T>) => {
  // Hook para manejar array dinámico
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as never, // Necesario para paths dinámicos
  });

  // Agregar nueva fila vacía
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
                {fields.length > 1 && (
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
                    />
                  )}
                />

                {/* C.I. */}
                <Controller
                  name={`${name}.${index}.ci` as never}
                  control={control}
                  rules={{
                    validate: (value) => {
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
                    />
                  )}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

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
      </Paper>
    </Box>
  );
};