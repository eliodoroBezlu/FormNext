// src/components/organisms/inspection-form-iro-isop/presentation/components/sections/SectionAccordion.tsx

import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Grid,
  Chip,
  TextField,
} from "@mui/material";
import { ExpandMore, FolderOpen, Description } from "@mui/icons-material";
import { Button } from "@/components/atoms/button/Button";
import { Controller, useFormContext } from "react-hook-form";
import { QuestionItem } from "./QuestionItem";
import type { SectionAccordionProps } from "@/components/organisms/inspection-form-iro-isop/types/IProps";
import type { Section, Question, SectionResponse, QuestionResponse } from "@/types/formTypes";

export const SectionAccordion = ({
  section,
  level,
  control,
  readonly,
  allFlatSections,
  handleMarkSectionAsNotApplicable,
  handleUpdateQuestionResponse,
  calculateSectionMetrics,
  renderSections,
}: SectionAccordionProps) => {
  const { getValues } = useFormContext(); // Permite obtener valores dinámicamente en el render.

  if (section.isParent) {
    return (
      <Accordion
        key={section._id || `parent-${level}`}
        elevation={2}
        sx={{
          mb: 2,
          ml: level * 2,
          border: "2px solid",
          borderColor: "primary.main",
          backgroundColor: "primary.50",
        }}
        defaultExpanded={level === 0}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { backgroundColor: "primary.dark" },
            "& .MuiAccordionSummary-expandIconWrapper": { color: "white" },
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <FolderOpen />
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" }, fontWeight: "bold" }}
            >
              📁 {section.title}
            </Typography>
            {section.description && (
              <Typography
                variant="caption"
                sx={{ color: "rgba(255, 255, 255, 0.8)", fontStyle: "italic" }}
              >
                {section.description}
              </Typography>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: { xs: 1, sm: 2 } }}>
          {section.subsections && section.subsections.length > 0 ? (
            <React.Fragment>
              {renderSections(section.subsections, level + 1)}
            </React.Fragment>
          ) : (
            <Box p={2} textAlign="center" color="text.secondary">
              <Typography variant="body2">
                Esta sección padre no tiene subsecciones definidas.
              </Typography>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    );
  }

  const flatIndex = allFlatSections.findIndex((s: Section) => s._id === section._id);
  if (flatIndex === -1) return null;

  const currentSections = (getValues("sections") as SectionResponse[]) || [];
  const sectionData = currentSections[flatIndex];
  
  const isCompleted = !!sectionData?.questions?.every(
    (q: QuestionResponse) => q.response && q.response !== ""
  );

  const sectionMetrics = calculateSectionMetrics(
    sectionData?.questions || [],
    section.maxPoints
  );

  return (
    <Accordion
      key={section._id || `section-${flatIndex}`}
      elevation={2}
      sx={{ mb: 2, ml: level * 2 }}
      defaultExpanded={level === 0}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          bgcolor: isCompleted ? "success.main" : "primary.main",
          color: "white",
          "& .MuiAccordionSummary-expandIconWrapper": { color: "white" },
        }}
      >
        <Grid container alignItems="center" spacing={2} sx={{ width: "100%" }}>
          <Grid size={{ xs: 12 }}>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Description />
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" }, fontWeight: "bold" }}
              >
                {section.title}
              </Typography>
              {isCompleted && (
                <Chip
                  label="Completado"
                  size="small"
                  sx={{ bgcolor: "success.dark", color: "white", fontWeight: "bold" }}
                />
              )}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: "auto" }}>
            <Typography
              variant="h6"
              sx={{ textAlign: { xs: "left", sm: "right" }, fontWeight: "bold" }}
            >
              % Cumplimiento: {sectionMetrics.compliance}%
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0 }}>
        {/* Header de Puntos de la Sección */}
        <Box
          sx={{
            bgcolor: isCompleted ? "success.light" : "primary.light",
            color: "white",
            p: { xs: 1, sm: 1.5 },
          }}
        >
          <Grid container spacing={1} alignItems="center">
            <Grid size={{ xs: 6, sm: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Máximo: {section.maxPoints}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Obtenido: {sectionMetrics.obtained}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                N/A: {sectionMetrics.na}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                display="flex"
                justifyContent={{ xs: "center", sm: "flex-end" }}
              >
                {!readonly && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleMarkSectionAsNotApplicable(flatIndex)}
                    sx={{
                      bgcolor: "white",
                      color: "error.main",
                      borderColor: "white",
                      fontWeight: "bold",
                      "&:hover": {
                        bgcolor: "error.light",
                        color: "white",
                        borderColor: "error.main",
                      },
                    }}
                  >
                    No Aplica Sección
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box p={{ xs: 2, sm: 3 }}>
          {section.questions.map((question: Question, questionIndex: number) => (
            <QuestionItem
              key={questionIndex}
              section={section}
              question={question}
              questionIndex={questionIndex}
              flatIndex={flatIndex}
              control={control}
              onResponseChange={handleUpdateQuestionResponse}
              readonly={readonly}
            />
          ))}

          <Box mt={3}>
            <Controller
              name={`sections.${flatIndex}.sectionComment`}
              control={control}
              rules={{
                validate: (val) => {
                  if (readonly) return true;
                  const allQuestions = getValues(`sections.${flatIndex}.questions`) as { response: string }[];
                  const allAreNA = allQuestions && allQuestions.length > 0 && allQuestions.every((q) => q.response === "N/A");
                  
                  if (allAreNA && (!val || val.trim() === "")) {
                    return "Debes justificar en los comentarios de la sección por qué no aplica la sección completa";
                  }
                  return true;
                }
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Comentarios de la Sección"
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  disabled={readonly}
                  error={!!error}
                  helperText={error?.message}
                  placeholder="Comentarios adicionales para esta sección..."
                />
              )}
            />
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
