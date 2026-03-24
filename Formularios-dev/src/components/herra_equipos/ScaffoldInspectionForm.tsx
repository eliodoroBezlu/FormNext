"use client";

import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Box, Typography, Paper, Chip, Alert } from "@mui/material";
import { FormDataHerraEquipos, FormTemplateHerraEquipos, InspectionStatus } from "./types/IProps";
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
import { ApprovalSection } from "./common/ApprovalSection";
import { PlaylistAddCheck } from "@mui/icons-material";
import { useUserRole } from "@/hooks/useUserRole";

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

  const isNewInspection = !initialData || !initialData.status;

  const [isInProgress, setIsInProgress] = useState(
    initialData?.status === InspectionStatus.IN_PROGRESS
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
    verification: initialData?.verification || {},
    responses: initialData?.responses || {},
    generalObservations: initialData?.generalObservations || "",
    inspectorSignature: initialData?.inspectorSignature || {},
    supervisorSignature: initialData?.supervisorSignature || {},
    scaffold: initialData?.scaffold || {
      routineInspections: [],
      finalConclusion: undefined,
    },
    outOfService: initialData?.outOfService,
    vehicle: initialData?.vehicle,
    selectedItems: initialData?.selectedItems || {},
    status: initialData?.status || InspectionStatus.DRAFT,
  };

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormDataHerraEquipos>({ defaultValues });

  useEffect(() => {
    if (initialData) {
      reset(defaultValues);
      const isProgressing = initialData.status === InspectionStatus.IN_PROGRESS;
      setIsInProgress(isProgressing);
      setFieldsReadonly(isProgressing);
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

  // ============================================
  // LÓGICA DE APROBACIÓN
  // ============================================

  const canApprove = () => {
    if (!config.approval?.enabled) return false;
    if (!config.approval.requiredRoles) return false;

    const hasRequiredRole = config.approval.requiredRoles.some((role) =>
      hasRole(role as "admin" | "supervisor" | "tecnico" | "viewer" | "superintendente")
    );

    if (!hasRequiredRole) return false;

    if (!config.approval.allowSelfApproval) {
      return initialData?.submittedBy !== user?.email;
    }

    return true;
  };

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
  const handleLocalApprove = (comments?: string) => {
    setApprovalDecision({ status: "approved", comments: comments || "" });
  };

  const handleLocalReject = (reason: string) => {
    setApprovalDecision({ status: "rejected", comments: reason });
  };

  // ============================================
  // LÓGICA CENTRAL DE ESTADO
  // Flujo: DRAFT → PENDING_APPROVAL → APPROVED → IN_PROGRESS → COMPLETED
  // ============================================
  const applyApprovalLogic = (
    data: FormDataHerraEquipos,
    intendedStatus: InspectionStatus
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

      // ── Ya está IN_PROGRESS (aprobado) → puede guardar progreso o finalizar
      } else if (initialData?.status === InspectionStatus.IN_PROGRESS) {
        result.status = intendedStatus; // IN_PROGRESS o COMPLETED
        result.requiresApproval = false;

      // ── Mantener estado existente ────────────────────────────────────────
      } else {
        result.status = initialData?.status || InspectionStatus.COMPLETED;
        result.requiresApproval = initialData?.requiresApproval || false;
        result.approval = initialData?.approval;
      }

    } else {
      // Sin aprobación habilitada — flujo directo
      result.status = intendedStatus;
      result.requiresApproval = false;
    }

    return result;
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleFormSubmit = (data: FormDataHerraEquipos) => {
    onSubmit(applyApprovalLogic(data, InspectionStatus.COMPLETED));
  };

  const handleFormSaveDraft = (data: FormDataHerraEquipos) => {
    onSaveDraft?.(applyApprovalLogic(data, InspectionStatus.DRAFT));
  };

  const handleFormSaveProgress = (data: FormDataHerraEquipos) => {
    const progressData = applyApprovalLogic(data, InspectionStatus.IN_PROGRESS);
    if (onSaveProgress) {
      onSaveProgress(progressData);
    } else {
      onSaveDraft?.(progressData);
    }
  };

  const handleFormFinalize = (data: FormDataHerraEquipos) => {
    const finalData = applyApprovalLogic(data, InspectionStatus.COMPLETED);
    if (onFinalize) {
      onFinalize(finalData);
    } else {
      onSubmit(finalData);
    }
  };

  // ============================================
  // HELPERS DE UI
  // ============================================

  const getStatusChip = () => {
    switch (initialData?.status) {
      case InspectionStatus.IN_PROGRESS:
        return <Chip label="EN PROGRESO" color="warning" size="small" icon={<PlaylistAddCheck />} />;
      case InspectionStatus.PENDING_APPROVAL:
        return <Chip label="PENDIENTE APROBACIÓN" color="info" size="small" />;
      case InspectionStatus.APPROVED:
        return <Chip label="APROBADO" color="success" size="small" />;
      case InspectionStatus.REJECTED:
        return <Chip label="RECHAZADO" color="error" size="small" />;
      case InspectionStatus.COMPLETED:
        return <Chip label="COMPLETADO" color="success" size="small" variant="outlined" />;
      default:
        return isNewInspection
          ? <Chip label="NUEVA INSPECCIÓN" color="success" size="small" variant="outlined" />
          : null;
    }
  };

  const getInfoAlert = () => {
    if (initialData?.status === InspectionStatus.PENDING_APPROVAL) {
      return (
        <Alert severity="warning">
          ⏳ <strong>Pendiente de aprobación:</strong> Esta inspección está esperando
          la aprobación de un supervisor para habilitar el andamio.
        </Alert>
      );
    }
    if (initialData?.status === InspectionStatus.REJECTED) {
      return (
        <Alert severity="error">
          ❌ <strong>Inspección rechazada:</strong>{" "}
          {initialData?.approval?.rejectionReason || "Sin motivo especificado"}.
          Corrija los problemas y vuelva a enviar.
        </Alert>
      );
    }
    if (isInProgress) {
      return (
        <Alert severity="info">
          📋 <strong>Modo continuo:</strong> Este andamio está en uso.
          Solo puede agregar inspecciones rutinarias. Los datos iniciales están bloqueados.
        </Alert>
      );
    }
    if (isNewInspection) {
      return (
        <Alert severity="success">
          ✨ <strong>Nueva inspección de andamio</strong><br />
          Complete los datos iniciales.{" "}
          {config.approval?.enabled
            ? "Al enviar, quedará pendiente de aprobación del supervisor antes de habilitar el andamio."
            : "Puede guardar como \"En Progreso\" para continuar agregando inspecciones rutinarias después."}
        </Alert>
      );
    }
    if (config.approval?.enabled && !isViewMode && !initialData) {
      return (
        <Alert severity="info">
          Esta inspección requiere aprobación de un supervisor antes de habilitar el andamio.
        </Alert>
      );
    }
    return null;
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      {/* ── Header ── */}
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={1} flexWrap="wrap">
          <Typography variant="h4">{config.formName}</Typography>
          {getStatusChip()}
        </Box>
        <Typography variant="body2" color="text.secondary">
          Código: {config.formCode}
        </Typography>
      </Box>

      {/* ── Alert informativo según estado ── */}
      {getInfoAlert()}

      {/* ── Verificación ── */}
      <VerificationFields
        fields={template.verificationFields}
        control={control}
        errors={errors}
        readonly={fieldsReadonly || readonly}
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
          readonly={fieldsReadonly || readonly}
        />
      )}

      {/* ── Secciones de preguntas ── */}
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
              readonly={fieldsReadonly || readonly}
            />
          ))}
        </Box>
      )}

      {/* ── Inspecciones Rutinarias ── */}
      {config.routineInspection?.enabled && shouldShowRoutines && (
        <>
          <Box sx={{ borderTop: "2px dashed", borderColor: "warning.main", pt: 3 }}>
            <Typography variant="h6" color="warning.main" gutterBottom>
              📋 Inspecciones Rutinarias Diarias
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Esta sección registra las inspecciones diarias del andamio mientras esté en uso
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

      {/* ── Conclusión final ── */}
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

      {/* ── Firma Inspector ── */}
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

      {/* ── Firma Supervisor — condicional ── */}
      {showSupervisorSignature() && (
        <SupervisorSignature
          register={register}
          control={control}
          errors={errors}
          setValue={setValue}
          config={config.signatures?.supervisor}
          readonly={fieldsReadonly || readonly}
        />
      )}

      {/* ── Sección de Aprobación ── */}
      {shouldShowApprovalSection() && (
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

      {/* ── Botones ── */}
      {!isViewMode && (
        <SaveSubmitButtons
          onSaveDraft={onSaveDraft ? () => handleSubmit(handleFormSaveDraft)() : undefined}
          onSubmit={handleSubmit(handleFormSubmit)}
          onSaveProgress={() => handleSubmit(handleFormSaveProgress)()}
          onFinalize={() => handleSubmit(handleFormFinalize)()}
          isSubmitting={isSubmitting}
          allowDraft={config.allowDraft ?? true}
          isScaffoldForm={true}
          isInProgress={isInProgress}
        />
      )}
    </Box>
  );
}