"use client"

import { useForm } from "react-hook-form"
import { Box, Typography, Paper } from "@mui/material"
import { FormDataHerraEquipos,  FormTemplateHerraEquipos } from "./types/IProps"
import { getFormConfig } from "./config/form-config.helpers"
import { AlertSection } from "./common/AlertSection"
import { InspectorSignature } from "./common/InspectorSignature"
import { SupervisorSignature } from "./common/SupervisorSignature"
import { SaveSubmitButtons } from "./common/SaveSubmitButtons"
import { ObservationsSection } from "./common/ObservationsSection"

interface VehicleInspectionFormProps {
  template: FormTemplateHerraEquipos
  onSubmit: (data: FormDataHerraEquipos) => void
  onSaveDraft?: (data: FormDataHerraEquipos) => void
}

export function VehicleInspectionForm({ template, onSubmit, onSaveDraft }: VehicleInspectionFormProps) {
  const config = getFormConfig(template.code)

  const {
    register,
    handleSubmit,
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

      {/* Selector de daños del vehículo */}
      {config.vehicle?.hasDamageSelector && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selector de Daños
          </Typography>
          <Typography align="center" color="text.secondary">
            Componente de selector de daños se renderizaría aquí
          </Typography>
        </Paper>
      )}

      {/* Fecha de próxima inspección */}
      {config.vehicle?.hasNextInspectionDate && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Próxima Inspección
          </Typography>
          <Typography align="center" color="text.secondary">
            Campo de fecha de próxima inspección se renderizaría aquí
          </Typography>
        </Paper>
      )}

      {/* Aquí irían las secciones y preguntas del formulario */}
      <Paper elevation={1} sx={{ p: 3, bgcolor: "grey.50" }}>
        <Typography align="center" color="text.secondary">
          Secciones y preguntas del formulario se renderizarían aquí
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
