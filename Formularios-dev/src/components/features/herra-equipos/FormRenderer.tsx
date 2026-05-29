"use client";

import React, { useEffect, useState } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Chip,
  Paper,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

// Componentes compartidos reutilizables
import { FormDataHerraEquipos, FormTemplateHerraEquipos } from "./types/IProps";
import { getFormConfig } from "./config/form-config.helpers";
import { VerificationFields } from "./presentation/components/renderers/VerificationsFields";
import { SectionRenderer } from "./presentation/components/renderers/SectionRenderer";
import { SaveSubmitButtons } from "./common/SaveSubmitButtons";

// ============================================
// PROPS DEL COMPONENTE
// ============================================
interface FormFillerProps {
  template: FormTemplateHerraEquipos;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;
  onSubmit?: (data: FormDataHerraEquipos) => void;
  readonly?: boolean;
  initialData?: FormDataHerraEquipos;
}

export const FormFiller: React.FC<FormFillerProps> = ({
  template,
  onSaveDraft,
  onSubmit,
  readonly = false,
  initialData,
}) => {
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hasSubmitErrors, setHasSubmitErrors] = useState(false);

  // ✅ Llamar a useForm ANTES de cualquier return condicional con mode: "onTouched"
  const {
    control,
    setValue,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormDataHerraEquipos>({
    defaultValues: initialData || {
      verification: {},
      responses: {},
    },
    mode: "onTouched",
  });

  // Warn before leaving with unsaved changes
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

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // ✅ Ahora sí, hacer la validación de config
  const config = getFormConfig(template.code);

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
  // HANDLERS: Enviar y Borrador
  // ============================================
  const handleSaveDraft = () => {
    setSaveMessage("Borrador guardado exitosamente");
    setTimeout(() => setSaveMessage(null), 3000);
    if (onSaveDraft) {
      onSaveDraft(getValues());
    }
  };

  const handleFinalSubmit = (data: FormDataHerraEquipos) => {
    setHasSubmitErrors(false);
    setSaveMessage("Formulario enviado exitosamente");
    if (onSubmit) onSubmit(data);
  };

  // Scroll to first invalid field when validation fails
  const handleInvalidSubmit = (errors: FieldErrors<FormDataHerraEquipos>) => {
    console.error("Form submission errors:", errors);
    setHasSubmitErrors(true);
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

  // ============================================
  // RENDERIZADO
  // ============================================
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      {/* Header del formulario */}
      <Card sx={{ mb: 3, backgroundColor: "#1976d2", color: "white" }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {template.name}
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              label={`Código: ${template.code}`}
              sx={{ backgroundColor: "white" }}
            />
            <Chip label={template.revision} sx={{ backgroundColor: "white" }} />
            <Chip
              label={
                template.type === "interna"
                  ? "Inspección Interna"
                  : "Inspección Externa"
              }
              sx={{ backgroundColor: "white" }}
            />
          </Box>
        </CardContent>
      </Card>

      {saveMessage && (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
          {saveMessage}
        </Alert>
      )}

      {hasSubmitErrors && Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setHasSubmitErrors(false)}>
          Hay campos con errores. Revise el formulario — los campos marcados en rojo requieren su atención.
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit(handleFinalSubmit, handleInvalidSubmit)}
        noValidate
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        {/* Campos de verificación reutilizables */}
        <VerificationFields
          fields={template.verificationFields}
          control={control}
          errors={errors}
          readonly={readonly}
          setValue={setValue}
        />

        {/* Secciones del formulario */}
        <Box mb={3}>
          {template.sections.map((section, sIdx) => (
            <SectionRenderer
              key={section._id || sIdx}
              section={section}
              sectionPath={`responses.s${sIdx}`}
              control={control}
              errors={errors}
              readonly={readonly}
              formConfig={config}
            />
          ))}
        </Box>

        {/* Botones de acción unificados */}
        {!readonly && (
          <SaveSubmitButtons
            onSaveDraft={onSaveDraft ? handleSaveDraft : undefined}
            onSubmit={handleSubmit(handleFinalSubmit, handleInvalidSubmit)}
            isSubmitting={isSubmitting}
            allowDraft={config.allowDraft ?? true}
          />
        )}
      </Box>
    </Box>
  );
};
