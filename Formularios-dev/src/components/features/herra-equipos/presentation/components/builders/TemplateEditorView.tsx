"use client";

import type React from "react";
import { Box, Typography, Chip, IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { FormBuilder } from "./FormBuilder";
import {
  FormBuilderDataHerraEquipos,
  FormTemplateHerraEquipos,
} from "../../../domain/models/BuilderTypes";

interface TemplateEditorViewProps {
  template: FormTemplateHerraEquipos | null;
  onSave: (template: FormTemplateHerraEquipos) => void;
  onCancel: () => void;
  mode: "create" | "edit" | "view";
}

export const TemplateEditorView: React.FC<TemplateEditorViewProps> = ({
  template,
  onSave,
  onCancel,
  mode,
}) => {
  const handleSave = (data: FormBuilderDataHerraEquipos) => {
    const now = new Date();
    onSave({
      _id: template?._id || Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: template?.createdAt || now,
      updatedAt: now,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={onCancel}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          {mode === "view" ? "Ver" : mode === "edit" ? "Editar" : "Crear"}{" "}
          Template
        </Typography>
        {mode === "edit" && template && (
          <Chip
            label={`Editando: ${template.name}`}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>
      <FormBuilder
        template={template}
        onSave={handleSave}
        onCancel={onCancel}
        mode={mode}
      />
    </Box>
  );
};
