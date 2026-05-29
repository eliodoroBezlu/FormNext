// components/form-filler/VerificationFields.tsx
"use client";

import React, { useEffect } from "react";
import { Controller, Control, FieldErrors, FieldPath, UseFormSetValue, PathValue } from "react-hook-form";
import { Typography, Card, CardContent, TextField, Grid } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { Dayjs } from "dayjs";
import AutocompleteCustom from "@/components/ui/autocomplete/AutocompleteCustom";
import { DataSourceType } from "@/lib/actions/dataSourceService";
import { VerificationField, FormDataHerraEquipos } from "../../../types/IProps";

interface VerificationFieldsProps<
  T extends FormDataHerraEquipos = FormDataHerraEquipos
> {
  fields: VerificationField[];
  control: Control<T>;
  errors: FieldErrors<T>;
  setValue: UseFormSetValue<T>;
  readonly?: boolean;
  isEditMode?: boolean;
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
  isEditMode = false,
}: VerificationFieldsProps<T>) => {

  useEffect(() => {
    if (!isEditMode) {
      fields.forEach((field) => {
        const fieldKey = `verification.${field.label}` as FieldPath<T>;
        if (field.type === "date") {
          setValue(fieldKey, getCurrentDate() as PathValue<T, FieldPath<T>>);
        } else if (field.type === "time") {
          setValue(fieldKey, getCurrentTime() as PathValue<T, FieldPath<T>>);
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
                    rules={{ required: field.obligatorio ? "Este campo es obligatorio" : false }}
                    render={({ field: formField }) => (
                      <AutocompleteCustom
                        dataSource={field.dataSource as DataSourceType}
                        label={field.label}
                        value={(formField.value as string) || null}
                        onChange={formField.onChange}
                        onBlur={formField.onBlur}
                        error={!!fieldError}
                        helperText={fieldError?.message}
                        required={field.obligatorio}
                        disabled={readonly}
                      />
                    )}
                  />
                ) : field.type === "date" ? (
                  <Controller
                    name={fieldKey}
                    control={control}
                    rules={{ required: field.obligatorio ? "Este campo es obligatorio" : false }}
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
                        disabled={!isEditMode}
                        slotProps={{
                          textField: {
                            error: !!fieldError,
                            helperText: fieldError?.message,
                            fullWidth: true,
                            disabled: !isEditMode,
                            required: field.obligatorio,
                          },
                        }}
                      />
                    )}
                  />
                ) : field.type === "time" ? (
                  <Controller
                    name={fieldKey}
                    control={control}
                    rules={{ required: field.obligatorio ? "Este campo es obligatorio" : false }}
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
                        disabled={!isEditMode}
                        slotProps={{
                          textField: {
                            error: !!fieldError,
                            helperText: fieldError?.message,
                            fullWidth: true,
                            disabled: !isEditMode,
                            required: field.obligatorio,
                          },
                        }}
                      />
                    )}
                  />
                ) : (
                  <Controller
                    name={fieldKey}
                    control={control}
                    rules={{ required: field.obligatorio ? "Este campo es obligatorio" : false }}
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
                        required={field.obligatorio}
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
