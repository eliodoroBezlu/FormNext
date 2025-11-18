"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box, Typography, Paper } from "@mui/material";
import { FormDataHerraEquipos, FormTemplateHerraEquipos, SelectableItemConfig } from "./types/IProps";
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
import { filterSectionsBySelections, validateRequiredSelections } from "./utils/section-utils";
import { DynamicSectionSelector } from "./DynamicSectionSelector";

interface StandardInspectionFormProps {
  template: FormTemplateHerraEquipos;
  onSubmit: (data: FormDataHerraEquipos) => void;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;
  readonly?: boolean;
  initialData?: FormDataHerraEquipos;
}

export function StandardInspectionForm({
  template,
  onSubmit,
  onSaveDraft,
  readonly = false,
  initialData,
}: StandardInspectionFormProps) {
  const config = getFormConfig(template.code);

  const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>(
    initialData?.selectedItems || {}
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormDataHerraEquipos>({
    defaultValues: initialData,
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  useEffect(() => {
    setValue("selectedItems", selectedItems);
  }, [selectedItems, setValue]);

  const initDefaults = (items: SelectableItemConfig[]): Record<string, string[]> => {
    const defaults: Record<string, string[]> = {};
    
    items.forEach(item => {
      if (item.defaultSelected && item.defaultSelected.length > 0) {
        defaults[item.sectionTitle] = item.defaultSelected;
      }
      if (item.nested) {
        Object.assign(defaults, initDefaults(item.nested));
      }
    });
    
    return defaults;
  };

  const getAllConfigs = (items: SelectableItemConfig[]): SelectableItemConfig[] => {
    let allConfigs: SelectableItemConfig[] = [...items];
    items.forEach(item => {
      if (item.nested) {
        allConfigs = allConfigs.concat(getAllConfigs(item.nested));
      }
    });
    return allConfigs;
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

  

  if (!config) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography color="error">
          Configuración no encontrada para {template.code}
        </Typography>
      </Paper>
    );
  }

  const handleSelectionChange = (path: string, selected: string[]) => {
    setSelectedItems(prev => ({
      ...prev,
      [path]: selected
    }));
  };

  const visibleSections = config.sectionSelector?.enabled
    ? filterSectionsBySelections(template.sections, selectedItems)
    : template.sections;

  const handleFormSubmit = (data: FormDataHerraEquipos) => {
    if (config.sectionSelector?.enabled && config.sectionSelector.items) {
      const allConfigs = getAllConfigs(config.sectionSelector.items);
      const validation = validateRequiredSelections(selectedItems, allConfigs);

      if (!validation.valid) {
        alert(`Debe seleccionar al menos un item en: ${validation.missing.join(", ")}`);
        return;
      }
    }

    onSubmit(data);
  };

  const handleDraftSave = (data: FormDataHerraEquipos) => {
    if (onSaveDraft) {
      onSaveDraft(data);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
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

      {config.sectionSelector?.enabled && config.sectionSelector.items && !readonly && (
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
              (s) => s._id === section._id || s.title === section.title
            );

            return (
              <SectionRenderer
                key={section._id || idx}
                section={section}
                sectionPath={`responses.section_${originalIndex}`}
                control={control}
                errors={errors}
                formConfig={config}
                readonly={readonly}
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

      {/* ✅ DEBUG: Mostrar visualmente si debe renderizarse */}
      

      {config.signatures?.inspector && (
        <InspectorSignature 
          register={register} 
          control={control}
          errors={errors} 
          setValue={setValue}
          config={config.signatures.inspector} 
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
          onSaveDraft ? () => handleSubmit(handleDraftSave)() : undefined
        }
        onSubmit={handleSubmit(handleFormSubmit)}
        isSubmitting={isSubmitting}
        allowDraft={config.allowDraft ?? true}
      />
    </Box>
  );
}