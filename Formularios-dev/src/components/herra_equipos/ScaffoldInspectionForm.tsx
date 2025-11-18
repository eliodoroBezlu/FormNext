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
import { PlaylistAddCheck } from "@mui/icons-material";

interface ScaffoldInspectionFormProps {
  template: FormTemplateHerraEquipos;
  onSubmit: (data: FormDataHerraEquipos) => void;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;
  onSaveProgress?: (data: FormDataHerraEquipos) => void;
  onFinalize?: (data: FormDataHerraEquipos) => void;
  initialData?: FormDataHerraEquipos;
  readonly?: boolean;
}

export function ScaffoldInspectionForm({
  template,
  onSubmit,
  onSaveDraft,
  onSaveProgress,
  onFinalize,
  initialData,
  readonly = false,
}: ScaffoldInspectionFormProps) {
  const config = getFormConfig(template.code);

  // ✅ Detectar si es inspección nueva (sin initialData o sin ID)
  const isNewInspection = !initialData || !initialData.status;

  // ✅ Detectar si está en progreso
  const [isInProgress, setIsInProgress] = useState(
    initialData?.status === InspectionStatus.IN_PROGRESS
  );

  // ✅ Modo lectura para campos iniciales (solo cuando está en progreso)
  const [fieldsReadonly, setFieldsReadonly] = useState(isInProgress);

  // ✅ CRÍTICO: Determinar si debe mostrar rutinarias
  // Solo mostrar SI:
  // 1. NO es nueva inspección, O
  // 2. Ya tiene rutinarias registradas
  const shouldShowRoutines = !isNewInspection || 
    (initialData?.scaffold?.routineInspections?.length || 0) > 0;

  // ✅ Log para debug
  console.log('🏗️ [ScaffoldForm] Estado:', {
    isNewInspection,
    isInProgress,
    shouldShowRoutines,
    hasInitialData: !!initialData,
    status: initialData?.status,
    routinesCount: initialData?.scaffold?.routineInspections?.length || 0,
  });

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
  } = useForm<FormDataHerraEquipos>({
    defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      console.log("🔄 [ScaffoldForm] Cargando initialData:", {
        id: (initialData as any)._id,
        status: initialData.status,
        hasRoutines: !!initialData.scaffold?.routineInspections,
        routinesCount: initialData.scaffold?.routineInspections?.length || 0,
      });
      
      reset(defaultValues);
      
      const isProgressing = initialData.status === InspectionStatus.IN_PROGRESS;
      setIsInProgress(isProgressing);
      setFieldsReadonly(isProgressing);
    }
  }, [initialData]);

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
  // HANDLERS
  // ============================================

  const handleFormSubmit = (data: FormDataHerraEquipos) => {
    console.log("📤 [ScaffoldForm] SUBMIT FINAL");
    console.log("📊 Datos scaffold:", data.scaffold);
    onSubmit({ ...data, status: InspectionStatus.COMPLETED });
  };

  const handleFormSaveDraft = (data: FormDataHerraEquipos) => {
    console.log("💾 [ScaffoldForm] GUARDAR BORRADOR");
    onSaveDraft?.({ ...data, status: InspectionStatus.DRAFT });
  };

  const handleFormSaveProgress = (data: FormDataHerraEquipos) => {
    console.log("🔄 [ScaffoldForm] GUARDAR EN PROGRESO");
    console.log("🏗️ Scaffold data:", {
      routinesCount: data.scaffold?.routineInspections?.length || 0,
      hasFinalConclusion: !!data.scaffold?.finalConclusion,
    });
    
    const progressData = {
      ...data,
      status: InspectionStatus.IN_PROGRESS,
    };

    if (onSaveProgress) {
      onSaveProgress(progressData);
    } else {
      onSaveDraft?.(progressData);
    }
  };

  const handleFormFinalize = (data: FormDataHerraEquipos) => {
    console.log("✅ [ScaffoldForm] FINALIZAR INSPECCIÓN");
    console.log("🏗️ Scaffold final data:", {
      routinesCount: data.scaffold?.routineInspections?.length || 0,
      finalConclusion: data.scaffold?.finalConclusion,
    });
    
    const finalData = {
      ...data,
      status: InspectionStatus.COMPLETED,
    };

    if (onFinalize) {
      onFinalize(finalData);
    } else {
      onSubmit(finalData);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      {/* ============================================ */}
      {/* HEADER CON ESTADO */}
      {/* ============================================ */}
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Typography variant="h4">
            {config.formName}
          </Typography>
          
          {/* ✅ Chip de estado */}
          {isInProgress && (
            <Chip 
              label="EN PROGRESO" 
              color="warning" 
              size="small"
              icon={<PlaylistAddCheck />}
            />
          )}

          {/* ✅ NUEVO: Chip para nueva inspección */}
          {isNewInspection && (
            <Chip 
              label="NUEVA INSPECCIÓN" 
              color="success" 
              size="small"
              variant="outlined"
            />
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          Código: {config.formCode}
        </Typography>
      </Box>

      {/* ✅ Alert informativo para inspección en progreso */}
      {isInProgress && (
        <Alert severity="info" sx={{ mb: 2 }}>
          📋 <strong>Modo continuo:</strong> Este andamio está en uso. 
          Solo puede agregar inspecciones rutinarias. Los datos iniciales están bloqueados.
        </Alert>
      )}

      {/* ✅ NUEVO: Alert informativo para nueva inspección */}
      {isNewInspection && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✨ <strong>Nueva inspección de andamio</strong><br />
          Complete los datos iniciales. Puede guardar como "En Progreso" para continuar agregando 
          inspecciones rutinarias después.
        </Alert>
      )}

      {/* ============================================ */}
      {/* CAMPOS DE VERIFICACIÓN */}
      {/* ============================================ */}
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

      {/* ============================================ */}
      {/* SECCIONES DEL FORMULARIO */}
      {/* ============================================ */}
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

      {/* ============================================ */}
      {/* INSPECCIONES RUTINARIAS */}
      {/* ✅ CRÍTICO: SOLO MOSTRAR SI NO ES NUEVA O SI YA TIENE RUTINARIAS */}
      {/* ============================================ */}
      {config.routineInspection?.enabled && shouldShowRoutines && (
        <>
          {/* ✅ Separador visual */}
          <Box sx={{ borderTop: '2px dashed', borderColor: 'warning.main', pt: 3 }}>
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

      {/* ============================================ */}
      {/* CONCLUSIÓN FINAL */}
      {/* ============================================ */}
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

      {/* ============================================ */}
      {/* FIRMAS */}
      {/* ============================================ */}
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

      {config.signatures?.supervisor && (
        <SupervisorSignature
          register={register}
          control={control}
          errors={errors}
          setValue={setValue}
          config={config.signatures.supervisor}
          readonly={fieldsReadonly || readonly}
        />
      )}

      {/* ============================================ */}
      {/* BOTONES INTELIGENTES */}
      {/* ============================================ */}
      <SaveSubmitButtons
        onSaveDraft={
          onSaveDraft ? () => handleSubmit(handleFormSaveDraft)() : undefined
        }
        onSubmit={handleSubmit(handleFormSubmit)}
        onSaveProgress={() => handleSubmit(handleFormSaveProgress)()}
        onFinalize={() => handleSubmit(handleFormFinalize)()}
        isSubmitting={isSubmitting}
        allowDraft={config.allowDraft ?? true}
        isScaffoldForm={true}
        isInProgress={isInProgress}
      />
    </Box>
  );
}