"use client";

import React, { useId } from "react";
import {
  Controller,
  Control,
  FieldErrors,
  FieldPath,
  ControllerRenderProps,
} from "react-hook-form";
import {
  Box,
  Typography,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  Paper,
  FormHelperText,
} from "@mui/material";
import {
  FormDataHerraEquipos,
  getNestedError,
  Question,
  QuestionResponse,
  FormFeatureConfig,
  DEFAULT_OPTIONS_MAP,
  ResponseType,
} from "../../../types/IProps";

// Semantic colors for toggle buttons
const OPTION_COLORS: Record<
  string,
  { bg: string; fg: string; border: string }
> = {
  si: { bg: "#1b5e20", fg: "#fff", border: "#1b5e20" },
  no: { bg: "#b71c1c", fg: "#fff", border: "#b71c1c" },
  na: { bg: "#546e7a", fg: "#fff", border: "#546e7a" },
  nr: { bg: "#455a64", fg: "#fff", border: "#455a64" },
  bueno: { bg: "#1b5e20", fg: "#fff", border: "#1b5e20" },
  malo: { bg: "#b71c1c", fg: "#fff", border: "#b71c1c" },
  bien: { bg: "#1b5e20", fg: "#fff", border: "#1b5e20" },
  mal: { bg: "#b71c1c", fg: "#fff", border: "#b71c1c" },
  operativo: { bg: "#0d47a1", fg: "#fff", border: "#0d47a1" },
  mantenimiento: { bg: "#e65100", fg: "#fff", border: "#e65100" },
};

interface QuestionRendererProps<
  T extends FormDataHerraEquipos = FormDataHerraEquipos,
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
  T extends FormDataHerraEquipos = FormDataHerraEquipos,
