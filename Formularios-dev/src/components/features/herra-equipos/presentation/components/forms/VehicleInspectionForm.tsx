"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller, FieldErrors } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  Alert,
  Button,
} from "@mui/material";
import {
  FormDataHerraEquipos,
  FormTemplateHerraEquipos,
  InspectionStatus,
} from "../../../types/IProps";
import { getFormConfig } from "../../../config/form-config.helpers";
import { AlertSection } from "../../../common/AlertSection";
import { InspectorSignature } from "../../../common/InspectorSignature";
import { SupervisorSignature } from "../../../common/SupervisorSignature";
import { ObservationsSection } from "../../../common/ObservationsSection";
import { ApprovalSection } from "../../../common/ApprovalSection";
import VehicleDamageSelector, {
  VehicleDamageSelectorRef,
} from "../selectors/VehicleDamageSelector";
import { useUserRole } from "@/hooks/useUserRole";
import { Role } from "@/lib/routePermissions";
import { VerificationFields } from "../renderers/VerificationsFields";
import { SectionRenderer } from "../renderers/SectionRenderer";

// Reusable stepper components
import { FormBreadcrumbs } from "../../../common/FormBreadcrumbs";
import { FormStepperHeader } from "../../../common/FormStepperHeader";
import { Step5ReviewSection } from "../../../common/Step5ReviewSection";
import dayjs from "dayjs";

interface VehicleInspectionFormProps {
  template: FormTemplateHerraEquipos;
  onSubmit: (data: FormDataHerraEquipos) => void;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;
  readonly?: boolean;
  initialData?: FormDataHerraEquipos;
  isViewMode?: boolean;
}



