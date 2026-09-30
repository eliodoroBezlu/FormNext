"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Alert, Box, Chip, CircularProgress, Grid, Paper, Typography } from "@mui/material";
import { Add, ArrowBack, FolderOpen, Image as ImageIcon, Save, UnfoldLess, UnfoldMore } from "@mui/icons-material";
import { Button } from "@/components/ui/buttons/Button";
import { FormField } from "@/components/ui/inputs/FormField";
import type { FormBuilderData, FormTemplate } from "@/types/formTypes";
import { useFormBuilderSubmit } from "@/components/features/form-builder/application/hooks/useFormBuilderSubmit";
import { useEstadisticasImagenes } from "../../application/hooks/useEstadisticasPlantilla";
import { normalizarSecciones } from "../../domain/models/estadisticasPlantilla";
import { SectionBuilder } from "./SectionBuilder";
import { ImageSectionBuilder } from "./SectionBuilderView";
import { CamposVerificacion } from "./CamposVerificacion";
import { AvisoImagenesProcesando, ResumenImagenes, ResumenPlantilla } from "./ResumenPlantilla";

export interface FormBuilderProps {
  template: FormTemplate | null;
  onSave: (template: FormTemplate) => void;
  onCancel: () => void;
  mode?: "create" | "edit" | "view";
}

const VALORES_NUEVA: FormBuilderData = {
  name: "",
  code: "",
  revision: "Rev. 1",
  type: "interna",
  verificationFields: [
    { label: "Gerencia", type: "text", dataSource: "", required: false },
    { label: "Supervisor", type: "text", dataSource: "", required: false },
    { label: "Inspección N°", type: "text", dataSource: "", required: false },
    { label: "Superintendencia", type: "text", dataSource: "", required: false },
    { label: "Lugar", type: "text", dataSource: "", required: false },
    { label: "Fecha Inspección", type: "date", dataSource: "", required: false },
    { label: "Área", type: "text", dataSource: "", required: false },
  ],
  sections: [],
  simpleSections: [],
};

const aValoresDelFormulario = (template: FormTemplate): FormBuilderData => ({
  name: template.name || "",
  code: template.code || "",
  revision: template.revision || "Rev. 1",
  type: template.type || "interna",
  verificationFields: (template.verificationFields || []).map((field) => ({
    label: field.label || "",
    type: field.type || "text",
    dataSource: field.dataSource || "",
    required: Boolean(field.required),
  })),
  sections: normalizarSecciones(template.sections || []),
  simpleSections: template.simpleSections || [],
});

/** Alterna un índice dentro de un Set (secciones expandidas). */
const alternar = (prev: Set<number>, i: number) => {
  const siguiente = new Set(prev);
  if (siguiente.has(i)) siguiente.delete(i);
  else siguiente.add(i);
  return siguiente;
};

/**
 * Constructor de plantillas IRO/ISOP.
 *
 * **Rendimiento:** esta raíz no vigila los datos del formulario. Cada campo
 * se suscribe a su propio valor y las secciones/preguntas están memoizadas;
 * los contadores que sí necesitan todo (`ResumenPlantilla`, `ResumenImagenes`,
 * `BotonGuardar`) son componentes chicos y aislados. Antes, un `useWatch` de
 * todas las secciones aquí arriba hacía que cada tecla redibujara todas las
 * preguntas, y la lentitud crecía con el tamaño del formulario.
 * Ver mds/implementation_planConstructoresFormularios.md.
 */