>({
  question,
  sectionPath,
  questionIndex,
  control,
  errors,
  readonly = false,
  formConfig,
}: QuestionRendererProps<T>) => {
  const uid = useId();
  const fieldName = `${sectionPath}.q${questionIndex}` as FieldPath<T>;
  const errorId = `${uid}-err`;
  const labelId = `${uid}-lbl`;

  const descriptionConfig = formConfig.questionDescription;
  const observationConfig = formConfig.questionObservations;

  const showDescription = descriptionConfig?.enabled ?? false;
  const descriptionRequired = descriptionConfig?.required ?? false;
  const descriptionLabel = descriptionConfig?.label ?? "Descripción";
  const descriptionPlaceholder =
    descriptionConfig?.placeholder ?? "Describa el elemento...";

  const showObservations = observationConfig?.enabled ?? true;
  const observationRequired = observationConfig?.required ?? false;
  const observationLabel = observationConfig?.label ?? "Observaciones";
  const observationPlaceholder =
    observationConfig?.placeholder ?? "Ingrese observaciones adicionales...";

  const { type, options, placeholder, min, max } = question.responseConfig;

  const getCurrentValue = (fieldValue: unknown): QuestionResponse => {
    if (fieldValue && typeof fieldValue === "object" && "value" in fieldValue) {
      return fieldValue as QuestionResponse;
    }
    return {
      value: type === "boolean" ? false : "",
      description: "",
      observacion: "",
    };
  };

  const error =
    getNestedError(errors, `${fieldName}.value`) ??
    getNestedError(errors, fieldName as string);
  const descripcionError = getNestedError(errors, `${fieldName}.description`);
  const observacionError = getNestedError(errors, `${fieldName}.observacion`);

  const updateValue = (
    currentFieldValue: unknown,
    newValue: string | number | boolean,
  ): QuestionResponse => {
    const current = getCurrentValue(currentFieldValue);
    return { value: newValue, description: current.description, observacion: current.observacion };
  };

  const updateDescripcion = (
    currentFieldValue: unknown,
    newDescripcion: string,
  ): QuestionResponse => {
    const current = getCurrentValue(currentFieldValue);
    return { value: current.value, description: newDescripcion, observacion: current.observacion };
  };

  const updateObservacion = (
    currentFieldValue: unknown,
    newObservacion: string,
  ): QuestionResponse => {
    const current = getCurrentValue(currentFieldValue);
    return { value: current.value, description: current.description, observacion: newObservacion };
  };

  // Shared validate function — one rule covers value + description + observacion
  const buildValidate = (valueType: string) => (value: unknown) => {
    const response = getCurrentValue(value);

    if (valueType !== "boolean") {
      const numValue = Number(response.value);
      if (response.value === "" || response.value === undefined || response.value === null)
        return "Este campo es obligatorio";
      if (valueType === "number" && isNaN(numValue))
        return "Debe ser un número válido";
      if (valueType === "number" && min !== undefined && numValue < min)
        return `Mínimo: ${min}`;
      if (valueType === "number" && max !== undefined && numValue > max)
        return `Máximo: ${max}`;
    }

    if (descriptionRequired && showDescription && !response.description?.trim())
      return "La descripción es obligatoria";
    if (observationRequired && showObservations && !response.observacion?.trim())
      return "La observación es obligatoria";

    return true;
  };

  // Inline description field — uses parent Controller's field (no separate Controller)
  const renderDescripcionInline = (
    field: ControllerRenderProps<T, FieldPath<T>>,
  ) => {
    if (!showDescription) return null;
    const current = getCurrentValue(field.value);
    return (
      <Box mt={2}>
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
          helperText={descripcionError?.message}
          disabled={readonly}
          required={descriptionRequired}
          inputProps={{
            "aria-required": descriptionRequired ? "true" : undefined,
            "aria-invalid": !!descripcionError ? "true" : undefined,
          }}
        />
      </Box>
    );
  };

  // Inline observacion field — uses parent Controller's field (no separate Controller)
  const renderObservacionInline = (
    field: ControllerRenderProps<T, FieldPath<T>>,
  ) => {
    if (!showObservations) return null;
    const obsErrorId = `${uid}-obs-err`;
    const current = getCurrentValue(field.value);
    return (
      <Box mt={2}>
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
          inputProps={{
            id: obsErrorId,
            "aria-required": observationRequired ? "true" : undefined,
            "aria-invalid": !!observacionError ? "true" : undefined,
            "aria-describedby": observacionError ? obsErrorId : undefined,
          }}
          FormHelperTextProps={{ id: obsErrorId }}
        />
      </Box>
    );
  };

  const renderInput = () => {
    switch (type) {
      case "si_no_na":
      case "bueno_malo_na":
      case "bien_mal":
      case "operativo_mantenimiento":
        return (
          <Controller
            name={fieldName}
            control={control}
            rules={{ validate: buildValidate(type) }}
            render={({ field }) => {
              const current = getCurrentValue(field.value);
              const resolvedOptions =
                options && options.length > 0
                  ? options
                  : (DEFAULT_OPTIONS_MAP[type as ResponseType] ?? []);

              return (
                <>
                  <FormControl
                    component="fieldset"
                    error={!!error}
                    fullWidth
                    aria-required={question.obligatorio ? "true" : undefined}
                  >
                    <FormLabel
                      component="legend"
                      id={labelId}
                      sx={{ display: "none" }}
                    >
                      {question.text}
                    </FormLabel>
                    <ToggleButtonGroup
                      value={current.value || null}
                      exclusive
                      onChange={(_, newValue) => {
                        if (newValue !== null || !question.obligatorio) {
                          field.onChange(updateValue(field.value, newValue ?? ""));
                        }
                      }}
                      aria-labelledby={labelId}
                      size="small"
                      disabled={readonly}
                      sx={{ flexWrap: "wrap", gap: 0.5 }}
                    >
                      {resolvedOptions.map((option) => {
                        const colors = OPTION_COLORS[String(option.value)];
                        const isSelected = current.value === option.value;
                        return (
                          <ToggleButton
                            key={String(option.value)}
                            value={option.value}
                            aria-pressed={isSelected}
                            sx={{
                              borderRadius: "32px !important",
                              border: "none !important",
                              px: 2.5,
                              py: 0.75,
                              boxShadow: "none",
                              transition: "all 0.2s",
                              fontWeight: isSelected ? 500 : 400,
                              fontSize: "0.875rem",
                              textTransform: "none",
                              "&.Mui-selected": {
                                backgroundColor: colors?.bg ?? "#1976d2",
                                color: colors?.fg ?? "#fff",
                                "&:hover": {
                                  backgroundColor: colors?.bg ?? "#1976d2",
                                  filter: "brightness(0.92)",
                                },
                              },
                              "&:not(.Mui-selected)": {
                                backgroundColor: "#e9ecef",
                                color: "#495057",
                                "&:hover": { backgroundColor: "#dee2e6" },
                              },
                            }}
                          >
                            {option.label}
                          </ToggleButton>
                        );
                      })}
                    </ToggleButtonGroup>
                    {error && (
                      <FormHelperText id={errorId}>{error.message}</FormHelperText>
                    )}
                  </FormControl>
                  {renderDescripcionInline(field)}
                  {renderObservacionInline(field)}
                </>
              );
            }}
          />
        );

      case "text":
        return (
          <Controller
            name={fieldName}
            control={control}
            rules={{ validate: buildValidate("text") }}
            render={({ field }) => {
              const current = getCurrentValue(field.value);
              return (
                <>
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
                    required={question.obligatorio}
                    inputProps={{
                      "aria-required": question.obligatorio ? "true" : undefined,
                      "aria-invalid": !!error ? "true" : undefined,
                      "aria-describedby": error ? errorId : undefined,
                    }}
                    FormHelperTextProps={{ id: errorId }}
                  />
                  {renderDescripcionInline(field)}
                  {renderObservacionInline(field)}
                </>
              );
            }}
          />
        );

      case "textarea": {
        const textareaMaxLength = 1000;
        return (
          <Controller
            name={fieldName}
            control={control}
            rules={{ validate: buildValidate("textarea") }}
            render={({ field }) => {
              const current = getCurrentValue(field.value);
              const charCount = String(current.value || "").length;
              return (
                <>
                  <Box>
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
                      required={question.obligatorio}
                      inputProps={{
                        maxLength: textareaMaxLength,
                        "aria-required": question.obligatorio ? "true" : undefined,
                        "aria-invalid": !!error ? "true" : undefined,
                        "aria-describedby": error ? errorId : undefined,
                      }}
                      FormHelperTextProps={{ id: errorId }}
                    />
                    {!readonly && (
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ display: "block", textAlign: "right", mt: 0.5 }}
                      >
                        {charCount}/{textareaMaxLength}
                      </Typography>
                    )}
                  </Box>
                  {renderDescripcionInline(field)}
                  {renderObservacionInline(field)}
                </>
              );
            }}
          />
        );
      }

      case "number":
        return (
          <Controller
            name={fieldName}
            control={control}
            rules={{ validate: buildValidate("number") }}
            render={({ field }) => {
              const current = getCurrentValue(field.value);
              return (
                <>
                  <TextField
                    value={current.value || ""}
                    onChange={(e) => {
                      const newValue = e.target.value ? Number(e.target.value) : "";
                      field.onChange(updateValue(field.value, newValue));
                    }}
                    type="number"
                    size="small"
                    placeholder={placeholder || "0"}
                    inputProps={{
                      min,
                      max,
                      "aria-required": question.obligatorio ? "true" : undefined,
                      "aria-invalid": !!error ? "true" : undefined,
                      "aria-describedby": error ? errorId : undefined,
                    }}
                    error={!!error}
                    helperText={error?.message}
                    disabled={readonly}
                    required={question.obligatorio}
                    FormHelperTextProps={{ id: errorId }}
                  />
                  {renderDescripcionInline(field)}
                  {renderObservacionInline(field)}
                </>
              );
            }}
          />
        );

      case "boolean":
        return (
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => {
              const current = getCurrentValue(field.value);
              const isChecked = Boolean(current.value);
              return (
                <>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) =>
                          field.onChange(updateValue(field.value, e.target.checked))
                        }
                        disabled={readonly}
                        inputProps={{ "aria-label": question.text }}
                      />
                    }
                    label="Confirmar"
                  />
                  {renderDescripcionInline(field)}
                  {renderObservacionInline(field)}
                </>
              );
            }}
          />
        );

      case "date":
        return (
          <Controller
            name={fieldName}
            control={control}
            rules={{ validate: buildValidate("date") }}
            render={({ field }) => {
              const current = getCurrentValue(field.value);
              return (
                <>
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
                    required={question.obligatorio}
                    inputProps={{
                      "aria-required": question.obligatorio ? "true" : undefined,
                      "aria-invalid": !!error ? "true" : undefined,
                      "aria-describedby": error ? errorId : undefined,
                    }}
                    FormHelperTextProps={{ id: errorId }}
                  />
                  {renderDescripcionInline(field)}
                  {renderObservacionInline(field)}
                </>
              );
            }}
          />
        );

      default:
        return (
          <Typography color="error">Tipo de pregunta no soportado</Typography>
        );
    }
  };

  const stripColor = error ? "#d32f2f" : "transparent";

  return (
    <Paper
      elevation={1}
      data-question-error={error ? "true" : undefined}
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: "#fafafa",
        borderLeft: `3px solid ${stripColor}`,
        transition: "border-left-color 0.2s ease",
      }}
    >
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
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
        )}
        <Box flex={1}>
          <FormLabel
            component="legend"
            id={labelId}
            sx={{ mb: 1, display: "block" }}
          >
            <Typography variant="body1" fontWeight="medium" component="span">
              {question.text}
              {question.obligatorio && (
                <Typography
                  component="span"
                  color="error"
                  sx={{ ml: 0.5 }}
                  aria-hidden="true"
                >
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
