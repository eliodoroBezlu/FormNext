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
import { ArrowBack, Save, Add, Delete, ExpandMore } from "@mui/icons-material";
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
} from "@/types/formTypes";
import { createInstance } from "@/lib/actions/instance-actions";
import { startTransition, useState } from "react";
import { valoracionCriterio, valoracionOptions } from "@/lib/constants";
import { SignatureField } from "@/components/molecules/team-member-signature/SigantureField";



interface InspectionFormData {
  verificationList: VerificationList;
  inspectionTeam: InspectionTeamMember[];
  sections: SectionResponse[];
  aspectosPositivos: string;
  aspectosAdicionales: string;
}

type ValoracionValue = "0" | "1" | "2" | "3" | "N/A" | "";

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

  // Crear valores iniciales para la nueva estructura de secciones
  const createInitialSections = (): SectionResponse[] => {
  return template.sections.map((section) => {
    if (!section._id) {
      throw new Error(`La sección "${section.title}" no tiene _id. No se puede inicializar.`);
    }

    return {
      sectionId: section._id, // ✅ Ahora TypeScript sabe que no es undefined
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
};

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { },
  } = useForm<InspectionFormData>({
    defaultValues: {
    verificationList: template.verificationFields
      .filter((field): field is VerificationField & { _id: string } => !!field._id)
      .reduce((acc, field) => {
        acc[field._id] = ""; // ✅ Ahora field._id es string
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


  // Función para calcular los valores de una sección específica
  const calculateSectionMetrics = (
    sectionIndex: number,
    questions: QuestionResponse[]
  ) => {
    const section = template.sections[sectionIndex];
    let obtainedPoints = 0;
    let naCount = 0;
    
    questions.forEach((question) => {
      if (question.response === "N/A") {
        naCount++;
      } else if (question.response !== "" && question.response !== undefined) {
        const points = Number(question.response);
        if (!isNaN(points)) {
          obtainedPoints += points;
        }
      }
    });

    // Calcular puntos aplicables considerando las preguntas N/A
    const totalQuestions = section.questions.length;
    const applicableQuestions = totalQuestions - naCount;
    const pointsPerQuestion = totalQuestions > 0 ? section.maxPoints / totalQuestions : 0;
    const applicablePoints = applicableQuestions * pointsPerQuestion;
    
    // Calcular porcentaje de cumplimiento
    const compliancePercentage = applicablePoints > 0 
      ? (obtainedPoints / applicablePoints) * 100 
      : 0;

    return {
      obtainedPoints,
      applicablePoints: Number(applicablePoints.toFixed(2)),
      naCount,
      compliancePercentage: Number(compliancePercentage.toFixed(2)),
    };
  };

  // Función para actualizar métricas de una sección cuando cambia una respuesta
  const updateSectionMetrics = (sectionIndex: number, questionIndex: number, newResponse: string) => {
    const currentSections = watchedSections;
    const updatedSections = [...currentSections];
    
    // Validar que newResponse sea uno de los valores permitidos
    const validResponses = ["0", "1", "2", "3", "N/A", ""];
    const sanitizedResponse = validResponses.includes(newResponse) ? newResponse : "";
    
    // Actualizar la respuesta y puntos de la pregunta específica
    updatedSections[sectionIndex].questions[questionIndex] = {
      ...updatedSections[sectionIndex].questions[questionIndex],
      response: sanitizedResponse,
      points: sanitizedResponse === "N/A" || sanitizedResponse === "" ? 0 : Number(sanitizedResponse) || 0,
    };

    // Recalcular métricas de la sección
    const metrics = calculateSectionMetrics(sectionIndex, updatedSections[sectionIndex].questions);
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      ...metrics,
    };

    setValue("sections", updatedSections);
  };

  // Función para actualizar comentario de una pregunta
  const updateQuestionComment = (sectionIndex: number, questionIndex: number, comment: string) => {
    const currentSections = watchedSections;
    const updatedSections = [...currentSections];
    
    updatedSections[sectionIndex].questions[questionIndex] = {
      ...updatedSections[sectionIndex].questions[questionIndex],
      comment,
    };

    setValue("sections", updatedSections);
  };

  // Función para actualizar comentario de sección
  const updateSectionComment = (sectionIndex: number, comment: string) => {
    const currentSections = watchedSections;
    const updatedSections = [...currentSections];
    
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      sectionComment: comment,
    };

    setValue("sections", updatedSections);
  };

  // Calcular métricas generales
  const calculateOverallMetrics = () => {
    const totalObtainedPoints = watchedSections.reduce((sum, section) => sum + section.obtainedPoints, 0);
    const totalApplicablePoints = watchedSections.reduce((sum, section) => sum + section.applicablePoints, 0);
    const totalMaxPoints = watchedSections.reduce((sum, section) => sum + section.maxPoints, 0);
    const totalNaCount = watchedSections.reduce((sum, section) => sum + section.naCount, 0);
    const overallCompliancePercentage = totalApplicablePoints > 0 
      ? (totalObtainedPoints / totalApplicablePoints) * 100 
      : 0;

    return {
      totalObtainedPoints,
      totalApplicablePoints,
      totalMaxPoints,
      totalNaCount,
      overallCompliancePercentage: Number(overallCompliancePercentage.toFixed(2)),
    };
  };

  const onSubmit = (data: InspectionFormData) => {
  startTransition(async () => {
    setError(null);
    setSuccess(null);

    try {
      const overallMetrics = calculateOverallMetrics();

      // Datos para enviar al API
      const instanceData = {
        templateId: template._id.toString(),
        verificationList: data.verificationList,
        inspectionTeam: data.inspectionTeam,
        valoracionCriterio,
        sections: data.sections,
        aspectosPositivos: data.aspectosPositivos,
        aspectosAdicionales: data.aspectosAdicionales,
        ...overallMetrics,
      };

      console.log('Datos antes de enviar:', instanceData);
      const result = await createInstance(instanceData);

      if (result.success) {
        setSuccess(result.message || "Formulario guardado exitosamente");
        
        // Crear la instancia completa con los datos del resultado del API
        // o usar los datos que enviamos más los campos adicionales
        const formInstance: FormInstance = {
          _id: result.data?._id || '', // ID viene del resultado del API
          templateId: template._id,
          verificationList: data.verificationList,
          inspectionTeam: data.inspectionTeam,
          valoracionCriterio,
          sections: data.sections,
          aspectosPositivos: data.aspectosPositivos,
          aspectosAdicionales: data.aspectosAdicionales,
          ...overallMetrics,
          status: 'borrador' as const,
          createdBy: 'current-user',
          createdAt: result.data?.createdAt || new Date(),
          updatedAt: result.data?.updatedAt || new Date(),
        };

        setTimeout(() => {
          onSave(formInstance); // Aquí estaba el error: usabas instanceData en lugar de formInstance
        }, 1500);
      } else {
        setError(result.error || "Error al guardar el formulario");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado al guardar el formulario");
    }
  });
};

  const addTeamMember = () => {
    appendTeamMember({ nombre: "", cargo: "", firma: "" });
  };

 
  const overallMetrics = calculateOverallMetrics();


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
          padding: { xs: "6px 12px", sm: "8px 16px" }
        }}
      >
        Volver
      </Button>
      
      <Box flex={1}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" }
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
      
      <Box 
        mt={{ xs: 2, sm: 0 }}
        textAlign={{ xs: "left", sm: "right" }}
      >
        <Typography 
          variant="h5"
          color="primary"
          sx={{
            fontSize: { xs: "1.2rem", sm: "1.5rem" }
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
            '& .MuiAccordionSummary-expandIconWrapper': {
              color: 'white'
            }
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
                  name={`verificationList.${field._id}`}
                  control={control}
                  type={field.type}
                  label={field.label}
                  options={
                    field.options?.map((opt) => ({
                      value: opt,
                      label: opt,
                    })) || []
                  }
                  rules={{ required: field.required ? `${field.label} es requerido` : false }}
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
            '& .MuiAccordionSummary-expandIconWrapper': {
              color: 'white'
            }
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
          {/* Botón Agregar Miembro - Ahora fuera del AccordionSummary */}
          

          {/* Header para desktop */}
          <Box 
            display={{ xs: "none", md: "block" }}
            mb={2}
          >
            <Grid container spacing={2}>
              <Grid size={1}>
                <Typography variant="subtitle2" fontWeight="bold">#</Typography>
              </Grid>
              <Grid size={3}>
                <Typography variant="subtitle2" fontWeight="bold">Nombre</Typography>
              </Grid>
              <Grid size={3}>
                <Typography variant="subtitle2" fontWeight="bold">Cargo</Typography>
              </Grid>
              <Grid size={4}>
                <Typography variant="subtitle2" fontWeight="bold">Firma</Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="subtitle2" fontWeight="bold">Acciones</Typography>
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
                bgcolor: { xs: "grey.50", md: "transparent" }
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
                <Grid size={{ xs: 6, md: 1 }} display={{ xs: "flex-end", md: "none" }}>
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
                    <FormField
                      name={`inspectionTeam.${index}.nombre`}
                      control={control}
                      label=""
                      inputProps={{ placeholder: "Nombre completo" }}
                      rules={{ required: "Nombre es requerido" }}
                    />
                  </Box>
                </Grid>

                {/* Cargo */}
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
                      inputProps={{ placeholder: "Cargo" }}
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
                width: { xs: "100%", sm: "auto" }
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
            '& .MuiAccordionSummary-expandIconWrapper': {
              color: 'white'
            }
          }}
        >
          <Typography 
            variant="h6"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            VALORACIÓN Y CRITERIO
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: { xs: 1, sm: 2 } }}>
          <Box>
            {valoracionCriterio.map((item) => (
              <Box
                key={item.valoracion}
                display="flex"
                alignItems="center"
                py={1}
                px={{ xs: 1, sm: 2 }}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-child": {
                    borderBottom: "none"
                  }
                }}
              >
                <Box
                  sx={{
                    minWidth: { xs: 60, sm: 80 },
                    textAlign: "center",
                    fontWeight: "bold",
                    bgcolor: "primary.light",
                    color: "primary.contrastText",
                    borderRadius: 1,
                    p: { xs: 0.5, sm: 1 },
                    mr: { xs: 1, sm: 2 }
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {item.valoracion}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                >
                  {item.criterio}
                </Typography>
              </Box>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Secciones del Formulario - Accordions individuales */}
      {template.sections.map((section, sectionIndex) => {
        const sectionData = watchedSections[sectionIndex];
        const isCompleted = sectionData?.questions?.every(q => q.response && q.response !== "");
        
        return (
          <Accordion 
            key={section._id} 
            elevation={2} 
            sx={{ mb: 2 }}
            defaultExpanded
          >
            <AccordionSummary 
              expandIcon={<ExpandMore />}
              sx={{ 
                bgcolor: isCompleted ? "success.main" : "primary.main", 
                color: "white",
                '& .MuiAccordionSummary-expandIconWrapper': {
                  color: 'white'
                }
              }}
            >
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={{ xs: 1, sm: 0 }}
                width="100%"
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography 
                    variant="h6"
                    sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                  >
                    {section.title}
                  </Typography>
                  {isCompleted && (
                    <Chip 
                      label="Completado" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'success.dark', 
                        color: 'white',
                        fontSize: { xs: '0.7rem', sm: '0.8rem' }
                      }} 
                    />
                  )}
                </Box>
                <Typography 
                  variant="h6"
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  % Cumplimiento: {sectionData?.compliancePercentage || 0}%
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Box sx={{ bgcolor: isCompleted ? "success.light" : "primary.light", color: "white", p: { xs: 1, sm: 1.5 } }}>
                <Box 
                  display="flex" 
                  flexDirection={{ xs: "row", sm: "row" }}
                  justifyContent="space-between" 
                  gap={{ xs: 0.5, sm: 0 }}
                >
                  <Typography variant="body2">
                    Máximo: {section.maxPoints}
                  </Typography>
                  <Typography variant="body2">
                    Aplicable: {sectionData?.applicablePoints?.toFixed(2) || 0}
                  </Typography>
                  <Typography variant="body2">
                    Obtenido: {sectionData?.obtainedPoints?.toFixed(2) || 0}
                  </Typography>
                  <Typography variant="body2">
                    N/A: {sectionData?.naCount || 0}
                  </Typography>
                </Box>
              </Box>
              
              <Box p={{ xs: 2, sm: 3 }}>
                {section.questions.map((question, questionIndex) => (
                  <Paper
                    key={questionIndex}
                    variant="outlined"
                    sx={{ 
                      mb: 2, 
                      p: { xs: 1.5, sm: 2 },
                      bgcolor: "grey.50"
                    }}
                  >
                    {/* Para móvil - Layout vertical */}
                    <Box display={{ xs: "block", md: "none" }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="primary"
                          sx={{ 
                            minWidth: 40,
                            fontSize: "0.8rem"
                          }}
                        >
                          {section._id?.charAt(0).toUpperCase()}.{questionIndex + 1}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: { xs: "0.8rem", sm: "0.875rem" },
                            ml: 1
                          }}
                        >
                          {question.text}
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid size={6}>
                          <Typography variant="caption" color="text.secondary">
                            Valoración:
                          </Typography>
                          <Select
                            value={sectionData?.questions[questionIndex]?.response || ""}
                            onChange={(value) => {
                              const selectedValue = typeof value === 'string' ? value : (value as { target: { value: ValoracionValue } })?.target?.value || "";
                              updateSectionMetrics(sectionIndex, questionIndex, selectedValue);
                            }}
                            label=""
                            options={valoracionOptions}
                            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                          />
                        </Grid>
                        <Grid size={6}>
                          <Typography variant="caption" color="text.secondary">
                            Comentario:
                          </Typography>
                          <Input
                            value={sectionData?.questions[questionIndex]?.comment || ""}
                            onChange={(e) => updateQuestionComment(sectionIndex, questionIndex, e.target.value)}
                            label=""
                            inputProps={{ placeholder: "Comentario" }}
                            sx={{ 
                              fontSize: { xs: "0.8rem", sm: "0.875rem" },
                              '& .MuiInputBase-input': {
                                padding: { xs: "6px", sm: "8px 12px" }
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Para desktop - Layout horizontal */}
                    <Box display={{ xs: "none", md: "block" }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={1}>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            textAlign="center"
                            color="primary"
                          >
                            {section._id?.charAt(0).toUpperCase()}.{questionIndex + 1}
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography variant="body2">{question.text}</Typography>
                        </Grid>
                        <Grid size={2}>
                          <Select
                            value={sectionData?.questions[questionIndex]?.response || ""}
                            onChange={(value) => {
                              const selectedValue = typeof value === 'string' ? value : (value as { target: { value: ValoracionValue } })?.target?.value || "";
                              updateSectionMetrics(sectionIndex, questionIndex, selectedValue);
                            }}
                            label=""
                            options={valoracionOptions}
                          />
                        </Grid>
                        <Grid size={2}>
                          <Input
                            value={sectionData?.questions[questionIndex]?.comment || ""}
                            onChange={(e) => updateQuestionComment(sectionIndex, questionIndex, e.target.value)}
                            label=""
                            inputProps={{ placeholder: "Comentario" }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>
                ))}

                <Box mt={3}>
                  <TextField
                    value={sectionData?.sectionComment || ""}
                    onChange={(e) => updateSectionComment(sectionIndex, e.target.value)}
                    label="Comentarios de la Sección"
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    placeholder="Comentarios adicionales para esta sección..."
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: { xs: "0.8rem", sm: "0.875rem" }
                      }
                    }}
                  />
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Conclusiones - Accordion */}
      <Accordion elevation={2} sx={{ mb: 2 }}>
        <AccordionSummary 
          expandIcon={<ExpandMore />}
          sx={{ 
            bgcolor: "secondary.main", 
            color: "white",
            '& .MuiAccordionSummary-expandIconWrapper': {
              color: 'white'
            }
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
                      '& .MuiInputBase-input': {
                        fontSize: { xs: "0.8rem", sm: "0.875rem" }
                      }
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
                    label="2. Aspectos adicionales encontrados:"
                    multiline
                    rows={4}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: { xs: "0.8rem", sm: "0.875rem" }
                      }
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Resumen General - Siempre visible */}
      <Paper elevation={3} sx={{ mb: 3, border: '2px solid', borderColor: 'primary.main' }}>
        <Box sx={{ bgcolor: "info.main", color: "white", p: { xs: 1, sm: 2 } }}>
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
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'grey.50' }}>
        <Box 
          display="flex" 
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="flex-end" 
          gap={2}
        >
          <Button 
            variant="outlined" 
            onClick={onCancel}
            sx={{
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.9rem", sm: "1rem" },
              padding: { xs: "10px", sm: "8px 16px" }
            }}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            startIcon={<Save />}
            sx={{
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "0.9rem", sm: "1rem" },
              padding: { xs: "10px", sm: "8px 16px" }
            }}
          >
            Guardar Formulario
          </Button>
        </Box>
      </Paper>
    </form>
  </Box>
);

}