"use client";

import React, { useState, useEffect } from "react";
import { useForm, useWatch, FieldErrors, Path } from "react-hook-form";
import { useUserRole } from "@/hooks/useUserRole";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import {
  FormDataHerraEquipos,
  FormTemplateHerraEquipos,
  SelectableItemConfig,
  Section,
  ResponsesData,
  InspectionStatus,
  isEquipmentCodeField,
  isAreaField,
  rebuildVerification,
  verificationFieldPath,
  sanitizeVerificationObject,
  TEMPLATE_EQUIPMENT_MAP,
  FormFeatureConfig,
} from "../../types/IProps";
import { getFormConfig } from "../../config/form-config.helpers";
import {
  filterSectionsBySelections,
  validateRequiredSelections,
} from "../../utils/section-utils";
import { Role } from "@/lib/routePermissions";
import { EquipoBackend } from "@/lib/actions/equipo-actions";

export interface StandardInspectionFormProps {
  template: FormTemplateHerraEquipos;
  onSubmit: (data: FormDataHerraEquipos) => void;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;
  onApprove?: (comments?: string) => void;
  onReject?: (reason: string) => void;
  readonly?: boolean;
  initialData?: FormDataHerraEquipos;
  isViewMode?: boolean;
  startStep?: number;
  equipos?: EquipoBackend[];
  areas?: string[];
}

const initDefaults = (
  items: SelectableItemConfig[],
): Record<string, string[]> => {
  const defaults: Record<string, string[]> = {};
  items.forEach((item) => {
    defaults[item.sectionTitle] = item.defaultSelected || [];
    if (item.nested) {
      Object.assign(defaults, initDefaults(item.nested));
    }
  });
  return defaults;
};

/**
 * Sin configuración de template no hay nada que renderizar
 * (el componente muestra un Paper de error en este caso).
 */
interface UseStandardInspectionFormMissingConfig {
  config: null;
}

interface UseStandardInspectionFormResult {
  config: FormFeatureConfig;
  currentViewMode: boolean;
  isApprovalReview: boolean;
  formSteps: { label: string }[];
  activeStep: number;
  approvalDecision: { status: "approved" | "rejected" | null; comments: string };
  selectedItems: Record<string, string[]>;
  validationError: string | null;
  setValidationError: React.Dispatch<React.SetStateAction<string | null>>;
  hasSubmitErrors: boolean;
  setHasSubmitErrors: React.Dispatch<React.SetStateAction<boolean>>;
  control: ReturnType<typeof useForm<FormDataHerraEquipos>>["control"];
  register: ReturnType<typeof useForm<FormDataHerraEquipos>>["register"];
  handleSubmit: ReturnType<typeof useForm<FormDataHerraEquipos>>["handleSubmit"];
  getValues: ReturnType<typeof useForm<FormDataHerraEquipos>>["getValues"];
  setValue: ReturnType<typeof useForm<FormDataHerraEquipos>>["setValue"];
  watch: ReturnType<typeof useForm<FormDataHerraEquipos>>["watch"];
  errors: FieldErrors<FormDataHerraEquipos>;
  isSubmitting: boolean;
  user: ReturnType<typeof useUserRole>["user"];
  router: ReturnType<typeof useRouter>;
  canApprove: () => boolean;
  handleSelectionChange: (path: string, selected: string[]) => void;
  visibleSections: Section[];
  handleApprovalSubmit: () => void;
  handleLocalApprove: (comments?: string | null) => void;
  handleLocalReject: (reason: string | null) => void;
  handleFormSubmit: (data: FormDataHerraEquipos) => void;
  handleInvalidSubmit: (errors: FieldErrors<FormDataHerraEquipos>) => void;
  handleDraftSave: (data: FormDataHerraEquipos) => void;
  showSupervisorSignature: () => boolean;
  shouldShowApprovalSection: () => boolean;
  step1Fields: FormTemplateHerraEquipos["verificationFields"];
  hasEquipmentSelection: boolean;
  handleNextStep: () => Promise<void>;
  handlePrevStep: () => void;
  handleStepChange: (newStep: number) => void;
}

/**
 * Orquesta todo el estado y la lógica de negocio (no-render) del formulario
 * estándar de inspección de herra-equipos: configuración por template,
 * flujo de pasos (stepper), validaciones de aprobación, autoguardado de
 * borrador y transformación de datos previa al envío.
 *
 * El componente `StandardInspectionForm` sólo debe encargarse del JSX,
 * consumiendo los valores y handlers que expone este hook.
 *
 * ⚠️ Zona sensible: la reconstrucción de `verification` (rebuildVerification)
 * y la visibilidad condicional del stepper (isViewMode / isApprovalReview)
 * fueron corregidas recientemente — no alterar su comportamiento.
 */
