"use client";

import type React from "react";
import {
  useFieldArray,
  type Control,
  type UseFormSetValue,
  type UseFormGetValues,
} from "react-hook-form";
import {
  Box,
  Typography,
  Grid,
  Button as MuiButton,
  Chip,
  IconButton,
  Divider,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Add, Delete, ExpandMore } from "@mui/icons-material";
import { ImageManager } from "./ImageManager";
import { QuestionBuilder } from "./QuestionEditor";
import {
  SectionHerraEquipos,
  QuestionHerraEquipos,
  FormBuilderDataHerraEquipos,
} from "../../../domain/models/BuilderTypes";

const DEFAULT_SI_NO_NA_OPTIONS = [
  { label: "SI", value: "si", color: "#4caf50" },
  { label: "NO", value: "no", color: "#f44336" },
  { label: "N/A", value: "na", color: "#ff9800" },
];

export interface SectionBuilderProps {
  sectionIndex: number;
  section: SectionHerraEquipos;
  control: Control<FormBuilderDataHerraEquipos>;
  setValue: UseFormSetValue<FormBuilderDataHerraEquipos>;
  getValues: UseFormGetValues<FormBuilderDataHerraEquipos>;
  onRemove: () => void;
  disabled?: boolean;
  isNested?: boolean;
  parentPath?: string;
}

export const SectionBuilder: React.FC<SectionBuilderProps> = ({
  sectionIndex,
  section,
  control,
  setValue,
  getValues,
  onRemove,
  disabled = false,
  parentPath,
}) => {
  const basePath = parentPath
    ? `${parentPath}.subsections.${sectionIndex}`
    : `sections.${sectionIndex}`;

  const questionsPath = `${basePath}.questions` as "sections";
  const { fields: questions, remove } = useFieldArray({
    control,
    name: questionsPath,
  });

  const setField = (path: string, value: unknown) =>
    setValue(path as keyof FormBuilderDataHerraEquipos, value as never);

  const addQuestion = () => {
    const newQuestion: QuestionHerraEquipos = {
      text: "",
      obligatorio: true,
      responseConfig: { type: "si_no_na", options: DEFAULT_SI_NO_NA_OPTIONS },
    };
    setField(`${basePath}.questions`, [
      ...(section.questions || []),
      newQuestion,
    ]);
  };

  const handleAddSubsection = (isParent: boolean) => {
    const newSub: SectionHerraEquipos = {
      title: isParent ? "Nueva Subsección Padre" : "Nueva Subsección",
      isParent,
      parentId: section._id || null,
      questions: [],
      images: [],
      subsections: isParent ? [] : undefined,
    };
    setField(`${basePath}.subsections`, [
      ...(section.subsections || []),
      newSub,
    ]);
  };

  const handleRemoveSubsection = (subIndex: number) => {
    const updated = [...(section.subsections || [])];
    updated.splice(subIndex, 1);
    setField(`${basePath}.subsections`, updated);
  };

  return (
    <Accordion defaultExpanded={!section.isParent} sx={{ mb: 2 }}>
      <Box display="flex" alignItems="flex-start">
        <AccordionSummary expandIcon={<ExpandMore />} sx={{ flexGrow: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight="medium">
              {section.isParent ? "📁" : "📄"} {section.title || "Sin título"}
            </Typography>
            {section.description && (
              <Typography variant="caption" color="text.secondary">
                {section.description}
              </Typography>
            )}
            <Box mt={0.5}>
              <Chip label={`${questions.length} preguntas`} size="small" />
              {section.subsections && section.subsections.length > 0 && (
                <Chip
                  label={`${section.subsections.length} subsecciones`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
              {section.images && section.images.length > 0 && (
                <Chip
                  label={`${section.images.length} imágenes`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </Box>
        </AccordionSummary>
        {!disabled && (
          <Box display="flex" alignItems="center" p={1}>
            <IconButton
              color="error"
              onClick={onRemove}
              size="small"
              title="Eliminar sección"
            >
              <Delete />
            </IconButton>
          </Box>
        )}
      </Box>

      <AccordionDetails>
        <Box>
          {/* Campos de título y descripción */}
          <Grid container spacing={2} mb={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={
                  section.isParent
                    ? "Título de la Sección Padre"
                    : "Título de la Sección"
                }
                value={section.title}
                onChange={(e) => setField(`${basePath}.title`, e.target.value)}
                size="small"
                disabled={disabled}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Descripción (opcional)"
                value={section.description || ""}
                onChange={(e) =>
                  setField(`${basePath}.description`, e.target.value)
                }
                size="small"
                multiline
                rows={2}
                disabled={disabled}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <ImageManager
            sectionPath={basePath}
            images={section.images || []}
            setValue={setValue}
            disabled={disabled}
          />

          {/* Preguntas (solo en secciones no-padre) */}
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
                  Preguntas ({questions.length})
                </Typography>
                {!disabled && (
                  <MuiButton
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={addQuestion}
                  >
                    Agregar Pregunta
                  </MuiButton>
                )}
              </Box>
              {questions.length === 0 ? (
                <Box
                  p={3}
                  textAlign="center"
                  sx={{
                    border: "2px dashed #ddd",
                    borderRadius: 2,
                    backgroundColor: "#fafafa",
                  }}
                >
                  <Typography color="text.secondary">
                    No hay preguntas. Haz clic en &ldquo;Agregar Pregunta&ldquo;
                    para comenzar.
                  </Typography>
                </Box>
              ) : (
                questions.map((question, qIndex) => (
                  <QuestionBuilder
                    key={section.questions[qIndex]?._id || qIndex}
                    sectionPath={basePath}
                    questionIndex={qIndex}
                    question={section.questions[qIndex]}
                    setValue={setValue}
                    onRemove={() => remove(qIndex)}
                    disabled={disabled}
                  />
                ))
              )}
            </>
          )}

          {/* Subsecciones (solo en secciones padre) */}
          {section.isParent === true && (
            <Box mt={3}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  Subsecciones ({section.subsections?.length || 0})
                </Typography>
                {!disabled && (
                  <Box display="flex" gap={1}>
                    <MuiButton
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => handleAddSubsection(false)}
                      color="primary"
                    >
                      Subsección Simple
                    </MuiButton>
                    <MuiButton
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => handleAddSubsection(true)}
                      color="secondary"
                    >
                      Subsección Padre
                    </MuiButton>
                  </Box>
                )}
              </Box>

              {!section.subsections || section.subsections.length === 0 ? (
                <Box
                  p={3}
                  textAlign="center"
                  sx={{
                    border: "2px dashed #ddd",
                    borderRadius: 2,
                    backgroundColor: "#fafafa",
                  }}
                >
                  <Typography color="text.secondary">
                    No hay subsecciones. Haz clic en los botones de arriba para
                    comenzar.
                  </Typography>
                </Box>
              ) : (
                section.subsections.map((subsection, subIndex) => (
                  <Box
                    key={subsection._id || `subsection-${subIndex}`}
                    ml={2}
                    mb={2}
                  >
                    <SectionBuilder
                      sectionIndex={subIndex}
                      section={subsection}
                      control={control}
                      setValue={setValue}
                      getValues={getValues}
                      onRemove={() => handleRemoveSubsection(subIndex)}
                      disabled={disabled}
                      isNested={true}
                      parentPath={basePath}
                    />
                  </Box>
                ))
              )}
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