export const FormBuilder: React.FC<FormBuilderProps> = ({ template, onSave, onCancel, mode = "create" }) => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(() => new Set([0]));
  const [expandedImageSections, setExpandedImageSections] = useState<Set<number>>(() => new Set([0]));

  const isReadOnly = mode === "view";
  const isEditing = mode === "edit" && template;
  // En un borrador el código queda fijo: une a todas las revisiones. El
  // número de revisión sí se puede cambiar (p. ej. saltar de la 7 a la 9); el
  // backend exige que sea mayor que el de las revisiones anteriores.
  const esBorrador = template?.estadoRevision === "borrador";

  const { onSubmit, isPending, error, setError, success, setSuccess } = useFormBuilderSubmit({
    template,
    isEditing: Boolean(isEditing),
    onSave,
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormBuilderData>({
    mode: "onTouched",
    defaultValues: template ? aValoresDelFormulario(template) : VALORES_NUEVA,
  });

  useEffect(() => {
    if (template) reset(aValoresDelFormulario(template));
  }, [template, reset]);

  // Las URL `blob:` temporales se liberan al salir del constructor. Antes esto
  // era la limpieza de un efecto que dependía de las secciones con imágenes,
  // así que corría en cada cambio y podía revocar una imagen a medio procesar.
  useEffect(
    () => () => {
      for (const seccion of getValues("simpleSections") ?? []) {
        for (const pregunta of seccion.questions ?? []) {
          if (pregunta.image?.startsWith("blob:")) URL.revokeObjectURL(pregunta.image);
        }
      }
    },
    [getValues],
  );

  const { fields: sections, append: appendSection, remove: removeSection } = useFieldArray({
    control,
    name: "sections",
  });
  const { fields: simpleSections, append: appendSimpleSection, remove: removeSimpleSection } = useFieldArray({
    control,
    name: "simpleSections",
  });

  const totalSecciones = sections.length + simpleSections.length;
  const puedeEliminarSeccion = !isReadOnly && totalSecciones > 1;

  const addSection = (isParent: boolean) => {
    const newIndex = sections.length;
    appendSection({
      title: isParent ? "Nueva Sección Padre" : "Nueva Sección",
      description: "",
      maxPoints: 0,
      questions: [],
      isParent,
      parentId: null,
      subsections: isParent ? [] : undefined,
      order: newIndex,
    });
    setExpandedSections((prev) => new Set([...prev, newIndex]));
  };

  const addImageSection = () => {
    const newIndex = simpleSections.length;
    appendSimpleSection({ title: "", questions: [{ text: "", image: undefined }] });
    setExpandedImageSections((prev) => new Set([...prev, newIndex]));
  };

  // Callbacks estables: las secciones están memoizadas y reciben el índice.
  const toggleSection = useCallback((i: number) => setExpandedSections((prev) => alternar(prev, i)), []);
  const toggleImageSection = useCallback((i: number) => setExpandedImageSections((prev) => alternar(prev, i)), []);
  const handleRemoveSection = useCallback((i: number) => removeSection(i), [removeSection]);
  const handleRemoveImageSection = useCallback((i: number) => removeSimpleSection(i), [removeSimpleSection]);

  const expandAllSections = () => {
    setExpandedSections(new Set(sections.map((_, i) => i)));
    setExpandedImageSections(new Set(simpleSections.map((_, i) => i)));
  };
  const collapseAllSections = () => {
    setExpandedSections(new Set());
    setExpandedImageSections(new Set());
  };

  /** Patrón 2 del CLAUDE.md: al guardar con errores, ir al primero. */
  const handleInvalidSubmit = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>('[data-question-error="true"], [aria-invalid="true"]');
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus?.();
        }
      });
    });
  };

  const botonesSeccion = (
    <Box display="flex" gap={1}>
      <Button type="button" variant="outlined" startIcon={<Add />} onClick={() => addSection(false)} size="small">
        Sección Simple
      </Button>
      <Button
        type="button"
        variant="outlined"
        startIcon={<FolderOpen />}
        onClick={() => addSection(true)}
        size="small"
        color="secondary"
      >
        Sección Padre
      </Button>
      <Button type="button" variant="outlined" startIcon={<ImageIcon />} onClick={addImageSection} size="small" color="info">
        Sección con Imágenes
      </Button>
    </Box>
  );

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} gap={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={2}>
          <Button type="button" variant="outlined" startIcon={<ArrowBack />} onClick={onCancel}>
            Volver
          </Button>
          <Typography variant="h4">
            {mode === "view" ? "Ver" : isEditing ? "Editar" : "Crear"} Plantilla de Formulario
          </Typography>
          {isEditing && <Chip label={`Editando: ${template?.name}`} color="primary" variant="outlined" size="small" />}
          {esBorrador && <Chip label={`Borrador · ${template?.revision}`} color="warning" size="small" />}
        </Box>
        <ResumenPlantilla control={control} totalSecciones={totalSecciones} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      <AvisoImagenesProcesando control={control} />

      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Información General
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="name" control={control} label="Nombre del Formulario" rules={{ required: "Nombre es requerido" }} disabled={isReadOnly} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="code" control={control} label="Código" rules={{ required: "Código es requerido" }} disabled={isReadOnly || esBorrador} />
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

        <CamposVerificacion control={control} disabled={isReadOnly} />

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Secciones ({totalSecciones})</Typography>
            <Box display="flex" gap={1}>
              {totalSecciones > 1 && (
                <>
                  <Button type="button" variant="text" size="small" startIcon={<UnfoldMore />} onClick={expandAllSections}>
                    Expandir Todo
                  </Button>
                  <Button type="button" variant="text" size="small" startIcon={<UnfoldLess />} onClick={collapseAllSections}>
                    Colapsar Todo
                  </Button>
                </>
              )}
              {!isReadOnly && botonesSeccion}
            </Box>
          </Box>

          {totalSecciones === 0 ? (
            <Box
              p={4}
              textAlign="center"
              sx={{ border: 2, borderColor: "primary.main", borderStyle: "dashed", borderRadius: 2, backgroundColor: "primary.50" }}
            >
              <Typography variant="h6" color="primary.main" gutterBottom>
                No hay secciones
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Las secciones organizan las preguntas de tu formulario
              </Typography>
              {!isReadOnly && botonesSeccion}
            </Box>
          ) : (
            <>
              {sections.map((section, i) => (
                <SectionBuilder
                  key={section.id}
                  sectionIndex={i}
                  control={control}
                  onRemove={handleRemoveSection}
                  expanded={expandedSections.has(i)}
                  onToggleExpanded={toggleSection}
                  disabled={isReadOnly}
                  showRemoveButton={puedeEliminarSeccion}
                />
              ))}
              {simpleSections.map((section, i) => (
                <ImageSectionBuilder
                  key={section.id}
                  sectionIndex={i}
                  control={control}
                  setValue={setValue}
                  onRemove={handleRemoveImageSection}
                  expanded={expandedImageSections.has(i)}
                  onToggleExpanded={toggleImageSection}
                  disabled={isReadOnly}
                  showRemoveButton={puedeEliminarSeccion}
                />
              ))}
            </>
          )}
        </Paper>

        <ResumenImagenes control={control} />

        {!isReadOnly && <BotonesGuardar control={control} isPending={isPending} onCancel={onCancel} />}
      </Box>

      {Object.keys(errors).length > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Hay campos con errores (marcados en rojo). Corrígelos antes de guardar.
        </Alert>
      )}
    </Box>
  );
};

/**
 * Guardar / Cancelar. Vigila solo las imágenes (para no guardar con una a
 * medio procesar); el resto de la validación la hace el submit y lleva al
 * primer error, en vez de deshabilitar el botón revalidando en cada tecla.
 */
function BotonesGuardar({
  control,
  isPending,
  onCancel,
}: {
  control: Parameters<typeof useEstadisticasImagenes>[0];
  isPending: boolean;
  onCancel: () => void;
}) {
  const { procesando } = useEstadisticasImagenes(control);
  return (
    <Box display="flex" justifyContent="flex-end" gap={2}>
      <Button type="button" variant="outlined" onClick={onCancel} disabled={isPending}>
        Cancelar
      </Button>
      <Button
        type="submit"
        variant="contained"
        startIcon={isPending ? <CircularProgress size={20} /> : <Save />}
        disabled={isPending || procesando > 0}
      >
        {isPending ? "Guardando..." : "Guardar Plantilla"}
      </Button>
    </Box>
  );
}
