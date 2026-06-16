"use client";

import React, { useEffect, useState } from "react";
import { Controller, useForm, FieldErrors } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Typography, Paper, Alert, Button, Chip } from "@mui/material";
import {
  FormDataHerraEquipos,
  FormTemplateHerraEquipos,
  InspectionStatus,
} from "../../../types/IProps";
import { getFormConfig } from "../../../config/form-config.helpers";
import { AlertSection } from "../../../common/AlertSection";
import { ColorCodeSection } from "../../../common/ColorCodeSection";
import { InspectorSignature } from "../../../common/InspectorSignature";
import { SupervisorSignature } from "../../../common/SupervisorSignature";
import { OutOfServiceSection } from "../../../common/OutOfServiceSection";
import { ObservationsSection } from "../../../common/ObservationsSection";
import { RoutineInspectionSection } from "./RoutineInspectionSection";
import { ScaffoldConclusionSection } from "./ScaffoldConclusionSection";
import { ApprovalSection } from "../../../common/ApprovalSection";
import { useUserRole } from "@/hooks/useUserRole";
import { Role } from "@/lib/routePermissions";
import { VerificationFields } from "../renderers/VerificationsFields";
import { SectionRenderer } from "../renderers/SectionRenderer";

// Reusable stepper components
import { FormBreadcrumbs } from "../../../common/FormBreadcrumbs";
import { FormStepperHeader } from "../../../common/FormStepperHeader";
import { Step5ReviewSection } from "../../../common/Step5ReviewSection";
import dayjs from "dayjs";

interface ScaffoldInspectionFormProps {
  template: FormTemplateHerraEquipos;
  onSubmit: (data: FormDataHerraEquipos) => void;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;
  onSaveProgress?: (data: FormDataHerraEquipos) => void;
  onFinalize?: (data: FormDataHerraEquipos) => void;
  initialData?: FormDataHerraEquipos;
  readonly?: boolean;
  isViewMode?: boolean;
}



