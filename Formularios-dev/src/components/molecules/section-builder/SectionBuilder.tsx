"use client";

import type React from "react";
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Add, Delete, ExpandMore } from "@mui/icons-material";
import { Button } from "../../atoms/button/Button";
import {
  FormField,
  FormFieldValue,
} from "../../molecules/form-field/FormField";
import { FormBuilderData, Question, Section } from "@/types/formTypes";

// Interfaces actualizadas

// Tipado específico para el SectionBuilder
export interface SectionBuilderProps {
  sectionIndex: number;
  section: Section;
  control: Control<FormBuilderData>; // Control de react-hook-form
  onRemove: () => void;
  onUpdate?: (sectionIndex: number, updatedSection: Partial<Section>) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  disabled?: boolean;
  showRemoveButton?: boolean;
  minQuestions?: number;
  maxQuestions?: number;
  pointsPerQuestion?: number;
}

export const SectionBuilder: React.FC<SectionBuilderProps> = ({
  sectionIndex,
  section,
  control,
  onRemove,
  onUpdate,
  expanded = false,
  onToggleExpanded,
  disabled = false,
  showRemoveButton = true,
  minQuestions = 1,
  maxQuestions = 300,
}) => {
  const {
    fields: questions,
    append: appendQuestion,
    remove: removeQuestion,
    update: updateQuestion,
  } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.questions` as const,
  });

  const watchedQuestions = useWatch({
    control,
    name: `sections.${sectionIndex}.questions`,
  });

  // Asegurarse de que todas las preguntas tengan el campo obligatorio inicializado
  useEffect(() => {
    questions.forEach((question, index) => {
      const currentQuestion = watchedQuestions?.[index];
      if (currentQuestion && currentQuestion.obligatorio === undefined) {
        updateQuestion(index, {
          ...currentQuestion,
          obligatorio: false,
        });
      }
    });
  }, [questions, watchedQuestions, updateQuestion]);

  const addQuestion = () => {
    if (questions.length >= maxQuestions) {
      alert(`Máximo ${maxQuestions} preguntas por sección`);
      return;
    }
    const newQuestion: Question = {
      //_id: generateId(), // o usa un UUID si prefieres
      text: "",
      obligatorio: false, // Valor por defecto
    };

    appendQuestion(newQuestion);
  };

  const handleRemoveQuestion = (questionIndex: number) => {
    if (questions.length <= minQuestions) {
      alert(`Mínimo ${minQuestions} pregunta(s) por sección`);
      return;
    }
    removeQuestion(questionIndex);
  };
  const handleSectionUpdate = (field: keyof Section, value: FormFieldValue) => {
    if (onUpdate) {
      onUpdate(sectionIndex, { [field]: value });
    }
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={onToggleExpanded}
      sx={{
        mb: 2,
        opacity: disabled ? 0.7 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <Box display="flex" alignItems="center">
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            flexGrow: 1,
            "&:hover": { backgroundColor: "action.hover" },
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="flex-start">
            <Typography variant="h6">
              Sección {sectionIndex + 1}
              {section.title && `: ${section.title}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {questions.length} pregunta{questions.length !== 1 ? "s" : ""} •
              Máx: {section.maxPoints || 0} puntos
            </Typography>
          </Box>
        </AccordionSummary>

        {showRemoveButton && (
          <Box display="flex" alignItems="center" px={1}>
            <IconButton
              color="error"
              onClick={onRemove}
              size="small"
              title="Eliminar sección"
              disabled={disabled}
            > 
              <Delete />
            </IconButton>
          </Box>
        )}
      </Box>

      <AccordionDetails>
        {/* Información general de la sección */}
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <FormField
              name={`sections.${sectionIndex}.title`}
              control={control}
              label="Título de la Sección"
              rules={{ required: "Título es requerido" }}
              disabled={disabled}
              onChange={(value) => handleSectionUpdate("title", value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormField
              name={`sections.${sectionIndex}.maxPoints`}
              control={control}
              type="number"
              label="Puntaje Máximo"
              rules={{
                required: "Puntaje Máximo es requerido",
                valueAsNumber: true,
                min: { value: 0, message: "Debe ser mayor o igual a 0" },
                max: { value: 1000, message: "Máximo 1000 puntos" },
              }}
              disabled={disabled}
              onChange={(value) =>
                handleSectionUpdate("maxPoints", Number(value))
              }
            />
          </Grid>
        </Grid>

        {/* Header de preguntas */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="subtitle1" fontWeight="medium">
            Preguntas ({questions.length}/{maxQuestions})
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={addQuestion}
            disabled={disabled || questions.length >= maxQuestions}
          >
            Agregar Pregunta
          </Button>
        </Box>

        {/* Lista de preguntas */}
        {questions.length === 0 ? (
          <Box
            p={3}
            textAlign="center"
            sx={{
              border: 1,
              borderColor: "divider",
              borderStyle: "dashed",
              borderRadius: 1,
              backgroundColor: "grey.50",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No hay preguntas. Haz clic en &quot;Agregar Pregunta&quot; para
              comenzar.
            </Typography>
          </Box>
        ) : (
          questions.map((question, questionIndex) => (
            <Box
              key={question.id}
              mb={2}
              p={2}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "background.paper",
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 7 }}>
                  <FormField
                    name={`sections.${sectionIndex}.questions.${questionIndex}.text`}
                    control={control}
                    label={`Pregunta ${questionIndex + 1}`}
                    inputProps={{
                      multiline: true,
                      rows: 2,
                      placeholder: "Escribe aquí la pregunta...",
                    }}
                    rules={{
                      required: "Pregunta es requerida",
                      minLength: {
                        value: 5,
                        message: "La pregunta debe tener al menos 5 caracteres",
                      },
                    }}
                    disabled={disabled}
                  />
                </Grid>
                <Grid size={{ xs: 8, sm: 3 }}>
                  <FormField
                    name={`sections.${sectionIndex}.questions.${questionIndex}.obligatorio`}
                    control={control}
                    type="checkbox"
                    label="¿Obligatorio?"
                    disabled={disabled}
                  />
                </Grid>
                <Grid size={{ xs: 4, sm: 2 }}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <Typography variant="caption" color="text.secondary" mb={1}>
                      #{questionIndex + 1}
                    </Typography>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveQuestion(questionIndex)}
                      size="small"
                      disabled={disabled || questions.length <= minQuestions}
                      title={
                        questions.length <= minQuestions
                          ? `Mínimo ${minQuestions} pregunta(s)`
                          : "Eliminar pregunta"
                      }
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ))
        )}

        {/* Información adicional */}
        <Box mt={2} p={2} sx={{ backgroundColor: "info.50", borderRadius: 1 }}>
          <Typography variant="caption" color="info.main">
            💡 Consejos: Las preguntas deben ser claras y específicas. El
            puntaje máximo se distribuirá equitativamente entre todas las
            preguntas. Las preguntas marcadas como obligatorias requerirán
            respuesta.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
