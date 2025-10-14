"use client";

import type React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  TextField,
  Chip,
  AccordionDetails,
  Accordion,
  AccordionSummary,
} from "@mui/material";
import {
  ArrowBack,
  Save,
  Add,
  Delete,
  ExpandMore,
  FolderOpen,
  Description,
} from "@mui/icons-material";
import { Button } from "../../atoms/button/Button";
import { Input } from "../../atoms/input/Input";
import { Select } from "../../atoms/select/Select";
import { FormField } from "../../molecules/form-field/FormField";
import {
  FormInstance,
  FormTemplate,
  InspectionTeamMember,
  VerificationList,
  SectionResponse,
  QuestionResponse,
  VerificationField,
  SimpleSection,
  Section,
} from "@/types/formTypes";
import { createInstance } from "@/lib/actions/instance-actions";
import { startTransition, useState, useCallback, useMemo } from "react";
import { valoracionCriterio, valoracionOptions } from "@/lib/constants";
import { SignatureField } from "@/components/molecules/team-member-signature/SigantureField";
import { DataSourceType } from "@/lib/actions/dataSourceService";
import AutocompleteTrabajador from "@/components/molecules/autocomplete-trabajador/AutocompleteTrabajador";
import { PersonalInvolucrado } from "@/components/molecules/personal-involucrado/PersonalInvolucrado";

// Tipos más específicos
interface PersonalInvolucrado {
  nombre: string;
  ci: string;
}
interface InspectionFormData {
  verificationList: VerificationList;
  inspectionTeam: InspectionTeamMember[];
  sections: SectionResponse[];
  simpleSections?: SimpleSection[];
  aspectosPositivos: string;
  aspectosAdicionales: string;
  personalInvolucrado?: PersonalInvolucrado[];
}

type ValoracionValue = "0" | "1" | "2" | "3" | "N/A" | "";

interface SectionMetrics {
  obtainedPoints: number;
  applicablePoints: number;
  naCount: number;
  compliancePercentage: number;
}

interface OverallMetrics {
  totalObtainedPoints: number;
  totalApplicablePoints: number;
  totalMaxPoints: number;
  totalNaCount: number;
  overallCompliancePercentage: number;
}

export interface InspectionFormProps {
  template: FormTemplate;
  onSave: (instance: FormInstance) => void;
  onCancel: () => void;
}

