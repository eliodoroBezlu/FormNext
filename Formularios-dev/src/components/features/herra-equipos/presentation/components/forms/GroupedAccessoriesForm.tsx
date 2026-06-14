"use client";

import React, { useEffect, useState } from "react";
import { Controller, useForm, FieldErrors } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Alert,
  Button,
} from "@mui/material";
import {
  FormDataHerraEquipos,
  FormTemplateHerraEquipos,
} from "../../../types/IProps";
import { AlertSection } from "../../../common/AlertSection";
import { ColorCodeSection } from "../../../common/ColorCodeSection";
import { InspectorSignature } from "../../../common/InspectorSignature";
import { SupervisorSignature } from "../../../common/SupervisorSignature";
import { getFormConfig } from "../../../config/form-config.helpers";
import { ObservationsSection } from "../../../common/ObservationsSection";
import { GroupedQuestionWithGeneralObservation } from "../renderers/GroupedQuestionWithGeneralObservation";
import { VerificationFields } from "../renderers/VerificationsFields";

// Reusable stepper components
import { FormBreadcrumbs } from "../../../common/FormBreadcrumbs";
import { FormStepperHeader } from "../../../common/FormStepperHeader";
import { Step5ReviewSection } from "../../../common/Step5ReviewSection";

interface GroupedAccessoriesFormProps {
  template: FormTemplateHerraEquipos;
  onSubmit: (data: FormDataHerraEquipos) => void;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;
  readonly?: boolean;
  initialData?: FormDataHerraEquipos;
}

const steps = [
  { label: "Herramienta y Área" },
  { label: "Datos Generales" },
  { label: "Inspección" },
  { label: "Firmas y Observaciones" },
  { label: "Revisión Final" },
];

