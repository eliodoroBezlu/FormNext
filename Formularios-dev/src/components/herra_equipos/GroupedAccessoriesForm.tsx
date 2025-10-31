"use client"

import { useForm } from "react-hook-form"
import { Box, Typography, Paper } from "@mui/material"
import { FormDataHerraEquipos, FormTemplateHerraEquipos } from "./types/IProps"
import { AlertSection } from "./common/AlertSection"
import { ColorCodeSection } from "./common/ColorCodeSection"
import { InspectorSignature } from "./common/InspectorSignature"
import { SupervisorSignature } from "./common/SupervisorSignature"
import { SaveSubmitButtons } from "./common/SaveSubmitButtons"
import { getFormConfig } from "./config/form-config.helpers"
import { ObservationsSection } from "./common/ObservationsSection"

interface GroupedAccessoriesFormProps {
  template: FormTemplateHerraEquipos
  onSubmit: (data: FormDataHerraEquipos) => void
  onSaveDraft?: (data: FormDataHerraEquipos) => void
}

export function GroupedAccessoriesForm({ template, onSubmit, onSaveDraft }: GroupedAccessoriesFormProps) {
  const config = getFormConfig(template.code)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormDataHerraEquipos>()

  if (!config) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography color="error">Configuración no encontrada para {template.code}</Typography>
      </Paper>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          {config.formName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Código: {config.formCode}
        </Typography>
      </Box>

      {config.alert && <AlertSection config={config.alert} />}

      {config.colorCode && (
        <ColorCodeSection
          config={config.colorCode}
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
        />
      )}

      {/* Aquí irían las preguntas agrupadas con columnas */}
      <Paper elevation={1} sx={{ p: 3, bgcolor: "grey.50" }}>
        <Typography align="center" color="text.secondary">
          Preguntas agrupadas con columnas se renderizarían aquí
        </Typography>
      </Paper>

      {config.conclusion && <ObservationsSection config={config.conclusion} register={register} errors={errors} />}

      {config.signatures?.inspector && <InspectorSignature register={register} errors={errors} />}

      {config.signatures?.supervisor && <SupervisorSignature register={register} errors={errors} />}

      <SaveSubmitButtons
        onSaveDraft={onSaveDraft ? () => handleSubmit(onSaveDraft)() : undefined}
        onSubmit={handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
        allowDraft={config.allowDraft ?? true}
      />
    </Box>
  )
}
