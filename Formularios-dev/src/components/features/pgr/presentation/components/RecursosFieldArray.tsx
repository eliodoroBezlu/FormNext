"use client";

import { Control, Controller, useFieldArray } from "react-hook-form";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { PgrConfiguracionFormData } from "../../domain/schemas/pgrConfiguracionSchema";
import type { UnidadRecurso } from "../../infrastructure/adapters/pgrCatalogoAdapter";

export interface RecursosFieldArrayProps {
  control: Control<PgrConfiguracionFormData>;
  actividadIndex: number;
  /** Unidades del catálogo. Hoy solo `HH`, pero salen de la base. */
  unidades: UnidadRecurso[];
  error?: string;
}

/**
 * Recursos de una actividad: filas de cantidad + unidad.
 *
 * Antes era un campo de texto libre y en la base quedaron valores como «dsa» o
 * «qwe». Separar la cantidad de la unidad permite sumar el esfuerzo del
 * programa, que es para lo que sirve el dato.
 */
export function RecursosFieldArray({
  control,
  actividadIndex,
  unidades,
  error,
}: RecursosFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `actividades.${actividadIndex}.recursos`,
  });

  // Si el catálogo todavía no cargó, no se inventa una unidad por defecto:
  // guardar un código que no existe sería peor que dejarlo vacío.
  const unidadPorDefecto = unidades[0]?.codigo ?? "";

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1} mb={1}>
        <Typography variant="caption" color="text.secondary">
          Recursos
        </Typography>
        <Button
          size="small"
          type="button"
          startIcon={<AddIcon />}
          onClick={() => append({ cantidad: 1, unidad: unidadPorDefecto })}
          sx={{ textTransform: "none" }}
        >
          Agregar
        </Button>
      </Stack>

      {fields.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Sin recursos asignados.
        </Typography>
      )}

      <Stack gap={1}>
        {fields.map((item, i) => (
          <Stack key={item.id} direction="row" gap={1} alignItems="center">
            <Controller
              name={`actividades.${actividadIndex}.recursos.${i}.cantidad`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Cantidad"
                  type="number"
                  size="small"
                  sx={{ width: 120 }}
                  value={field.value ?? 0}
                  onChange={(e) => {
                    // El input devuelve string; el schema espera number.
                    const n = parseInt(e.target.value, 10);
                    field.onChange(Number.isFinite(n) && n >= 0 ? n : 0);
                  }}
                  slotProps={{ htmlInput: { min: 0 } }}
                />
              )}
            />
            <Controller
              name={`actividades.${actividadIndex}.recursos.${i}.unidad`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Unidad"
                  size="small"
                  sx={{ width: 200 }}
                  value={field.value ?? ""}
                >
                  {unidades.map((u) => (
                    <MenuItem key={u._id} value={u.codigo}>
                      {u.codigo} — {u.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <IconButton
              color="error"
              type="button"
              size="small"
              onClick={() => remove(i)}
              aria-label={`Quitar el recurso ${i + 1}`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
