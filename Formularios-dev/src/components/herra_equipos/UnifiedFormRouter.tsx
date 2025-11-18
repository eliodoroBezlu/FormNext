"use client";

import { Paper, Typography } from "@mui/material";
import { StandardInspectionForm } from "./StandardInspectionForm";
import { getFormType } from "./config/form-config.helpers";
import { FormTemplateHerraEquipos, FormDataHerraEquipos } from "./types/IProps";
import { GroupedAccessoriesForm } from "./GroupedAccessoriesForm";
import { VehicleInspectionForm } from "./VehicleInspectionForm";
import { ScaffoldInspectionForm } from "./ScaffoldInspectionForm";

interface UnifiedFormRouterProps {
  template: FormTemplateHerraEquipos;
  onSubmit: (data: FormDataHerraEquipos) => void;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;
  onSaveProgress?: (data: FormDataHerraEquipos) => void; // ✅ NUEVO
  onFinalize?: (data: FormDataHerraEquipos) => void;
  initialData?: FormDataHerraEquipos; // ✅ AGREGAR
  readonly?: boolean; // ✅ AGREGAR
}

export function UnifiedFormRouter({
  template,
  onSubmit,
  onSaveDraft,
  onSaveProgress,
  onFinalize,
  initialData,
  readonly = false,
}: UnifiedFormRouterProps) {
  const formType = getFormType(template.code);

  // ✅ Wrapper para interceptar y loggear los datos
  const handleSubmitWithLog = (data: FormDataHerraEquipos) => {
    // Pasar al siguiente nivel (FormularioDinamicoPage)
    onSubmit(data);
  };
  

  const handleDraftWithLog = (data: FormDataHerraEquipos) => {
    if (onSaveDraft) {
      onSaveDraft(data);
    }
  };

  const commonProps = {
    template,
    onSubmit: handleSubmitWithLog,
    onSaveDraft: handleDraftWithLog,
    initialData,
    readonly,
  };

  const scaffoldProps = {
    ...commonProps,
    onSaveProgress,  // ✅ SOLO para scaffold
    onFinalize,      // ✅ SOLO para scaffold
  };

  switch (formType) {
    case "standard":
      return <StandardInspectionForm {...commonProps} />;

    case "grouped":
      return <GroupedAccessoriesForm {...commonProps} />;

    case "vehicle":
      return <VehicleInspectionForm {...commonProps} />;

    case "scaffold":
      return <ScaffoldInspectionForm {...scaffoldProps} />;

    default:
      return (
        <Paper elevation={2} sx={{ p: 3, bgcolor: "error.light" }}>
          <Typography color="error.dark" align="center">
            Tipo de formulario no reconocido: {template.code}
          </Typography>
        </Paper>
      );
  }
}
