"use client";

import { Autocomplete, Box, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { ValoresReporte } from "../../domain/formularioReporte";
import type { BombaResumen, Catalogos } from "../../domain/models/Monitoreo";
import { CampoCatalogo, CampoTexto, ChipResultado } from "./CamposReporte";

interface Props {
  catalogos: Catalogos;
  bombas: BombaResumen[];
  /** El TAG no cambia una vez guardado: un reporte de otra bomba es otro reporte. */
  tagFijo: boolean;
  soloLectura: boolean;
  codigoInterno?: string;
  colorDeResultado: (r?: string) => string | undefined;
  /** Al elegir TAG o fecha: pedir los antecedentes de la bomba. */
  onCambioDeBomba: () => void;
}

/** Cabecera del formato: TAG, fecha, técnica, OT y ACCIÓN. */
export function SeccionCabecera({
  catalogos,
  bombas,
  tagFijo,
  soloLectura,
  codigoInterno,
  colorDeResultado,
  onCambioDeBomba,
}: Props) {
  const { control } = useFormContext<ValoresReporte>();
  const resultado = useWatch({ control, name: "resultado" });
  // El backend las entrega por urgencia; para elegir, mejor en orden.
  const tags = bombas.map((b) => b.equipo.codigo).sort();

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
                    onCambioDeBomba();
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
                        (bombas.length === 0 ? "No hay bombas cargadas" : undefined)
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
          <CampoTexto nombre="ot" label="N° OT" soloLectura={soloLectura} />
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <CampoCatalogo
            nombre="tecnica"
            etiqueta="Técnica de monitoreo"
            opciones={catalogos.tecnica}
            soloLectura={soloLectura}
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
          <CampoTexto nombre="alcance" label="Alcance" multiline minRows={2} soloLectura={soloLectura} />
        </Grid>
      </Grid>
    </Paper>
  );
}
