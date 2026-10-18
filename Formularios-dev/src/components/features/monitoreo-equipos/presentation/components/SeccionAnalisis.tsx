"use client";

import { Box, Button, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ValoresReporte } from "../../domain/formularioReporte";
import type { Catalogos } from "../../domain/models/Monitoreo";
import { CampoCatalogo, CampoTexto } from "./CamposReporte";

/** Diez sobran; el formato tiene espacio para pocas. */
const MAX_RECOMENDACIONES = 10;

/** DESCRIPCIÓN DEL PROCESO, ANÁLISIS Y DIAGNÓSTICO y RECOMENDACIONES. */
export function SeccionAnalisis({
  catalogos,
  soloLectura,
}: {
  catalogos: Catalogos;
  soloLectura: boolean;
}) {
  const { control } = useFormContext<ValoresReporte>();
  const { fields, append, remove } = useFieldArray({ control, name: "recomendaciones" });

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        Proceso, análisis y recomendaciones
      </Typography>
      <Grid container spacing={2}>
        <Grid size={12}>
          <CampoTexto
            nombre="descripcion_proceso"
            label="Descripción del proceso de monitoreo o análisis de datos"
            multiline
            minRows={2}
            soloLectura={soloLectura}
          />
        </Grid>
        <Grid size={12}>
          <CampoTexto
            nombre="analisis"
            label="Análisis y diagnóstico"
            multiline
            minRows={4}
            soloLectura={soloLectura}
          />
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={3} mb={1}>
        <Typography variant="body2" fontWeight={600}>
          Recomendaciones
        </Typography>
        {!soloLectura && (
          <Button
            type="button"
            size="small"
            startIcon={<Add />}
            disabled={fields.length >= MAX_RECOMENDACIONES}
            onClick={() => append({ texto: "" })}
          >
            Agregar
          </Button>
        )}
      </Stack>
      <Stack gap={1} mb={2}>
        {fields.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Sin recomendaciones.
          </Typography>
        )}
        {fields.map((f, i) => (
          <Stack key={f.id} direction="row" gap={1} alignItems="flex-start">
            <Typography variant="body2" sx={{ pt: 1, minWidth: 24 }}>
              {i + 1}.-
            </Typography>
            <Box flex={1}>
              <CampoTexto nombre={`recomendaciones.${i}.texto`} multiline soloLectura={soloLectura} />
            </Box>
            {!soloLectura && (
              <IconButton type="button" size="small" onClick={() => remove(i)} aria-label="Quitar">
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Stack>
        ))}
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CampoCatalogo
            nombre="tecnica_apoyo"
            etiqueta="Técnica adicional de apoyo"
            opciones={catalogos.tecnica}
            soloLectura={soloLectura}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CampoCatalogo
            nombre="resultado"
            etiqueta="Resultado del análisis"
            opciones={catalogos.severidad}
            soloLectura={soloLectura}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
