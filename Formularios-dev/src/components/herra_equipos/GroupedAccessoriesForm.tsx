"use client";

import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
} from "@mui/material";
import { FormDataHerraEquipos, FormTemplateHerraEquipos } from "./types/IProps";
import { AlertSection } from "./common/AlertSection";
import { ColorCodeSection } from "./common/ColorCodeSection";
import { InspectorSignature } from "./common/InspectorSignature";
import { SupervisorSignature } from "./common/SupervisorSignature";
import { SaveSubmitButtons } from "./common/SaveSubmitButtons";
import { getFormConfig } from "./config/form-config.helpers";
import { ObservationsSection } from "./common/ObservationsSection";
import { VerificationFields } from "./VerificationsFields";
import { GroupedQuestionWithGeneralObservation } from "./GroupedQuestionWithGeneralObservation";
import { useEffect } from "react";

interface GroupedAccessoriesFormProps {
  template: FormTemplateHerraEquipos;
  onSubmit: (data: FormDataHerraEquipos) => void;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;
  readonly?: boolean;
  initialData?: FormDataHerraEquipos;
}

export function GroupedAccessoriesForm({
  template,
  onSubmit,
  onSaveDraft,
  readonly = false,
  initialData,
}: GroupedAccessoriesFormProps) {
  const config = getFormConfig(template.code);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormDataHerraEquipos>();

  useEffect(() => {
    if (initialData) {
      console.log("🔄 Cargando datos iniciales:", initialData);
      reset(initialData);
      console.log("✅ Datos cargados");
    }
  }, [initialData, reset]);

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
        isEditMode={!!initialData}
      />
      {config.formType === "grouped" && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, border: "2px solid #2196f3" }}>
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{
                fontWeight: "bold",
                color: "#000",
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              📊 Cantidad de Accesorios de Izaje a Inspeccionar
            </Typography>

            <Grid container spacing={2}>
              {config.groupedConfig?.columns
                .filter((col) => col.applicability === "requiredWithCount")
                .map((column) => (
                  <Grid size={{ xs: 6, sm: 3 }} key={column.key}>
                    <Controller
                      name={`accesoriosConfig.${column.key}.cantidad`}
                      control={control}
                      defaultValue={0}
                      rules={{
                        required: "Ingrese cantidad",
                        min: { value: 0, message: "Mínimo 0" },
                      }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="number"
                          label={column.label}
                          placeholder="0"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          disabled={readonly}
                          InputProps={{
                            inputProps: { min: 0 },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#fff9c4",
                              "& fieldset": {
                                borderColor: "#fbc02d",
                                borderWidth: 2,
                              },
                              "&:hover fieldset": {
                                borderColor: "#f9a825",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#f57f17",
                              },
                            },
                            "& .MuiInputLabel-root": {
                              fontWeight: "bold",
                              color: "#000",
                            },
                            "& input": {
                              fontWeight: "bold",
                              fontSize: "1.1rem",
                              textAlign: "center",
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>
                ))}
            </Grid>
          </Box>
        </Paper>
      )}

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

      {template.sections.map((section, sectionIndex) => (
        <Box key={sectionIndex}>
          {section.title && (
            <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>
              {section.title}
            </Typography>
          )}

          {section.questions.map((question, questionIndex) => (
            <GroupedQuestionWithGeneralObservation
              key={`${sectionIndex}-${questionIndex}`}
              question={question}
              sectionPath={`responses.${sectionIndex}.questions`}
              questionIndex={questionIndex}
              control={control}
              errors={errors}
              readonly={readonly}
              formConfig={config}
            />
          ))}
        </Box>
      ))}
      {config.formType === "grouped" && (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            border: "2px solid #4caf50",
            backgroundColor: "#f1f8e9",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: "#2e7d32",
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 3,
            }}
          >
            🏷️ Tipo de Servicio por Accesorio
          </Typography>

          <Grid container spacing={3}>
            {config.groupedConfig?.columns
              .filter((col) => col.applicability === "requiredWithCount")
              .map((column) => (
                <Grid size={{ xs: 12, md: 6 }} key={column.key}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: "bold",
                        mb: 1,
                        color: "#1976d2",
                      }}
                    >
                      {column.label}
                    </Typography>
                    <Controller
                      name={`accesoriosConfig.${column.key}.tipoServicio`}
                      control={control}
                      rules={{
                        required: `Seleccione tipo de servicio para ${column.label}`,
                      }}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          fullWidth
                          select
                          label={`Tipo de Servicio - ${column.label}`}
                          value={field.value || ""}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          disabled={readonly}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#e8f5e9",
                              "& fieldset": {
                                borderColor: "#4caf50",
                              },
                            },
                          }}
                        >
                          <MenuItem value="">
                            <em>Seleccione tipo</em>
                          </MenuItem>
                          <MenuItem value="N">N - Normal</MenuItem>
                          <MenuItem value="S">S - Severo</MenuItem>
                          <MenuItem value="ES">ES - Especial</MenuItem>
                        </TextField>
                      )}
                    />
                  </Box>
                </Grid>
              ))}
          </Grid>

          {/* Leyenda de tipos */}
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: "#e3f2fd",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
              📋 Descripción de Tipos de Servicio:
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • <strong>N - Normal:</strong> Uso estándar sin condiciones
              especiales
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • <strong>S - Severo:</strong> Condiciones de trabajo exigentes
            </Typography>
            <Typography variant="body2">
              • <strong>ES - Especial:</strong> Aplicaciones específicas o
              críticas
            </Typography>
          </Box>
        </Paper>
      )}

      {config.conclusion && (
        <ObservationsSection
          config={config.conclusion}
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