export function GroupedAccessoriesForm({
  template,
  onSubmit,
  onSaveDraft,
  readonly = false,
  initialData,
}: GroupedAccessoriesFormProps) {
  const config = getFormConfig(template.code);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active step state read from search query parameter
  const initialStep = parseInt(searchParams.get("step") || "1", 10);
  const [activeStep, setActiveStep] = useState(initialStep);

  const updateStepQueryParam = (step: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("step", step.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  };

  const handleStepChange = (newStep: number) => {
    setActiveStep(newStep);
    updateStepQueryParam(newStep);
  };

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormDataHerraEquipos>({ mode: "onTouched" });

  const [hasSubmitErrors, setHasSubmitErrors] = useState(false);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (!isDirty || readonly) return;
    const handler = (e: BeforeUnloadEvent) => {
      if ((window as Window & { bypassBeforeUnload?: boolean }).bypassBeforeUnload) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, readonly]);

  if (!config) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography color="error">
          Configuración no encontrada para {template.code}
        </Typography>
      </Paper>
    );
  }

  const handleInvalidSubmit = (errors: FieldErrors<FormDataHerraEquipos>) => {
    console.log("errors", errors);
    setHasSubmitErrors(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const firstInvalid = document.querySelector<HTMLElement>(
          '[data-question-error="true"], [aria-invalid="true"]',
        );
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
          const focusable = firstInvalid.querySelector<HTMLElement>(
            "input, textarea, button[aria-pressed]",
          );
          (focusable ?? firstInvalid).focus?.();
        }
      });
    });
  };

  const handleFormSubmit = (data: FormDataHerraEquipos) => {
    setHasSubmitErrors(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).bypassBeforeUnload = true;
    onSubmit(data);
  };

  const handleDraftSave = (data: FormDataHerraEquipos) => {
    onSaveDraft?.(data);
  };

  // Split Verification Fields into Step 1 and Step 2
  const step1Labels = ["TAG", "Equipo", "Herramienta", "Instrumento", "Código de Instrumento", "Identificación", "Código del Equipo", "Área", "Planta", "Ubicación", "Lugar"];
  const step1Fields = template.verificationFields.filter((f) => step1Labels.includes(f.label));
  const step2Fields = template.verificationFields.filter((f) => !step1Labels.includes(f.label));

  // Stepper Section Navigation Handlers
  const handleNextStep = async () => {
    if (activeStep === 1) {
      const step1FieldNames = step1Fields.map((f) => `verification.${f.label}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = await trigger(step1FieldNames as any);
      if (isValid) handleStepChange(2);
    } else if (activeStep === 2) {
      // Validate step 2 fields + accesoriosConfig count inputs
      const step2FieldNames = step2Fields.map((f) => `verification.${f.label}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const step2Valid = await trigger(step2FieldNames as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const configValid = await trigger("accesoriosConfig" as any);
      if (step2Valid && configValid) handleStepChange(3);
    } else if (activeStep === 3) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = await trigger("responses" as any);
      if (isValid) handleStepChange(4);
    } else if (activeStep === 4) {
      const step4FieldNames = [
        "generalObservations",
        "inspectorSignature.inspectorName",
        "inspectorSignature.signatureBase64",
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = await trigger(step4FieldNames as any);
      if (!isValid) return;

      if (onSaveDraft) {
        handleSubmit(async (data) => {
          await onSaveDraft(data);
          if (initialData?._id) {
            handleStepChange(5);
          }
        })();
      } else {
        handleStepChange(5);
      }
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      handleStepChange(activeStep - 1);
    }
  };

  return (
    <>
      <FormBreadcrumbs formName={config.formName} />

      <Box
        component="form"
        onSubmit={handleSubmit(handleFormSubmit, handleInvalidSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        noValidate
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            {config.formName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Código: {config.formCode}
          </Typography>
        </Box>

        <FormStepperHeader activeStep={activeStep} steps={steps} />

        {hasSubmitErrors && Object.keys(errors).length > 0 && (
          <Alert severity="error" onClose={() => setHasSubmitErrors(false)}>
            Hay campos con errores. Revise el formulario — los campos marcados en
            rojo requieren su atención.
          </Alert>
        )}

        {/* STEP 1: HERRAMIENTA Y ÁREA */}
        {activeStep === 1 && (
          <VerificationFields
            fields={step1Fields}
            control={control}
            errors={errors}
            readonly={readonly}
            setValue={setValue}
            isEditMode={!!initialData}
          />
        )}

        {/* STEP 2: DATOS GENERALES + CANTIDADES */}
        {activeStep === 2 && (
          <>
            <VerificationFields
              fields={step2Fields}
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
          </>
        )}

        {/* STEP 3: INSPECCIÓN / CUERPO */}
        {activeStep === 3 && (
          <>
            {config.alert && <AlertSection config={config.alert} />}

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
          </>
        )}

        {/* STEP 4: FIRMAS Y OBSERVACIONES */}
        {activeStep === 4 && (
          <>
            {config.colorCode && (
              <ColorCodeSection
                config={config.colorCode}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
              />
            )}

            {config.generalObservations?.enabled && (
              <ObservationsSection
                config={config.generalObservations}
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
                config={config.signatures.inspector}
              />
            )}

            {config.signatures?.supervisor &&
              typeof config.signatures.supervisor === "object" &&
              config.signatures.supervisor.enabled && (
              <SupervisorSignature
                register={register}
                control={control}
                errors={errors}
                setValue={setValue}
                config={config.signatures.supervisor}
              />
            )}
          </>
        )}

        {/* STEP 5: VISTA PREVIA Y PDF */}
        {activeStep === 5 && (
          <Step5ReviewSection
            template={template}
            formData={watch()}
            onPrev={handlePrevStep}
            onFinalSubmit={handleSubmit(handleFormSubmit, handleInvalidSubmit)}
            isSubmitting={isSubmitting}
            inspectionId={initialData?._id}
            formType="grouped"
          />
        )}

        {/* STEPPER STEP NAVIGATION BUTTONS (STEPS 1-4) */}
        {activeStep < 5 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 2,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            {activeStep === 1 ? (
              <Button
                variant="outlined"
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (window as any).bypassBeforeUnload = true;
                  router.push("/dashboard/form-herra-equipos");
                }}
              >
                Cancelar
              </Button>
            ) : (
              <Button variant="outlined" onClick={handlePrevStep}>
                Anterior
              </Button>
            )}

            <Box sx={{ display: "flex", gap: 1.5 }}>
              {config.allowDraft !== false && onSaveDraft && (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleSubmit(handleDraftSave)}
                  disabled={isSubmitting}
                >
                  Guardar Borrador
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleNextStep}
                disabled={isSubmitting}
                sx={{
                  background: "linear-gradient(135deg, #6366F1, #818CF8)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                  },
                }}
              >
                Siguiente Sección
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
