"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Paper,
} from "@mui/material";
import { Save, Send, CheckCircle } from "@mui/icons-material";

// Componentes compartidos reutilizables
import { VerificationFields } from "./VerificationsFields";
import { SectionRenderer } from "./SectionRenderer";
import { FormDataHerraEquipos, FormTemplateHerraEquipos } from "./types/IProps";
import { getFormConfig } from "./config/form-config.helpers";
import { init } from "next/dist/compiled/webpack/webpack";

// ============================================
// PROPS DEL COMPONENTE
// ============================================
interface FormFillerProps {
  template: FormTemplateHerraEquipos;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;    // ✅ Cambiado a FormDataHerraEquipos
  onSubmit?: (data: FormDataHerraEquipos) => void;  // ✅ Cambiado a FormDataHerraEquipos
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
  
  // ✅ Llamar a useForm ANTES de cualquier return condicional
  const {
    control,
    setValue,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<FormDataHerraEquipos>({
    defaultValues: {
      verification: {},
      responses: {},
    },
  });

  useEffect(() => {
    if (initialData) {
      console.log("🔄 Cargando datos iniciales:", initialData)
      reset(initialData) ;
      console.log("✅ Datos cargados");
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
  // HANDLER: Guardar Borrador
  // ============================================
  const handleSaveDraft = (data: FormDataHerraEquipos) => {
    console.log("=".repeat(60));
    console.log("💾 [FormFiller] GUARDAR BORRADOR");
    console.log("=".repeat(60));
    console.log("Template:", template.code);
    console.log("Datos:", data);
    console.log("=".repeat(60));

    setSaveMessage("Borrador guardado exitosamente");
    setTimeout(() => setSaveMessage(null), 3000);

    if (onSaveDraft) {
      onSaveDraft(data); // ✅ Ahora pasa FormDataHerraEquipos directamente
    }
  };

  // ============================================
  // HANDLER: Submit Final
  // ============================================
  const handleFinalSubmit = (data: FormDataHerraEquipos) => {
    console.log("=".repeat(60));
    console.log("📤 [FormFiller] SUBMIT FINAL");
    console.log("=".repeat(60));
    console.log("Template:", template.code);
    console.log("Datos:", data);
    console.log("=".repeat(60));

    setSaveMessage("Formulario enviado exitosamente");

    if (onSubmit) {
      onSubmit(data); // ✅ Ahora pasa FormDataHerraEquipos directamente
    }
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
            <Chip label={`Código: ${template.code}`} sx={{ backgroundColor: "white" }} />
            <Chip label={template.revision} sx={{ backgroundColor: "white" }} />
            <Chip
              label={template.type === "interna" ? "Inspección Interna" : "Inspección Externa"}
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

      <form onSubmit={handleSubmit(handleFinalSubmit)}>
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

        {/* Botones de acción */}
        {!readonly && (
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={handleSubmit(handleSaveDraft)}
            >
              Guardar Borrador
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Send />}
            >
              Enviar Formulario
            </Button>
          </Box>
        )}
      </form>
    </Box>
  );
};