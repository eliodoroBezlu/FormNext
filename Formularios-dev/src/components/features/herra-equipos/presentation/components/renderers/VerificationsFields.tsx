// components/form-filler/VerificationFields.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Controller, Control, FieldErrors, FieldPath, UseFormSetValue, PathValue, useWatch } from "react-hook-form";
import { Typography, Card, CardContent, TextField, Grid, Autocomplete, CircularProgress } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { Dayjs } from "dayjs";
import AutocompleteCustom from "@/components/ui/autocomplete/AutocompleteCustom";
import {
  DataSourceType,
  EquipoBackend,
  fetchDataBySourceAdapter,
  obtenerEquiposAdapter,
} from "../../../infrastructure/adapters/catalogDataAdapter";
import {
  VerificationField,
  FormDataHerraEquipos,
  TEMPLATE_EQUIPMENT_MAP,
  isEquipmentCodeField,
  isAreaField,
  autofillEquipmentFields,
  sanitizeFieldKey,
  verificationFieldPath,
} from "../../../types/IProps";
import { useUserRole } from "@/hooks/useUserRole";

interface VerificationFieldsProps<
  T extends FormDataHerraEquipos = FormDataHerraEquipos
> {
  fields: VerificationField[];
  control: Control<T>;
  errors: FieldErrors<T>;
  setValue: UseFormSetValue<T>;
  readonly?: boolean;
  isEditMode?: boolean;
  templateCode?: string;
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
  templateCode,
}: VerificationFieldsProps<T>) => {

  const { user } = useUserRole();
  const [areas, setAreas] = useState<string[]>([]);
  const [equipos, setEquipos] = useState<EquipoBackend[]>([]);
  const [loadingEquipos, setLoadingEquipos] = useState(false);

  useEffect(() => {
    const loadAreas = async () => {
      try {
        const data = await fetchDataBySourceAdapter("area");
        if (Array.isArray(data)) {
          const mapped = (data as (string | { nombre?: string; name?: string })[]).map(a => typeof a === 'string' ? a : (a.nombre || a.name || '')).filter(Boolean);
          setAreas(Array.from(new Set(mapped)));
        }
      } catch (err) {
        console.error("Error al cargar áreas para verificación:", err);
      }
    };
    loadAreas();
  }, []);

  useEffect(() => {
    if (!templateCode || !TEMPLATE_EQUIPMENT_MAP[templateCode]) {
      return;
    }
    const loadEquipos = async () => {
      setLoadingEquipos(true);
      try {
        const data = await obtenerEquiposAdapter();
        const allowedTypes = TEMPLATE_EQUIPMENT_MAP[templateCode];
        const filtered = data.filter(e => allowedTypes.includes(e.tipo_equipo));
        setEquipos(filtered);
      } catch (err) {
        console.error("Error al cargar equipos para verificación:", err);
      } finally {
        setLoadingEquipos(false);
      }
    };
    loadEquipos();
  }, [templateCode]);

  // Buscar si hay un campo de área en los fields de este paso
  const areaField = fields.find(field => isAreaField(field.label));

  // Observar el valor del campo de área en tiempo real
  const watchedArea = useWatch({
    control,
    name: areaField ? verificationFieldPath(areaField.label) as FieldPath<T> : ("" as FieldPath<T>),
  }) as string | undefined;

  // Pre-poblar el campo de área con el área del usuario logueado por defecto si no tiene valor y no es modo edición
  useEffect(() => {
    if (!isEditMode && user?.area && areaField) {
      const targetKey = verificationFieldPath(areaField.label) as FieldPath<T>;
      // Solo asignar si actualmente no tiene un valor
      setValue(targetKey, user.area as PathValue<T, FieldPath<T>>, { shouldValidate: true, shouldDirty: true });
    }
  }, [user, areaField, isEditMode, setValue]);

  // Filtrar equipos sugeridos según el área seleccionada
  const filteredEquipos = React.useMemo(() => {
    if (!watchedArea) return equipos;
    const normWatched = watchedArea.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return equipos.filter(e => {
      const areaNombre = e.area_id?.nombre || "";
      const normArea = areaNombre.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return normArea === normWatched || normArea.includes(normWatched) || normWatched.includes(normArea);
    });
  }, [equipos, watchedArea]);

  const autofillForm = (equipo: EquipoBackend) => {
    autofillEquipmentFields(setValue, fields, equipo.area_id?.nombre || "", equipo.codigo, equipo);
  };

  useEffect(() => {
    if (!isEditMode) {
      fields.forEach((field) => {
        const fieldKey = verificationFieldPath(field.label) as FieldPath<T>;
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
            const fieldKey = verificationFieldPath(field.label) as FieldPath<T>;
            const fieldError = (
              errors.verification as
                | Record<string, { message?: string }>
                | undefined
            )?.[sanitizeFieldKey(field.label)];

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
                ) : (isEquipmentCodeField(field.label) && templateCode && TEMPLATE_EQUIPMENT_MAP[templateCode]) ? (
                  <Controller
                    name={fieldKey}
                    control={control}
                    rules={{ required: field.obligatorio ? "Este campo es obligatorio" : false }}
                    render={({ field: formField }) => (
                      <Autocomplete
                        freeSolo
                        options={filteredEquipos.map(e => e.codigo)}
                        value={(formField.value as string) || null}
                        onChange={(_event, newValue) => {
                          formField.onChange(newValue);
                          if (newValue) {
                            const selectedEquip = equipos.find(e => e.codigo === newValue);
                            if (selectedEquip) {
                              autofillForm(selectedEquip);
                            }
                          }
                        }}
                        onInputChange={(_event, newInputValue) => {
                          formField.onChange(newInputValue || null);
                          if (newInputValue) {
                            const selectedEquip = equipos.find(e => e.codigo === newInputValue);
                            if (selectedEquip) {
                              autofillForm(selectedEquip);
                            }
                          }
                        }}
                        disabled={readonly}
                        loading={loadingEquipos}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={field.label}
                            error={!!fieldError}
                            helperText={fieldError?.message}
                            required={field.obligatorio}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loadingEquipos ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                    )}
                  />
                ) : isAreaField(field.label) ? (
                  <Controller
                    name={fieldKey}
                    control={control}
                    rules={{ required: field.obligatorio ? "Este campo es obligatorio" : false }}
                    render={({ field: formField }) => (
                      <Autocomplete
                        freeSolo
                        options={areas}
                        value={(formField.value as string) || null}
                        onChange={(_event, newValue) => {
                          formField.onChange(newValue);
                        }}
                        onInputChange={(_event, newInputValue) => {
                          formField.onChange(newInputValue || null);
                        }}
                        disabled={readonly}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={field.label}
                            error={!!fieldError}
                            helperText={fieldError?.message}
                            required={field.obligatorio}
                          />
                        )}
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
