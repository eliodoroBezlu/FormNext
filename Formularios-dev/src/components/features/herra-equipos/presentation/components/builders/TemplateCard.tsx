"use client";

import type React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import {
  SectionHerraEquipos,
  FormTemplateHerraEquipos,
} from "../../../domain/models/BuilderTypes";

interface TemplateCardProps {
  template: FormTemplateHerraEquipos;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  onView,
}) => {
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  const getTotalQuestions = (): number => {
    let total = 0;
    const countQuestions = (sections: SectionHerraEquipos[]) => {
      sections.forEach((section) => {
        total += section.questions.length;
        if (section.subsections) {
          countQuestions(section.subsections);
        }
      });
    };
    countQuestions(template.sections);
    return total;
  };
  const getAutocompleteFields = (): number =>
    template.verificationFields.filter((f) => f.type === "autocomplete").length;

  return (
    <Card>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Typography variant="h6" gutterBottom>
            {template.name}
          </Typography>
          <Chip
            label={template.type === "interna" ? "Interna" : "Externa"}
            size="small"
            color={template.type === "interna" ? "primary" : "secondary"}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Código:</strong> {template.code}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Revisión:</strong> {template.revision}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Creado:</strong> {formatDate(template.createdAt)}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Actualizado:</strong> {formatDate(template.updatedAt)}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box display="flex" flexWrap="wrap" gap={1}>
          <Chip
            label={`${template.sections.length} secciones`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${getTotalQuestions()} preguntas`}
            size="small"
            variant="outlined"
            color="secondary"
          />
          <Chip
            label={`${template.verificationFields.length} campos`}
            size="small"
            variant="outlined"
            color="info"
          />
          {getAutocompleteFields() > 0 && (
            <Chip
              label={`${getAutocompleteFields()} autocomplete`}
              size="small"
              variant="outlined"
              color="success"
            />
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", gap: 1 }}>
        <IconButton size="small" onClick={onView} title="Ver">
          <Visibility />
        </IconButton>
        <IconButton size="small" onClick={onEdit} title="Editar">
          <Edit />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={onDelete}
          title="Eliminar"
        >
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  );
};
