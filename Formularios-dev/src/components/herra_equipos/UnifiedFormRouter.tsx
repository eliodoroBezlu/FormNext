"use client"

import { Paper, Typography } from "@mui/material"
import { StandardInspectionForm } from "./StandardInspectionForm"
import { getFormType } from "./config/form-config.helpers"
import { FormTemplateHerraEquipos, FormDataHerraEquipos } from "./types/IProps"
import { GroupedAccessoriesForm } from "./GroupedAccessoriesForm"
import { VehicleInspectionForm } from "./VehicleInspectionForm"
import { ScaffoldInspectionForm } from "./ScaffoldInspectionForm"

interface UnifiedFormRouterProps {
  template: FormTemplateHerraEquipos
  onSubmit: (data: FormDataHerraEquipos) => void
  onSaveDraft?: (data: FormDataHerraEquipos) => void
}

export function UnifiedFormRouter({ template, onSubmit, onSaveDraft }: UnifiedFormRouterProps) {
  const formType = getFormType(template.code)

  // ✅ Wrapper para interceptar y loggear los datos
  const handleSubmitWithLog = (data: FormDataHerraEquipos) => {
    console.log("📤 [UnifiedFormRouter] Submit interceptado");
    console.log("Código del formulario:", template.code);
    console.log("Tipo de formulario:", formType);
    console.log("Datos completos:", data);
    
    // Mostrar datos específicos del selector
    if (data.selectedItems && Object.keys(data.selectedItems).length > 0) {
      console.log("✅ Subsecciones seleccionadas:", data.selectedItems);
      console.table(data.selectedItems); // Formato tabla bonito
    }
    
    // Pasar al siguiente nivel (FormularioDinamicoPage)
    onSubmit(data);
  };

  const handleDraftWithLog = (data: FormDataHerraEquipos) => {
    console.log("💾 [UnifiedFormRouter] Borrador interceptado");
    console.log("Subsecciones guardadas:", data.selectedItems);
    
    if (onSaveDraft) {
      onSaveDraft(data);
    }
  };

  switch (formType) {
    case "standard":
      return (
        <StandardInspectionForm 
          template={template} 
          onSubmit={handleSubmitWithLog} 
          onSaveDraft={handleDraftWithLog} 
        />
      );

    case "grouped":
      return (
        <GroupedAccessoriesForm 
          template={template} 
          onSubmit={handleSubmitWithLog} 
          onSaveDraft={handleDraftWithLog} 
        />
      );

    case "vehicle":
      return (
        <VehicleInspectionForm 
          template={template} 
          onSubmit={handleSubmitWithLog} 
          onSaveDraft={handleDraftWithLog} 
        />
      );

    case "scaffold":
      return (
        <ScaffoldInspectionForm 
          template={template} 
          onSubmit={handleSubmitWithLog} 
          onSaveDraft={handleDraftWithLog}
        />
      );

    default:
      return (
        <Paper elevation={2} sx={{ p: 3, bgcolor: "error.light" }}>
          <Typography color="error.dark" align="center">
            Tipo de formulario no reconocido: {template.code}
          </Typography>
        </Paper>
      )
  }
}