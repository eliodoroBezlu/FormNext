// components/form-filler/VerificationFields.tsx
"use client";

import React from "react";
import { Controller, Control, FieldErrors, FieldPath } from "react-hook-form";
import { Typography, Card, CardContent, TextField, Grid } from "@mui/material";
import AutocompleteCustom from "@/components/molecules/autocomplete-custom/AutocompleteCustom";
import { DataSourceType } from "@/lib/actions/dataSourceService";
import { VerificationField, FormDataHerraEquipos } from "./types/IProps";

// Hacer el componente genérico para aceptar cualquier extensión de FormDataHerraEquipos
interface VerificationFieldsProps<
  T extends FormDataHerraEquipos = FormDataHerraEquipos
> {
  fields: VerificationField[];
  control: Control<T>;
  errors: FieldErrors<T>;
  readonly?: boolean;
}

export const VerificationFields = <
  T extends FormDataHerraEquipos = FormDataHerraEquipos
>({
  fields,
  control,
  errors,
  readonly = false,
}: VerificationFieldsProps<T>) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Datos de Verificación
        </Typography>
        <Grid container spacing={2}>
          {fields.map((field, idx) => {
            const fieldKey = `verification.${field.label}` as FieldPath<T>;
            const fieldError = (
              errors.verification as
                | Record<string, { message?: string }>
                | undefined
            )?.[field.label];

            return (
              <Grid size={{ xs: 12, md: 6 }} key={idx}>
                {field.type === "autocomplete" && field.dataSource ? (
                  <Controller
                    name={fieldKey}
                    control={control}
                    rules={{ required: "Este campo es obligatorio" }}
                    render={({ field: formField }) => (
                      <AutocompleteCustom
                        dataSource={field.dataSource as DataSourceType}
                        label={field.label}
                        value={(formField.value as string) || null}
                        onChange={formField.onChange}
                        onBlur={formField.onBlur}
                        error={!!fieldError}
                        helperText={fieldError?.message}
                        required
                        disabled={readonly}
                      />
                    )}
                  />
                ) : (
                  <Controller
                    name={fieldKey}
                    control={control}
                    rules={{ required: "Este campo es obligatorio" }}
                    render={({ field: formField }) => (
                      <TextField
                        value={formField.value || ""}
                        onChange={formField.onChange}
                        onBlur={formField.onBlur}
                        fullWidth
                        label={field.label}
                        type={
                          field.type === "date"
                            ? "date"
                            : field.type === "time"
                            ? "time"
                            : field.type === "number"
                            ? "number"
                            : "text"
                        }
                        InputLabelProps={
                          field.type === "date" || field.type === "time" 
                            ? { shrink: true } 
                            : undefined
                        }
                        error={!!fieldError}
                        helperText={fieldError?.message}
                        disabled={readonly || field.type === "time"}
                        InputProps={{
                          readOnly: field.type === "time",
                        }}
                      />
                    )}
                  />
                )}
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};
