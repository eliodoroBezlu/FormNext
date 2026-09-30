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
import { Visibility, Edit, Delete, ContentCopy, Publish, History } from "@mui/icons-material";
import { ChipEstadoRevision } from "@/components/ui/versionado/DialogosVersionado";
import { estadoDeRevision } from "@/types/versionado";
import {
  SectionHerraEquipos,
  FormTemplateHerraEquipos,
} from "../../../domain/models/BuilderTypes";

interface TemplateCardProps {
  template: FormTemplateHerraEquipos;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  /** Solo en la vigente, si no hay ya un borrador de su código. */
  onNuevaRevision?: () => void;
  /** Solo en un borrador. */
  onPublicar?: () => void;
  onHistorial: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  onView,
  onNuevaRevision,
  onPublicar,
  onHistorial,
}) => {
  const estado = estadoDeRevision(template);
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
          <Box display="flex" gap={0.5} flexWrap="wrap" justifyContent="flex-end">
            <ChipEstadoRevision estado={estado} />
            <Chip
              label={template.type === "interna" ? "Interna" : "Externa"}
              size="small"
              color={template.type === "interna" ? "primary" : "secondary"}
            />
          </Box>
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
        <IconButton size="small" onClick={onEdit} title="Editar" aria-label="Editar">
          <Edit />
        </IconButton>
        {onNuevaRevision && (
          <IconButton size="small" onClick={onNuevaRevision} title="Nueva revisión" aria-label="Nueva revisión">
            <ContentCopy />
          </IconButton>
        )}
        {onPublicar && (
          <IconButton size="small" color="success" onClick={onPublicar} title="Publicar revisión" aria-label="Publicar revisión">
            <Publish />
          </IconButton>
        )}
        <IconButton size="small" onClick={onHistorial} title="Historial de revisiones" aria-label="Historial de revisiones">
          <History />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={onDelete}
          title={estado === "borrador" ? "Descartar borrador" : "Eliminar"}
          aria-label={estado === "borrador" ? "Descartar borrador" : "Eliminar"}
        >
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  );
};