export function VehicleInspectionForm({
  template,
  onSubmit,
  onSaveDraft,
  readonly = false,
  initialData,
  isViewMode = false,
}: VehicleInspectionFormProps) {
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

  // ✅ Estado de decisión de aprobación (igual que StandardInspectionForm)
  const [approvalDecision, setApprovalDecision] = useState<{
    status: "approved" | "rejected" | null;
    comments: string;
  }>({ status: null, comments: "" });

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
  } = useForm<FormDataHerraEquipos>({
    mode: "onTouched",
    defaultValues: {
      verification: {},
      responses: {},
      vehicle: {
        tipoInspeccion: undefined,
        certificacionMSC: undefined,
        damages: [],
        damageObservations: "",
        fechaProximaInspeccion: "",
        responsableProximaInspeccion: "",
        damageImageBase64: "",
      },
      ...initialData,
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
    },
  });

  const vehicleDamageRef = useRef<VehicleDamageSelectorRef>(null);
  const [hasSubmitErrors, setHasSubmitErrors] = useState(false);

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
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

  // ✅ Misma lógica que StandardInspectionForm


  const shouldShowApprovalSection = () => {
    if (!config?.approval?.enabled) return false;
    if (!initialData) return false;

    const approvalStatuses = [
      InspectionStatus.PENDING_APPROVAL,
      InspectionStatus.APPROVED,
      InspectionStatus.REJECTED,
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
      if (initialData.status === "approved") return true;
      if (initialData.status === "pending_approval" && canApprove())
        return true;
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



  const handleApprovalSubmit = () => {
    handleFormSubmit(getValues());
  };

  const handleInvalidSubmit = (errors: FieldErrors<FormDataHerraEquipos>) => {
    console.log(errors);
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

  const handleFormSubmit = async (data: FormDataHerraEquipos) => {
    // Limpiar tempId de damages
    if (data.vehicle?.damages) {
      data.vehicle.damages = data.vehicle.damages.map((damage) => ({
        type: damage.type,
        x: damage.x,
        y: damage.y,
        timestamp: damage.timestamp,
      }));
    }

    // Generar imagen de daños
    if (vehicleDamageRef.current) {
      const damageImage = await vehicleDamageRef.current.generateBase64();
      if (data.vehicle) {
        data.vehicle.damageImageBase64 = damageImage || undefined;
      }
    }

    // ✅ Misma lógica de estado que StandardInspectionForm
    const isNewForm = !initialData || !initialData._id;
    const requiresApproval = config.approval?.enabled === true;

    if (requiresApproval && !isViewMode) {
      if (approvalDecision.status === "approved" && canApprove()) {
        data.status = InspectionStatus.APPROVED;
        data.approval = {
          ...data.approval,
          status: "approved",
          approvedBy: user?.username || "Supervisor",
          approvedAt: new Date().toISOString(),
          supervisorComments: approvalDecision.comments,
        };
      } else if (approvalDecision.status === "rejected" && canApprove()) {
        data.status = InspectionStatus.REJECTED;
        data.approval = {
          ...data.approval,
          status: "rejected",
          approvedBy: user?.username || "Supervisor",
          approvedAt: new Date().toISOString(),
          rejectionReason: approvalDecision.comments,
        };
      } else if (isNewForm) {
        data.status = InspectionStatus.PENDING_APPROVAL;
        data.requiresApproval = true;
        data.approval = { status: "pending" };
      } else {
        data.status = initialData?.status || InspectionStatus.COMPLETED;
        data.requiresApproval = initialData?.requiresApproval || false;
        data.approval = initialData?.approval;
      }
    } else {
      data.status = InspectionStatus.COMPLETED;
      data.requiresApproval = false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).bypassBeforeUnload = true;
    onSubmit(data);
  };

  const handleSaveDraftWithImage = async (data: FormDataHerraEquipos) => {
    if (vehicleDamageRef.current) {
      const damageImage = await vehicleDamageRef.current.generateBase64();
      if (data.vehicle) {
        data.vehicle.damageImageBase64 = damageImage || undefined;
      }
    }
    if (onSaveDraft) {
      onSaveDraft(data);
    }
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
      // Validate step 2 verification + vehicle-specific header inputs
      const step2FieldNames = step2Fields.map((f) => `verification.${f.label}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const step2Valid = await trigger(step2FieldNames as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vehicleValid = await trigger(["vehicle.tipoInspeccion", "vehicle.certificacionMSC"] as any);
      if (step2Valid && vehicleValid) handleStepChange(3);
    } else if (activeStep === 3) {
      // Validate checklist & damages + next inspection date
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responsesValid = await trigger("responses" as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nextInspValid = await trigger(["vehicle.fechaProximaInspeccion", "vehicle.responsableProximaInspeccion"] as any);
      if (responsesValid && nextInspValid) handleStepChange(4);
    } else if (activeStep === 4) {
      const step4FieldNames = [
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
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = await trigger(step4FieldNames as any);
      if (!isValid) return;

      if (onSaveDraft) {
        handleSubmit(async (data) => {
          if (vehicleDamageRef.current) {
            const damageImage = await vehicleDamageRef.current.generateBase64();
            if (data.vehicle) {
              data.vehicle.damageImageBase64 = damageImage || undefined;
            }
          }
          await onSaveDraft(data);
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
        <Box>
          <Typography variant="h4" gutterBottom>
            {config.formName}
          </Typography>
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

        {/* Info aprobación para formularios nuevos */}
        {config.approval?.enabled && !isViewMode && !initialData && (
          <Alert severity="info">
            Esta inspección requiere aprobación de un supervisor antes de ser
            finalizada.
          </Alert>
        )}

        {/* STEP 1: HERRAMIENTA Y ÁREA */}
        {activeStep === 1 && (
          <VerificationFields
            fields={step1Fields}
            control={control}
            errors={errors}
            readonly={readonly || isApprovalReview}
            setValue={setValue}
            isEditMode={!!initialData}
          />
        )}

        {/* STEP 2: DATOS GENERALES + TIPO DE INSPECCIÓN/MSC */}
        {activeStep === 2 && (
          <>
            <VerificationFields
              fields={step2Fields}
              control={control}
              errors={errors}
              readonly={readonly || isApprovalReview}
              setValue={setValue}
              isEditMode={!!initialData}
            />

            {config.vehicle?.hasDamageSelector && (
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  mb: 3,
                  border: "2px solid #1976d2",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <Grid container spacing={3}>
                  {/* TIPO DE INSPECCIÓN */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: "bold",
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        📋 INSPECCIÓN:
                      </Typography>
                      <Controller
                        name="vehicle.tipoInspeccion"
                        control={control}
                        rules={{ required: "Debe seleccionar un tipo de inspección" }}
                        render={({ field }) => (
                          <Box sx={{ display: "flex", gap: 2 }}>
                            {["inicial", "periodica"].map((tipo) => (
                              <FormControlLabel
                                key={tipo}
                                control={
                                  <Checkbox
                                    checked={field.value === tipo}
                                    onChange={() => field.onChange(tipo)}
                                    disabled={readonly}
                                    sx={{ "&.Mui-checked": { color: "#1976d2" } }}
                                  />
                                }
                                label={
                                  <Typography
                                    sx={{ fontWeight: "bold", fontSize: "1rem" }}
                                  >
                                    {tipo === "inicial" ? "INICIAL" : "PERIÓDICA"}
                                  </Typography>
                                }
                                sx={{
                                  border:
                                    field.value === tipo
                                      ? "3px solid #1976d2"
                                      : "2px solid #000",
                                  p: 1.5,
                                  m: 0,
                                  flex: 1,
                                  backgroundColor:
                                    field.value === tipo ? "#e3f2fd" : "#fff",
                                  transition: "all 0.3s ease",
                                  borderRadius: 1,
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      />
                      {errors?.vehicle?.tipoInspeccion && (
                        <Typography
                          color="error"
                          variant="caption"
                          sx={{ mt: 1, display: "block" }}
                        >
                          {errors.vehicle.tipoInspeccion.message}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  {/* CERTIFICACIÓN MSC */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: "bold",
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        ✅ CERTIFICACIÓN MSC:
                      </Typography>
                      <Controller
                        name="vehicle.certificacionMSC"
                        control={control}
                        rules={{ required: "Debe seleccionar una opción" }}
                        render={({ field }) => (
                          <Box sx={{ display: "flex", gap: 2 }}>
                            {[
                              {
                                value: "si",
                                label: "SI",
                                color: "#4caf50",
                                bg: "#e8f5e9",
                              },
                              {
                                value: "no",
                                label: "NO",
                                color: "#f44336",
                                bg: "#ffebee",
                              },
                            ].map((opt) => (
                              <FormControlLabel
                                key={opt.value}
                                control={
                                  <Checkbox
                                    checked={field.value === opt.value}
                                    onChange={() => field.onChange(opt.value)}
                                    disabled={readonly}
                                    sx={{ "&.Mui-checked": { color: opt.color } }}
                                  />
                                }
                                label={
                                  <Typography
                                    sx={{ fontWeight: "bold", fontSize: "1rem" }}
                                  >
                                    {opt.label}
                                  </Typography>
                                }
                                sx={{
                                  border:
                                    field.value === opt.value
                                      ? `3px solid ${opt.color}`
                                      : "2px solid #000",
                                  p: 1.5,
                                  m: 0,
                                  flex: 1,
                                  backgroundColor:
                                    field.value === opt.value ? opt.bg : "#fff",
                                  transition: "all 0.3s ease",
                                  borderRadius: 1,
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      />
                      {errors?.vehicle?.certificacionMSC && (
                        <Typography
                          color="error"
                          variant="caption"
                          sx={{ mt: 1, display: "block" }}
                        >
                          {errors.vehicle.certificacionMSC.message}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </>
        )}

        {/* STEP 3: INSPECCIÓN / MAPA DE DAÑOS */}
        {activeStep === 3 && (
          <>
            {config.alert && <AlertSection config={config.alert} />}

            {/* Secciones */}
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
                    readonly={readonly || isApprovalReview}
                  />
                ))}
              </Box>
            )}

            {/* Selector de daños */}
            {config.vehicle?.hasDamageSelector && (
              <VehicleDamageSelector<FormDataHerraEquipos>
                ref={vehicleDamageRef}
                vehicleImageUrl="/image.png"
                control={control}
                setValue={setValue}
                damageFieldName="vehicle.damages"
                observationsFieldName="vehicle.damageObservations"
                readonly={readonly}
                initialDamages={initialData?.vehicle?.damages}
                initialImage={initialData?.vehicle?.damageImageBase64}
              />
            )}

            {/* Próxima Inspección */}
            {config.vehicle?.hasNextInspectionDate && (
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  mb: 3,
                  border: "2px solid #757575",
                  backgroundColor: "#f5f5f5",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    color: "#424242",
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  📅 Programación de Próxima Inspección
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{
                        backgroundColor: "#e0e0e0",
                        border: "2px solid #000",
                        borderRadius: 1,
                        p: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                          mb: 2,
                          textAlign: "center",
                          color: "#000",
                        }}
                      >
                        FECHA PROXIMA INSPECCIÓN
                      </Typography>
                      <Controller
                        name="vehicle.fechaProximaInspeccion"
                        control={control}
                        rules={{
                          required: "La fecha de próxima inspección es obligatoria",
                        }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            disabled={readonly}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "#fff",
                                "& fieldset": { borderColor: "#000", borderWidth: 2 },
                              },
                              "& input": {
                                fontWeight: "bold",
                                fontSize: "1rem",
                                textAlign: "center",
                                color: "#000",
                              },
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box
                      sx={{
                        backgroundColor: "#e0e0e0",
                        border: "2px solid #000",
                        borderRadius: 1,
                        p: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                          mb: 2,
                          textAlign: "center",
                          color: "#000",
                        }}
                      >
                        RESPONSABLE DE PROX. INSP.
                      </Typography>
                      <Controller
                        name="vehicle.responsableProximaInspeccion"
                        control={control}
                        rules={{
                          required:
                            "El responsable de próxima inspección es obligatorio",
                        }}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            fullWidth
                            placeholder="Ingrese nombre del responsable"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            disabled={readonly}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "#fff",
                                "& fieldset": { borderColor: "#000", borderWidth: 2 },
                              },
                              "& input": {
                                fontWeight: "bold",
                                fontSize: "1rem",
                                color: "#000",
                              },
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                </Grid>
                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    <strong>ℹ️ Información:</strong> Estos datos se utilizan para
                    programar la siguiente inspección del vehículo.
                  </Typography>
                </Alert>
              </Paper>
            )}
          </>
        )}

        {/* STEP 4: FIRMAS Y OBSERVACIONES */}
        {activeStep === 4 && (
          <>
            {/* Conclusión */}
            {config.conclusion?.enabled && (
              <ObservationsSection
                config={config.conclusion}
                register={register}
                errors={errors}
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
              />
            )}

            {/* Aprobación */}
            {shouldShowApprovalSection() && !isApprovalReview && (
              <ApprovalSection
                status={initialData!.status || InspectionStatus.PENDING_APPROVAL}
                approval={initialData!.approval}
                canApprove={canApprove()}
                onApprove={handleLocalApprove}
                onReject={handleLocalReject}
                readonly={
                  initialData!.status === InspectionStatus.APPROVED ||
                  initialData!.status === InspectionStatus.REJECTED
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
                : handleSubmit(handleFormSubmit, handleInvalidSubmit)
            }
            isSubmitting={isSubmitting}
            inspectionId={initialData?._id}
            formType="vehicle"
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
            formType="vehicle"
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
                  onClick={handleSubmit(handleSaveDraftWithImage)}
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
