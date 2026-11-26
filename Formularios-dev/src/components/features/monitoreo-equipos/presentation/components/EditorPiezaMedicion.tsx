"use client";

import { Button, Grid, IconButton, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { Add, ArrowDownward, ArrowUpward, Delete } from "@mui/icons-material";
import { Controller, useFieldArray, useFormContext, type Path } from "react-hook-form";
import { MAX_ANILLOS, MAX_PUNTOS, MAX_ZONAS_POR_PIEZA } from "../../domain/espesores";
import { ZONA_VACIA, type ValoresPlantilla } from "../../domain/plantillaMedicion";

interface Props {
  indice: number;
  total: number;
  onQuitar: () => void;
  onMover: (hacia: number) => void;
}

/** Un campo de texto del editor, con su error de RHF debajo. */
function Campo({
  nombre,
  label,
  requerido,
  rango,
  ancho,
}: {
  nombre: Path<ValoresPlantilla>;
  label: string;
  requerido?: boolean;
  /** Entero entre 1 y este tope. */
  rango?: number;
  ancho?: number;
}) {
  const { control } = useFormContext<ValoresPlantilla>();
  return (
    <Controller
      name={nombre}
      control={control}
      rules={{
        required: requerido ? "Obligatorio" : false,
        validate: rango
          ? (v) => {
              const n = Number(v);
              return (Number.isInteger(n) && n >= 1 && n <= rango) || `De 1 a ${rango}`;
            }
          : undefined,
      }}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          value={(field.value as string) ?? ""}
          label={label}
          size="small"
          fullWidth={!ancho}
          sx={ancho ? { width: ancho } : undefined}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          slotProps={rango ? { htmlInput: { inputMode: "numeric" } } : undefined}
          data-question-error={fieldState.error ? "true" : undefined}
        />
      )}
    />
  );
}

/**
 * Una pieza de la grilla: su nombre, los espesores de referencia y sus zonas
 * (los «lados»), cada una con cuántos anillos y cuántos puntos se miden.
 */
export function EditorPiezaMedicion({ indice, total, onQuitar, onMover }: Props) {
  const { control } = useFormContext<ValoresPlantilla>();
  const zonas = useFieldArray({ control, name: `piezas.${indice}.zonas` });
  const base = `piezas.${indice}` as const;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="body2" fontWeight={700}>
          Pieza {indice + 1}
        </Typography>
        <Stack direction="row">
          <Tooltip title="Subir">
            <span>
              <IconButton type="button" size="small" disabled={indice === 0} onClick={() => onMover(-1)}>
                <ArrowUpward fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Bajar">
            <span>
              <IconButton
                type="button"
                size="small"
                disabled={indice === total - 1}
                onClick={() => onMover(1)}
              >
                <ArrowDownward fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Quitar pieza">
            <span>
              <IconButton type="button" size="small" disabled={total === 1} onClick={onQuitar}>
                <Delete fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Campo nombre={`${base}.nombre`} label="Nombre (p. ej. 1, Cuello, Dardo LV250033)" requerido />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Campo nombre={`${base}.espesor_nominal_mm`} label="Nominal (mm)" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Campo nombre={`${base}.espesor_alerta_mm`} label="Alerta bajo (mm)" />
        </Grid>
      </Grid>

      <Stack gap={1}>
        {zonas.fields.map((z, j) => (
          <Stack key={z.id} direction={{ xs: "column", sm: "row" }} gap={1} alignItems="flex-start">
            <Campo
              nombre={`${base}.zonas.${j}.nombre`}
              label={zonas.fields.length > 1 ? "Zona (p. ej. Lado Oeste)" : "Zona (opcional)"}
              requerido={zonas.fields.length > 1}
            />
            <Campo nombre={`${base}.zonas.${j}.anillos`} label="Anillos" rango={MAX_ANILLOS} ancho={110} />
            <Campo nombre={`${base}.zonas.${j}.puntos`} label="Puntos" rango={MAX_PUNTOS} ancho={110} />
            <IconButton
              type="button"
              size="small"
              aria-label="Quitar zona"
              disabled={zonas.fields.length === 1}
              onClick={() => zonas.remove(j)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <Button
        type="button"
        size="small"
        startIcon={<Add />}
        sx={{ mt: 1 }}
        disabled={zonas.fields.length >= MAX_ZONAS_POR_PIEZA}
        onClick={() => zonas.append({ ...ZONA_VACIA })}
      >
        Agregar zona
      </Button>
    </Paper>
  );
}
