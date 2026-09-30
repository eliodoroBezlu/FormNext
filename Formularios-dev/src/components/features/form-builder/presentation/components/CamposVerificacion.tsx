"use client";

import { memo, useCallback } from "react";
import { useFieldArray, useWatch, type Control } from "react-hook-form";
import { Box, Chip, Grid, IconButton, Paper, Typography } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { Button } from "@/components/ui/buttons/Button";
import { FormField } from "@/components/ui/inputs/FormField";
import type { FormBuilderData } from "@/types/formTypes";

const DATA_SOURCES = [
  { value: "area", label: "Área" },
  { value: "superintendencia", label: "Superintendencia" },
  { value: "trabajador", label: "Trabajador" },
  { value: "gerencia", label: "Gerencia" },
  { value: "cargo", label: "Cargo" },
  { value: "equipo", label: "Equipo" },
  { value: "vicepresidencia", label: "Vicepresidencia" },
  { value: "supervisor", label: "Supervisor" },
];

const OPCIONES_TIPO = [
  { value: "text", label: "Texto" },
  { value: "date", label: "Fecha" },
  { value: "number", label: "Número" },
  { value: "select", label: "Selección" },
  { value: "autocomplete", label: "Autocompletar" },
];

const OPCIONES_ORIGEN = [{ value: "", label: "Seleccionar..." }, ...DATA_SOURCES];

interface Props {
  control: Control<FormBuilderData>;
  disabled: boolean;
}

/** «Campos de Lista de Verificación»: la cabecera de datos de la inspección. */
export function CamposVerificacion({ control, disabled }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: "verificationFields" });

  const agregar = useCallback(
    () => append({ label: "", type: "text", dataSource: "", required: false }),
    [append],
  );

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Campos de Lista de Verificación ({fields.length})</Typography>
        {!disabled && (
          <Button type="button" variant="outlined" startIcon={<Add />} onClick={agregar}>
            Agregar Campo
          </Button>
        )}
      </Box>
      {fields.map((field, index) => (
        <CampoVerificacion key={field.id} index={index} control={control} disabled={disabled} onRemove={remove} />
      ))}
    </Paper>
  );
}

interface CampoProps extends Props {
  index: number;
  onRemove: (index: number) => void;
}

/**
 * Una fila. Vigila solo su propio `type` y `dataSource` —lo que decide si se
 * ve el selector de origen—, así que cambiar un campo no redibuja los demás.
 */
const CampoVerificacion = memo(function CampoVerificacion({ index, control, disabled, onRemove }: CampoProps) {
  const [tipo, origen] = useWatch({
    control,
    name: [`verificationFields.${index}.type`, `verificationFields.${index}.dataSource`],
  });
  const esAutocompletar = tipo === "autocomplete";

  return (
    <Box mb={2}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: esAutocompletar ? 3 : 4 }}>
          <FormField
            name={`verificationFields.${index}.label`}
            control={control}
            label="Etiqueta del Campo"
            rules={{ required: "Etiqueta es requerida" }}
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: esAutocompletar ? 3 : 5 }}>
          <FormField
            name={`verificationFields.${index}.type`}
            control={control}
            type="select"
            label="Tipo"
            options={OPCIONES_TIPO}
            rules={{ required: "Tipo es requerido" }}
            disabled={disabled}
          />
        </Grid>
        {esAutocompletar && (
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormField
              name={`verificationFields.${index}.dataSource`}
              control={control}
              type="select"
              label="Origen de Datos"
              options={OPCIONES_ORIGEN}
              disabled={disabled}
              rules={{ required: "Origen de datos es requerido" }}
            />
          </Grid>
        )}
        <Grid size={{ xs: 6, sm: 2 }} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FormField
            name={`verificationFields.${index}.required`}
            control={control}
            type="checkbox"
            label="Requerido"
            disabled={disabled}
          />
        </Grid>
        {!disabled && (
          <Grid size={{ xs: 6, sm: 1 }} sx={{ display: "flex", justifyContent: "center" }}>
            <IconButton color="error" onClick={() => onRemove(index)} aria-label="Eliminar campo">
              <Delete />
            </IconButton>
          </Grid>
        )}
        {esAutocompletar && origen && (
          <Box mt={1} ml={2}>
            <Chip
              size="small"
              label={`Fuente: ${DATA_SOURCES.find((s) => s.value === origen)?.label}`}
              color="info"
              variant="outlined"
            />
          </Box>
        )}
      </Grid>
    </Box>
  );
});
