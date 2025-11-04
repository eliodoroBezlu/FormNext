"use client";

import { Controller, useForm } from "react-hook-form";
import { Box, Typography, Paper } from "@mui/material";
import { FormDataHerraEquipos, FormTemplateHerraEquipos } from "./types/IProps";
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
import { RoutineInspectionSection } from "./RoutineInspectionSection";
import { ScaffoldConclusionSection } from "./ScaffoldConclusionSection";

interface ScaffoldInspectionFormProps {
  template: FormTemplateHerraEquipos;
  onSubmit: (data: FormDataHerraEquipos) => void;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;
  readonly?: boolean;
}

export function ScaffoldInspectionForm({
  template,
  onSubmit,
  onSaveDraft,
  readonly = false,
}: ScaffoldInspectionFormProps) {
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

      {config.conclusion?.enabled && config.conclusion.showCheckbox && (
        <Controller
          name="scaffold.finalConclusion"
          control={control}
          rules={{ required: "Debe seleccionar una opción de conclusión" }}
          render={({ field }) => (
            <ScaffoldConclusionSection
              config={config.conclusion!}
              register={register}
              errors={errors}
              value={field.value}
              onChange={field.onChange}
              readonly={readonly}
            />
          )}
        />
      )}

      {config.routineInspection?.enabled && (
        <Controller
          name="scaffold.routineInspections"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <RoutineInspectionSection
              config={config.routineInspection!}
              register={register}
              errors={errors}
              value={field.value}
              onChange={field.onChange}
              readonly={readonly}
            />
          )}
        />
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
        <InspectorSignature
          register={register}
          control={control}
          errors={errors}
          setValue={setValue}
          config={config.signatures.supervisor}
        />
      )}

      {config.signatures?.supervisor && (
        <SupervisorSignature
          register={register}
          control={control}
          errors={errors}
          setValue={setValue}
          config={config.signatures.supervisor}
        />
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
