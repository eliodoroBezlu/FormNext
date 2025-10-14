// components/form-filler/QuestionRenderer.tsx
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
import { FormDataHerraEquipos, getNestedError, Question } from "./types/IProps";

// Hacer el componente genérico
interface QuestionRendererProps<T extends FormDataHerraEquipos = FormDataHerraEquipos> {
  question: Question;
  sectionPath: string;
  questionIndex: number;
  control: Control<T>;
  errors: FieldErrors<T>;
  readonly?: boolean;
}

export const QuestionRenderer = <T extends FormDataHerraEquipos = FormDataHerraEquipos>({
  question,
  sectionPath,
  questionIndex,
  control,
  errors,
  readonly = false,
}: QuestionRendererProps<T>) => {
  const fieldName = `${sectionPath}.q${questionIndex}` as FieldPath<T>;
  const observacionFieldName = `${sectionPath}.q${questionIndex}.observacion` as FieldPath<T>;
  
  const error = getNestedError(errors, fieldName);
  const observacionError = getNestedError(errors, observacionFieldName);

  const renderInput = () => {
    const { type, options, placeholder, min, max } = question.responseConfig;

    switch (type) {
      case "si_no_na":
        return (
          <>
            <Controller
              name={fieldName}
              control={control}
              rules={{ required: question.obligatorio ? "Este campo es obligatorio" : false }}
              render={({ field }) => (
                <FormControl error={!!error} fullWidth>
                  <RadioGroup 
                    value={field.value || ""} 
                    onChange={field.onChange}
                    row
                  >
                    {options?.map((option) => (
                      <FormControlLabel
                        key={String(option.value)}
                        value={option.value}
                        control={<Radio disabled={readonly} />}
                        label={
                          <Chip
                            label={option.label}
                            size="small"
                            sx={{
                              backgroundColor: option.color || "default",
                              color: "white",
                            }}
                          />
                        }
                      />
                    ))}
                  </RadioGroup>
                  {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
              )}
            />
            <Box mt={2}>
              <Controller
                name={observacionFieldName}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ""}
                    fullWidth
                    size="small"
                    label="Observaciones (opcional)"
                    placeholder="Ingrese observaciones adicionales..."
                    multiline
                    rows={2}
                    error={!!observacionError}
                    helperText={observacionError?.message}
                    disabled={readonly}
                  />
                )}
              />
            </Box>
          </>
        );

      case "text":
        return (
          <>
            <Controller
              name={fieldName}
              control={control}
              rules={{ required: question.obligatorio ? "Este campo es obligatorio" : false }}
              render={({ field }) => (
                <TextField
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  fullWidth
                  size="small"
                  placeholder={placeholder || "Ingrese su respuesta"}
                  error={!!error}
                  helperText={error?.message}
                  disabled={readonly}
                />
              )}
            />
            <Box mt={2}>
              <Controller
                name={observacionFieldName}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ""}
                    fullWidth
                    size="small"
                    label="Observaciones (opcional)"
                    placeholder="Ingrese observaciones adicionales..."
                    multiline
                    rows={2}
                    disabled={readonly}
                  />
                )}
              />
            </Box>
          </>
        );

      case "textarea":
        return (
          <>
            <Controller
              name={fieldName}
              control={control}
              rules={{ required: question.obligatorio ? "Este campo es obligatorio" : false }}
              render={({ field }) => (
                <TextField
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  fullWidth
                  multiline
                  rows={4}
                  size="small"
                  placeholder={placeholder || "Ingrese su respuesta"}
                  error={!!error}
                  helperText={error?.message}
                  disabled={readonly}
                />
              )}
            />
            <Box mt={2}>
              <Controller
                name={observacionFieldName}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ""}
                    fullWidth
                    size="small"
                    label="Observaciones adicionales (opcional)"
                    placeholder="Ingrese observaciones complementarias..."
                    multiline
                    rows={2}
                    disabled={readonly}
                  />
                )}
              />
            </Box>
          </>
        );

      case "number":
        return (
          <>
            <Controller
              name={fieldName}
              control={control}
              rules={{
                required: question.obligatorio ? "Este campo es obligatorio" : false,
                min: min ? { value: min, message: `Mínimo: ${min}` } : undefined,
                max: max ? { value: max, message: `Máximo: ${max}` } : undefined,
              }}
              render={({ field }) => (
                <TextField
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                  onBlur={field.onBlur}
                  type="number"
                  size="small"
                  placeholder={placeholder || "0"}
                  inputProps={{ min, max }}
                  error={!!error}
                  helperText={error?.message}
                  disabled={readonly}
                />
              )}
            />
            <Box mt={2}>
              <Controller
                name={observacionFieldName}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ""}
                    fullWidth
                    size="small"
                    label="Observaciones (opcional)"
                    placeholder="Ingrese observaciones adicionales..."
                    multiline
                    rows={2}
                    disabled={readonly}
                  />
                )}
              />
            </Box>
          </>
        );

      case "boolean":
        return (
          <>
            <Controller
              name={fieldName}
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={!!field.value} 
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={readonly}
                    />
                  }
                  label="Sí"
                />
              )}
            />
            <Box mt={2}>
              <Controller
                name={observacionFieldName}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ""}
                    fullWidth
                    size="small"
                    label="Observaciones (opcional)"
                    placeholder="Ingrese observaciones adicionales..."
                    multiline
                    rows={2}
                    disabled={readonly}
                  />
                )}
              />
            </Box>
          </>
        );

      case "date":
        return (
          <>
            <Controller
              name={fieldName}
              control={control}
              rules={{ required: question.obligatorio ? "Este campo es obligatorio" : false }}
              render={({ field }) => (
                <TextField
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  error={!!error}
                  helperText={error?.message}
                  disabled={readonly}
                />
              )}
            />
            <Box mt={2}>
              <Controller
                name={observacionFieldName}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ""}
                    fullWidth
                    size="small"
                    label="Observaciones (opcional)"
                    placeholder="Ingrese observaciones adicionales..."
                    multiline
                    rows={2}
                    disabled={readonly}
                  />
                )}
              />
            </Box>
          </>
        );

      default:
        return <Typography color="error">Tipo de pregunta no soportado</Typography>;
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
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              {question.image.caption}
            </Typography>
          )}
          {renderInput()}
        </Box>
      </Box>
    </Paper>
  );
};