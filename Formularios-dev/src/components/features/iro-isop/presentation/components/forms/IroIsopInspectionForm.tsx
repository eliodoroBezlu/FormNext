// src/components/organisms/inspection-form-iro-isop/presentation/components/forms/IroIsopInspectionForm.tsx

import React, { useCallback } from "react";
import { Box, Typography, Grid, Paper, Alert, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { Save, ExpandMore, Group } from "@mui/icons-material";
import { Button } from "@/components/ui/buttons/Button";
import { FormProvider, type UseFormReturn } from "react-hook-form";
import type { Section } from "@/types/formTypes";
import type { IroIsopInspectionFormProps, InspectionFormData } from "@/components/features/iro-isop/types/IProps";

// Sub-secciones Componentizadas
import { VerificationListSection } from "../sections/VerificationListSection";
import { InspectionTeamSection } from "../sections/InspectionTeamSection";
import { CriterioValoracionSection } from "../sections/CriterioValoracionSection";
import { SectionAccordion } from "../sections/SectionAccordion";
import { ConclusionesSection } from "../sections/ConclusionesSection";
import { ResumenGeneralSection } from "../sections/ResumenGeneralSection";
import { PersonalInvolucrado } from "./PersonalInvolucrado";

export const IroIsopInspectionForm = ({
  methods,
  control,
  handleSubmit,
  setValue,
  trigger,
  template,
  readonly,
  onCancel,
  onSubmit,
  success,
  error,
  submitting,
  teamMembers,
  addTeamMember,
  removeTeamMember,
  previewMetrics,
  allFlatSections,
  calculateSectionMetrics,
  handleMarkSectionAsNotApplicable,
  handleUpdateQuestionResponse,
}: IroIsopInspectionFormProps & { methods: UseFormReturn<InspectionFormData> }) => {

  // --- DOUBLE FRAME SMOOTH SCROLL TO ERRORS (PROJECT baseline standard) ---
  const handleInvalidSubmit = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const errorElement = document.querySelector<HTMLElement>(
          '[data-question-error="true"], [aria-invalid="true"], .Mui-error'
        );
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          const focusable = errorElement.querySelector<HTMLElement>(
            "input, textarea, button[aria-pressed]"
          );
          (focusable ?? errorElement).focus?.();
        }
      });
    });
  }, []);

  // --- RENDERIZADO RECURSIVO DE SECCIONES JERÁRQUICAS ---
  const renderSections = (sections: Section[], level: number = 0): React.ReactNode => {
    return sections.map((sec, idx) => (
      <SectionAccordion
        key={sec._id || `section-accordion-${level}-${idx}`}
        section={sec}
        level={level}
        index={idx}
        control={control}
        readonly={readonly}
        allFlatSections={allFlatSections}
        handleMarkSectionAsNotApplicable={handleMarkSectionAsNotApplicable}
        handleUpdateQuestionResponse={handleUpdateQuestionResponse}
        calculateSectionMetrics={calculateSectionMetrics}
        renderSections={renderSections}
      />
    ));
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)} noValidate>
        {success && (
          <Alert severity="success" sx={{ mb: 3, fontWeight: "medium" }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3, fontWeight: "medium" }}>
            {error}
          </Alert>
        )}

        {/* LISTA DE VERIFICACIÓN */}
        <VerificationListSection
          control={control}
          verificationFields={template.verificationFields}
          readonly={readonly}
        />

        {/* EQUIPO DE INSPECCIÓN */}
        <InspectionTeamSection
          control={control}
          setValue={setValue}
          teamMembers={teamMembers}
          addTeamMember={addTeamMember}
          removeTeamMember={removeTeamMember}
          readonly={readonly}
        />

        {/* CRITERIOS DE VALORACIÓN */}
        <CriterioValoracionSection documentCode={template.code} />

        {/* ACORDEONES DE PREGUNTAS DINÁMICAS RECURSIVAS */}
        <Box sx={{ mb: 3 }}>
          {renderSections(template.sections, 0)}
        </Box>

        {/* CONCLUSIONES Y RECOMENDACIONES */}
        <ConclusionesSection control={control} readonly={readonly} />

        {/* PERSONAL INVOLUCRADO (Condicional por código de plantilla) */}
        {template.code === "1.02.P06.F46" && (
          <Accordion elevation={2} sx={{ mb: 2 }} defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{ bgcolor: "warning.main", color: "white" }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Group />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  PERSONAL INVOLUCRADO
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2 }}>
              <PersonalInvolucrado<InspectionFormData>
                control={control}
                name="personalInvolucrado"
                setValue={setValue}
                trigger={trigger}
                disabled={readonly}
                onTrabajadorSelect={() => {}}
              />
            </AccordionDetails>
          </Accordion>
        )}

        {/* RESUMEN FINAL DE CUMPLIMIENTO */}
        <ResumenGeneralSection previewMetrics={previewMetrics} />

        {/* CONTROLES DE GUARDADO Y NAVEGACIÓN */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            bgcolor: "grey.50",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "grey.200",
            mt: 4,
          }}
        >
          <Grid container spacing={2} justifyContent="flex-end">
            <Grid size={{ xs: 12, sm: "auto" }}>
              <Button
                variant="outlined"
                onClick={onCancel}
                sx={{ width: { xs: "100%", sm: "auto" } }}
                type="button" // Evita disparar el submit nativo
              >
                {readonly ? "Volver" : "Cancelar"}
              </Button>
            </Grid>
            {!readonly && (
              <Grid size={{ xs: 12, sm: "auto" }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={submitting}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  {submitting ? "Guardando..." : "Guardar Formulario"}
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>
      </form>
    </FormProvider>
  );
};
