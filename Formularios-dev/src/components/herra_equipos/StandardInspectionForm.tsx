"use client";

import { useForm } from "react-hook-form";
import { Box, Typography, Paper } from "@mui/material";
import { FormDataHerraEquipos,  FormTemplateHerraEquipos } from "./types/IProps";
import { getFormConfig } from "./config/form-config.helpers";
import { AlertSection } from "./common/AlertSection";
import { ColorCodeSection } from "./common/ColorCodeSection";
import { SectionRenderer } from "./SectionRenderer";
import { InspectorSignature } from "./common/InspectorSignature";
import { SaveSubmitButtons } from "./common/SaveSubmitButtons";
import { VerificationFields } from "./VerificationsFields";
import { SupervisorSignature } from "./common/SupervisorSignature";
import { OutOfServiceSection } from "./common/OutOfServiceSection";
import { ObservationsSection } from "./common/ObservationsSection";

interface StandardInspectionFormProps {
  template: FormTemplateHerraEquipos;
  onSubmit: (data: FormDataHerraEquipos) => void;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;
  readonly?: boolean;
}

export function StandardInspectionForm({
  template,
  onSubmit,
  onSaveDraft,
  readonly = false,
}: StandardInspectionFormProps) {
  const config = getFormConfig(template.code);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormDataHerraEquipos>();

  if (!config) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography color="error">
          Configuración no encontrada para {template.code}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      <Box>
        <Typography variant="h4" gutterBottom>
          {config.formName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Código: {config.formCode}
        </Typography>
      </Box>

      <VerificationFields
                fields={template.verificationFields}
                control={control}
                errors={errors}
                readonly={readonly}
                setValue={setValue} 
              />

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

      {template.sections && template.sections.length > 0 && (
        <Box>
          {template.sections.map((section, idx) => (
            <SectionRenderer
              key={section._id || idx}
              section={section}
              sectionPath={`sections.${idx}`}
              control={control}
              errors={errors}
              formConfig={config}
            />
          ))}
        </Box>
      )}

      {config.generalObservations?.enabled && (
        <ObservationsSection
          config={config.generalObservations}
          register={register}
          errors={errors}
        />
      )}

      {config.outOfService?.enabled && (
        <OutOfServiceSection
          config={config.outOfService}
          register={register}
          errors={errors}
        />
      )}

      {config.signatures?.inspector && (
        <InspectorSignature register={register} errors={errors} />
      )}

      {config.signatures?.supervisor && (
        <SupervisorSignature register={register} errors={errors} />
      )}

      <SaveSubmitButtons
        onSaveDraft={
          onSaveDraft ? () => handleSubmit(onSaveDraft)() : undefined
        }
        onSubmit={handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
        allowDraft={config.allowDraft ?? true}
      />
    </Box>
  );
}