export const InspectionFormIroIsop: React.FC<InspectionFormProps> = ({
  template,
  onSave,
  onCancel,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getValoracionMessage = useCallback(() => {
    const code = template.code?.toUpperCase() || "";

    if (code.includes("1.02.P06.F12")) {
      return {
        title: "VALORACIÓN & CRITERIO",
        showConformacion: true, // Flag para mostrar columnas adicionales
        items: [
          {
            valoracion: "0",
            criterio:
              "El ítem NO cumple o cumple menos del 50% de las veces (el ítem tiene más de dos desviaciones)",
            isopMSC: "Supervisor del área inspeccionada.",
            isopEECC: "Supervisor de contrato",
          },
          {
            valoracion: "1",
            criterio:
              "El ítem cumple entre el 51% al 70% de las veces (el ítem tiene dos desviaciones)",
            isopMSC: "Trabajadores del área por lo menos 1.",
            isopEECC: "Responsable de la EECC",
          },
          {
            valoracion: "2",
            criterio:
              "El ítem cumple entre el 71% al 90% de las veces (el ítem tiene máximo una desviación)",
            isopMSC: "Personal de áreas invitadas por lo menos 1",
            isopEECC: "Trabajadores de la EECC por lo menos 1.",
          },
          {
            valoracion: "3",
            criterio:
              "El ítem cumple a cabalidad más del 91% (el ítem no tiene desviaciones)",
            isopMSC: "Comité Mixto por lo menos 1",
            isopEECC: "Personal de MSC invitadas por lo menos 1",
          },
          {
            valoracion: "N/A",
            criterio: "El ítem no es aplicable",
            isopMSC: "",
            isopEECC: "Comité Mixto por lo menos 1 o coordinador",
          },
        ],
        nota: "El ítem en color rojo es obligatorio; si se coloca N/A, se debe justificar en los comentarios el motivo por el cual NO APLICA",
      };
    }

    // Mensaje por defecto para otros formularios
    return {
      title: "VALORACIÓN Y CRITERIO",
      showConformacion: false,
      items: valoracionCriterio,
      nota: null,
    };
  }, [template.code, valoracionCriterio]);

  const flattenSections = useCallback((sections: Section[]): Section[] => {
    const flattened: Section[] = [];

    const flatten = (section: Section) => {
      // Solo agregar secciones que NO sean padre
      if (!section.isParent) {
        flattened.push(section);
      }

      // Procesar subsecciones recursivamente
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach(flatten);
      }
    };

    sections.forEach(flatten);
    return flattened;
  }, []);

  const flatSections = useMemo(
    () => flattenSections(template.sections),
    [template.sections]
  );

  // Función para calcular métricas de una sección (memoizada)
  const calculateSectionMetrics = useCallback(
    (sectionIndex: number, questions: QuestionResponse[]): SectionMetrics => {
      const section = flatSections[sectionIndex];
      let obtainedPoints = 0;
      let naCount = 0;

      questions.forEach((question) => {
        if (question.response === "N/A") {
          naCount++;
        } else if (
          question.response !== "" &&
          question.response !== undefined
        ) {
          const points = Number(question.response);
          if (!isNaN(points)) {
            obtainedPoints += points;
          }
        }
      });

      const applicablePoints = section.maxPoints;
      const compliancePercentage =
        section.maxPoints > 0 ? (obtainedPoints / section.maxPoints) * 100 : 0;

      return {
        obtainedPoints,
        applicablePoints: Number(applicablePoints.toFixed(2)),
        naCount,
        compliancePercentage: Number(compliancePercentage.toFixed(2)),
      };
    },
    [flatSections]
  );

  // Crear valores iniciales para las secciones
  const createInitialSections = useCallback((): SectionResponse[] => {
    const flatSections = flattenSections(template.sections);

    return flatSections.map((section) => {
      if (!section._id) {
        throw new Error(
          `La sección "${section.title}" no tiene _id. No se puede inicializar.`
        );
      }

      return {
        sectionId: section._id,
        maxPoints: section.maxPoints,
        questions: section.questions.map((question) => ({
          questionText: question.text,
          response: "",
          points: 0,
          comment: "",
        })),
        obtainedPoints: 0,
        applicablePoints: section.maxPoints,
        naCount: 0,
        compliancePercentage: 0,
        sectionComment: "",
      };
    });
  }, [template.sections]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: {},
  } = useForm<InspectionFormData>({
    defaultValues: {
      verificationList: template.verificationFields
        .filter(
          (field): field is VerificationField & { _id: string } => !!field._id
        )
        .reduce((acc, field) => {
          acc[field.label] = "";
          return acc;
        }, {} as VerificationList),
      inspectionTeam: [
        { nombre: "", cargo: "", firma: "" },
        { nombre: "", cargo: "", firma: "" },
        { nombre: "", cargo: "", firma: "" },
      ],
      sections: createInitialSections(),
      aspectosPositivos: "",
      aspectosAdicionales: "",

      personalInvolucrado:
        template.code === "1.02.P06.F46"
          ? [
              { nombre: "", ci: "" },
              { nombre: "", ci: "" },
              { nombre: "", ci: "" },
              { nombre: "", ci: "" },
            ] // Comienza con 1 fila vacía para F46
          : [], // Vacío para otros templates
      // 👈 Inicializado con 8 filas vacías
    },
  });

  const {
    fields: teamMembers,
    append: appendTeamMember,
    remove: removeTeamMember,
  } = useFieldArray({
    control,
    name: "inspectionTeam",
  });

  const watchedSections = watch("sections");

  // Marcar sección como no aplicable (optimizada)
  const markSectionAsNotApplicable = useCallback(
    (sectionIndex: number) => {
      const currentSections = watchedSections;
      const updatedSections = [...currentSections];

      // Marcar todas las preguntas como "N/A"
      const updatedQuestions = updatedSections[sectionIndex].questions.map(
        (question) => ({
          ...question,
          response: "N/A" as ValoracionValue,
          points: 0,
        })
      );

      // Calcular métricas una sola vez
      const metrics = calculateSectionMetrics(sectionIndex, updatedQuestions);

      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        questions: updatedQuestions,
        ...metrics,
      };

      setValue("sections", updatedSections);
    },
    [watchedSections, setValue, calculateSectionMetrics]
  );

  // Actualizar métricas de sección solo cuando cambia la respuesta (no en comentarios)
  const updateSectionMetrics = useCallback(
    (sectionIndex: number, questionIndex: number, newResponse: string) => {
      const currentSections = watchedSections;
      const updatedSections = [...currentSections];

      // Validar respuesta
      const validResponses = ["0", "1", "2", "3", "N/A", ""];
      const sanitizedResponse = validResponses.includes(newResponse)
        ? newResponse
        : "";

      // Solo actualizar si realmente cambió la respuesta
      const currentResponse =
        updatedSections[sectionIndex].questions[questionIndex].response;
      if (currentResponse === sanitizedResponse) return;

      // Actualizar respuesta y puntos
      updatedSections[sectionIndex].questions[questionIndex] = {
        ...updatedSections[sectionIndex].questions[questionIndex],
        response: sanitizedResponse,
        points:
          sanitizedResponse === "N/A" || sanitizedResponse === ""
            ? 0
            : Number(sanitizedResponse) || 0,
      };

      // Recalcular métricas solo cuando cambia la respuesta
      const metrics = calculateSectionMetrics(
        sectionIndex,
        updatedSections[sectionIndex].questions
      );

      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        ...metrics,
      };

      setValue("sections", updatedSections);
    },
    [watchedSections, setValue, calculateSectionMetrics]
  );

  // Actualizar comentario de pregunta sin recalcular métricas
  const updateQuestionComment = useCallback(
    (sectionIndex: number, questionIndex: number, comment: string) => {
      // Usar setValue directo sin recalcular métricas
      setValue(
        `sections.${sectionIndex}.questions.${questionIndex}.comment`,
        comment,
        { shouldValidate: false, shouldDirty: true, shouldTouch: true }
      );
    },
    [setValue]
  );

  // Actualizar comentario de sección sin recalcular métricas
  const updateSectionComment = useCallback(
    (sectionIndex: number, comment: string) => {
      setValue(`sections.${sectionIndex}.sectionComment`, comment);
    },
    [setValue]
  );

  // Calcular métricas generales (memoizado)
  const overallMetrics = useMemo((): OverallMetrics => {
    const totalObtainedPoints = watchedSections.reduce(
      (sum, section) => sum + section.obtainedPoints,
      0
    );
    const totalMaxPoints = watchedSections.reduce(
      (sum, section) => sum + section.maxPoints,
      0
    );
    const totalNaCount = watchedSections.reduce(
      (sum, section) => sum + section.naCount,
      0
    );

    const overallCompliancePercentage =
      totalMaxPoints > 0 ? (totalObtainedPoints / totalMaxPoints) * 100 : 0;

    return {
      totalObtainedPoints,
      totalApplicablePoints: totalMaxPoints,
      totalMaxPoints,
      totalNaCount,
      overallCompliancePercentage: Number(
        overallCompliancePercentage.toFixed(2)
      ),
    };
  }, [watchedSections]);

  // Envío del formulario
  const onSubmit = useCallback(
    (data: InspectionFormData) => {
      startTransition(async () => {
        setError(null);
        setSuccess(null);

        try {
          const instanceData = {
            templateId: template._id.toString(),
            verificationList: data.verificationList,
            inspectionTeam: data.inspectionTeam,
            valoracionCriterio,
            sections: data.sections,
            aspectosPositivos: data.aspectosPositivos,
            aspectosAdicionales: data.aspectosAdicionales,
            personalInvolucrado: data.personalInvolucrado,
            ...overallMetrics,
          };

          console.log("Datos antes de enviar:", instanceData);
          const result = await createInstance(instanceData);

          if (result.success) {
            setSuccess(result.message || "Formulario guardado exitosamente");

            const formInstance: FormInstance = {
              _id: result.data?._id || "",
              templateId: template._id,
              verificationList: data.verificationList,
              inspectionTeam: data.inspectionTeam,
              valoracionCriterio,
              sections: data.sections,
              aspectosPositivos: data.aspectosPositivos,
              aspectosAdicionales: data.aspectosAdicionales,
              ...overallMetrics,
              status: "borrador" as const,
              createdBy: "current-user",
              createdAt: result.data?.createdAt || new Date(),
              updatedAt: result.data?.updatedAt || new Date(),
            };

            setTimeout(() => {
              onSave(formInstance);
            }, 1500);
          } else {
            setError(result.error || "Error al guardar el formulario");
          }
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Error inesperado al guardar el formulario"
          );
        }
      });
    },
    [template._id, valoracionCriterio, overallMetrics, onSave]
  );

  const addTeamMember = useCallback(() => {
    appendTeamMember({ nombre: "", cargo: "", firma: "" });
  }, [appendTeamMember]);

  // Reemplaza tu función renderSections actual con esta versión completa:

  const renderSections = (
    sections: Section[],
    level: number = 0
  ): React.ReactNode => {
    return sections.map((section, index) => {
      // Si es sección padre, renderizar como contenedor
      if (section.isParent) {
        return (
          <Accordion
            key={section._id || `parent-${level}-${index}`}
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
                "& .MuiAccordionSummary-expandIconWrapper": {
                  color: "white",
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <FolderOpen />
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  📁 {section.title}
                </Typography>
                {section.description && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: { xs: "0.7rem", sm: "0.8rem" },
                    }}
                  >
                    {section.description}
                  </Typography>
                )}
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: { xs: 1, sm: 2 } }}>
              {section.subsections && section.subsections.length > 0 ? (
                renderSections(section.subsections, level + 1)
              ) : (
                <Box p={2} textAlign="center" color="text.secondary">
                  <Typography variant="body2">
                    Esta sección padre no tiene subsecciones definidas
                  </Typography>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        );
      }

      // Si NO es sección padre, renderizar sección con preguntas
      const flatIndex = flatSections.findIndex((s) => s._id === section._id);
      if (flatIndex === -1) return null;

      const sectionData = watchedSections[flatIndex];
      const isCompleted = sectionData?.questions?.every(
        (q) => q.response && q.response !== ""
      );

      return (
        <Accordion
          key={section._id || `section-${flatIndex}`}
          elevation={2}
          sx={{
            mb: 2,
            ml: level * 2,
          }}
          defaultExpanded={level === 0}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              bgcolor: isCompleted ? "success.main" : "primary.main",
              color: "white",
              "& .MuiAccordionSummary-expandIconWrapper": {
                color: "white",
              },
            }}
          >
            <Grid container alignItems="center" spacing={2} width="100%">
              <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                  <Description />
                  <Typography
                    variant="h6"
                    sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                  >
                    {section.title}
                  </Typography>
                  {section.description && (
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      ({section.description})
                    </Typography>
                  )}
                  {isCompleted && (
                    <Chip
                      label="Completado"
                      size="small"
                      sx={{
                        bgcolor: "success.dark",
                        color: "white",
                        fontSize: { xs: "0.7rem", sm: "0.8rem" },
                      }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: "auto" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    textAlign: { xs: "left", sm: "right" },
                  }}
                >
                  % Cumplimiento: {sectionData?.compliancePercentage || 0}%
                </Typography>
              </Grid>
            </Grid>
          </AccordionSummary>

          <AccordionDetails sx={{ p: 0 }}>
            <Box
              sx={{
                bgcolor: isCompleted ? "success.light" : "primary.light",
                color: "white",
                p: { xs: 1, sm: 1.5 },
              }}
            >
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: 6, sm: 2 }}>
                  <Typography
                    variant="body2"
                    fontSize={{ xs: "0.75rem", sm: "0.875rem" }}
                  >
                    Máximo: {section.maxPoints}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <Typography
                    variant="body2"
                    fontSize={{ xs: "0.75rem", sm: "0.875rem" }}
                  >
                    Aplicable: {sectionData?.applicablePoints?.toFixed(2) || 0}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <Typography
                    variant="body2"
                    fontSize={{ xs: "0.75rem", sm: "0.875rem" }}
                  >
                    Obtenido: {sectionData?.obtainedPoints?.toFixed(2) || 0}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <Typography
                    variant="body2"
                    fontSize={{ xs: "0.75rem", sm: "0.875rem" }}
                  >
                    N/A: {sectionData?.naCount || 0}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    display="flex"
                    justifyContent={{ xs: "center", sm: "flex-end" }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => markSectionAsNotApplicable(flatIndex)}
                      sx={{
                        bgcolor: "white",
                        color: "error.main",
                        borderColor: "white",
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        padding: { xs: "4px 8px", sm: "4px 12px" },
                        minHeight: { xs: "28px", sm: "32px" },
                        "&:hover": {
                          bgcolor: "error.light",
                          color: "white",
                          borderColor: "error.main",
                        },
                      }}
                    >
                      No Aplica
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box p={{ xs: 2, sm: 3 }}>
              {section.questions.map((question, questionIndex) => (
                <Paper
                  key={questionIndex}
                  variant="outlined"
                  sx={{
                    mb: 2,
                    p: { xs: 1.5, sm: 2 },
                    bgcolor: "grey.50",
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    {/* Número de pregunta */}
                    <Grid size={{ xs: 2, md: 1 }}>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        textAlign="center"
                        color="primary"
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        {section._id?.charAt(0).toUpperCase()}.
                        {questionIndex + 1}
                      </Typography>
                    </Grid>

                    {/* Texto de la pregunta */}
                    <Grid size={{ xs: 10, md: 5 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                      >
                        {question.text}
                      </Typography>
                    </Grid>

                    {/* Select de valoración */}
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
                        <Select
                          value={
                            sectionData?.questions[questionIndex]?.response ||
                            ""
                          }
                          onChange={(value) => {
                            const selectedValue =
                              typeof value === "string"
                                ? value
                                : (
                                    value as {
                                      target: { value: ValoracionValue };
                                    }
                                  )?.target?.value || "";
                            updateSectionMetrics(
                              flatIndex,
                              questionIndex,
                              selectedValue
                            );
                          }}
                          label=""
                          options={valoracionOptions}
                          sx={{
                            fontSize: { xs: "0.8rem", sm: "0.875rem" },
                            ...(question.obligatorio && {
                              backgroundColor: "#E63715",
                              "& .MuiSelect-select": {
                                backgroundColor: "#E63715 !important",
                              },
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "#E63715 !important",
                                "& fieldset": {
                                  borderColor: "#E63715",
                                },
                                "&:hover fieldset": {
                                  borderColor: "#E63715",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#E63715",
                                },
                              },
                            }),
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Campo de comentario */}
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
                        <Input
                          value={
                            sectionData?.questions[questionIndex]?.comment || ""
                          }
                          onChange={(e) =>
                            updateQuestionComment(
                              flatIndex,
                              questionIndex,
                              e.target.value
                            )
                          }
                          label=""
                          inputProps={{ placeholder: "Comentario" }}
                          sx={{
                            fontSize: { xs: "0.8rem", sm: "0.875rem" },
                            "& .MuiInputBase-input": {
                              padding: { xs: "8px 12px", sm: "8px 12px" },
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              <Box mt={3}>
                <TextField
                  value={sectionData?.sectionComment || ""}
                  onChange={(e) =>
                    updateSectionComment(flatIndex, e.target.value)
                  }
                  label="Comentarios de la Sección"
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  placeholder="Comentarios adicionales para esta sección..."
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    },
                  }}
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      );
    });
  };

  return (
    <Box p={{ xs: 1, sm: 2, md: 3 }}>
      {/* Header - Responsive */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "center", sm: "center" }}
        gap={2}
        mb={3}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onCancel}
          sx={{
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
            padding: { xs: "6px 12px", sm: "8px 16px" },
          }}
        >
          Volver
        </Button>

        <Box flex={1}>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
            }}
          >
            {template.name}
          </Typography>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={{ xs: 1, sm: 2 }}
            mt={1}
          >
            <Typography variant="body2" color="text.secondary">
              {template.code}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {template.revision}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textTransform: "capitalize" }}
            >
              Inspección {template.type}
            </Typography>
          </Box>
        </Box>

        <Box mt={{ xs: 2, sm: 0 }} textAlign={{ xs: "left", sm: "right" }}>
          <Typography
            variant="h5"
            color="primary"
            sx={{
              fontSize: { xs: "1.2rem", sm: "1.5rem" },
            }}
          >
            % Cumplimiento Global: {overallMetrics.overallCompliancePercentage}%
          </Typography>
        </Box>
      </Box>

      {/* Mostrar mensajes de éxito/error */}
      {success && (
        <Box
          mb={2}
          p={{ xs: 1, sm: 2 }}
          bgcolor="success.light"
          color="success.contrastText"
          borderRadius={1}
        >
          {success}
        </Box>
      )}
      {error && (
        <Box
          mb={2}
          p={{ xs: 1, sm: 2 }}
          bgcolor="error.light"
          color="error.contrastText"
          borderRadius={1}
        >
          {error}
        </Box>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Lista de Verificación - Accordion */}
        <Accordion elevation={2} sx={{ mb: 2 }} defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              "& .MuiAccordionSummary-expandIconWrapper": {
                color: "white",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              LISTA DE VERIFICACIÓN
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {template.verificationFields.map((field) => (
                <Grid size={{ xs: 12, sm: 6 }} key={field._id}>
                  <FormField
                    name={`verificationList.${field.label}`}
                    control={control}
                    type={field.type}
                    label={field.label}
                    dataSource={field.dataSource as DataSourceType}
                    options={
                      field.options?.map((opt) => ({
                        value: opt,
                        label: opt,
                      })) || []
                    }
                    rules={{
                      required: field.required
                        ? `${field.label} es requerido`
                        : false,
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Equipo de Inspección - Accordion */}
        <Accordion elevation={2} sx={{ mb: 2 }} defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              "& .MuiAccordionSummary-expandIconWrapper": {
                color: "white",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              EQUIPO DE INSPECCIÓN
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Header para desktop */}
            <Box display={{ xs: "none", md: "block" }} mb={2}>
              <Grid container spacing={2}>
                <Grid size={1}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    #
                  </Typography>
                </Grid>
                <Grid size={3}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Nombre
                  </Typography>
                </Grid>
                <Grid size={3}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Cargo
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Firma
                  </Typography>
                </Grid>
                <Grid size={1}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Acciones
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Team Members */}
            {teamMembers.map((member, index) => (
              <Paper
                key={member.id}
                variant="outlined"
                sx={{
                  mb: 2,
                  p: { xs: 2, sm: 2 },
                  bgcolor: { xs: "grey.50", md: "transparent" },
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  {/* Número */}
                  <Grid size={{ xs: 6, md: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="primary"
                    >
                      #{index + 1}
                    </Typography>
                  </Grid>

                  {/* Acciones - En móvil aparece al lado del cargo */}
                  <Grid
                    size={{ xs: 6, md: 1 }}
                    display={{ xs: "flex-end", md: "none" }}
                  >
                    <Box display="flex" justifyContent="flex-end">
                      {teamMembers.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => removeTeamMember(index)}
                          sx={{ padding: { xs: "4px", sm: "8px" } }}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </Grid>

                  {/* Nombre */}
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Box>
                      <Typography
                        variant="caption"
                        display={{ xs: "block", md: "none" }}
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        Nombre:
                      </Typography>
                      <Controller
                        name={`inspectionTeam.${index}.nombre`}
                        control={control}
                        rules={{ required: "Nombre es requerido" }}
                        render={({ field, fieldState: { error } }) => (
                          <AutocompleteTrabajador
                            label="Nombre"
                            placeholder="Seleccione trabajador"
                            value={field.value || null}
                            onChange={(nomina, trabajador) => {
                              // Actualizar el nombre (nomina)
                              field.onChange(nomina);

                              // Si se seleccionó un trabajador de la lista
                              // autocompletar el cargo con el puesto
                              if (trabajador?.puesto) {
                                setValue(
                                  `inspectionTeam.${index}.cargo`,
                                  trabajador.puesto
                                );
                              }
                            }}
                            onBlur={field.onBlur}
                            error={!!error}
                            helperText={error?.message}
                            required
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  {/* Cargo - Sin cambios */}
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Box>
                      <Typography
                        variant="caption"
                        display={{ xs: "block", md: "none" }}
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        Cargo:
                      </Typography>
                      <FormField
                        name={`inspectionTeam.${index}.cargo`}
                        control={control}
                        label=""
                        inputProps={{ placeholder: "Cargo (autocompletado)" }}
                        rules={{ required: "Cargo es requerido" }}
                      />
                    </Box>
                  </Grid>

                  {/* Firma */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box>
                      <Typography
                        variant="caption"
                        display={{ xs: "block", md: "none" }}
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        Firma:
                      </Typography>
                      <SignatureField
                        fieldName={`inspectionTeam.${index}.firma`}
                        control={control}
                        setValue={setValue}
                        heightPercentage={25}
                        format="png"
                      />
                    </Box>
                  </Grid>

                  {/* Acciones - Solo en desktop */}
                  <Grid size={1} display={{ xs: "none", md: "flex" }}>
                    <Box display="flex" justifyContent="center">
                      {teamMembers.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => removeTeamMember(index)}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addTeamMember}
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  padding: { xs: "6px 12px", sm: "8px 16px" },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Agregar Miembro
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Valoración y Criterio - Accordion */}
        <Accordion elevation={2} sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              bgcolor: "info.main",
              color: "white",
              "& .MuiAccordionSummary-expandIconWrapper": {
                color: "white",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              {getValoracionMessage().title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 1, sm: 2 } }}>
            <Box>
              {/* Header con columnas adicionales si es F46 */}
              {getValoracionMessage().showConformacion && (
                <Grid
                  container
                  spacing={2}
                  sx={{
                    bgcolor: "success.light",
                    p: 1.5,
                    mb: 2,
                    borderRadius: 1,
                    display: { xs: "none", md: "flex" },
                  }}
                >
                  {/* Columna Valoración */}
                  <Grid size={1.5}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="success.dark"
                    >
                      Valoración
                    </Typography>
                  </Grid>

                  {/* Columna Criterio */}
                  <Grid size={5}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="success.dark"
                    >
                      Criterio
                    </Typography>
                  </Grid>

                  {/* Columna Conformación */}
                  <Grid size={5.5}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="success.dark"
                      sx={{
                        bgcolor: "warning.light",
                        p: 1,
                        borderRadius: 1,
                        textAlign: "center",
                        mb: 1,
                      }}
                    >
                      CONFORMACIÓN DEL EQUIPO DE INSPECCIÓN
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid size={6}>
                        <Box
                          sx={{
                            textAlign: "center",
                            bgcolor: "white",
                            p: 0.5,
                            borderRadius: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="primary.dark"
                          >
                            ISOP para MSC
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box
                          sx={{
                            textAlign: "center",
                            bgcolor: "white",
                            p: 0.5,
                            borderRadius: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color="primary.dark"
                          >
                            ISOP para EECC
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {/* Items de valoración */}
              {getValoracionMessage().items.map((item, idx) => (
                <Grid
                  container
                  spacing={2}
                  key={`${item.valoracion}-${idx}`}
                  sx={{
                    py: 1.5,
                    px: { xs: 1, sm: 2 },
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": {
                      borderBottom: "none",
                    },
                  }}
                >
                  {/* Valoración */}
                  <Grid size={{ xs: 12, md: 1.5 }}>
                    <Box
                      sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                        bgcolor: "primary.light",
                        color: "primary.contrastText",
                        borderRadius: 1,
                        p: { xs: 0.5, sm: 1 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        minHeight: { xs: "40px", md: "auto" },
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {item.valoracion}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Criterio */}
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                      >
                        {item.criterio}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Columnas de conformación (solo para F46) */}
                  {getValoracionMessage().showConformacion && (
                    <Grid size={{ xs: 12, md: 5.5 }}>
                      <Grid container spacing={1} sx={{ height: "100%" }}>
                        {/* ISOP para MSC */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box
                            sx={{
                              bgcolor: "grey.100",
                              p: 1,
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "grey.300",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <Typography
                              variant="caption"
                              fontWeight="bold"
                              display={{ xs: "block", md: "none" }}
                              color="primary.dark"
                              sx={{ mb: 0.5 }}
                            >
                              ISOP para MSC:
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                            >
                              {"isopMSC" in item ? item.isopMSC : "-"}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* ISOP para EECC */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box
                            sx={{
                              bgcolor: "grey.100",
                              p: 1,
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "grey.300",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <Typography
                              variant="caption"
                              fontWeight="bold"
                              display={{ xs: "block", md: "none" }}
                              color="primary.dark"
                              sx={{ mb: 0.5 }}
                            >
                              ISOP para EECC:
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                            >
                              {"isopEECC" in item ? item.isopEECC : "-"}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  )}

                  {/* Para formularios sin conformación */}
                  {!getValoracionMessage().showConformacion && (
                    <Grid size={{ xs: 12, md: 5.5 }} />
                  )}
                </Grid>
              ))}

              {/* Nota especial para F46 */}
              {getValoracionMessage().nota && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "error.light",
                    borderRadius: 1,
                    border: "2px solid",
                    borderColor: "error.main",
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="error.dark"
                    sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                  >
                   Nota: {getValoracionMessage().nota}
                  </Typography>
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Secciones del Formulario - Accordions individuales */}
        {renderSections(template.sections, 0)}

        {/* Secciones Simples (Informativas) */}
        {template.simpleSections && template.simpleSections.length > 0 && (
          <Box mb={2}>
            {template.simpleSections.map((section, index) => (
              <Accordion
                key={section._id || `simple-section-${index}`}
                elevation={2}
                sx={{
                  mb: 2,
                  border: "2px solid",
                  borderColor: "secondary.light",
                  backgroundColor: "secondary.50",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    backgroundColor: "secondary.light",
                    "&:hover": { backgroundColor: "secondary.main" },
                  }}
                >
                  <Typography variant="h6" color="secondary.dark">
                    {section.title}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  {section.questions?.map((question, questionIndex) => (
                    <Paper
                      key={questionIndex}
                      variant="outlined"
                      sx={{
                        mb: 2,
                        p: 2,
                        backgroundColor: "background.paper",
                        borderColor: "secondary.light",
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: question.image ? 7 : 12 }}>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>#{questionIndex + 1}:</strong>{" "}
                            {question.text}
                          </Typography>
                        </Grid>

                        {question.image && (
                          <Grid size={{ xs: 12, md: 5 }}>
                            <Box
                              sx={{
                                border: 2,
                                borderColor: "secondary.light",
                                borderRadius: 1,
                                overflow: "hidden",
                                backgroundColor: "secondary.50",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minHeight: 150,
                              }}
                            >
                              <img
                                src={question.image}
                                alt={`Imagen informativa ${questionIndex + 1}`}
                                style={{
                                  width: "100%",
                                  height: "auto",
                                  maxHeight: "200px",
                                  objectFit: "contain",
                                }}
                                onError={(e) => {
                                  console.error("Error loading image:", e);
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 1, display: "block" }}
                            >
                              📎 Imagen de referencia
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  ))}

                  <Box
                    mt={2}
                    p={2}
                    sx={{ backgroundColor: "info.50", borderRadius: 1 }}
                  >
                    <Typography variant="caption" color="info.main">
                      ℹ️ Esta sección es solo informativa y no afecta la
                      puntuación del formulario.
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* Conclusiones - Accordion */}
        <Accordion elevation={2} sx={{ mb: 2 }} defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              bgcolor: "secondary.main",
              color: "white",
              "& .MuiAccordionSummary-expandIconWrapper": {
                color: "white",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              CONCLUSIONES Y RECOMENDACIONES
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Controller
                  name="aspectosPositivos"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value || ""}
                      label="1. Aspectos positivos encontrados:"
                      multiline
                      rows={4}
                      fullWidth
                      variant="outlined"
                      sx={{
                        "& .MuiInputBase-input": {
                          fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <Controller
                  name="aspectosAdicionales"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value || ""}
                      label="2. Ítems Críticos encontrados::"
                      multiline
                      rows={4}
                      fullWidth
                      variant="outlined"
                      sx={{
                        "& .MuiInputBase-input": {
                          fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        },
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {template.code === "1.02.P06.F46" && (
          <Accordion elevation={2} sx={{ mb: 2 }} defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                bgcolor: "warning.main",
                color: "white",
                "& .MuiAccordionSummary-expandIconWrapper": {
                  color: "white",
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                PERSONAL INVOLUCRADO EN EL TRABAJO
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
              <PersonalInvolucrado<InspectionFormData>
                control={control}
                name="personalInvolucrado"
                onTrabajadorSelect={(index, trabajador) => {
                  if (trabajador) {
                    setValue(
                      `personalInvolucrado.${index}.nombre`,
                      trabajador.nomina
                    );
                    setValue(`personalInvolucrado.${index}.ci`, trabajador.ci);
                  } else {
                    setValue(`personalInvolucrado.${index}.nombre`, "");
                    setValue(`personalInvolucrado.${index}.ci`, "");
                  }
                }}
              />
            </AccordionDetails>
          </Accordion>
        )}

        {/* Resumen General - Siempre visible */}
        <Paper
          elevation={3}
          sx={{ mb: 3, border: "2px solid", borderColor: "primary.main" }}
        >
          <Box
            sx={{ bgcolor: "info.main", color: "white", p: { xs: 1, sm: 2 } }}
          >
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              RESUMEN GENERAL
            </Typography>
          </Box>
          <Box p={{ xs: 2, sm: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Puntaje Total Obtenido
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  {overallMetrics.totalObtainedPoints.toFixed(2)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Puntaje Total Aplicable
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  {overallMetrics.totalApplicablePoints.toFixed(2)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Total Preguntas N/A
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  {overallMetrics.totalNaCount}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  % Cumplimiento General
                </Typography>
                <Typography
                  variant="h5"
                  color="primary"
                  sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                >
                  {overallMetrics.overallCompliancePercentage}%
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Botones de acción - Siempre visibles */}
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, bgcolor: "grey.50" }}>
          <Grid container spacing={2} justifyContent="flex-end">
            <Grid size={{ xs: 12, sm: "auto" }}>
              <Button
                variant="outlined"
                onClick={onCancel}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  padding: { xs: "10px", sm: "8px 16px" },
                }}
              >
                Cancelar
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: "auto" }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  padding: { xs: "10px", sm: "8px 16px" },
                }}
              >
                Guardar Formulario
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </form>
    </Box>
  );
};
