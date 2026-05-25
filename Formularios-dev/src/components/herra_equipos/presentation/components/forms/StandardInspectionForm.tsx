"use client";

import React, { useState, useEffect } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { Box, Typography, Paper, Alert, Snackbar } from "@mui/material";
import { useUserRole } from "@/hooks/useUserRole";
import {
  FormDataHerraEquipos,
  FormTemplateHerraEquipos,
  SelectableItemConfig,
  Section,
  ResponsesData,
  InspectionStatus,
} from "../../../types/IProps";
import { getFormConfig } from "../../../config/form-config.helpers";
import { AlertSection } from "../../../common/AlertSection";
import { ColorCodeSection } from "../../../common/ColorCodeSection";
import { InspectorSignature } from "../../../common/InspectorSignature";
import { SaveSubmitButtons } from "../../../common/SaveSubmitButtons";
import { SupervisorSignature } from "../../../common/SupervisorSignature";
import { OutOfServiceSection } from "../../../common/OutOfServiceSection";
import { ObservationsSection } from "../../../common/ObservationsSection";
import { ApprovalSection } from "../../../common/ApprovalSection";
import { InspectionStatusChip } from "../../../common/InspectionStatusChip";
import {
  filterSectionsBySelections,
  validateRequiredSelections,
} from "../../../utils/section-utils";
import { DynamicSectionSelector } from "../selectors/DynamicSectionSelector";
import { Role } from "@/lib/routePermissions";
import { VerificationFields } from "../renderers/VerificationsFields";
import { SectionRenderer } from "../renderers/SectionRenderer";

interface StandardInspectionFormProps {
  template: FormTemplateHerraEquipos;
  onSubmit: (data: FormDataHerraEquipos) => void;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;
  onApprove?: (comments?: string) => void;
  onReject?: (reason: string) => void;
  readonly?: boolean;
  initialData?: FormDataHerraEquipos;
  isViewMode?: boolean;
}

