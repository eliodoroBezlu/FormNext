// components/form-filler/VerificationFields.tsx
"use client";

import React, { useEffect } from "react";
import { Controller, Control, FieldErrors, FieldPath, UseFormSetValue, PathValue } from "react-hook-form";
import { Typography, Card, CardContent, TextField, Grid } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { Dayjs } from "dayjs";
import AutocompleteCustom from "@/components/molecules/autocomplete-custom/AutocompleteCustom";
import { DataSourceType } from "@/lib/actions/dataSourceService";
import { VerificationField, FormDataHerraEquipos } from "./types/IProps";

interface VerificationFieldsProps<
  T extends FormDataHerraEquipos = FormDataHerraEquipos
> {
  fields: VerificationField[];
  control: Control<T>;
  errors: FieldErrors<T>;
  setValue: UseFormSetValue<T>;
  readonly?: boolean;
  isEditMode?: boolean; // ✅ NUEVO: Para saber si estamos editando
}

const getCurrentDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getCurrentTime = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const VerificationFields = <
  T extends FormDataHerraEquipos = FormDataHerraEquipos
>({
  fields,
  control,
  errors,
  setValue,
  readonly = false,
  isEditMode = false, // ✅ NUEVO
}: VerificationFieldsProps<T>) => {
  
  // ✅ MODIFICADO: Solo setear fechas automáticamente si NO estamos editando
  useEffect(() => {
    if (!isEditMode) {
      fields.forEach((field) => {
        const fieldKey = `verification.${field.label}` as FieldPath<T>;
        
        if (field.type === "date") {
          const currentDate = getCurrentDate();
          setValue(fieldKey, currentDate as PathValue<T, FieldPath<T>>);
        } else if (field.type === "time") {
          const currentTime = getCurrentTime();
          setValue(fieldKey, currentTime as PathValue<T, FieldPath<T>>);
        }
      });
    }
  }, [fields, setValue, isEditMode]);

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
                ) : field.type === "date" ? (
                  <Controller
                    name={fieldKey}
                    control={control}
                    //rules={{ required: "Este campo es obligatorio" }}
                    render={({ field: formField }) => (
                      <DatePicker
                        value={formField.value ? dayjs(formField.value as string) : null}
                        onChange={(newValue: Dayjs | null) => {
                          if (newValue && newValue.isValid()) {
                            formField.onChange(newValue.format('YYYY-MM-DD'));
                          } else {
                            formField.onChange(null);
                          }
                        }}
                        label={field.label}
                        disabled={!isEditMode} // ✅ MODIFICADO: Habilitar en modo edición
                        slotProps={{
                          textField: {
                            error: !!fieldError,
                            helperText: fieldError?.message,
                            fullWidth: true,
                            disabled: !isEditMode,
                          },
                        }}
                      />
                    )}
                  />
                ) : field.type === "time" ? (
                  <Controller
                    name={fieldKey}
                    control={control}
                    //rules={{ required: "Este campo es obligatorio" }}
                    render={({ field: formField }) => (
                      <TimePicker
                        value={formField.value ? dayjs(formField.value as string, 'HH:mm') : null}
                        onChange={(newValue: Dayjs | null) => {
                          if (newValue && newValue.isValid()) {
                            formField.onChange(newValue.format('HH:mm'));
                          } else {
                            formField.onChange(null);
                          }
                        }}
                        label={field.label}
                        disabled={!isEditMode} // ✅ MODIFICADO: Habilitar en modo edición
                        slotProps={{
                          textField: {
                            error: !!fieldError,
                            helperText: fieldError?.message,
                            fullWidth: true,
                            disabled: !isEditMode,
                          },
                        }}
                      />
                    )}
                  />
                ) : (
                  <Controller
                    name={fieldKey}
                    control={control}
                    //rules={{ required: "Este campo es obligatorio" }}
                    render={({ field: formField }) => (
                      <TextField
                        value={formField.value || ""}
                        onChange={formField.onChange}
                        onBlur={formField.onBlur}
                        fullWidth
                        label={field.label}
                        type={field.type === "number" ? "number" : "text"}
                        error={!!fieldError}
                        helperText={fieldError?.message}
                        disabled={readonly}
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