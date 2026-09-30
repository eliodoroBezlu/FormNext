"use client";

import { memo } from "react";
import type { Control } from "react-hook-form";
import { Box, Grid, IconButton, Typography } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { FormField } from "@/components/ui/inputs/FormField";
import type { FormBuilderData } from "@/types/formTypes";
import { AsaArrastre, useOrdenable } from "@/components/ui/sortable/ListaOrdenable";

interface PreguntaFilaProps {
  /** `field.id` del field array: identidad estable para arrastrar. */
  id: string;
  /** Ruta de la sección dueña, p. ej. `sections.2` o `sections.0.subsections.1`. */
  basePath: string;
  index: number;
  control: Control<FormBuilderData>;
  disabled: boolean;
  /** `false` cuando la sección está en su mínimo de preguntas. */
  puedeEliminar: boolean;
  minPreguntas: number;
  onRemove: (index: number) => void;
}

const REGLAS_TEXTO = {
  required: "Pregunta es requerida",
  minLength: { value: 5, message: "La pregunta debe tener al menos 5 caracteres" },
};

const INPUT_TEXTO = {
  multiline: true,
  rows: 2,
  placeholder: "Escribe aquí la pregunta...",
};

/**
 * Una pregunta de una sección con puntaje.
 *
 * Memoizada y sin leer datos del formulario desde arriba: cada campo es su
 * propio `Controller`, así que escribir aquí solo redibuja este campo. Es lo
 * que hace que el constructor no se vuelva lento con muchas preguntas.
 */
export const PreguntaFila = memo(function PreguntaFila({
  id,
  basePath,
  index,
  control,
  disabled,
  puedeEliminar,
  minPreguntas,
  onRemove,
}: PreguntaFilaProps) {
  const { nodoRef, estilo, arrastrando, asa } = useOrdenable(id, disabled);

  return (
    <Box
      ref={nodoRef}
      style={estilo}
      mb={2}
      p={2}
      sx={{ border: 1, borderColor: arrastrando ? "primary.main" : "divider", borderRadius: 1, backgroundColor: "background.paper" }}
    >
      <Grid container spacing={2} alignItems="center">
        {!disabled && (
          <Grid size="auto">
            <AsaArrastre asa={asa} arrastrando={arrastrando} />
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: "grow" }}>
          <FormField
            name={`${basePath}.questions.${index}.text` as never}
            control={control}
            label={`Pregunta ${index + 1}`}
            inputProps={INPUT_TEXTO}
            rules={REGLAS_TEXTO}
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 8, sm: 3 }}>
          <FormField
            name={`${basePath}.questions.${index}.obligatorio` as never}
            control={control}
            type="checkbox"
            label="¿Obligatorio?"
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 4, sm: 2 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="caption" color="text.secondary" mb={1}>
              #{index + 1}
            </Typography>
            <IconButton
              color="error"
              onClick={() => onRemove(index)}
              size="small"
              disabled={disabled || !puedeEliminar}
              title={puedeEliminar ? "Eliminar pregunta" : `Mínimo ${minPreguntas} pregunta(s)`}
              aria-label="Eliminar pregunta"
            >
              <Delete />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
});
