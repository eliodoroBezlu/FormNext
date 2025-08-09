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
  LinearProgress,
} from "@mui/material";
import {
  Add,
  Delete,
  ArrowBack,
  Save,
  Expand,
  Image,
} from "@mui/icons-material";
import { Button } from "../../atoms/button/Button";
import { FormField } from "../../molecules/form-field/FormField";
import { FormBuilderData, FormTemplate } from "@/types/formTypes";
import { useCallback, useEffect, useState, useTransition } from "react";
import { createTemplate, updateTemplate } from "@/lib/actions/template-actions";
import { SectionBuilder } from "@/components/molecules/section-builder/SectionBuilder";
import { ImageSectionBuilder } from "@/components/molecules/section-builder-view/SectionBuilderView";

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
  const [expandedImageSections, setExpandedImageSections] = useState<Set<number>>(
    new Set([0])
  );

  const isReadOnly = mode === "view";
  const isEditing = mode === "edit" && template;

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormBuilderData>({
    mode: "onChange",
    defaultValues: template || {
      name: "",
      code: "",
      revision: "Rev. 1",
      type: "interna",
      verificationFields: [
        { label: "Gerencia", type: "text" },
        { label: "Supervisor", type: "text" },
        { label: "Inspección N°", type: "text" },
        { label: "Superintendencia", type: "text" },
        { label: "Lugar", type: "text" },
        { label: "Fecha Inspección", type: "date" },
        { label: "Área", type: "text" },
      ],
      sections: [],
      simpleSections: []
    },
  });

  useEffect(() => {
    if (template) {
      reset({
        name: template.name || "",
        code: template.code || "",
        revision: template.revision || "Rev. 1",
        type: template.type || "interna",
        verificationFields: template.verificationFields || [],
        sections: template.sections || [],
        simpleSections: template.simpleSections || [],
      });
    }
  }, [template, reset]);

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

  const {
    fields: simpleSections,
    append: appendSimpleSection,
    remove: removeSimpleSection,
  } = useFieldArray({
    control,
    name: "simpleSections",
  });

  // Watch para obtener datos actuales
  const watchedSections = watch("sections");
  const watchedSimpleSections = watch("simpleSections");

  const onSubmit = async (data: FormBuilderData) => {
    // Validación básica
    if (data.sections.length === 0 ) {
      setError("Debe agregar al menos una sección");
      return;
    }

    // Validar secciones regulares
    const invalidSections = data.sections.filter(section => {
      return !section.questions ||
        section.questions.length === 0 ||
        !section.questions.some(q => q.text?.trim());
    });

    // Validar secciones con imágenes
    // const invalidSimpleSections = (data.simpleSections || []).filter(section => {
    //   return !section.questions ||
    //     section.questions.length === 0 ||
    //     !section.questions.some(q => q.text?.trim());
    // });

    if (invalidSections.length > 0 ) {
      setError("Todas las secciones deben tener al menos una pregunta válida");
      return;
    }

    startTransition(async () => {
      setError(null);
      setSuccess(null);

      try {
        // Validar que todas las imágenes ya estén en base64
        const hasInvalidImages = (data.simpleSections || []).some(section => 
          section.questions?.some(question => 
            question.image && question.image.startsWith('blob:')
          )
        );

        if (hasInvalidImages) {
          setError("Hay imágenes que aún se están procesando. Por favor, espera a que terminen.");
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
                .map((q) => q),
            };
          }),
          simpleSections: (data.simpleSections || []).map((section) => ({
            ...section,
            questions: (section.questions || [])
              .filter((q) => q.text?.trim())
              .map((q) => q),
          })),
        };
        // Verificar tamaños de base64 antes de enviar
        const imageStats = (transformedData.simpleSections || []).flatMap(section => 
          (section.questions || [])
            .filter(q => q.image && q.image.startsWith('data:image/'))
            .map(q => {
              const sizeInBytes = (q.image!.length * 3) / 4;
              const sizeInKB = Math.round(sizeInBytes / 1024);
              return sizeInKB;
            })
        );

        if (imageStats.length > 0) {
          const totalImageSize = imageStats.reduce((sum, size) => sum + size, 0);
          console.log(`Total de imágenes: ${imageStats.length}, Tamaño total: ${totalImageSize}KB`);
          
          // Advertencia si el tamaño total es muy grande
          if (totalImageSize > 5000) { // 5MB total
            console.warn('⚠️ Tamaño total de imágenes muy grande:', totalImageSize, 'KB');
          }
        }
        console.log("Datos transformados para envío:", transformedData);

        const result = isEditing
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
      label: "",
      type: "text",
    });
  }, [appendVerificationField]);

  const addSection = () => {
    const newIndex = sections.length;
    appendSection({
      title: "",
      maxPoints: 0,
      questions: [{ text: "", obligatorio: false }],
    });

    setExpandedSections((prev) => new Set([...prev, newIndex]));
  };

  const addImageSection = () => {
    const newIndex = simpleSections.length;
    appendSimpleSection({
      title: "",
      questions: [{ text: "", image: undefined }],
    });

    setExpandedImageSections((prev) => new Set([...prev, newIndex]));
  };

  const toggleImageSectionExpansion = (index: number) => {
    setExpandedImageSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
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
    setExpandedImageSections(new Set(simpleSections.map((_, index) => index)));
  };

  const collapseAllSections = () => {
    setExpandedSections(new Set());
    setExpandedImageSections(new Set());
  };

  const getTotalQuestions = () => {
    const regularQuestions = watchedSections.reduce((total, section) => {
      return total + (section.questions?.length || 0);
    }, 0);
    
    const imageQuestions = (watchedSimpleSections || []).reduce((total, section) => {
      return total + (section.questions?.length || 0);
    }, 0);
    
    return regularQuestions + imageQuestions;
  };

  const getTotalMaxPoints = () => {
    return watchedSections.reduce((total, section) => {
      return total + (Number(section.maxPoints) || 0);
    }, 0);
  };

  const getTotalSections = () => {
    return sections.length + simpleSections.length;
  };

  // Función para obtener estadísticas de imágenes
  const getImageStats = () => {
    const stats = {
      total: 0,
      base64: 0,
      processing: 0,
      totalSizeKB: 0,
    };

    (watchedSimpleSections || []).forEach(section => {
      (section.questions || []).forEach(question => {
        if (question.image) {
          stats.total++;
          if (question.image.startsWith('data:image/')) {
            stats.base64++;
            const sizeInBytes = (question.image.length * 3) / 4;
            stats.totalSizeKB += Math.round(sizeInBytes / 1024);
          } else if (question.image.startsWith('blob:')) {
            stats.processing++;
          }
        }
      });
    });

    return stats;
  };

  // Verificar si hay imágenes pendientes de procesamiento
  const hasProcessingImages = () => {
    return (watchedSimpleSections || []).some(section =>
      (section.questions || []).some(question =>
        question.image && question.image.startsWith('blob:')
      )
    );
  };

  // Limpiar URLs blob cuando se desmonte el componente
  useEffect(() => {
    return () => {
      // Cleanup blob URLs on unmount
      watchedSimpleSections?.forEach(section => {
        section.questions?.forEach(question => {
          if (question.image && question.image.startsWith('blob:')) {
            URL.revokeObjectURL(question.image);
          }
        });
      });
    };
  }, [watchedSimpleSections]);

  const imageStats = getImageStats();
  const isProcessingImages = hasProcessingImages();

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
            {mode === "view" ? "Ver" : isEditing ? "Editar" : "Crear"} Plantilla
            de Formulario
          </Typography>
          {isEditing && (
            <Chip 
              label={`Editando: ${template?.name}`} 
              color="primary" 
              variant="outlined"
              size="small"
            />
          )}
        </Box>

        {/* Estadísticas del formulario */}
        <Box display="flex" gap={1}>
          <Chip
            label={`${getTotalSections()} secciones`}
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
          {imageStats.total > 0 && (
            <Chip
              label={`${imageStats.base64}/${imageStats.total} img (${imageStats.totalSizeKB}KB)`}
              color={imageStats.processing > 0 ? "warning" : "info"}
              variant="outlined"
              size="small"
              icon={<Image />}
            />
          )}
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

      {/* Indicador de procesamiento de imágenes */}
      {isProcessingImages && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            <Typography variant="body2">
              Procesando imágenes... Por favor espera antes de guardar.
            </Typography>
          </Box>
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
            <Typography variant="h6">
              Secciones ({getTotalSections()})
            </Typography>
            <Box display="flex" gap={1}>
              {getTotalSections() > 1 && (
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
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={addSection}
                    size="small"
                  >
                    Sección Regular
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Image />}
                    onClick={addImageSection}
                    size="small"
                    color="secondary"
                  >
                    Sección con Imágenes
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          {getTotalSections() === 0 ? (
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
                <Box display="flex" gap={2} justifyContent="center">
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={addSection}
                  >
                    Sección Regular
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Image />}
                    onClick={addImageSection}
                    color="secondary"
                  >
                    Sección con Imágenes
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <>
              {/* Secciones regulares */}
              {sections.map((section, sectionIndex) => (
                <Box key={section.id} position="relative">
                  <SectionBuilder
                    sectionIndex={sectionIndex}
                    section={watchedSections[sectionIndex]}
                    control={control}
                    onRemove={() => removeSection(sectionIndex)}
                    expanded={expandedSections.has(sectionIndex)}
                    onToggleExpanded={() => toggleSectionExpansion(sectionIndex)}
                    disabled={isReadOnly}
                    showRemoveButton={!isReadOnly && getTotalSections() > 1}
                  />
                </Box>
              ))}

              {/* Secciones con imágenes */}
              {simpleSections.map((section, sectionIndex) => (
                <Box key={section.id} position="relative">
                  <ImageSectionBuilder
                    sectionIndex={sectionIndex}
                    section={watchedSimpleSections?.[sectionIndex] || section}
                    control={control}
                    setValue={setValue}
                    onRemove={() => removeSimpleSection(sectionIndex)}
                    expanded={expandedImageSections.has(sectionIndex)}
                    onToggleExpanded={() => toggleImageSectionExpansion(sectionIndex)}
                    disabled={isReadOnly}
                    showRemoveButton={!isReadOnly && getTotalSections() > 1}
                  />
                </Box>
              ))}
            </>
          )}
        </Paper>

        {/* Información de imágenes si hay */}
        {imageStats.total > 0 && (
          <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: "info.50" }}>
            <Typography variant="subtitle2" color="info.dark" gutterBottom>
              📊 Resumen de Imágenes
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Total: {imageStats.total}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Listas: {imageStats.base64}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Procesando: {imageStats.processing}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Tamaño: {imageStats.totalSizeKB}KB
                </Typography>
              </Grid>
            </Grid>
            
            {imageStats.processing > 0 && (
              <Box mt={1}>
                <LinearProgress color="warning" />
                <Typography variant="caption" color="warning.dark">
                  Esperando que terminen de procesarse las imágenes...
                </Typography>
              </Box>
            )}
          </Paper>
        )}

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
              disabled={isPending || !isValid || isProcessingImages}
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
          <Box component="ul" sx={{ mt: 1, mb: 0 }}>
            {Object.entries(errors).map(([field, error]) => (
              <Box component="li" key={field}>
                {field}: {error?.message || "Campo requerido"}
              </Box>
            ))}
          </Box>
        </Alert>
      )}

      {/* Información de desarrollo */}
      {process.env.NODE_ENV === 'development' && imageStats.total > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            🚧 Modo desarrollo: {imageStats.base64} imágenes convertidas a Base64 (listas para BD). 
            {imageStats.processing > 0 && `${imageStats.processing} aún procesándose.`}
            {imageStats.totalSizeKB > 1000 && ` ⚠️ Tamaño total: ${imageStats.totalSizeKB}KB`}
          </Typography>
        </Alert>
      )}
    </Box>
  );
};