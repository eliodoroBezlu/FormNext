// src/components/organisms/inspection-form-iro-isop/application/hooks/useIroIsopForm.ts

import { useState, useCallback, useMemo, useEffect, startTransition } from "react";
import { useForm, useFieldArray, type Path } from "react-hook-form";
import { valoracionCriterio } from "@/lib/constants";
import type { FormInstance, VerificationField, SectionResponse, QuestionResponse } from "@/types/formTypes";
import type { InspectionFormData, InspectionFormProps } from "@/components/organisms/inspection-form-iro-isop/types/IProps";
import {
  flattenSections,
  createInitialSections,
  calculateSectionMetrics,
  type ValoracionValue,
} from "@/components/organisms/inspection-form-iro-isop/domain/models/IroIsopDomain";
import { iroIsopAdapter } from "@/components/organisms/inspection-form-iro-isop/infrastructure/adapters/iroIsopAdapter";

export const useIroIsopForm = ({
  template,
  onSave,
  readonly = false,
  initialData,
  isEditMode = false,
}: InspectionFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [metricsTrigger, setMetricsTrigger] = useState(0);

  // --- OBTENER SECCIONES APLANADAS DEL DOMINIO ---
  const allFlatSections = useMemo(
    () => flattenSections(template.sections),
    [template.sections]
  );

  // --- RHF CONFIGURACIÓN ---
  const methods = useForm<InspectionFormData>({
      mode: "onTouched",
      defaultValues: initialData
        ? {
            verificationList: initialData.verificationList,
            inspectionTeam: initialData.inspectionTeam,
            sections: initialData.sections || createInitialSections(template.sections),
            aspectosPositivos: initialData.aspectosPositivos || "",
            aspectosAdicionales: initialData.aspectosAdicionales || "",
            personalInvolucrado: initialData.personalInvolucrado || [],
          }
        : {
            verificationList: template.verificationFields
              .filter(
                (field: VerificationField): field is VerificationField & { _id: string } =>
                  !!field._id
              )
              .reduce((acc: Record<string, string>, field: VerificationField) => {
                acc[field.label] = "";
                return acc;
              }, {} as Record<string, string>),
            inspectionTeam: [
              { nombre: "", cargo: "", firma: "" },
              { nombre: "", cargo: "", firma: "" },
              { nombre: "", cargo: "", firma: "" },
            ],
            sections: createInitialSections(template.sections),
            aspectosPositivos: "",
            aspectosAdicionales: "",
            personalInvolucrado:
              template.code === "1.02.P06.F46"
                ? Array(1).fill({ nombre: "", ci: "" })
                : [],
          },
    });

  const { control, handleSubmit, setValue, getValues, trigger, reset, formState: { errors, isDirty } } = methods;

  // --- MANEJO DE INTEGRIDAD DEL LISTADO DE EQUIPO ---
  const {
    fields: teamMembers,
    append: appendTeamMember,
    remove: removeTeamMember,
  } = useFieldArray({
    control,
    name: "inspectionTeam",
  });

  const addTeamMember = useCallback(() => {
    appendTeamMember({ nombre: "", cargo: "", firma: "" });
  }, [appendTeamMember]);

  // --- GUARDIÁN DE SALIDA PARA CAMBIOS NO GUARDADOS ---
  useEffect(() => {
    if (!isDirty || readonly) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, readonly]);

  // --- SINCRONIZAR RESET ANTE CARGA ASÍNCRONA DE DATOS (EDICIÓN) ---
  useEffect(() => {
    if (initialData) {
      reset({
        verificationList: initialData.verificationList,
        inspectionTeam: initialData.inspectionTeam,
        sections: initialData.sections || createInitialSections(template.sections),
        aspectosPositivos: initialData.aspectosPositivos || "",
        aspectosAdicionales: initialData.aspectosAdicionales || "",
        personalInvolucrado: initialData.personalInvolucrado || [],
      });
      setMetricsTrigger((prev) => prev + 1);
    }
  }, [initialData, reset, template.sections]);

  // --- ESCUCHAR CAMBIOS DE RESPUESTAS PARA MÉTRICAS REACTIVAS ---
  const sectionResponses = useMemo(() => {
    // Reference metricsTrigger to trigger recalculation when metricsTrigger changes
    const _trigger = metricsTrigger;
    const sections = (getValues as unknown as (key: string) => SectionResponse[])("sections");
    if (!sections || _trigger === -999) return [];
    return sections.map((section: SectionResponse) => ({
      maxPoints: section.maxPoints,
      totalQuestions: section.questions.length,
      questions: section.questions,
    }));
  }, [metricsTrigger, getValues]);

  // --- MÉTRICAS DE CUMPLIMIENTO EN TIEMPO REAL ---
  const previewMetrics = useMemo(() => {
    let totalObtained = 0;
    let totalApplicable = 0;
    let totalNA = 0;

    sectionResponses.forEach((section: { maxPoints: number; totalQuestions: number; questions: QuestionResponse[] }) => {
      const pointsPerQuestion =
        section.totalQuestions > 0
          ? section.maxPoints / section.totalQuestions
          : 0;

      let sectionObtained = 0;
      let sectionNaCount = 0;

      section.questions.forEach((q: QuestionResponse) => {
        if (q.response === "N/A") {
          sectionNaCount++;
          totalNA++;
        } else if (q.response !== "") {
          const points = Number(q.response);
          if (!isNaN(points)) sectionObtained += points;
        }
      });

      totalObtained += sectionObtained;
      totalApplicable += section.maxPoints - sectionNaCount * pointsPerQuestion;
    });

    const compliance =
      totalApplicable > 0 ? (totalObtained / totalApplicable) * 100 : 0;

    return {
      totalObtained: totalObtained.toFixed(2),
      totalApplicable: totalApplicable.toFixed(2),
      totalNA,
      compliance: compliance.toFixed(2),
    };
  }, [sectionResponses]);

  // --- ACCIÓN: MARCAR SECCIÓN COMO COMPLETA DE NO APLICACIÓN ---
  const handleMarkSectionAsNotApplicable = useCallback(
    (sectionIndex: number) => {
      if (readonly) return;
      const currentSections = getValues("sections") as SectionResponse[];
      if (!currentSections || !currentSections[sectionIndex]) return;

      const updatedQuestions = currentSections[sectionIndex].questions.map(
        (question: QuestionResponse) => ({
          ...question,
          response: "N/A" as ValoracionValue,
        })
      );

      setValue(`sections.${sectionIndex}.questions` as Path<InspectionFormData>, updatedQuestions, {
        shouldValidate: false,
        shouldDirty: true,
      });
      setMetricsTrigger((prev) => prev + 1);

      // Disparar validaciones reactivas
      trigger(`sections.${sectionIndex}.sectionComment` as Path<InspectionFormData>);
      const totalQuestions = currentSections[sectionIndex].questions.length;
      for (let i = 0; i < totalQuestions; i++) {
        trigger(`sections.${sectionIndex}.questions.${i}.comment` as Path<InspectionFormData>);
      }
    },
    [getValues, setValue, trigger, readonly]
  );

  // --- ACCIÓN: CAMBIAR RESPUESTA A PREGUNTA ---
  const handleUpdateQuestionResponse = useCallback(
    (sectionIndex: number, questionIndex: number, newResponse: string) => {
      if (readonly) return;
      const validResponses = ["0", "1", "2", "3", "N/A", ""];
      const sanitizedResponse = validResponses.includes(newResponse)
        ? newResponse
        : "";

      setValue(
        `sections.${sectionIndex}.questions.${questionIndex}.response` as Path<InspectionFormData>,
        sanitizedResponse,
        { shouldValidate: false, shouldDirty: true }
      );
      setMetricsTrigger((prev) => prev + 1);

      // Disparar validaciones reactivas
      trigger(`sections.${sectionIndex}.sectionComment` as Path<InspectionFormData>);
      const currentSections = getValues("sections") as SectionResponse[];
      if (currentSections && currentSections[sectionIndex]) {
        const totalQuestions = currentSections[sectionIndex].questions.length;
        for (let i = 0; i < totalQuestions; i++) {
          trigger(`sections.${sectionIndex}.questions.${i}.comment` as Path<InspectionFormData>);
        }
      }
    },
    [getValues, setValue, trigger, readonly]
  );

  // --- SUBMIT DEL FORMULARIO CON TRANSICIÓN DE ESTADO ---
  const onSubmit = useCallback(
    (data: InspectionFormData) => {
      if (readonly) return;

      setSubmitting(true);
      setError(null);
      setSuccess(null);

      startTransition(async () => {
        try {
          const commonPayload = {
            templateId: template._id.toString(),
            verificationList: data.verificationList,
            inspectionTeam: data.inspectionTeam,
            valoracionCriterio,
            sections: data.sections,
            aspectosPositivos: data.aspectosPositivos,
            aspectosAdicionales: data.aspectosAdicionales,
            personalInvolucrado: data.personalInvolucrado,
          };

          if (isEditMode && initialData) {
            // MODO EDICIÓN
            const updatedInstance: FormInstance = {
              ...initialData,
              ...commonPayload,
              updatedAt: new Date(),
            };
            onSave(updatedInstance);
          } else {
            // MODO CREACIÓN
            const result = await iroIsopAdapter.saveInspectionInstance(commonPayload);

            if (result.success) {
              setSuccess(result.message || "Formulario guardado exitosamente");

              const formInstance: FormInstance = {
                _id: result.data?._id || "",
                templateId: template._id,
                verificationList: data.verificationList,
                inspectionTeam: data.inspectionTeam,
                valoracionCriterio,
                sections: result.data?.sections || data.sections,
                aspectosPositivos: data.aspectosPositivos,
                aspectosAdicionales: data.aspectosAdicionales,
                personalInvolucrado: data.personalInvolucrado,
                totalObtainedPoints: result.data?.totalObtainedPoints || 0,
                totalApplicablePoints: result.data?.totalApplicablePoints || 0,
                totalMaxPoints: result.data?.totalMaxPoints || 0,
                totalNaCount: result.data?.totalNaCount || 0,
                overallCompliancePercentage: result.data?.overallCompliancePercentage || 0,
                status: "borrador" as const,
                createdBy: "current-user",
                createdAt: result.data?.createdAt || new Date(),
                updatedAt: result.data?.updatedAt || new Date(),
              };

              setTimeout(() => {
                onSave(formInstance);
              }, 1500);
            } else {
              setError(result.error || "Error al guardar el formulario");
            }
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Error inesperado al guardar el formulario"
          );
        } finally {
          setSubmitting(false);
        }
      });
    },
    [template._id, onSave, readonly, isEditMode, initialData]
  );

  return {
    methods,
    control,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    errors,
    isDirty,
    onSubmit,
    // Miembros de equipo
    teamMembers,
    addTeamMember,
    removeTeamMember: (index: number) => removeTeamMember(index),
    // Estados locales
    error,
    success,
    submitting,
    // Métricas y secciones
    allFlatSections,
    previewMetrics,
    calculateSectionMetrics,
    handleMarkSectionAsNotApplicable,
    handleUpdateQuestionResponse,
  };
};
