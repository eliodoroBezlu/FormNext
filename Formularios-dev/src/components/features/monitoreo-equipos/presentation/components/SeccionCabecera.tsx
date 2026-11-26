"use client";

import { Autocomplete, Box, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMemo } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { soloDigitos, type ValoresReporte } from "../../domain/formularioReporte";
import type { BombaResumen, Catalogos, PlantillaMedicion } from "../../domain/models/Monitoreo";
import { CampoCatalogo, CampoTexto, ChipResultado } from "./CamposReporte";

interface Props {
  catalogos: Catalogos;
  bombas: BombaResumen[];
  /** Sus tags también se reportan, aunque no sean bombas. */
  plantillasMedicion: PlantillaMedicion[];
  /** ¿El reporte tiene medición de espesores? Cambia de dónde sale el alcance. */
  conMedicion: boolean;
  /** El TAG no cambia una vez guardado: un reporte de otra bomba es otro reporte. */
  tagFijo: boolean;
  soloLectura: boolean;
  codigoInterno?: string;
  colorDeResultado: (r?: string) => string | undefined;
  /** Al elegir TAG, fecha o técnica: pedir los antecedentes y la plantilla. */
  onCambioDeBomba: () => void;
}

/** Cabecera del formato: TAG, fecha, técnica, OT y ACCIÓN. */
export function SeccionCabecera({
  catalogos,
  bombas,
  plantillasMedicion,
  conMedicion,
  tagFijo,
  soloLectura,
  codigoInterno,
  colorDeResultado,
  onCambioDeBomba,
}: Props) {
  const { control, getValues, setValue } = useFormContext<ValoresReporte>();
  const resultado = useWatch({ control, name: "resultado" });
  // El backend entrega las bombas por urgencia; para elegir, mejor en orden.
  const tags = useMemo(
    () =>
      [...new Set([...bombas.map((b) => b.equipo.codigo), ...plantillasMedicion.map((p) => p.tag)])].sort(),
    [bombas, plantillasMedicion],
  );

  /** Un tag con una sola plantilla trae su técnica, si todavía no se eligió. */
  const alElegirTag = (tag: string) => {
    const suyas = plantillasMedicion.filter((p) => p.tag === tag);
    if (suyas.length === 1 && !getValues("tecnica")) {
      setValue("tecnica", suyas[0].tecnica, { shouldDirty: true });
    }
    onCambioDeBomba();
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={700}>
          Cabecera
        </Typography>
        <Stack direction="row" gap={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Acción:
          </Typography>
          {/* La ACCIÓN del formato es el resultado del análisis: no se escribe aparte. */}
          <ChipResultado valor={resultado} color={colorDeResultado(resultado)} />
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="tag"
            control={control}
            rules={{ required: "Elija la bomba" }}
            render={({ field, fieldState }) => (
              <Box data-question-error={fieldState.error ? "true" : undefined}>
                <Autocomplete
                  options={tags}
                  value={field.value || null}
                  readOnly={soloLectura || tagFijo}
                  onChange={(_, v) => {
                    field.onChange(v ?? "");
                    alElegirTag(v ?? "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputRef={field.ref}
                      label="TAG"
                      size="small"
                      error={!!fieldState.error}
                      helperText={
                        fieldState.error?.message ??
                        (tags.length === 0 ? "No hay bombas ni plantillas de medición" : undefined)
                      }
                    />
                  )}
                />
              </Box>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CampoTexto
            nombre="fecha"
            label="Fecha"
            type="date"
            soloLectura={soloLectura}
            slotProps={{ inputLabel: { shrink: true } }}
            onBlur={onCambioDeBomba}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CampoTexto
            nombre="ot"
            label="N° OT"
            helperText="Solo números"
            filtro={soloDigitos}
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
            soloLectura={soloLectura}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <CampoCatalogo
            nombre="tecnica"
            etiqueta="Técnica de monitoreo"
            opciones={catalogos.tecnica}
            soloLectura={soloLectura}
            onElegir={onCambioDeBomba}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Código interno"
            size="small"
            fullWidth
            value={codigoInterno ?? "Se asigna al emitir"}
            slotProps={{ input: { readOnly: true } }}
          />
        </Grid>
        <Grid size={12}>
          <CampoTexto
            nombre="alcance"
            label="Alcance"
            helperText={
              conMedicion ? "Qué se mide y para qué" : "Viene de la ficha de la bomba; se puede ajustar"
            }
            multiline
            minRows={2}
            soloLectura={soloLectura}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
