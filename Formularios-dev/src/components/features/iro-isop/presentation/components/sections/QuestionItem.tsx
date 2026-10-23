import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { Select } from "@/components/ui/inputs/Select";
import { Input } from "@/components/ui/inputs/Input";
import { valoracionOptions } from "@/lib/constants";
import type { QuestionItemProps } from "@/components/features/iro-isop/types/IProps";
import { motivoDelComentario } from "@/components/features/iro-isop/domain/models/comentarioObligatorio";

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

    /** Si esta respuesta exige comentario, el mensaje; si no, `null`. */
    const comentarioPedido = () => {
      const preguntas = getValues(`sections.${flatIndex}.questions`) as { response: string }[] | undefined;
      return motivoDelComentario({
        respuesta: getValues(`sections.${flatIndex}.questions.${questionIndex}.response`),
        obligatoria: !!question.obligatorio,
        seccionEnteraNoAplica: !!preguntas?.length && preguntas.every((q) => q.response === "N/A"),
      });
    };

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
                  // Puntaje 0, 1 o 2: siempre; «No aplica»: solo en las rojas
                  // (ver `comentarioObligatorio.ts`).
                  validate: (val) => {
                    if (readonly) return true;
                    const motivo = comentarioPedido();
                    if (motivo && (!val || val.trim() === "")) return motivo;
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
                      placeholder:
                        !readonly && comentarioPedido()
                          ? "Comentario (obligatorio)"
                          : "Comentario",
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
