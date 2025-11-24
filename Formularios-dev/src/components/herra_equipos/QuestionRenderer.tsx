"use client";

import React from "react";
import { Controller, Control, FieldErrors, FieldPath } from "react-hook-form";
import {
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  Paper,
  Chip,
  FormHelperText,
} from "@mui/material";
import {
  FormDataHerraEquipos,
  getNestedError,
  Question,
  QuestionResponse,
  FormFeatureConfig,
} from "./types/IProps";

interface QuestionRendererProps<
  T extends FormDataHerraEquipos = FormDataHerraEquipos
> {
  question: Question;
  sectionPath: string;
  questionIndex: number;
  control: Control<T>;
  errors: FieldErrors<T>;
  readonly?: boolean;
  formConfig: FormFeatureConfig;
}

export const QuestionRenderer = <
  T extends FormDataHerraEquipos = FormDataHerraEquipos
>({
  question,
  sectionPath,
  questionIndex,
  control,
  errors,
  readonly = false,
  formConfig,
}: QuestionRendererProps<T>) => {
  const fieldName = `${sectionPath}.q${questionIndex}` as FieldPath<T>;

  // Extraer configuraciones del formConfig
  const descriptionConfig = formConfig.questionDescription;
  const observationConfig = formConfig.questionObservations;

  const showDescription = descriptionConfig?.enabled ?? false;
  const descriptionRequired = descriptionConfig?.required ?? false;
  const descriptionLabel = descriptionConfig?.label ?? "Descripción";
  const descriptionPlaceholder =
    descriptionConfig?.placeholder ?? "Describa el elemento...";

  const showObservations = observationConfig?.enabled ?? true;
  const observationRequired = observationConfig?.required ?? false;
  const observationLabel = observationConfig?.label ?? "Observaciones ";
  const observationPlaceholder =
    observationConfig?.placeholder ?? "Ingrese observaciones adicionales...";

  const error = getNestedError(errors, `${fieldName}.value`);
  const descripcionError = getNestedError(errors, `${fieldName}.description`);
  const observacionError = getNestedError(errors, `${fieldName}.observacion`);

  // Helper para obtener el valor actual
  const getCurrentValue = (fieldValue: unknown): QuestionResponse => {
    if (fieldValue && typeof fieldValue === "object" && "value" in fieldValue) {
      return fieldValue as QuestionResponse;
    }
    // Para boolean, inicializar con false en lugar de string vacío
    return {
      value: question.responseConfig.type === "boolean" ? false : "",
      description: "",
      observacion: "",
    };
  };

  // Helper para actualizar el valor
  const updateValue = (
    currentFieldValue: unknown,
    newValue: string | number | boolean
  ): QuestionResponse => {
    const current = getCurrentValue(currentFieldValue);
    return {
      value: newValue,
      description: current.description,
      observacion: current.observacion,
    };
  };

  // Helper para actualizar la descripción
  const updateDescripcion = (
    currentFieldValue: unknown,
    newDescripcion: string
  ): QuestionResponse => {
    const current = getCurrentValue(currentFieldValue);
    return {
      value: current.value,
      description: newDescripcion,
      observacion: current.observacion,
    };
  };

  // Helper para actualizar la observación
  const updateObservacion = (
    currentFieldValue: unknown,
    newObservacion: string
  ): QuestionResponse => {
    const current = getCurrentValue(currentFieldValue);
    return {
      value: current.value,
      description: current.description,
      observacion: newObservacion,
    };
  };

  // Campo de DESCRIPCIÓN
  const renderDescripcionField = () => {
    if (!showDescription) return null;

    return (
      <Box mt={2}>
        <Controller
          name={fieldName}
          control={control}
          rules={{
            validate: descriptionRequired
              ? (value) => {
                  const response = getCurrentValue(value);
                  if (!response.description?.trim()) {
                    return "La descripción es obligatoria";
                  }
                  return true;
                }
              : undefined,
          }}
          render={({ field }) => {
            const current = getCurrentValue(field.value);
            return (
              <TextField
                value={current.description || ""}
                onChange={(e) =>
                  field.onChange(updateDescripcion(field.value, e.target.value))
                }
                fullWidth
                size="small"
                label={descriptionLabel}
                placeholder={descriptionPlaceholder}
                multiline
                rows={2}
                error={!!descripcionError}
                disabled={readonly}
                required={descriptionRequired}
              />
            );
          }}
        />
      </Box>
    );
  };

  // Campo de OBSERVACIONES
  const renderObservacionField = () => {
    if (!showObservations) return null;

    return (
      <Box mt={2}>
        <Controller
          name={fieldName}
          control={control}
          rules={{
            validate: observationRequired
              ? (value) => {
                  const response = getCurrentValue(value);
                  return (
                    response.observacion?.trim() !== "" ||
                    "La observación es obligatoria"
                  );
                }
              : undefined,
          }}
          render={({ field }) => {
            const current = getCurrentValue(field.value);
            return (
              <TextField
                value={current.observacion || ""}
                onChange={(e) =>
                  field.onChange(updateObservacion(field.value, e.target.value))
                }
                fullWidth
                size="small"
                label={observationLabel}
                placeholder={observationPlaceholder}
                multiline
                rows={2}
                error={!!observacionError}
                helperText={observacionError?.message}
                disabled={readonly}
                required={observationRequired}
              />
            );
          }}
        />
      </Box>
    );
  };

  const renderInput = () => {
    const { type, options, placeholder, min, max } = question.responseConfig;

    switch (type) {
      case "si_no_na":
      case "bueno_malo_na":
      case "bien_mal":
      case "operativo_mantenimiento":
        return (
          <>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                validate: question.obligatorio
                  ? (value) => {
                      const response = getCurrentValue(value);
                      return (
                        response.value !== "" || "Este campo es obligatorio"
                      );
                    }
                  : undefined,
              }}
              render={({ field }) => {
                const current = getCurrentValue(field.value);

                // Definir colores fijos: azul, plomo, blanco
                const fixedColors = ["#1976d2", "#607d8b", "#ffffff"];

                // Definir opciones específicas según el tipo
                let displayOptions = options || [];

                // Si no hay opciones definidas en la config, usar las predeterminadas según el tipo
                if (!options || options.length === 0) {
                  switch (type) {
                    case "si_no_na":
                      displayOptions = [
                        { value: "si", label: "Sí" },
                        { value: "no", label: "No" },
                        { value: "na", label: "N/A" },
                      ];
                      break;
                    case "bueno_malo_na":
                      displayOptions = [
                        { value: "bueno", label: "Bueno" },
                        { value: "malo", label: "Malo" },
                        { value: "na", label: "N/A" },
                      ];
                      break;
                    case "bien_mal":
                      displayOptions = [
                        { value: "bien", label: "Bien" },
                        { value: "mal", label: "Mal" },
                      ];
                      break;
                    case "operativo_mantenimiento":
                      displayOptions = [
                        { value: "operativo", label: "Operativo" },
                        { value: "mantenimiento", label: "Mantenimiento" },
                      ];
                      break;
                  }
                }

                // Asignar colores fijos a las opciones (sobrescribe cualquier color de config)
                displayOptions = displayOptions.map((option, index) => ({
                  ...option,
                  color: fixedColors[index] || "#757575",
                }));

                return (
                  <FormControl error={!!error} fullWidth>
                    <RadioGroup
                      value={current.value || ""}
                      onChange={(e) =>
                        field.onChange(updateValue(field.value, e.target.value))
                      }
                      row
                    >
                      {displayOptions.map((option) => (
                        <FormControlLabel
                          key={String(option.value)}
                          value={option.value}
                          control={<Radio disabled={readonly} />}
                          label={
                            <Chip
                              label={option.label}
                              size="small"
                              sx={{
                                backgroundColor: option.color || "#757575",
                                color:
                                  option.color === "#ffffff"
                                    ? "#000000"
                                    : "white",
                                border:
                                  option.color === "#ffffff"
                                    ? "1px solid #ccc"
                                    : "none",
                              }}
                            />
                          }
                        />
                      ))}
                    </RadioGroup>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                );
              }}
            />
            {renderDescripcionField()}
            {renderObservacionField()}
          </>
        );

      case "text":
        return (
          <>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                validate: question.obligatorio
                  ? (value) => {
                      const response = getCurrentValue(value);
                      return (
                        response.value !== "" || "Este campo es obligatorio"
                      );
                    }
                  : undefined,
              }}
              render={({ field }) => {
                const current = getCurrentValue(field.value);
                return (
                  <TextField
                    value={current.value || ""}
                    onChange={(e) =>
                      field.onChange(updateValue(field.value, e.target.value))
                    }
                    fullWidth
                    size="small"
                    placeholder={placeholder || "Ingrese su respuesta"}
                    error={!!error}
                    helperText={error?.message}
                    disabled={readonly}
                  />
                );
              }}
            />
            {renderDescripcionField()}
            {renderObservacionField()}
          </>
        );

      case "textarea":
        return (
          <>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                validate: question.obligatorio
                  ? (value) => {
                      const response = getCurrentValue(value);
                      return (
                        response.value !== "" || "Este campo es obligatorio"
                      );
                    }
                  : undefined,
              }}
              render={({ field }) => {
                const current = getCurrentValue(field.value);
                return (
                  <TextField
                    value={current.value || ""}
                    onChange={(e) =>
                      field.onChange(updateValue(field.value, e.target.value))
                    }
                    fullWidth
                    multiline
                    rows={4}
                    size="small"
                    placeholder={placeholder || "Ingrese su respuesta"}
                    error={!!error}
                    helperText={error?.message}
                    disabled={readonly}
                  />
                );
              }}
            />
            {renderDescripcionField()}
            {renderObservacionField()}
          </>
        );

      case "number":
        return (
          <>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                validate: (value) => {
                  const response = getCurrentValue(value);
                  const numValue = Number(response.value);

                  if (question.obligatorio && response.value === "") {
                    return "Este campo es obligatorio";
                  }
                  if (response.value !== "" && isNaN(numValue)) {
                    return "Debe ser un número válido";
                  }
                  if (min !== undefined && numValue < min) {
                    return `Mínimo: ${min}`;
                  }
                  if (max !== undefined && numValue > max) {
                    return `Máximo: ${max}`;
                  }
                  return true;
                },
              }}
              render={({ field }) => {
                const current = getCurrentValue(field.value);
                return (
                  <TextField
                    value={current.value || ""}
                    onChange={(e) => {
                      const newValue = e.target.value
                        ? Number(e.target.value)
                        : "";
                      field.onChange(updateValue(field.value, newValue));
                    }}
                    type="number"
                    size="small"
                    placeholder={placeholder || "0"}
                    inputProps={{ min, max }}
                    error={!!error}
                    helperText={error?.message}
                    disabled={readonly}
                  />
                );
              }}
            />
            {renderDescripcionField()}
            {renderObservacionField()}
          </>
        );

     case "boolean":
  return (
    <>
      <Controller
        name={fieldName}
        control={control}
        
        render={({ field }) => {
          const current = getCurrentValue(field.value);
          const isChecked = Boolean(current.value);
          
          return (
            <FormControlLabel
              control={
                <Checkbox
                  checked={isChecked}
                  onChange={(e) => {
                    field.onChange(updateValue(field.value, e.target.checked));
                  }}
                  disabled={readonly}
                />
              }
              label="Sí"
            />
          );
        }}
      />
      {renderDescripcionField()}
      {renderObservacionField()}
    </>
  );
      case "date":
        return (
          <>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                validate: question.obligatorio
                  ? (value) => {
                      const response = getCurrentValue(value);
                      return (
                        response.value !== "" || "Este campo es obligatorio"
                      );
                    }
                  : undefined,
              }}
              render={({ field }) => {
                const current = getCurrentValue(field.value);
                return (
                  <TextField
                    value={current.value || ""}
                    onChange={(e) =>
                      field.onChange(updateValue(field.value, e.target.value))
                    }
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    error={!!error}
                    helperText={error?.message}
                    disabled={readonly}
                  />
                );
              }}
            />
            {renderDescripcionField()}
            {renderObservacionField()}
          </>
        );

      default:
        return (
          <Typography color="error">Tipo de pregunta no soportado</Typography>
        );
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: "#fafafa" }}>
      <Box display="flex" gap={2}>
        {question.image && (
          <Box
            sx={{
              flexShrink: 0,
              width: 120,
              height: 120,
              borderRadius: 1,
              overflow: "hidden",
              border: "1px solid #ddd",
            }}
          >
            <Box
              component="img"
              src={question.image.url}
              alt={question.image.caption}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>
        )}
        <Box flex={1}>
          <FormLabel component="legend" sx={{ mb: 1 }}>
            <Typography variant="body1" fontWeight="medium">
              {question.text}
              {question.obligatorio && (
                <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                  *
                </Typography>
              )}
            </Typography>
          </FormLabel>
          {question.image?.caption && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mb={1}
            >
              {question.image.caption}
            </Typography>
          )}
          {renderInput()}
        </Box>
      </Box>
    </Paper>
  );
};
