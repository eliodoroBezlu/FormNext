"use client";

import React, { useState } from "react";
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
import {  FormResponse, FormDataHerraEquipos, FormTemplateHerraEquipos } from "./types/IProps";
import { getFormConfig } from "./config/form-config.helpers";

interface FormFillerProps {
  template: FormTemplateHerraEquipos;
  onSave?: (data: FormResponse) => void;
  onSubmit?: (data: FormResponse) => void;
  readonly?: boolean;
}

export const FormFiller: React.FC<FormFillerProps> = ({ 
  template, 
  onSave, 
  onSubmit,
  readonly = false 
}) => {
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
  // ✅ Llamar a useForm ANTES de cualquier return condicional
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataHerraEquipos>({
    defaultValues: {
      verification: {},
      responses: {},
    },
  });

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

  const handleSaveDraft = (data: FormDataHerraEquipos) => {
    const formResponse: FormResponse = {
      templateId: template._id,
      verificationData: data.verification,
      responses: data.responses,
      submittedAt: new Date(),
      status: "draft",
    };

    console.log("Guardando borrador:", formResponse);
    setSaveMessage("Borrador guardado exitosamente");
    setTimeout(() => setSaveMessage(null), 3000);

    if (onSave) {
      onSave(formResponse);
    }
  };

  const handleFinalSubmit = (data: FormDataHerraEquipos) => {
    const formResponse: FormResponse = {
      templateId: template._id,
      verificationData: data.verification,
      responses: data.responses,
      submittedAt: new Date(),
      status: "completed",
    };

    console.log("Enviando formulario:", formResponse);
    setSaveMessage("Formulario enviado exitosamente");

    if (onSubmit) {
      onSubmit(formResponse);
    }
  };

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