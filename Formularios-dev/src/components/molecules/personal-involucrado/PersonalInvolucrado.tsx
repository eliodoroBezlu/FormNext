"use client";

import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import AutocompleteTrabajador from "@/components/molecules/autocomplete-trabajador/AutocompleteTrabajador";
import {
  Controller,
  useFieldArray,
  Control,
  FieldValues,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";
import { TrabajadorOption } from "@/components/molecules/autocomplete-trabajador/AutocompleteTrabajador";
import { Button } from "@/components/atoms/button/Button";

interface PersonalInvolucradoProps<T extends FieldValues> {
  control: Control<T>;
  name: string;
  setValue: UseFormSetValue<T>;
  trigger: UseFormTrigger<T>;
  onTrabajadorSelect: (
    index: number,
    trabajador: TrabajadorOption | null,
  ) => void;
  disabled?: boolean;
}

export const PersonalInvolucrado = <T extends FieldValues>({
  control,
  name,
  setValue,
  trigger,
  onTrabajadorSelect,
  disabled = false,
}: PersonalInvolucradoProps<T>) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as never,
  });

  const isEmpty = (val: unknown): boolean =>
    !val || (typeof val === "string" && val.trim() === "");

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
                {!disabled && fields.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => remove(index)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
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
                      if (disabled) return true;
                      if (isEmpty(value))
                        return "Nombre y Apellido es requerido";
                      return true;
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <AutocompleteTrabajador
                      label="Nombre y Apellido"
                      placeholder="Seleccione o escriba un nombre"
                      value={field.value || null}
                      onChange={(nomina, trabajador) => {
                        // ✅ setValue actualiza _formValues sincrónicamente
                        setValue(
                          `${name}.${index}.nombre` as never,
                          (nomina ?? "") as never,
                          { shouldValidate: false, shouldDirty: true },
                        );
                        // ✅ Si viene de la lista, auto-rellenar CI
                        if (trabajador?.ci) {
                          setValue(
                            `${name}.${index}.ci` as never,
                            trabajador.ci as never,
                            { shouldValidate: false, shouldDirty: true },
                          );
                        }
                        onTrabajadorSelect(index, trabajador ?? null);
                      }}
                      onBlur={() => {
                        // ✅ Validar después de que setValue actualizó el valor
                        trigger(`${name}.${index}.nombre` as never);
                        field.onBlur();
                      }}
                      required={true}
                      error={!!error}
                      helperText={error?.message}
                      disabled={disabled}
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
                      if (isEmpty(value)) return "C.I. es requerido";
                      return true;
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="C.I."
                      placeholder="Ingrese C.I."
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      error={!!error}
                      helperText={error?.message}
                      disabled={disabled}
                    />
                  )}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

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
