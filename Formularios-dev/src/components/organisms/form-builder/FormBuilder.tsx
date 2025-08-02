"use client";

import type React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Collapse,
} from "@mui/material";
import {
  Add,
  Delete,
  ArrowBack,
  Save,
  Expand,
} from "@mui/icons-material";
import { Button } from "../../atoms/button/Button";
import { FormField } from "../../molecules/form-field/FormField";
import { FormBuilderData, FormTemplate } from "@/types/formTypes";
import { useCallback, useState, useTransition } from "react";
import { createTemplate, updateTemplate } from "@/lib/actions/template-actions";
import { SectionBuilder } from "@/components/molecules/section-builder/SectionBuilder";
// Importamos el componente independiente
export interface FormBuilderProps {
  template: FormTemplate | null;
  onSave: (template: FormTemplate) => void;
  onCancel: () => void;
  mode?: "create" | "edit" | "view";
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  template,
  onSave,
  onCancel,
  mode = "create",
}) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([0])
  );

  const isReadOnly = mode === "view";

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormBuilderData>({
    mode: "onChange",
    defaultValues: template || {
      name: "",
      code: "",
      revision: "Rev. 1",
      type: "interna",
      verificationFields: [
        {  label: "Gerencia", type: "text" },
        { label: "Supervisor", type: "text" },
        {  label: "Inspección N°", type: "text" },
        {  label: "Superintendencia", type: "text" },
        {  label: "Lugar", type: "text" },
        {  label: "Fecha Inspección", type: "date" },
        {  label: "Área", type: "text" },
      ],
      sections: []
    },
  });

  const {
    fields: verificationFields,
    append: appendVerificationField,
    remove: removeVerificationField,
  } = useFieldArray({
    control,
    name: "verificationFields",
  });

  const {
    fields: sections,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  // Watch para obtener datos actuales
  const watchedSections = watch("sections");

  const onSubmit = (data: FormBuilderData) => {
    if (data.sections.length === 0) {
      setError("Debe agregar al menos una sección");
      return;
    }

    // Validar que cada sección tenga al menos una pregunta
    const invalidSections = data.sections.filter(section => {
      return !section.questions ||
        section.questions.length === 0 ||
        !section.questions.some(q => q.text?.trim()); // ✅ Ahora sí reconoce preguntas válidas
    });

    if (invalidSections.length > 0) {
       setError("Todas las secciones deben tener al menos una pregunta válida");
      return;
     }

    const transformedData: FormBuilderData = {
      ...data,
      sections: data.sections.map((section, index) => {
        const maxPoints = Number(section.maxPoints);

        if (isNaN(maxPoints) || maxPoints < 0) {
        throw new Error(
          `Sección ${index + 1}: El puntaje máximo debe ser un número mayor o igual a 0`
        );
      }

        return {
          ...section,
          maxPoints: maxPoints,
          questions: (section.questions || [])
          .filter((q) => q.text?.trim())
          .map((q) => q), // Opcional: puedes limpiar el texto u otros campos
        };
      }),
    };
    console.log("Datos transformados:", transformedData);

    startTransition(async () => {
      setError(null);
      setSuccess(null);

      try {
        const result = template
          ? await updateTemplate(template._id, transformedData)
          : await createTemplate(transformedData);

        if (result.success) {
          setSuccess(result.message || "Operación completada exitosamente");
          onSave(result.data);
        } else {
          setError(result.error || "Error desconocido");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado");
      }
    });
  };

  const addVerificationField = useCallback(() => {
    appendVerificationField({
      //_id: Date.now().toString(),
      label: "",
      type: "text",
    });
  }, [appendVerificationField]);

  const addSection = () => {
    const newIndex = sections.length;
    appendSection({
      //_id: Date.now().toString(),
      title: "",
      maxPoints: 0,
      questions: [{  text: "" }],
    });

    // Expandir automáticamente la nueva sección
    setExpandedSections((prev) => new Set([...prev, newIndex]));
  };

  const toggleSectionExpansion = (index: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const expandAllSections = () => {
    setExpandedSections(new Set(sections.map((_, index) => index)));
  };

  const collapseAllSections = () => {
    setExpandedSections(new Set());
  };

  const getTotalQuestions = () => {
  return watchedSections.reduce((total, section) => {
    return total + (section.questions?.length || 0);
  }, 0);
};

  console.log("get total questions", getTotalQuestions());
  console.log("watchedSections", watchedSections);

  const getTotalMaxPoints = () => {
    return watchedSections.reduce((total, section) => {
      return total + (Number(section.maxPoints) || 0);
    }, 0);
  };

  return (
    <Box p={3}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={onCancel}
          >
            Volver
          </Button>
          <Typography variant="h4">
            {mode === "view" ? "Ver" : template ? "Editar" : "Crear"} Plantilla
            de Formulario
          </Typography>
        </Box>

        {/* Estadísticas del formulario */}
        <Box display="flex" gap={1}>
          <Chip
            label={`${sections.length} secciones`}
            color="primary"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${getTotalQuestions()} preguntas`}
            color="secondary"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${getTotalMaxPoints()} pts máx`}
            color="success"
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>

      {/* Mensajes de estado */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Información General */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Información General
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                name="name"
                control={control}
                label="Nombre del Formulario"
                rules={{ required: "Nombre es requerido" }}
                disabled={isReadOnly}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                name="code"
                control={control}
                label="Código"
                rules={{ required: "Código es requerido" }}
                disabled={isReadOnly}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                name="revision"
                control={control}
                label="Número de Revisión"
                rules={{ required: "Numero de revision es requerido" }}
                disabled={isReadOnly}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField
                name="type"
                control={control}
                type="select"
                label="Tipo de Inspección"
                options={[
                  { value: "interna", label: "Interna" },
                  { value: "externa", label: "Externa" },
                ]}
                rules={{ required: "Tipo de Inspección es requerido" }}
                disabled={isReadOnly}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Campos de Lista de Verificación */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">
              Campos de Lista de Verificación ({verificationFields.length})
            </Typography>
            {!isReadOnly && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addVerificationField}
              >
                Agregar Campo
              </Button>
            )}
          </Box>

          {verificationFields.map((field, index) => (
            <Box key={field.id} mb={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 5, sm: 4 }}>
                  <FormField
                    name={`verificationFields.${index}.label`}
                    control={control}
                    label="Etiqueta del Campo"
                    rules={{ required: "Etiqueta es requerida" }}
                    disabled={isReadOnly}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 5 }}>
                  <FormField
                    name={`verificationFields.${index}.type`}
                    control={control}
                    type="select"
                    label="Tipo"
                    options={[
                      { value: "text", label: "Texto" },
                      { value: "date", label: "Fecha" },
                      { value: "number", label: "Número" },
                      { value: "select", label: "Selección" },
                    ]}
                    rules={{ required: "Tipo es requerido" }}
                    disabled={isReadOnly}
                  />
                </Grid>
                {!isReadOnly && (
                  <Grid size={{ xs: 1 }}>
                    <IconButton
                      color="error"
                      onClick={() => removeVerificationField(index)}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                )}
              </Grid>
            </Box>
          ))}
        </Paper>

        {/* Secciones */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Secciones ({sections.length})</Typography>
            <Box display="flex" gap={1}>
              {sections.length > 1 && (
                <>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<Expand />}
                    onClick={expandAllSections}
                  >
                    Expandir Todo
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<Collapse />}
                    onClick={collapseAllSections}
                  >
                    Colapsar Todo
                  </Button>
                </>
              )}
              {!isReadOnly && (
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addSection}
                >
                  Agregar Sección
                </Button>
              )}
            </Box>
          </Box>

          {sections.length === 0 ? (
            <Box
              p={4}
              textAlign="center"
              sx={{
                border: 2,
                borderColor: "primary.main",
                borderStyle: "dashed",
                borderRadius: 2,
                backgroundColor: "primary.50",
              }}
            >
              <Typography variant="h6" color="primary.main" gutterBottom>
                No hay secciones
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Las secciones organizan las preguntas de tu formulario
              </Typography>
              {!isReadOnly && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={addSection}
                >
                  Crear Primera Sección
                </Button>
              )}
            </Box>
          ) : (
            sections.map((section, sectionIndex) => (
              <Box key={section.id} position="relative">
                <SectionBuilder
                  sectionIndex={sectionIndex}
                  section={watchedSections[sectionIndex]}
                  control={control}
                  onRemove={() => removeSection(sectionIndex)}
                  expanded={expandedSections.has(sectionIndex)}
                  onToggleExpanded={() => toggleSectionExpansion(sectionIndex)}
                  disabled={isReadOnly}
                  showRemoveButton={!isReadOnly && sections.length > 1}
                />

                {/* Botón de duplicar (solo en modo edición) */}
              </Box>
            ))
          )}
        </Paper>

        {/* Botones de acción */}
        {!isReadOnly && (
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={onCancel} disabled={isPending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={isPending ? <CircularProgress size={20} /> : <Save />}
              disabled={isPending || !isValid}
            >
              {isPending ? "Guardando..." : "Guardar Plantilla"}
            </Button>
          </Box>
        )}
      </form>

      {/* Errores de validación */}
      {Object.keys(errors).length > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Por favor, corrige los errores en el formulario antes de continuar.
        </Alert>
      )}
    </Box>
  );
};
