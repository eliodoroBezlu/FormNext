// src/components/organisms/inspection-form-iro-isop/InspectionFormIroIsop.tsx

"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { Button } from "../../atoms/button/Button";
import { useIroIsopForm } from "./application/hooks/useIroIsopForm";
import { IroIsopInspectionForm } from "./presentation/components/forms/IroIsopInspectionForm";
import type { InspectionFormProps } from "./types/IProps";

export const InspectionFormIroIsop = ({
  template,
  onSave,
  onCancel,
  readonly = false,
  initialData,
  isEditMode = false,
}: InspectionFormProps) => {
  // Consumimos toda la lógica desacoplada a través del Custom Hook de aplicación
  const formHook = useIroIsopForm({
    template,
    onSave,
    onCancel,
    readonly,
    initialData,
    isEditMode,
  });

  return (
    <Box p={{ xs: 1, sm: 2, md: 3 }}>
      {/* CABECERA PRINCIPAL */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems="center"
        gap={2}
        mb={3}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={onCancel}
          type="button"
        >
          {readonly ? "Volver" : "Cancelar"}
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            sx={{ fontSize: { xs: "1.5rem", sm: "2.5rem" }, fontWeight: "bold" }}
          >
            {template.name}
          </Typography>
          <Box display="flex" gap={2} mt={1}>
            <Typography variant="body2" color="text.secondary">
              Código: {template.code}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rev. {template.revision}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h5" color="primary" sx={{ fontWeight: "bold" }}>
          % Global: {formHook.previewMetrics.compliance}%
        </Typography>
      </Box>

      {/* FORMULARIO DE ACCIÓN DE CUMPLIMIENTO */}
      <IroIsopInspectionForm
        methods={formHook.methods}
        control={formHook.control}
        handleSubmit={formHook.handleSubmit}
        setValue={formHook.setValue}
        trigger={formHook.trigger}
        errors={formHook.errors}
        isDirty={formHook.isDirty}
        template={template}
        readonly={readonly}
        isEditMode={isEditMode}
        onCancel={onCancel}
        onSubmit={formHook.onSubmit}
        success={formHook.success}
        error={formHook.error}
        submitting={formHook.submitting}
        teamMembers={formHook.teamMembers}
        addTeamMember={formHook.addTeamMember}
        removeTeamMember={formHook.removeTeamMember}
        previewMetrics={formHook.previewMetrics}
        allFlatSections={formHook.allFlatSections}
        calculateSectionMetrics={formHook.calculateSectionMetrics}
        handleMarkSectionAsNotApplicable={formHook.handleMarkSectionAsNotApplicable}
        handleUpdateQuestionResponse={formHook.handleUpdateQuestionResponse}
      />
    </Box>
  );
};
