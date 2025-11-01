"use client"

import { Paper, Typography } from "@mui/material"
import { StandardInspectionForm } from "./StandardInspectionForm"
import { getFormType } from "./config/form-config.helpers"
import {  FormTemplateHerraEquipos } from "./types/IProps"
import { GroupedAccessoriesForm } from "./GroupedAccessoriesForm"
import { VehicleInspectionForm } from "./VehicleInspectionForm"
interface UnifiedFormRouterProps {
  template: FormTemplateHerraEquipos
  onSubmit: (data: unknown) => void
  onSaveDraft?: (data: unknown) => void
}

export function UnifiedFormRouter({ template, onSubmit, onSaveDraft }: UnifiedFormRouterProps) {
  const formType = getFormType(template.code)

  switch (formType) {
    case "standard":
      return <StandardInspectionForm template={template} onSubmit={onSubmit} onSaveDraft={onSaveDraft} />

    case "grouped":
      return <GroupedAccessoriesForm template={template} onSubmit={onSubmit} onSaveDraft={onSaveDraft} />

    case "vehicle":
      return <VehicleInspectionForm template={template} onSubmit={onSubmit} onSaveDraft={onSaveDraft} />

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