export function useStandardInspectionForm({
  template,
  onSubmit,
  onSaveDraft,
  readonly = false,
  initialData,
  isViewMode = false,
  startStep,
}: StandardInspectionFormProps):
  | UseStandardInspectionFormMissingConfig
  | UseStandardInspectionFormResult {
  const config = getFormConfig(template.code);
  const { user, hasRole } = useUserRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Leer si estamos en modo vista desde la URL
  const isViewModeUrl = searchParams.get("mode") === "view";

  // Usar cualquiera de los dos (por prop o por URL)
  const currentViewMode = isViewMode || isViewModeUrl;

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

  // Active step state read from search query parameter or startStep prop
  const initialStep = isApprovalReview
    ? 6
    : startStep !== undefined
      ? startStep
      : parseInt(searchParams.get("step") || "1", 10);
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

  // ✅ 1. ESTADO NUEVO: Para capturar la decisión del Checkbox de Aprobación
  const [approvalDecision, setApprovalDecision] = useState<{
    status: "approved" | "rejected" | null;
    comments: string;
  }>({ status: null, comments: "" });

  const initialSelections = React.useMemo(() => {
    if (initialData?.selectedItems) return initialData.selectedItems;
    if (config?.sectionSelector?.enabled && config.sectionSelector.items) {
      return initDefaults(config.sectionSelector.items);
    }
    return {};
  }, [initialData, config]);

  const [selectedItems, setSelectedItems] =
    useState<Record<string, string[]>>(initialSelections);
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
    trigger,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormDataHerraEquipos>({
    defaultValues: {
      ...initialData,
      verification: sanitizeVerificationObject(initialData?.verification),
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
      selectedItems: initialSelections,
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        verification: sanitizeVerificationObject(initialData.verification),
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
        selectedItems: initialData.selectedItems || initialSelections,
      });
    }
  }, [initialData, reset, initialSelections]);

  useEffect(() => {
    setValue("selectedItems", selectedItems, { shouldDirty: false });
  }, [selectedItems, setValue]);

  // ✅ Auto-seleccionar tipo de escalera desde el campo de verificación
  // Aplica solo a formularios con sectionSelector (ej. 1.02.P06.F33 - Escaleras)
  const tipoEscaleraFieldLabel = React.useMemo(() => {
    if (!config?.sectionSelector?.enabled) return null;
    const field = template.verificationFields.find((f) => {
      const norm = f.label
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
      return norm.includes("TIPO") && norm.includes("ESCALERA");
    });
    return field?.label || null;
  }, [config, template.verificationFields]);

  // Observar el valor del campo "Tipo de Escalera".
  // `useWatch` no puede llamarse condicionalmente (reglas de hooks), así que
  // se invoca siempre con una ruta centinela cuando el campo no existe y el
  // resultado se descarta después. Cast a `Path<T>` en vez de `any`
  // (Patrón 9 del CLAUDE.md).
  const tipoEscaleraPath = (
    tipoEscaleraFieldLabel
      ? verificationFieldPath(tipoEscaleraFieldLabel)
      : "__sin_campo_tipo_escalera__"
  ) as Path<FormDataHerraEquipos>;

  const tipoEscaleraObservado = useWatch({
    control,
    name: tipoEscaleraPath,
  });

  const tipoEscaleraValor = tipoEscaleraFieldLabel
    ? (tipoEscaleraObservado as string | undefined)
    : undefined;

  useEffect(() => {
    if (!config?.sectionSelector?.enabled || !config.sectionSelector.items)
      return;
    if (!tipoEscaleraFieldLabel || !tipoEscaleraValor) return;

    const normTipo = tipoEscaleraValor
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    config.sectionSelector.items.forEach((itemConfig) => {
      const parentSection = template.sections.find(
        (s) => s.title === itemConfig.sectionTitle,
      );
      if (!parentSection?.subsections?.length) return;

      // Buscar la subsección cuyo título coincida con el tipo de escalera del equipo
      const matchingSubsection = parentSection.subsections.find((sub) => {
        const normSub = sub.title
          .toUpperCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim();
        // Extraer parte significativa del título de la subsección (quitar "N. VERIFICACION ESCALERA ")
        const subKeywords = normSub
          .replace(/^\d+\.\s*VERIFICACION\s+ESCALERA\s*/i, "")
          .trim();
        return (
          normSub.includes(normTipo) ||
          normTipo.includes(subKeywords.substring(0, 20)) ||
          subKeywords
            .split(" ")
            .filter((w) => w.length > 4)
            .every((w) => normTipo.includes(w))
        );
      });

      if (!matchingSubsection) return;

      const currentPath = itemConfig.sectionTitle;
      const currentSelected = selectedItems[currentPath] || [];
      if (!currentSelected.includes(matchingSubsection.title)) {
        setSelectedItems((prev) => ({
          ...prev,
          [currentPath]: [matchingSubsection.title],
        }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoEscaleraValor]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!isDirty || readonly) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (
        (window as Window & { bypassBeforeUnload?: boolean }).bypassBeforeUnload
      )
        return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, readonly]);

  if (!config) {
    return { config: null };
  }

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

  const handleSelectionChange = (path: string, selected: string[]) => {
    setSelectedItems((prev) => ({
      ...prev,
      [path]: selected,
    }));
  };

  const visibleSections = config.sectionSelector?.enabled
    ? filterSectionsBySelections(template.sections, selectedItems)
    : template.sections;

  // Bypass RHF validation for approval actions — inspector data is already submitted
  const handleApprovalSubmit = () => {
    handleFormSubmit(getValues());
  };

  // ✅ 2. INTERCEPTORES DE APROBACIÓN (Guardar decisión localmente)
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

  // ✅ 3. LÓGICA DE ENVÍO MODIFICADA
  const handleFormSubmit = (data: FormDataHerraEquipos) => {
    data.verification = rebuildVerification(
      getValues,
      template.verificationFields,
    );
    if (
      !isApprovalReview &&
      !isViewMode &&
      config.sectionSelector?.enabled &&
      config.sectionSelector.items
    ) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).bypassBeforeUnload = true;
    onSubmit(completeData);
  };

  // Scroll to first invalid field when submission fails validation
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

  const handleDraftSave = (data: FormDataHerraEquipos) => {
    data.verification = rebuildVerification(
      getValues,
      template.verificationFields,
    );
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

  // Step 1 should contain ONLY Area and Code/TAG fields (used for edit mode navigation)
  const step1Fields = template.verificationFields.filter(
    (f) => isEquipmentCodeField(f.label) || isAreaField(f.label),
  );

  // Mapped forms with equipment: show equipment selector in step 1 (new inspections only)
  const hasEquipmentSelection =
    TEMPLATE_EQUIPMENT_MAP[template.code] !== undefined && !initialData;

  // Stepper Section Navigation Handlers
  const handleNextStep = async () => {
    if (activeStep === 1) {
      if (hasEquipmentSelection) {
        handleStepChange(2);
      } else {
        const step1FieldNames = step1Fields.map((f) =>
          verificationFieldPath(f.label),
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isValid = await trigger(step1FieldNames as any);
        if (isValid) handleStepChange(2);
      }
    } else if (activeStep === 2) {
      // Always validate ALL verification fields in step 2
      const step2FieldNames = template.verificationFields.map((f) =>
        verificationFieldPath(f.label),
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = await trigger(step2FieldNames as any);
      if (isValid) handleStepChange(3);
    } else if (activeStep === 3) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = await trigger("responses" as any);
      if (isValid) handleStepChange(4);
    } else if (activeStep === 4) {
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
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isValid = await trigger(step4FieldNames as any);
      if (!isValid) return;

      if (onSaveDraft) {
        handleSubmit(async (data) => {
          data.verification = rebuildVerification(
            getValues,
            template.verificationFields,
          );
          const completeData = ensureAllBooleanFields(data, template.sections);
          await onSaveDraft(completeData);
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

  return {
    config,
    currentViewMode,
    isApprovalReview,
    formSteps,
    activeStep,
    approvalDecision,
    selectedItems,
    validationError,
    setValidationError,
    hasSubmitErrors,
    setHasSubmitErrors,
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    errors,
    isSubmitting,
    user,
    router,
    canApprove,
    handleSelectionChange,
    visibleSections,
    handleApprovalSubmit,
    handleLocalApprove,
    handleLocalReject,
    handleFormSubmit,
    handleInvalidSubmit,
    handleDraftSave,
    showSupervisorSignature,
    shouldShowApprovalSection,
    step1Fields,
    hasEquipmentSelection,
    handleNextStep,
    handlePrevStep,
    handleStepChange,
  };
}

export type { Path };
