"use client";

import type React from "react";
import {
  Control,
  useFieldArray,
  useWatch,
  UseFormSetValue,
} from "react-hook-form";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
} from "@mui/material";
import {
  Add,
  Delete,
  ExpandMore,
  FolderOpen,
  Description,
} from "@mui/icons-material";
import { Button } from "../../atoms/button/Button";
import {
  FormField,
  FormFieldValue,
} from "../../molecules/form-field/FormField";
import { FormBuilderData, Question, Section } from "@/types/formTypes";

export interface SectionBuilderProps {
  sectionIndex: number;
  section: Section;
  control: Control<FormBuilderData>;
  setValue: UseFormSetValue<FormBuilderData>;
  onRemove: () => void;
  onUpdate?: (sectionIndex: number, updatedSection: Partial<Section>) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  disabled?: boolean;
  showRemoveButton?: boolean;
  minQuestions?: number;
  maxQuestions?: number;
  parentPath?: string;
  isNested?: boolean;
}

export const SectionBuilder: React.FC<SectionBuilderProps> = ({
  sectionIndex,
  section,
  control,
  setValue,
  onRemove,
  onUpdate,
  expanded = false,
  onToggleExpanded,
  disabled = false,
  showRemoveButton = true,
  minQuestions = 1,
  maxQuestions = 300,
  parentPath = "",
  isNested = false,
}) => {
  const basePath = parentPath
    ? `${parentPath}.subsections.${sectionIndex}`
    : `sections.${sectionIndex}`;

  const [expandedSubsections, setExpandedSubsections] = useState<Set<number>>(
    new Set([0]) 
  );


  const {
    fields: questions,
    append: appendQuestion,
    remove: removeQuestion,
    update: updateQuestion,
  } = useFieldArray({
    control,
    name: `${basePath}.questions` as never,
  });

  const {
    fields: subsections,
    append: appendSubsection,
    remove: removeSubsection,
  } = useFieldArray({
    control,
    name: `${basePath}.subsections` as never,
  });

  const watchedQuestions = useWatch({
  control,
  name: `${basePath}.questions` as never,
}) as Question[] | undefined;

const watchedSubsections = useWatch({
  control,
  name: `${basePath}.subsections` as never,
}) as Section[] | undefined;

  useEffect(() => {
    if (!section.isParent && questions.length > 0) {
      questions.forEach((question, index) => {
        const currentQuestion = watchedQuestions?.[index];
        if (
          currentQuestion &&
          "obligatorio" in currentQuestion &&
          currentQuestion.obligatorio === undefined
        ) {
          updateQuestion(index, {
            ...currentQuestion,
            obligatorio: false,
          });
        }
      });
    }
  }, [questions, watchedQuestions, updateQuestion, section.isParent]);

  const addQuestion = () => {
    if (questions.length >= maxQuestions) {
      alert(`Máximo ${maxQuestions} preguntas por sección`);
      return;
    }

    if (section.isParent) {
      alert(
        "Las secciones padre no pueden tener preguntas. Agrega subsecciones en su lugar."
      );
      return;
    }

    const newQuestion: Question = {
      text: "",
      obligatorio: false,
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

  const addSubsection = (isParent: boolean) => {

    const newSubsection: Section = {
      title: isParent ? "Nueva Subsección Padre" : "Nueva Subsección Simple",
      description: "",
      maxPoints: 0,
      questions: isParent ? [] : [{ text: "", obligatorio: false }],
      isParent: isParent, 
      parentId: section._id || null,
      subsections: isParent ? [] : undefined,
      order: section.subsections?.length || 0,
    };


    appendSubsection(newSubsection);

    const newIndex = subsections.length;
    setExpandedSubsections((prev) => new Set([...prev, newIndex]));
  };

  const handleRemoveSubsection = (subIndex: number) => {
    removeSubsection(subIndex);
  };

  const getTotalQuestionsRecursive = (sec: Section): number => {
    let total = sec.questions?.length || 0;
    if (sec.subsections) {
      sec.subsections.forEach((sub) => {
        total += getTotalQuestionsRecursive(sub);
      });
    }
    return total;
  };

  const getTotalPointsRecursive = (sec: Section): number => {
    let total = Number(sec.maxPoints) || 0;
    if (sec.subsections) {
      sec.subsections.forEach((sub) => {
        total += getTotalPointsRecursive(sub);
      });
    }
    return total;
  };

  const shouldShowSubsections = section.isParent === true;

  

  
  return (
    <Accordion
      expanded={expanded}
      onChange={onToggleExpanded}
      sx={{
        mb: 2,
        ml: isNested ? 2 : 0,
        opacity: disabled ? 0.7 : 1,
        pointerEvents: disabled ? "none" : "auto",
        border: section.isParent ? "2px solid" : "1px solid",
        borderColor: section.isParent ? "primary.main" : "divider",
        backgroundColor: section.isParent ? "primary.50" : "background.paper",
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
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            width="100%"
          >
            <Box display="flex" alignItems="center" gap={1}>
              {section.isParent ? (
                <FolderOpen color="primary" />
              ) : (
                <Description color="action" />
              )}
              <Typography
                variant="h6"
                fontWeight={section.isParent ? "bold" : "medium"}
              >
                {section.isParent ? "📁" : "📄"} {section.title || "Sin título"}
              </Typography>
            </Box>

            {section.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {section.description}
              </Typography>
            )}

            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
              {!section.isParent && (
                <>
                  <Chip
                    label={`${questions.length} pregunta${
                      questions.length !== 1 ? "s" : ""
                    }`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`${section.maxPoints || 0} pts`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </>
              )}

              {shouldShowSubsections && (
                <>
                  <Chip
                    label={`${subsections.length} subsección${
                      subsections.length !== 1 ? "es" : ""
                    }`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`${getTotalQuestionsRecursive(
                      section
                    )} preguntas totales`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`${getTotalPointsRecursive(section)} pts totales`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </>
              )}
            </Box>
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
          <Grid size={{ xs: 12, sm: section.isParent ? 12 : 8 }}>
            <FormField
              name={`${basePath}.title` as never}
              control={control}
              label={
                section.isParent
                  ? "Título de la Sección Padre"
                  : "Título de la Sección"
              }
              rules={{ required: "Título es requerido" }}
              disabled={disabled}
              onChange={(value) => handleSectionUpdate("title", value)}
            />
          </Grid>

          {!section.isParent && (
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormField
                name={`${basePath}.maxPoints` as never}
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
          )}

          <Grid size={{ xs: 12 }}>
            <FormField
              name={`${basePath}.description` as never}
              control={control}
              label="Descripción (opcional)"
              inputProps={{
                multiline: true,
                rows: 2,
                placeholder: "Descripción de la sección...",
              }}
              disabled={disabled}
            />
          </Grid>
        </Grid>

        {/* Preguntas - Solo si NO es sección padre */}
        {!section.isParent && (
          <>
            <Divider sx={{ my: 2 }} />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Preguntas ({questions.length}/{maxQuestions})
              </Typography>
              {!disabled && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={addQuestion}
                  disabled={questions.length >= maxQuestions}
                >
                  Agregar Pregunta
                </Button>
              )}
            </Box>

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
                  No hay preguntas. Haz clic en &quot;Agregar Pregunta&quot;
                  para comenzar.
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
                        name={
                          `${basePath}.questions.${questionIndex}.text`  as never
                        }
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
                            message:
                              "La pregunta debe tener al menos 5 caracteres",
                          },
                        }}
                        disabled={disabled}
                      />
                    </Grid>
                    <Grid size={{ xs: 8, sm: 3 }}>
                      <FormField
                        name={
                          `${basePath}.questions.${questionIndex}.obligatorio` as never
                        }
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
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          mb={1}
                        >
                          #{questionIndex + 1}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveQuestion(questionIndex)}
                          size="small"
                          disabled={
                            disabled || questions.length <= minQuestions
                          }
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
          </>
        )}

        {/* Subsecciones - Solo si ES o PUEDE ser sección padre */}
        {shouldShowSubsections && (
          <>
            <Divider sx={{ my: 3 }} />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Subsecciones ({subsections.length})
              </Typography>
              {!disabled && (
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => addSubsection(false)}
                    color="primary"
                  >
                    Subsección Simple
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => addSubsection(true)}
                    color="secondary"
                  >
                    Subsección Padre
                  </Button>
                </Box>
              )}
            </Box>

            {subsections.length === 0 ? (
              <Box
                p={3}
                textAlign="center"
                sx={{
                  border: 2,
                  borderColor: "primary.main",
                  borderStyle: "dashed",
                  borderRadius: 1,
                  backgroundColor: "primary.50",
                }}
              >
                <Typography variant="body2" color="primary.main">
                  No hay subsecciones. Haz clic en los botones de arriba para
                  comenzar.
                </Typography>
              </Box>
            ) : (
              subsections.map((subsection, subIndex) => {
                const currentSubsection = watchedSubsections?.[subIndex] || {
                  title: "",
                  description: "",
                  maxPoints: 0,
                  questions: [],
                  isParent: false,
                  parentId: null,
                  subsections: undefined,
                  ...(subsection),
                };

                
                const toggleSubsectionExpansion = (index: number) => {
                  setExpandedSubsections((prev) => {
                    const newSet = new Set(prev);
                    if (newSet.has(index)) {
                      newSet.delete(index);
                    } else {
                      newSet.add(index);
                    }
                    return newSet;
                  });
                };

                return (
                  <Box key={subsection.id || `subsection-${subIndex}`} mb={2}>
                    <SectionBuilder
                      sectionIndex={subIndex}
                      section={currentSubsection}
                      control={control}
                      setValue={setValue}
                      onRemove={() => handleRemoveSubsection(subIndex)}
                      disabled={disabled}
                      isNested={true}
                      parentPath={basePath}
                      showRemoveButton={true}
                      expanded={expandedSubsections.has(subIndex)}
                      onToggleExpanded={() =>
                        toggleSubsectionExpansion(subIndex)
                      }
                    />
                  </Box>
                );
              })
            )}
          </>
        )}

        {/* Información adicional */}
        <Box mt={2} p={2} sx={{ backgroundColor: "info.50", borderRadius: 1 }}>
          <Typography variant="caption" color="info.main">
            💡{" "}
            {section.isParent
              ? "📁 Sección Padre: Contiene subsecciones. Puede tener Subsecciones Padre o Simples."
              : "📄 Sección Simple: Contiene preguntas. No puede tener subsecciones (es terminal)."}
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
