"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  FormHelperText,
} from "@mui/material";
import { Section } from "./types/IProps";

interface SubsectionSelectorProps {
  parentSection: Section;
  selectedSubsections: string[];
  onSelectionChange: (selected: string[]) => void;
  label?: string;
  helperText?: string;
  error?: string;
  readonly?: boolean;
  required?: boolean;
}

export function SubsectionSelector({
  parentSection,
  selectedSubsections,
  onSelectionChange,
  label,
  helperText,
  error,
  readonly = false,
  required = false,
}: SubsectionSelectorProps) {
  const subsections = parentSection.subsections || [];

  if (subsections.length === 0) {
    return null;
  }

  const handleToggle = (subsectionTitle: string) => {
    if (readonly) return;

    const isSelected = selectedSubsections.includes(subsectionTitle);
    
    if (isSelected) {
      onSelectionChange(selectedSubsections.filter((t) => t !== subsectionTitle));
    } else {
      onSelectionChange([...selectedSubsections, subsectionTitle]);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="medium">
        {label || `Seleccione las subsecciones de "${parentSection.title}"`}
      </Typography>

      {helperText && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {helperText}
        </Typography>
      )}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        {subsections.map((subsection) => {
          const isSelected = selectedSubsections.includes(subsection.title);
          
          return (
            <Chip
              key={subsection._id || subsection.title}
              label={subsection.title}
              onClick={() => handleToggle(subsection.title)}
              color={isSelected ? "primary" : "default"}
              variant={isSelected ? "filled" : "outlined"}
              disabled={readonly}
              sx={{
                fontSize: "0.9rem",
                py: 2.5,
                px: 1.5,
                cursor: readonly ? "default" : "pointer",
                "&:hover": readonly ? {} : {
                  transform: "scale(1.05)",
                  transition: "transform 0.2s",
                },
              }}
            />
          );
        })}
      </Box>

      {error && (
        <FormHelperText error sx={{ mt: 1 }}>
          {error}
        </FormHelperText>
      )}

      {selectedSubsections.length === 0 && required && !readonly && (
        <FormHelperText sx={{ mt: 1, color: "warning.main" }}>
          ⚠️ Debe seleccionar al menos una subsección
        </FormHelperText>
      )}

      {selectedSubsections.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          ✓ {selectedSubsections.length} subsección(es) seleccionada(s)
        </Typography>
      )}
    </Paper>
  );
}