// components/form-filler/specialized/GroupedQuestionWithGeneralObservation.tsx
"use client"
import { Controller, PathValue, type Control, type FieldErrors, type FieldPath } from "react-hook-form"
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  FormControl,
  FormHelperText,
} from "@mui/material"
import type { FormDataHerraEquipos, Question, GroupedQuestionData, ColumnConfig } from "./types/IProps"
import { FormFeatureConfig } from "./formConfig"

interface GroupedQuestionWithGeneralObservationProps<T extends FormDataHerraEquipos = FormDataHerraEquipos> {
  question: Question
  sectionPath: string
  questionIndex: number
  control: Control<T>
  errors: FieldErrors<T>
  readonly?: boolean
  formConfig: FormFeatureConfig   
}

export const GroupedQuestionWithGeneralObservation = <T extends FormDataHerraEquipos = FormDataHerraEquipos>({
  question,
  sectionPath,
  questionIndex,
  control,
  readonly = false,
  formConfig,
}: GroupedQuestionWithGeneralObservationProps<T>) => {
  const groupedConfig = formConfig?.groupedConfig

  if (!groupedConfig) {
    return <Typography color="error">Error: Configuración de columnas no encontrada</Typography>
  }

  const fieldName = `${sectionPath}.q${questionIndex}` as FieldPath<T>


  const options = question.responseConfig?.options 

  const getBackgroundColor = (applicability: string): string => {
    switch (applicability) {
      case "required":
        return "#ffebee"
      case "requiredWithCount":
        return "#fff9c4"
      case "notApplicable":
        return "#f5f5f5"
      default:
        return "#ffffff"
    }
  }

  // 🆕 Valores por defecto para la estructura - CON TIPOS EXPLÍCITOS
  const getDefaultData = (): GroupedQuestionData => {
    const values: { [key: string]: string } = {}

    // 🆕 Tipo explícito para col
    groupedConfig.columns.forEach((col: ColumnConfig) => {
      if (col.applicability !== "notApplicable") {
        values[col.key] = ""
      }
    })

    return {
      values,
      observacion: "",
    }
  }

  return (
    <Paper elevation={2} sx={{ mb: { xs: 2, md: 3 }, border: "2px solid #ddd", overflow: "hidden" }}>
      {/* Header de la pregunta */}
      <Box sx={{ p: { xs: 1.5, md: 2 }, backgroundColor: "#e3f2fd", borderBottom: "3px solid #1976d2" }}>
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}>
          {question.text}
        </Typography>
      </Box>

      {/* Instrucciones */}
      {groupedConfig.instructionText && (
        <Box sx={{ p: { xs: 1.5, md: 2 }, backgroundColor: "#e8f5e9", borderBottom: "1px solid #c8e6c9" }}>
          <Typography variant="body2" sx={{ fontStyle: "italic", fontSize: { xs: "0.875rem", md: "0.875rem" } }}>
            {groupedConfig.instructionText}
          </Typography>
        </Box>
      )}

      {/* Grid de columnas + Observación general */}
      <Box sx={{ p: { xs: 1.5, md: 2 } }}>
        <Controller
          name={fieldName}
          control={control}
          defaultValue={getDefaultData() as PathValue<T, typeof fieldName>}
          rules={{
            validate: question.obligatorio
              ? (value) => {
                  if (!value || typeof value !== "object") return "Selección requerida"

                  const data = value as GroupedQuestionData

                  const requiredColumns = groupedConfig.columns.filter(
                    (col: ColumnConfig) =>
                      col.applicability === "required" || col.applicability === "requiredWithCount",
                  )

                  for (const col of requiredColumns) {
                    const columnValue = data.values?.[col.key]
                    if (!columnValue) {
                      return `La columna ${col.label} es obligatoria`
                    }
                  }
                  return true
                }
              : undefined,
          }}
          render={({ field, fieldState }) => {
            const currentData: GroupedQuestionData =
              field.value && typeof field.value === "object" && "values" in field.value && "observacion" in field.value
                ? (field.value as GroupedQuestionData)
                : getDefaultData()

            const error = fieldState.error

            const updateColumnValue = (columnKey: string, newValue: string) => {
              const updated: GroupedQuestionData = {
                values: {
                  ...currentData.values,
                  [columnKey]: newValue,
                },
                observacion: currentData.observacion,
              }
              field.onChange(updated)
            }

            const updateObservacion = (newObservacion: string) => {
              const updated: GroupedQuestionData = {
                values: currentData.values,
                observacion: newObservacion,
              }
              field.onChange(updated)
            }

            return (
              <FormControl error={!!error} fullWidth>
                <Grid container spacing={{ xs: 1.5, md: 2 }}>
                  {groupedConfig.columns.map((column: ColumnConfig) => {
                    const isDisabled = column.applicability === "notApplicable"
                    const columnValue = currentData.values?.[column.key] || ""

                    return (
                      <Grid size={{ xs: 6, sm: 6, md: 6, lg: 3 }} key={column.key}>
                        <Paper
                          elevation={1}
                          sx={{
                            p: { xs: 1, md: 2 },
                            height: "100%",
                            backgroundColor: getBackgroundColor(column.applicability),
                            border: isDisabled ? "2px dashed #ccc" : "2px solid #ddd",
                            opacity: isDisabled ? 0.5 : 1,
                          }}
                        >
                          {/* Header de la columna */}
                          <Box
                            sx={{
                              mb: { xs: 1, md: 2 },
                              pb: { xs: 0.5, md: 1 },
                              borderBottom: "2px solid rgba(0,0,0,0.1)",
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              textAlign="center"
                              sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}
                            >
                              {column.label}
                            </Typography>
                          </Box>

                          {/* Contenido de la columna */}
                          {isDisabled ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minHeight: { xs: 60, md: 80 },
                              }}
                            >
                              <Typography
                                variant="h6"
                                color="text.disabled"
                                sx={{ fontStyle: "italic", fontSize: { xs: "1rem", md: "1.25rem" } }}
                              >
                                N/A
                              </Typography>
                            </Box>
                          ) : (
                            <RadioGroup
                              value={columnValue}
                              onChange={(e) => updateColumnValue(column.key, e.target.value)}
                              sx={{ gap: { xs: 0.5, md: 1 } }}
                            >
                              {options?.map((option) => (
                                <FormControlLabel
                                  key={String(option.value)}
                                  value={option.value}
                                  control={<Radio disabled={readonly} size="small" />}
                                  label={
                                    <Chip
                                      label={option.label}
                                      size="small"
                                      sx={{
                                        backgroundColor: option.color || "default",
                                        color: "white",
                                        width: "100%",
                                        height: { xs: 24, md: 28 },
                                        fontSize: { xs: "0.75rem", md: "0.8125rem" },
                                        fontWeight: "bold",
                                      }}
                                    />
                                  }
                                  sx={{
                                    mb: { xs: 0.5, md: 1 },
                                    ml: 0,
                                    mr: 0,
                                  }}
                                />
                              ))}
                            </RadioGroup>
                          )}
                        </Paper>
                      </Grid>
                    )
                  })}
                </Grid>

                {error && <FormHelperText sx={{ mt: 2 }}>{error.message}</FormHelperText>}

                {/* OBSERVACIÓN GENERAL */}
                <Box sx={{ mt: { xs: 2, md: 3 } }}>
                  <TextField
                    value={currentData.observacion || ""}
                    onChange={(e) => updateObservacion(e.target.value)}
                    fullWidth
                    multiline
                    label="Observación General"
                    placeholder="Ingrese una observación general para este criterio..."
                    disabled={readonly}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#fafafa",
                        fontSize: { xs: "0.875rem", md: "1rem" },
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: { xs: "0.875rem", md: "1rem" },
                      },
                    }}
                  />
                </Box>
              </FormControl>
            )
          }}
        />
      </Box>
    </Paper>
  )
}