export function StandardInspectionForm({
  template,
  onSubmit,
  onSaveDraft,
  readonly = false,
  initialData,
  isViewMode = false,
}: StandardInspectionFormProps) {
  const config = getFormConfig(template.code);
  const { user, hasRole } = useUserRole();

  // ✅ 1. ESTADO NUEVO: Para capturar la decisión del Checkbox de Aprobación
  const [approvalDecision, setApprovalDecision] = useState<{
    status: "approved" | "rejected" | null;
    comments: string;
  }>({ status: null, comments: "" });

  const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>(
    initialData?.selectedItems || {},
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasSubmitErrors, setHasSubmitErrors] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormDataHerraEquipos>({
    defaultValues: initialData,
    mode: "onTouched",
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  useEffect(() => {
    setValue("selectedItems", selectedItems);
  }, [selectedItems, setValue]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!isDirty || readonly) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, readonly]);

  const initDefaults = (
    items: SelectableItemConfig[],
  ): Record<string, string[]> => {
    const defaults: Record<string, string[]> = {};
    items.forEach((item) => {
      if (item.defaultSelected && item.defaultSelected.length > 0) {
        defaults[item.sectionTitle] = item.defaultSelected;
      }
      if (item.nested) {
        Object.assign(defaults, initDefaults(item.nested));
      }
    });
    return defaults;
  };

  const getAllConfigs = (
    items: SelectableItemConfig[],
  ): SelectableItemConfig[] => {
    let allConfigs: SelectableItemConfig[] = [...items];
    items.forEach((item) => {
      if (item.nested) {
        allConfigs = allConfigs.concat(getAllConfigs(item.nested));
      }
    });
    return allConfigs;
  };

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

  useEffect(() => {
    if (
      config?.sectionSelector?.enabled &&
      config.sectionSelector.items &&
      Object.keys(selectedItems).length === 0
    ) {
      const defaultSelections = initDefaults(config.sectionSelector.items);
      setSelectedItems(defaultSelections);
    }
  }, [config?.sectionSelector?.enabled]);

  const ensureAllBooleanFields = (
    data: FormDataHerraEquipos,
    sections: Section[],
  ): FormDataHerraEquipos => {
    const result = { ...data };
    if (!result.responses) {
      result.responses = {};
    }

    const processSections = (secs: Section[], path: string) => {
      secs.forEach((section, sIdx) => {
        const sectionKey = `section_${sIdx}`;
        const fullPath = path ? `${path}.${sectionKey}` : sectionKey;
        const pathParts = fullPath.split(".");
        let currentLevel: ResponsesData = result.responses!;

        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!currentLevel[pathParts[i]]) {
            currentLevel[pathParts[i]] = {};
          }
          currentLevel = currentLevel[pathParts[i]] as unknown as ResponsesData;
        }

        const finalKey = pathParts[pathParts.length - 1];
        if (!currentLevel[finalKey]) {
          currentLevel[finalKey] = {};
        }

        const sectionData = currentLevel[finalKey];

        if (!section.isParent && section.questions) {
          section.questions.forEach((question, qIdx) => {
            if (question.responseConfig.type === "boolean") {
              const questionKey = `q${qIdx}`;
              if (!sectionData[questionKey]) {
                sectionData[questionKey] = {
                  value: false,
                  description: "",
                  observacion: "",
                };
              }
            }
          });
        }

        if (section.subsections && section.subsections.length > 0) {
          processSections(section.subsections, fullPath);
        }
      });
    };

    processSections(sections, "");
    return result;
  };

  if (!config) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography color="error">
          Configuración no encontrada para {template.code}
        </Typography>
      </Paper>
    );
  }

  const canApprove = () => {
    if (!config.approval?.enabled) return false;
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

  const handleSelectionChange = (path: string, selected: string[]) => {
    setSelectedItems((prev) => ({
      ...prev,
      [path]: selected,
    }));
  };

  const visibleSections = config.sectionSelector?.enabled
    ? filterSectionsBySelections(template.sections, selectedItems)
    : template.sections;

  // true when a supervisor is reviewing a pending-approval form
  const isApprovalReview =
    !isViewMode &&
    initialData?.status === InspectionStatus.PENDING_APPROVAL &&
    canApprove();

  // Bypass RHF validation for approval actions — inspector data is already submitted
  const handleApprovalSubmit = () => {
    handleFormSubmit(getValues());
  };

  // ✅ 2. INTERCEPTORES DE APROBACIÓN (Guardar decisión localmente)
  const handleLocalApprove = (comments?: string) => {
    setApprovalDecision({ status: "approved", comments: comments || "" });
  };

  const handleLocalReject = (reason: string) => {
    setApprovalDecision({ status: "rejected", comments: reason });
  };

  // ✅ 3. LÓGICA DE ENVÍO MODIFICADA
  const handleFormSubmit = (data: FormDataHerraEquipos) => {
    if (config.sectionSelector?.enabled && config.sectionSelector.items) {
      const allConfigs = getAllConfigs(config.sectionSelector.items);
      const validation = validateRequiredSelections(selectedItems, allConfigs);
      if (!validation.valid) {
        setValidationError(
          `Debe seleccionar al menos un item en: ${validation.missing.join(", ")}`,
        );
        return;
      }
    }

    setHasSubmitErrors(false);
    const completeData = ensureAllBooleanFields(data, template.sections);
    const isNewForm = !initialData || !initialData._id;
    const requiresApproval = config.approval?.enabled === true;

    if (requiresApproval && !isViewMode) {
      if (approvalDecision.status === "approved" && canApprove()) {
        completeData.status = InspectionStatus.APPROVED;
        completeData.approval = {
          ...completeData.approval,
          status: "approved",
          approvedBy: user?.username || "Supervisor",
          approvedAt: new Date().toISOString(),
          supervisorComments: approvalDecision.comments,
        };
      } else if (approvalDecision.status === "rejected" && canApprove()) {
        completeData.status = InspectionStatus.REJECTED;
        completeData.approval = {
          ...completeData.approval,
          status: "rejected",
          approvedBy: user?.username || "Supervisor",
          approvedAt: new Date().toISOString(),
          rejectionReason: approvalDecision.comments,
        };
      } else if (isNewForm) {
        completeData.status = InspectionStatus.PENDING_APPROVAL;
        completeData.requiresApproval = true;
        completeData.approval = { status: "pending" };
      } else {
        completeData.status = initialData?.status || InspectionStatus.COMPLETED;
        completeData.requiresApproval = initialData?.requiresApproval || false;
        completeData.approval = initialData?.approval;
      }
    } else {
      completeData.status = InspectionStatus.COMPLETED;
      completeData.requiresApproval = false;
    }

    onSubmit(completeData);
  };

  // Scroll to first invalid field when submission fails validation
  const handleInvalidSubmit = (errors: FieldErrors<FormDataHerraEquipos>) => {
    setHasSubmitErrors(true);
    console.log("errors", errors);
    // Double rAF: first frame commits React's state update, second frame commits the DOM paint
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

  const handleDraftSave = (data: FormDataHerraEquipos) => {
    if (onSaveDraft) {
      const completeData = ensureAllBooleanFields(data, template.sections);
      completeData.status = InspectionStatus.DRAFT;
      onSaveDraft(completeData);
    }
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
      if (initialData.status === "pending_approval" && canApprove()) {
        return true;
      }
    }
    return false;
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit(handleFormSubmit, handleInvalidSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        noValidate
      >
        {/* Page header — form identity + live status */}
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={600}
              gutterBottom
              sx={{ mb: 0.5 }}
            >
              {config.formName}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              fontFamily="monospace"
            >
              {config.formCode}
            </Typography>
          </Box>
          {initialData?.status && (
            <InspectionStatusChip status={initialData.status} size="medium" />
          )}
        </Box>

        {hasSubmitErrors && Object.keys(errors).length > 0 && (
          <Alert severity="error" onClose={() => setHasSubmitErrors(false)}>
            Hay campos con errores. Revise el formulario — los campos marcados
            en rojo requieren su atención.
          </Alert>
        )}

        {config.approval?.enabled && !isViewMode && !initialData && (
          <Alert severity="info">
            Esta inspección requiere aprobación de un supervisor antes de ser
            finalizada.
          </Alert>
        )}

        <VerificationFields
          fields={template.verificationFields}
          control={control}
          errors={errors}
          readonly={readonly || isApprovalReview}
          setValue={setValue}
          isEditMode={!!initialData}
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

        {config.outOfService?.enabled && (
          <Box>
            <OutOfServiceSection
              config={config.outOfService}
              register={register}
              control={control}
              errors={errors}
              readonly={readonly}
              section="header"
            />
          </Box>
        )}

        {config.sectionSelector?.enabled &&
          config.sectionSelector.items &&
          !readonly && (
            <Box>
              {config.sectionSelector.items.map((itemConfig, idx) => (
                <DynamicSectionSelector
                  key={idx}
                  sections={template.sections}
                  config={itemConfig}
                  selectedItems={selectedItems}
                  onSelectionChange={handleSelectionChange}
                  readonly={readonly}
                />
              ))}
            </Box>
          )}

        {visibleSections.length > 0 && (
          <Box>
            {visibleSections.map((section, idx) => {
              const originalIndex = template.sections.findIndex(
                (s) => s._id === section._id || s.title === section.title,
              );

              return (
                <SectionRenderer
                  key={section._id || idx}
                  section={section}
                  sectionPath={`responses.section_${originalIndex}`}
                  control={control}
                  errors={errors}
                  formConfig={config}
                  readonly={readonly || isApprovalReview}
                />
              );
            })}
          </Box>
        )}

        {config.outOfService?.enabled && (
          <Box>
            <OutOfServiceSection
              config={config.outOfService}
              register={register}
              control={control}
              errors={errors}
              readonly={readonly}
              section="footer"
            />
          </Box>
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

        {showSupervisorSignature() && (
          <SupervisorSignature
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
            config={config.signatures?.supervisor}
          />
        )}

        {shouldShowApprovalSection() && (
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

        {!isViewMode && (
          <SaveSubmitButtons
            onSaveDraft={
              onSaveDraft ? () => handleSubmit(handleDraftSave)() : undefined
            }
            onSubmit={
              isApprovalReview
                ? handleApprovalSubmit
                : handleSubmit(handleFormSubmit, handleInvalidSubmit)
            }
            isSubmitting={isSubmitting}
            allowDraft={config.allowDraft ?? true}
            approvalAction={
              initialData?.status === InspectionStatus.PENDING_APPROVAL
                ? approvalDecision.status === "approved"
                  ? "approve"
                  : approvalDecision.status === "rejected"
                    ? "reject"
                    : null
                : undefined
            }
          />
        )}
      </Box>

      <Snackbar
        open={!!validationError}
        autoHideDuration={6000}
        onClose={() => setValidationError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="warning"
          onClose={() => setValidationError(null)}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {validationError}
        </Alert>
      </Snackbar>
    </>
  );
}
