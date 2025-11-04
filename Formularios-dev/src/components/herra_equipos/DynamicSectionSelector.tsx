"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  FormHelperText,
  Divider,
} from "@mui/material";
import { Section, SelectableItemConfig } from "./types/IProps";

interface DynamicSectionSelectorProps {
  sections: Section[];
  config: SelectableItemConfig;
  selectedItems: Record<string, string[]>;
  onSelectionChange: (path: string, selected: string[]) => void;
  readonly?: boolean;
  path?: string; // Path para tracking recursivo
}

export function DynamicSectionSelector({
  sections,
  config,
  selectedItems,
  onSelectionChange,
  readonly = false,
  path = "",
}: DynamicSectionSelectorProps) {
  // Encontrar la sección padre
  const findSection = (sections: Section[], title: string): Section | undefined => {
    for (const section of sections) {
      if (section.title === title) return section;
      if (section.subsections) {
        const found = findSection(section.subsections, title);
        if (found) return found;
      }
    }
    return undefined;
  };

  const parentSection = findSection(sections, config.sectionTitle);

  if (!parentSection || !parentSection.subsections || parentSection.subsections.length === 0) {
    return null;
  }

  const currentPath = path ? `${path}.${config.sectionTitle}` : config.sectionTitle;
  const currentSelected = selectedItems[currentPath] || [];

  const handleToggle = (itemTitle: string) => {
    if (readonly) return;

    const isSelected = currentSelected.includes(itemTitle);
    
    if (isSelected) {
      onSelectionChange(currentPath, currentSelected.filter((t) => t !== itemTitle));
    } else {
      onSelectionChange(currentPath, [...currentSelected, itemTitle]);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="medium">
        {config.label || `Seleccione items de "${config.sectionTitle}"`}
      </Typography>

      {config.helperText && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {config.helperText}
        </Typography>
      )}

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        {parentSection.subsections.map((item) => {
          const isSelected = currentSelected.includes(item.title);
          const hasNestedConfig = config.nested?.some(n => n.sectionTitle === item.title);
          
          return (
            <Chip
              key={item._id || item.title}
              label={`${item.title}${item.subsections && item.subsections.length > 0 ? ` (${item.subsections.length})` : ''}`}
              onClick={() => handleToggle(item.title)}
              color={isSelected ? "primary" : "default"}
              variant={isSelected ? "filled" : "outlined"}
              disabled={readonly}
              icon={hasNestedConfig ? <span>📂</span> : undefined}
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

      {currentSelected.length === 0 && config.required && !readonly && (
        <FormHelperText sx={{ mt: 1, color: "warning.main" }}>
          ⚠️ Debe seleccionar al menos un item
        </FormHelperText>
      )}

      {currentSelected.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          ✓ {currentSelected.length} item(s) seleccionado(s)
        </Typography>
      )}

      {/* ✅ Selectores anidados (recursivo) */}
      {config.nested && config.nested.length > 0 && currentSelected.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Configuración de items seleccionados:
          </Typography>
          {config.nested.map((nestedConfig, idx) => {
            // Solo mostrar el selector anidado si el padre está seleccionado
            if (!currentSelected.includes(nestedConfig.sectionTitle)) {
              return null;
            }

            return (
              <Box key={idx} sx={{ ml: 2, mb: 2 }}>
                <DynamicSectionSelector
                  sections={parentSection.subsections || []}
                  config={nestedConfig}
                  selectedItems={selectedItems}
                  onSelectionChange={onSelectionChange}
                  readonly={readonly}
                  path={currentPath}
                />
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
}