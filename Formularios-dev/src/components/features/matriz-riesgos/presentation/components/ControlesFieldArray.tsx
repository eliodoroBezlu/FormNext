"use client";

import {
  Autocomplete,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add, DeleteOutline } from "@mui/icons-material";
import {
  Control,
  Controller,
  FieldErrors,
  useFieldArray,
  UseFormRegister,
} from "react-hook-form";
import { OpcionesDeCategoria, RiesgoDto } from "../../domain/models/IProps";
import { colorEficacia } from "../../domain/matrizHelpers";

interface Props {
  control: Control<RiesgoDto>;
  register: UseFormRegister<RiesgoDto>;
  errors: FieldErrors<RiesgoDto>;
  opciones: OpcionesDeCategoria | null;
  /** Eficacia calculada por el servidor, en el mismo orden que los controles. */
  eficacias: (string | null)[];
  readonly?: boolean;
}

/**
 * Los controles del riesgo.
 *
 * La eficacia no se edita: la deriva el servidor de jerarquía × calidad y acá
 * solo se muestra. Es lo que hace visible por qué un EPP nunca llega a
 * «Eficaz» por bien implementado que esté.
 */
export function ControlesFieldArray({
  control,
  register,
  errors,
  opciones,
  eficacias,
  readonly = false,
}: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "controles",
  });

  const sugerencias = (lista?: string[]) => lista ?? [];

  return (
    <Stack gap={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" fontWeight={700}>
          Controles ({fields.length})
        </Typography>
        {!readonly && (
          <Button
            type="button"
            size="small"
            startIcon={<Add />}
            onClick={() =>
              append({
                familiaControl: "",
                medida: "",
                familiaVerificador: "",
                verificador: "",
                calidadControl: opciones?.calidades[0] ?? "",
                jerarquiaControl: opciones?.jerarquias[4] ?? "",
              })
            }
          >
            Agregar control
          </Button>
        )}
      </Box>

      {fields.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Un riesgo sin controles no puede reducir su nivel. Agregá al menos
          uno.
        </Typography>
      )}

      {fields.map((campo, i) => {
        const errorControl = errors.controles?.[i];
        return (
          <Box
            key={campo.id}
            data-question-error={errorControl ? "true" : undefined}
            sx={{
              p: 2,
              borderRadius: 2,
              border: 1,
              borderColor: errorControl ? "error.main" : "divider",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1.5}
            >
              <Stack direction="row" gap={1} alignItems="center">
                <Typography variant="caption" fontWeight={700}>
                  Control {i + 1}
                </Typography>
                <Chip
                  size="small"
                  label={eficacias[i] ?? "sin evaluar"}
                  color={colorEficacia(eficacias[i] ?? null)}
                  variant={eficacias[i] ? "filled" : "outlined"}
                />
              </Stack>
              {!readonly && (
                <IconButton
                  type="button"
                  size="small"
                  onClick={() => remove(i)}
                  aria-label={`Eliminar el control ${i + 1}`}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Stack gap={2}>
              <Controller
                control={control}
                name={`controles.${i}.familiaControl`}
                rules={{ required: "Indicá la familia del control" }}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    freeSolo
                    disabled={readonly}
                    options={sugerencias(opciones?.controles)}
                    value={field.value ?? ""}
                    onChange={(_, v) => field.onChange(v ?? "")}
                    onInputChange={(_, v, motivo) => {
                      if (motivo === "input") field.onChange(v);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Familia de control"
                        size="small"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                )}
              />

              <TextField
                {...register(`controles.${i}.medida`, {
                  required: "Describí la medida",
                })}
                label="Medida de prevención, control o mitigación"
                size="small"
                multiline
                minRows={2}
                disabled={readonly}
                error={!!errorControl?.medida}
                helperText={errorControl?.medida?.message}
              />

              <Controller
                control={control}
                name={`controles.${i}.verificador`}
                rules={{
                  required: "Sin verificador el control no llega al PGR",
                }}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    freeSolo
                    disabled={readonly}
                    options={sugerencias(opciones?.verificadores)}
                    value={field.value ?? ""}
                    onChange={(_, v) => field.onChange(v ?? "")}
                    onInputChange={(_, v, motivo) => {
                      if (motivo === "input") field.onChange(v);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Verificador"
                        size="small"
                        error={!!fieldState.error}
                        helperText={
                          fieldState.error?.message ??
                          "Es lo que agrupa las actividades del PGR"
                        }
                      />
                    )}
                  />
                )}
              />

              <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                <TextField
                  {...register(`controles.${i}.jerarquiaControl`, {
                    required: true,
                  })}
                  select
                  label="Jerarquía"
                  size="small"
                  fullWidth
                  disabled={readonly}
                  defaultValue={campo.jerarquiaControl ?? ""}
                >
                  {(opciones?.jerarquias ?? []).map((j) => (
                    <MenuItem key={j} value={j}>
                      {j}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  {...register(`controles.${i}.calidadControl`, {
                    required: true,
                  })}
                  select
                  label="Calidad (implementación real)"
                  size="small"
                  fullWidth
                  disabled={readonly}
                  defaultValue={campo.calidadControl ?? ""}
                >
                  {(opciones?.calidades ?? []).map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
