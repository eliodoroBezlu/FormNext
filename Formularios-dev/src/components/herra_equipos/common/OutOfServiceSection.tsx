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
  Typography,
  MenuItem,
  Select,
} from "@mui/material";
import type { UseFormRegister, FieldErrors, Control, FieldError, Path } from "react-hook-form";
import { Controller } from "react-hook-form";
import { FormDataHerraEquipos, OutOfServiceConfig, DynamicFieldConfig } from "../types/IProps";
import dayjs from "dayjs";

interface OutOfServiceSectionProps {
  config: OutOfServiceConfig;
  register: UseFormRegister<FormDataHerraEquipos>;
  control: Control<FormDataHerraEquipos>;
  errors: FieldErrors<FormDataHerraEquipos>;
  readonly?: boolean;
  fieldPrefix?: string;
  section: "header" | "footer";
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

type ResponseOptionKey = keyof typeof responseOptions;

interface ValidationRules {
  required?: string | boolean;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  value?: string;
}

const DynamicField = ({
  field,
  register,
  control,
  readonly,
  buildFieldName,
  getNestedError,
}: {
  field: DynamicFieldConfig;
  register: UseFormRegister<FormDataHerraEquipos>;
  control: Control<FormDataHerraEquipos>;
  errors: FieldErrors<FormDataHerraEquipos>;
  readonly?: boolean;
  fieldPrefix: string;
  buildFieldName: (fieldName: string) => string;
  getNestedError: (fieldName: string) => FieldError | undefined;
}) => {
  const finalFieldName = buildFieldName(field.fieldName);
  const error = getNestedError(field.fieldName);
  
  const validationRules: ValidationRules = {
    required: field.required ? `${field.label} es obligatorio` : false,
  };

  if (field.minLength) {
    validationRules.minLength = { 
      value: field.minLength, 
      message: `Mínimo ${field.minLength} caracteres` 
    };
  }
  
  if (field.maxLength) {
    validationRules.maxLength = { 
      value: field.maxLength, 
      message: `Máximo ${field.maxLength} caracteres` 
    };
  }
  
  if (field.min !== undefined) {
    validationRules.min = { 
      value: field.min, 
      message: `Valor mínimo: ${field.min}` 
    };
  }
  
  if (field.max !== undefined) {
    validationRules.max = { 
      value: field.max, 
      message: `Valor máximo: ${field.max}` 
    };
  }
  
  if (field.pattern) {
    validationRules.pattern = { 
      value: new RegExp(field.pattern), 
      message: "Formato inválido" 
    };
  }

  const commonProps = {
    fullWidth: true,
    disabled: readonly,
    error: !!error,
    helperText: error?.message ? String(error.message) : undefined,
    sx: field.gridColumn ? { gridColumn: field.gridColumn } : undefined,
  };

  switch (field.type) {
    case "date":
      return (
        <TextField
          type="date"
          label={field.label}
          required={field.required}
          InputLabelProps={{ shrink: true }}
          {...register(finalFieldName as Path<FormDataHerraEquipos>, {
            ...validationRules,
            value: dayjs().format("YYYY-MM-DD"),
          })}
          {...commonProps}
          disabled={true}
          helperText="La fecha se establece automáticamente"
        />
      );

    case "number":
      return (
        <TextField
          type="number"
          label={field.label}
          placeholder={field.placeholder}
          required={field.required}
          {...register(finalFieldName as Path<FormDataHerraEquipos>, validationRules)}
          {...commonProps}
        />
      );

    case "select":
      return (
        <FormControl {...commonProps}>
          <FormLabel required={field.required}>{field.label}</FormLabel>
          <Select
            {...register(finalFieldName as Path<FormDataHerraEquipos>, validationRules)}
            displayEmpty
          >
            <MenuItem value="">
              <em>{field.placeholder || "Seleccionar..."}</em>
            </MenuItem>
            {field.options?.map((option) => {
              const value = typeof option === "string" ? option : option.value;
              const label = typeof option === "string" ? option : option.label;
              return (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              );
            })}
          </Select>
          {error && <FormHelperText error>{String(error.message)}</FormHelperText>}
        </FormControl>
      );

    case "radioGroup": {
      const responseType = field.responseType || "yes-no";
      const options = responseOptions[responseType as ResponseOptionKey];
      
      return (
        <Controller
          name={finalFieldName as Path<FormDataHerraEquipos>}
          control={control}
          defaultValue={field.defaultValue || ""}
          rules={validationRules}
          render={({ field: controllerField }) => (
            <FormControl
              component="fieldset"
              error={!!error}
              required={field.required}
              disabled={readonly}
              fullWidth
              sx={field.gridColumn ? { gridColumn: field.gridColumn } : { gridColumn: "1 / -1" }}
            >
              <FormLabel 
                component="legend" 
                sx={{ mb: 2, fontWeight: 600, fontSize: "1rem" }}
              >
                {field.label}
              </FormLabel>

              <RadioGroup
                row
                value={controllerField.value || ""}
                onChange={(e) => controllerField.onChange(e.target.value)}
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

              {error && (
                <FormHelperText error>
                  {String(error.message || "Este campo es obligatorio")}
                </FormHelperText>
              )}
            </FormControl>
          )}
        />
      );
    }

    case "text":
    default:
      return (
        <TextField
          label={field.label}
          placeholder={field.placeholder}
          required={field.required}
          multiline={field.type === "text" && field.gridColumn === "1 / -1"}
          rows={field.gridColumn === "1 / -1" ? 3 : 1}
          {...register(finalFieldName as Path<FormDataHerraEquipos>, validationRules)}
          {...commonProps}
        />
      );
  }
};

export function OutOfServiceSection({
  config,
  register,
  control,
  errors,
  readonly = false,
  fieldPrefix = "outOfService",
  section,
}: OutOfServiceSectionProps) {
  const buildFieldName = (fieldName: string): string => {
    if (fieldName.startsWith(fieldPrefix)) {
      return fieldName;
    }
    if (fieldName.startsWith("outOfService.")) {
      return fieldName.replace("outOfService.", `${fieldPrefix}.`);
    }
    return `${fieldPrefix}.${fieldName.split('.').pop()}`;
  };

  const getNestedError = (fieldName: string): FieldError | undefined => {
    const parts = buildFieldName(fieldName).split(".");
    let current: FieldErrors<FormDataHerraEquipos> | FieldError | undefined = errors;
    
    for (const part of parts) {
      if (!current || typeof current !== 'object') return undefined;
      current = (current as Record<string, FieldError | FieldErrors<FormDataHerraEquipos>>)[part];
    }
    
    return current as FieldError | undefined;
  };

  const hasLegacyFields = config.fields && (
    config.fields.showDate || 
    config.fields.showObservations ||
    config.fields.showTag ||
    config.fields.showInspector ||
    config.fields.showCapacidad ||
    config.fields.showTipo
  );

  const isLegacyMode = hasLegacyFields && !config.header?.enabled && !config.footer?.enabled;

  if (isLegacyMode && section !== "header") {
    return null;
  }

  // MODO LEGACY
  if (isLegacyMode && section === "header" && config.fields) {
    const responseType = config.responseType || "yes-no";
    const options = responseOptions[responseType as ResponseOptionKey];
    
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        {config.showConclusion !== false && (
          <Controller
            name={buildFieldName("status") as Path<FormDataHerraEquipos>}
            control={control}
            defaultValue={config.defaultValue || ""}
            rules={{
              required: config.required ? "Este campo es obligatorio" : false,
            }}
            render={({ field: controllerField }) => (
              <FormControl
                component="fieldset"
                error={!!getNestedError("status")}
                required={config.required}
                disabled={readonly}
                fullWidth
                sx={{ mb: 3 }}
              >
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600, fontSize: "1rem" }}>
                  {config.label || "Fuera de Servicio:"}
                </FormLabel>
                <RadioGroup
                  row
                  value={controllerField.value || ""}
                  onChange={(e) => controllerField.onChange(e.target.value)}
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
                {getNestedError("status") && (
                  <FormHelperText error>
                    {String(getNestedError("status")?.message)}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        )}

        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          {config.fields.showDate && (
            <TextField
              type="date"
              label={config.fields.dateLabel || "Fecha"}
              required={config.fields.dateRequired}
              disabled={true}
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...register(buildFieldName("date") as Path<FormDataHerraEquipos>, {
                required: config.fields.dateRequired ? "La fecha es obligatoria" : false,
                value: dayjs().format("YYYY-MM-DD"),
              })}
              error={!!getNestedError("date")}
              helperText={getNestedError("date")?.message ? String(getNestedError("date")?.message) : undefined}
            />
          )}

          {config.fields.showTag && (
            <TextField
              label={config.fields.tagLabel || "Tag"}
              required={config.fields.tagRequired}
              disabled={readonly}
              fullWidth
              placeholder="Ingrese el tag..."
              {...register(buildFieldName("tag") as Path<FormDataHerraEquipos>, {
                required: config.fields.tagRequired ? "El tag es obligatorio" : false,
              })}
              error={!!getNestedError("tag")}
              helperText={getNestedError("tag")?.message ? String(getNestedError("tag")?.message) : undefined}
            />
          )}

          {config.fields.showInspector && (
            <TextField
              label={config.fields.inspectorLabel || "Inspector"}
              required={config.fields.inspectorRequired}
              disabled={readonly}
              fullWidth
              {...register(buildFieldName("inspector") as Path<FormDataHerraEquipos>, {
                required: config.fields.inspectorRequired ? "El inspector es obligatorio" : false,
              })}
              error={!!getNestedError("inspector")}
              helperText={getNestedError("inspector")?.message ? String(getNestedError("inspector")?.message) : undefined}
            />
          )}

          {config.fields.showCapacidad && (
            <TextField
              label={config.fields.capacidadLabel || "Capacidad"}
              required={config.fields.capacidadRequired}
              disabled={readonly}
              fullWidth
              {...register(buildFieldName("capacidad") as Path<FormDataHerraEquipos>, {
                required: config.fields.capacidadRequired ? "La capacidad es obligatoria" : false,
              })}
              error={!!getNestedError("capacidad")}
              helperText={getNestedError("capacidad")?.message ? String(getNestedError("capacidad")?.message) : undefined}
            />
          )}

          {config.fields.showTipo && (
            <TextField
              label={config.fields.tipoLabel || "Tipo"}
              required={config.fields.tipoRequired}
              disabled={readonly}
              fullWidth
              {...register(buildFieldName("tipo") as Path<FormDataHerraEquipos>, {
                required: config.fields.tipoRequired ? "El tipo es obligatorio" : false,
              })}
              error={!!getNestedError("tipo")}
              helperText={getNestedError("tipo")?.message ? String(getNestedError("tipo")?.message) : undefined}
            />
          )}

          {config.fields.showObservations && (
            <TextField
              label={config.fields.observationsLabel || "Observaciones"}
              required={config.fields.observationsRequired}
              disabled={readonly}
              fullWidth
              multiline
              rows={3}
              sx={{ gridColumn: { md: "1 / -1" } }}
              {...register(buildFieldName("observations") as Path<FormDataHerraEquipos>, {
                required: config.fields.observationsRequired ? "Las observaciones son obligatorias" : false,
                maxLength: config.fields.observationsMaxLength
                  ? { value: config.fields.observationsMaxLength, message: `Máximo ${config.fields.observationsMaxLength} caracteres` }
                  : undefined,
              })}
              error={!!getNestedError("observations")}
              helperText={getNestedError("observations")?.message ? String(getNestedError("observations")?.message) : undefined}
            />
          )}
        </Box>
      </Paper>
    );
  }

  // MODO NUEVO (header/footer)
  const sectionConfig = section === "header" ? config.header : config.footer;

  if (!sectionConfig?.enabled || !sectionConfig.fields || sectionConfig.fields.length === 0) {
    return null;
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      {sectionConfig.title && (
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {sectionConfig.title}
        </Typography>
      )}

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
        {sectionConfig.fields.map((field, index) => (
          <DynamicField
            key={`${section}-${index}`}
            field={field}
            register={register}
            control={control}
            errors={errors}
            readonly={readonly}
            fieldPrefix={fieldPrefix}
            buildFieldName={buildFieldName}
            getNestedError={getNestedError}
          />
        ))}
      </Box>
    </Paper>
  );
}