export function ScaffoldInspectionForm({
  template,
  onSubmit,
  onSaveDraft,
  onSaveProgress,
  onFinalize,
  initialData,
  readonly = false,
  isViewMode = false,
}: ScaffoldInspectionFormProps) {
  const config = getFormConfig(template.code);
  const { user, hasRole } = useUserRole();
  const router = useRouter();
  const searchParams = useSearchParams();

  const canApprove = () => {
    if (!config?.approval?.enabled) return false;
    if (!config.approval.requiredRoles) return false;

    const hasRequiredRole = config.approval.requiredRoles.some((role) =>
      hasRole(
        role as
          | Role.ADMIN
          | Role.SUPERVISOR
          | Role.TECNICO
          | Role.SUPERINTENDENTE,
      ),
    );

    if (!hasRequiredRole) return false;

    if (!config.approval.allowSelfApproval) {
      return initialData?.submittedBy !== user?.email;
    }

    return true;
  };

  const isApprovalReview =
    !isViewMode &&
    initialData?.status === InspectionStatus.PENDING_APPROVAL &&
    canApprove();

  const formSteps = isApprovalReview
    ? [
        { label: "Herramienta y Área" },
        { label: "Datos Generales" },
        { label: "Inspección" },
        { label: "Firmas y Observaciones" },
        { label: "Revisión Final" },
        { label: "Aprobación" },
      ]
    : [
        { label: "Herramienta y Área" },
        { label: "Datos Generales" },
        { label: "Inspección" },
        { label: "Firmas y Observaciones" },
        { label: "Revisión Final" },
      ];

  // Active step state read from search query parameter
  const initialStep = isApprovalReview ? 6 : parseInt(searchParams.get("step") || "1", 10);
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

  const isNewInspection = !initialData || !initialData.status;

  const [isInProgress, setIsInProgress] = useState(
    initialData?.status === InspectionStatus.IN_PROGRESS,
  );
  const [fieldsReadonly, setFieldsReadonly] = useState(isInProgress);

  // ✅ Estado de decisión de aprobación
  const [approvalDecision, setApprovalDecision] = useState<{
    status: "approved" | "rejected" | null;
    comments: string;
  }>({ status: null, comments: "" });

  const shouldShowRoutines =
    !isNewInspection ||
    (initialData?.scaffold?.routineInspections?.length || 0) > 0;

  const defaultValues: FormDataHerraEquipos = {
    ...initialData,
    verification: initialData?.verification || {},
    responses: initialData?.responses || {},
    generalObservations: initialData?.generalObservations || "",
    scaffold: initialData?.scaffold || {
      routineInspections: [],
      finalConclusion: undefined,
    },
    selectedItems: initialData?.selectedItems || {},
    status: initialData?.status || InspectionStatus.DRAFT,
    inspectorSignature: {
      name: "",
      signature: "",
      inspectorName: "",
      inspectorSignature: "",
      inspectionDate: dayjs().format("YYYY-MM-DD"),
      ...initialData?.inspectorSignature,
    },
    supervisorSignature: {
      supervisorName: "",
      supervisorSignature: "",
      supervisorDate: dayjs().format("YYYY-MM-DD"),
      ...initialData?.supervisorSignature,
    },
  };

  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormDataHerraEquipos>({ defaultValues, mode: "onTouched" });

  const [hasSubmitErrors, setHasSubmitErrors] = useState(false);

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        verification: initialData.verification || {},
        responses: initialData.responses || {},
        generalObservations: initialData.generalObservations || "",
        scaffold: initialData.scaffold || {
          routineInspections: [],
          finalConclusion: undefined,
        },
        selectedItems: initialData.selectedItems || {},
        status: initialData.status || InspectionStatus.DRAFT,
        inspectorSignature: {
          name: "",
          signature: "",
          inspectorName: "",
          inspectorSignature: "",
          inspectionDate: dayjs().format("YYYY-MM-DD"),
          ...initialData.inspectorSignature,
        },
        supervisorSignature: {
          supervisorName: "",
          supervisorSignature: "",
          supervisorDate: dayjs().format("YYYY-MM-DD"),
          ...initialData.supervisorSignature,
        },
      });
      const isProgressing = initialData.status === InspectionStatus.IN_PROGRESS;
      setIsInProgress(isProgressing);
      setFieldsReadonly(isProgressing);
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (!isDirty || fieldsReadonly || readonly) return;
    const handler = (e: BeforeUnloadEvent) => {
      if ((window as Window & { bypassBeforeUnload?: boolean }).bypassBeforeUnload) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, fieldsReadonly, readonly]);

  if (!config) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography color="error">
          Configuración no encontrada para {template.code}
        </Typography>
      </Paper>
    );
  }

  // ============================================
  // LÓGICA DE APROBACIÓN
  // ============================================



  const shouldShowApprovalSection = () => {
    if (!config?.approval?.enabled) return false;
    if (!initialData) return false;

    // ✅ Incluye IN_PROGRESS para que el supervisor pueda ver el estado aprobado
    const approvalStatuses = [
      InspectionStatus.PENDING_APPROVAL,
      InspectionStatus.APPROVED,
      InspectionStatus.REJECTED,
      InspectionStatus.IN_PROGRESS,
    ];

    return approvalStatuses.includes(initialData.status as InspectionStatus);
  };

  const showSupervisorSignature = () => {
    if (
      !config.signatures ||
      typeof config.signatures.supervisor !== "object" ||
      !config.signatures.supervisor.enabled
    ) {
      return false;
    }
    if (isViewMode) return true;
    if (!config.approval?.enabled) return true;

    if (initialData) {
      if (initialData.status === InspectionStatus.APPROVED) return true;
      if (initialData.status === InspectionStatus.IN_PROGRESS) return true;
      if (initialData.status === InspectionStatus.COMPLETED) return true;
      if (
        initialData.status === InspectionStatus.PENDING_APPROVAL &&
        canApprove()
      ) {
        return true;
      }
    }
    return false;
  };

  // ✅ Interceptores locales de aprobación
  const handleLocalApprove = (comments?: string | null) => {
    if (comments === null) {
      setApprovalDecision({ status: null, comments: "" });
    } else {
      setApprovalDecision({ status: "approved", comments: comments || "" });
    }
  };

  const handleLocalReject = (reason: string | null) => {
    if (reason === null) {
      setApprovalDecision({ status: null, comments: "" });
    } else {
      setApprovalDecision({ status: "rejected", comments: reason });
    }
  };

  // ============================================
  // LÓGICA CENTRAL DE ESTADO
  // Flujo: DRAFT → PENDING_APPROVAL → APPROVED → IN_PROGRESS → COMPLETED
  // ============================================
  const applyApprovalLogic = (
    data: FormDataHerraEquipos,
    intendedStatus: InspectionStatus,
  ): FormDataHerraEquipos => {
    const result = { ...data };
    const requiresApproval = config.approval?.enabled === true;
    const isNewForm = !initialData || !initialData._id;

    // DRAFT siempre pasa directo, sin aprobación
    if (intendedStatus === InspectionStatus.DRAFT) {
      result.status = InspectionStatus.DRAFT;
      return result;
    }

    if (requiresApproval && !isViewMode) {
      // ── Supervisor aprueba → andamio pasa a IN_PROGRESS ─────────────────
      if (approvalDecision.status === "approved" && canApprove()) {
        result.status = InspectionStatus.IN_PROGRESS;
        result.requiresApproval = false;
        result.approval = {
          ...result.approval,
          status: "approved",
          approvedBy: user?.username || "Supervisor",
          approvedAt: new Date().toISOString(),
          supervisorComments: approvalDecision.comments,
        };

        // ── Supervisor rechaza ───────────────────────────────────────────────
      } else if (approvalDecision.status === "rejected" && canApprove()) {
        result.status = InspectionStatus.REJECTED;
        result.approval = {
          ...result.approval,
          status: "rejected",
          approvedBy: user?.username || "Supervisor",
          approvedAt: new Date().toISOString(),
          rejectionReason: approvalDecision.comments,
        };

        // ── Nuevo formulario → espera aprobación ────────────────────────────
      } else if (isNewForm) {
        result.status = InspectionStatus.PENDING_APPROVAL;
        result.requiresApproval = true;
        result.approval = { status: "pending" };
      } else {
        // En progreso o ya finalizado
        result.status = initialData?.status || InspectionStatus.IN_PROGRESS;
        result.requiresApproval = initialData?.requiresApproval ?? false;
        result.approval = initialData?.approval;
      }
    } else {
      // Sin flujo de aprobación (va directo a IN_PROGRESS si es scaffold, para permitir diario)
      result.status =
        intendedStatus === InspectionStatus.COMPLETED
          ? InspectionStatus.COMPLETED
          : InspectionStatus.IN_PROGRESS;
      result.requiresApproval = false;
    }

    return result;
  };

  const handleFormSubmit = (data: FormDataHerraEquipos) => {
    setHasSubmitErrors(false);
    const resolvedData = applyApprovalLogic(data, InspectionStatus.IN_PROGRESS);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).bypassBeforeUnload = true;
    onSubmit(resolvedData);
  };

  const handleFormSaveProgress = (data: FormDataHerraEquipos) => {
    if (onSaveProgress) {
      const resolvedData = applyApprovalLogic(
        data,
        InspectionStatus.IN_PROGRESS,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).bypassBeforeUnload = true;
      onSaveProgress(resolvedData);
    }
  };

  const handleFormFinalize = (data: FormDataHerraEquipos) => {
    if (onFinalize) {
      const resolvedData = applyApprovalLogic(data, InspectionStatus.COMPLETED);
      resolvedData.status = InspectionStatus.COMPLETED;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).bypassBeforeUnload = true;
      onFinalize(resolvedData);
    }
  };

  const handleFormSaveDraft = (data: FormDataHerraEquipos) => {
    if (onSaveDraft) {
      const resolvedData = applyApprovalLogic(data, InspectionStatus.DRAFT);
      onSaveDraft(resolvedData);
    }
  };

  const handleInvalidSubmit = (errors: FieldErrors<FormDataHerraEquipos>) => {
    setHasSubmitErrors(true);
    console.log("errors", errors);
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



  const handleApprovalSubmit = () => {
    handleFormSubmit(getValues());
  };

  const getStatusChip = () => {
    if (isNewInspection) return null;
    return (
      <Chip
        label={
          initialData?.status === "in_progress"
            ? "EN PROGRESO"
            : (initialData?.status || "").toUpperCase()
        }
        color={
          initialData?.status === "approved"
            ? "success"
            : initialData?.status === "in_progress"
              ? "warning"
              : "default"
        }
      />
    );
  };

  const getInfoAlert = () => {
    if (isNewInspection) {
      return (
        <Alert severity="success">
          ✨ <strong>Nueva inspección de andamio</strong>
          <br />
          Complete los datos iniciales.{" "}
          {config.approval?.enabled
            ? "Al enviar, quedará pendiente de aprobación del supervisor antes de habilitar el andamio."
            : 'Puede guardar como "En Progreso" para continuar agregando inspecciones rutinarias después.'}
        </Alert>
      );
    }
    if (config.approval?.enabled && !isViewMode && !initialData) {
      return (
        <Alert severity="info">
          Esta inspección requiere aprobación de un supervisor antes de
          habilitar el andamio.
        </Alert>
      );
    }
    return null;
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
      const step2FieldNames = step2Fields.map((f) => `verification.${f.label}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = await trigger(step2FieldNames as any);
      if (isValid) handleStepChange(3);
    } else if (activeStep === 3) {
      // Validate checklist & daily routines
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responsesValid = await trigger("responses" as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const routinesValid = await trigger("scaffold.routineInspections" as any);
      if (responsesValid && routinesValid) handleStepChange(4);
    } else if (activeStep === 4) {
      // Validate signatures / observations / final scaffold conclusion
      const step4FieldNames = [
        "generalObservations",
        "inspectorSignature.inspectorName",
        "inspectorSignature.name",
        "inspectorSignature.inspectorSignature",
        "inspectorSignature.signature",
        "inspectorSignature.signatureBase64",
        "supervisorSignature.supervisorName",
        "supervisorSignature.name",
        "supervisorSignature.supervisorSignature",
        "supervisorSignature.signature",
        "supervisorSignature.signatureBase64",
        "scaffold.finalConclusion",
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = await trigger(step4FieldNames as any);
      if (!isValid) return;

      if (onSaveDraft) {
        handleSubmit(async (data) => {
          const resolvedData = applyApprovalLogic(data, InspectionStatus.DRAFT);
          await onSaveDraft(resolvedData);
          if (initialData?._id) {
            handleStepChange(5);
          }
        })();
      } else {
        handleStepChange(5);
      }
    } else if (activeStep === 5) {
      handleStepChange(6);
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
        {/* ── Header ── */}
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={1} flexWrap="wrap">
            <Typography variant="h5" fontWeight={600}>{config.formName}</Typography>
            {getStatusChip()}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Código: {config.formCode}
          </Typography>
        </Box>

        <FormStepperHeader activeStep={activeStep} steps={formSteps} />

        {hasSubmitErrors && Object.keys(errors).length > 0 && (
          <Alert severity="error" onClose={() => setHasSubmitErrors(false)}>
            Hay campos con errores. Revise el formulario — los campos marcados en
            rojo requieren su atención.
          </Alert>
        )}

        {/* ── Alert informativo según estado ── */}
        {activeStep < 5 && getInfoAlert()}

        {/* STEP 1: HERRAMIENTA Y ÁREA */}
        {activeStep === 1 && (
          <VerificationFields
            fields={step1Fields}
            control={control}
            errors={errors}
            readonly={fieldsReadonly || readonly || isApprovalReview}
            setValue={setValue}
            isEditMode={!!initialData}
          />
        )}

        {/* STEP 2: DATOS GENERALES */}
        {activeStep === 2 && (
          <VerificationFields
            fields={step2Fields}
            control={control}
            errors={errors}
            readonly={fieldsReadonly || readonly || isApprovalReview}
            setValue={setValue}
            isEditMode={!!initialData}
          />
        )}

        {/* STEP 3: INSPECCIÓN / RUTINAS */}
        {activeStep === 3 && (
          <>
            {config.alert && <AlertSection config={config.alert} />}

            {config.colorCode && (
              <ColorCodeSection
                config={config.colorCode}
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                readonly={fieldsReadonly || readonly}
              />
            )}

            {/* Secciones de preguntas */}
            {template.sections && template.sections.length > 0 && (
              <Box>
                {template.sections.map((section, idx) => (
                  <SectionRenderer
                    key={section._id || idx}
                    section={section}
                    sectionPath={`responses.section_${idx}`}
                    control={control}
                    errors={errors}
                    formConfig={config}
                    readonly={fieldsReadonly || readonly || isApprovalReview}
                  />
                ))}
              </Box>
            )}

            {/* Inspecciones Rutinarias */}
            {config.routineInspection?.enabled && shouldShowRoutines && (
              <>
                <Box
                  sx={{ borderTop: "2px dashed", borderColor: "warning.main", pt: 3 }}
                >
                  <Typography variant="h6" color="warning.main" gutterBottom>
                    📋 Inspecciones Rutinarias Diarias
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Esta sección registra las inspecciones diarias del andamio
                    mientras esté en uso
                  </Typography>
                </Box>

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
              </>
            )}
          </>
        )}

        {/* STEP 4: CONCLUSIÓN, OBSERVACIONES Y FIRMAS */}
        {activeStep === 4 && (
          <>
            {/* Conclusión final */}
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
                    readonly={fieldsReadonly || readonly}
                  />
                )}
              />
            )}

            {config.generalObservations?.enabled && (
              <ObservationsSection
                config={config.generalObservations}
                register={register}
                errors={errors}
                readonly={fieldsReadonly || readonly}
              />
            )}

            {config.outOfService?.enabled && (
              <OutOfServiceSection
                config={config.outOfService}
                register={register}
                errors={errors}
                readonly={fieldsReadonly || readonly}
                section="header"
                control={control}
              />
            )}

            {/* Firma Inspector */}
            {config.signatures?.inspector && (
              <InspectorSignature
                register={register}
                control={control}
                errors={errors}
                setValue={setValue}
                config={config.signatures.inspector}
                readonly={fieldsReadonly || readonly}
              />
            )}

            {/* Firma Supervisor */}
            {showSupervisorSignature() && !isApprovalReview && (
              <SupervisorSignature
                register={register}
                control={control}
                errors={errors}
                setValue={setValue}
                config={config.signatures?.supervisor}
                readonly={fieldsReadonly || readonly}
              />
            )}

            {/* Sección de Aprobación */}
            {shouldShowApprovalSection() && !isApprovalReview && (
              <ApprovalSection
                status={initialData!.status || InspectionStatus.PENDING_APPROVAL}
                approval={initialData!.approval}
                canApprove={canApprove()}
                onApprove={handleLocalApprove}
                onReject={handleLocalReject}
                readonly={
                  readonly ||
                  initialData!.status === InspectionStatus.APPROVED ||
                  initialData!.status === InspectionStatus.IN_PROGRESS ||
                  initialData!.status === InspectionStatus.REJECTED ||
                  initialData!.status === InspectionStatus.COMPLETED
                }
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
            onFinalSubmit={
              isApprovalReview
                ? handleNextStep
                : isInProgress
                  ? () => handleSubmit(handleFormFinalize, handleInvalidSubmit)()
                  : handleSubmit(handleFormSubmit, handleInvalidSubmit)
            }
            isSubmitting={isSubmitting}
            inspectionId={initialData?._id}
            formType="scaffold"
            isApprovalReview={isApprovalReview}
            showApprovalInputs={false}
          />
        )}

        {/* STEP 6: APROBACIÓN */}
        {activeStep === 6 && (
          <Step5ReviewSection
            template={template}
            formData={watch()}
            onPrev={handlePrevStep}
            onFinalSubmit={handleApprovalSubmit}
            isSubmitting={isSubmitting}
            inspectionId={initialData?._id}
            formType="scaffold"
            isApprovalReview={isApprovalReview}
            showApprovalInputs={true}
            register={register}
            control={control}
            setValue={setValue}
            errors={errors}
            onApprove={handleLocalApprove}
            onReject={handleLocalReject}
            isSubmitDisabled={!approvalDecision.status}
          />
        )}

        {/* STEPPER STEP NAVIGATION BUTTONS (STEPS 1-4) */}
        {activeStep < 5 && (
          <Box
            className="save-submit-buttons"
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
                  onClick={handleSubmit(handleFormSaveDraft)}
                  disabled={isSubmitting}
                >
                  Guardar Borrador
                </Button>
              )}

              {/* Botón de "Guardar en Progreso" exclusivo para scaffolds */}
              {!isInProgress && !isViewMode && onSaveProgress && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => handleSubmit(handleFormSaveProgress)()}
                  disabled={isSubmitting}
                >
                  Guardar en Progreso
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
