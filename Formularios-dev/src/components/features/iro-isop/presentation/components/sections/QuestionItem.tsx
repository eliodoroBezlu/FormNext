import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { Select } from "@/components/ui/inputs/Select";
import { Input } from "@/components/ui/inputs/Input";
import { valoracionOptions } from "@/lib/constants";
import type { QuestionItemProps } from "@/components/features/iro-isop/types/IProps";

export const QuestionItem = React.memo(
  ({
    section,
    question,
    questionIndex,
    flatIndex,
    control,
    onResponseChange,
    readonly = false,
  }: QuestionItemProps) => {
    const { trigger, getValues, formState: { errors } } = useFormContext();

    // Acceder de forma segura a los errores de la pregunta actual para evitar problemas de tipos de RHF
    const sectionErrors = (errors.sections as unknown as Record<string, unknown>[])?.[flatIndex];
    const questionErrors = sectionErrors?.questions as Record<string, unknown> | undefined;
    const responseError = questionErrors?.[questionIndex] as Record<string, unknown> | undefined;
    const commentError = questionErrors?.[questionIndex] as Record<string, unknown> | undefined;
    const hasError = !!responseError || !!commentError;

    return (
      <Paper
        key={questionIndex}
        variant="outlined"
        data-question-error={hasError ? "true" : undefined}
        sx={{
          mb: 2,
          p: { xs: 1.5, sm: 2 },
          bgcolor: (theme) => (theme.palette.mode === "dark" ? "background.paper" : "grey.50"),
          border: hasError ? "2px solid" : "1px solid",
          borderColor: (theme) =>
            hasError ? "error.main" : theme.palette.mode === "dark" ? "divider" : "grey.200",
          transition: "box-shadow 0.3s ease, border-color 0.3s ease",
          "&:hover": {
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0px 2px 8px rgba(0, 0, 0, 0.3)"
                : "0px 2px 8px rgba(0, 0, 0, 0.05)",
          },
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 2, md: 1 }}>
            <Typography
              variant="body2"
              fontWeight="bold"
              textAlign="center"
              color={hasError ? "error" : "primary"}
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              {section._id?.charAt(0).toUpperCase()}.{questionIndex + 1}
            </Typography>
          </Grid>

          <Grid size={{ xs: 10, md: 5 }}>
            <Typography
              variant="body2"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
            >
              {question.text}
              {(question.obligatorio || true) && (
                <Typography component="span" color="error" sx={{ ml: 0.5, fontWeight: "bold" }}>
                  *
                </Typography>
              )}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Box>
              <Typography
                variant="caption"
                display={{ xs: "block", md: "none" }}
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                Valoración:
              </Typography>
              <Controller
                name={`sections.${flatIndex}.questions.${questionIndex}.response`}
                control={control}
                rules={{ required: !readonly && "Respuesta requerida" }}
                render={({ field, fieldState: { error } }) => (
                  <Select
                    value={field.value || ""}
                    onChange={(value: unknown) => {
                      const selectedValue =
                        typeof value === "string"
                          ? value
                          : (value as { target: { value: string } })?.target?.value || "";
                      field.onChange(selectedValue);
                      onResponseChange(flatIndex, questionIndex, selectedValue);
                      // Disparar validación del comentario si es obligatorio
                      if (question.obligatorio) {
                        trigger(`sections.${flatIndex}.questions.${questionIndex}.comment`);
                      }
                    }}
                    label=""
                    options={valoracionOptions}
                    disabled={readonly}
                    error={!!error}
                    helperText={error?.message}
                    sx={{
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      ...(question.obligatorio && {
                        backgroundColor: "#E63715",
                        "& .MuiSelect-select": {
                          backgroundColor: "#E63715 !important",
                          color: "white !important",
                        },
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#E63715 !important",
                          "& fieldset": { borderColor: "#E63715" },
                        },
                      }),
                    }}
                  />
                )}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Box>
              <Typography
                variant="caption"
                display={{ xs: "block", md: "none" }}
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                Comentario:
              </Typography>
              <Controller
                name={`sections.${flatIndex}.questions.${questionIndex}.comment`}
                control={control}
                rules={{
                  validate: (val) => {
                    if (readonly) return true;
                    const currentResponse = getValues(`sections.${flatIndex}.questions.${questionIndex}.response`);
                    
                    // Si esta pregunta no está marcada como N/A o no es obligatoria, no exige comentario
                    if (!question.obligatorio || currentResponse !== "N/A") return true;

                    // Verificar si TODAS las preguntas de esta sección están marcadas como "N/A"
                    const allQuestions = getValues(`sections.${flatIndex}.questions`) as { response: string }[];
                    const allAreNA = allQuestions && allQuestions.every(q => q.response === "N/A");

                    // Si TODAS las preguntas están marcadas como N/A, la justificación se hace a nivel de sección, no pregunta por pregunta
                    if (allAreNA) return true;

                    if (!val || val.trim() === "") {
                      return "Se debe justificar en los comentarios el motivo por el cual NO APLICA";
                    }
                    return true;
                  }
                }}
                render={({ field, fieldState: { error } }) => (
                  <Input
                    {...field}
                    value={field.value || ""}
                    label=""
                    error={!!error}
                    helperText={error?.message}
                    inputProps={{
                      placeholder: "Comentario",
                      readOnly: readonly,
                    }}
                    disabled={readonly}
                    sx={{
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      "& .MuiInputBase-input": {
                        padding: { xs: "8px 12px", sm: "8px 12px" },
                      },
                    }}
                  />
                )}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  }
);

QuestionItem.displayName = "QuestionItem";
