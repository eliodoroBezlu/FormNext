"use client";

import { memo } from "react";
import type { Control } from "react-hook-form";
import { Alert, Box, Chip, CircularProgress, Grid, LinearProgress, Paper, Typography } from "@mui/material";
import { Image as ImageIcon } from "@mui/icons-material";
import type { FormBuilderData } from "@/types/formTypes";
import {
  useEstadisticasImagenes,
  useEstadisticasPlantilla,
} from "../../application/hooks/useEstadisticasPlantilla";

interface Props {
  control: Control<FormBuilderData>;
  /** Secciones + secciones con imágenes: sale de los field arrays, no de un watch. */
  totalSecciones: number;
}

/** Contadores de la cabecera. Es lo único que se redibuja con cada tecla. */
export const ResumenPlantilla = memo(function ResumenPlantilla({ control, totalSecciones }: Props) {
  const { preguntas, puntos, autocompletar, imagenes } = useEstadisticasPlantilla(control);

  return (
    <Box display="flex" gap={1} flexWrap="wrap">
      <Chip label={`${totalSecciones} secciones`} color="primary" variant="outlined" size="small" />
      <Chip label={`${preguntas} preguntas`} color="secondary" variant="outlined" size="small" />
      <Chip label={`${puntos} pts máx`} color="success" variant="outlined" size="small" />
      {imagenes.total > 0 && (
        <Chip
          label={`${imagenes.listas}/${imagenes.total} img (${imagenes.tamanoKB}KB)`}
          color={imagenes.procesando > 0 ? "warning" : "info"}
          variant="outlined"
          size="small"
          icon={<ImageIcon />}
        />
      )}
      {autocompletar > 0 && (
        <Chip label={`${autocompletar} autocomplete`} color="info" variant="outlined" size="small" />
      )}
    </Box>
  );
});

/** Aviso mientras hay imágenes convirtiéndose a base64. */
export const AvisoImagenesProcesando = memo(function AvisoImagenesProcesando({
  control,
}: Pick<Props, "control">) {
  const { procesando } = useEstadisticasImagenes(control);
  if (procesando === 0) return null;
  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      <Box display="flex" alignItems="center" gap={2}>
        <CircularProgress size={20} />
        <Typography variant="body2">Procesando imágenes... Por favor espera antes de guardar.</Typography>
      </Box>
    </Alert>
  );
});

/** Resumen de imágenes al pie del constructor. */
export const ResumenImagenes = memo(function ResumenImagenes({ control }: Pick<Props, "control">) {
  const imagenes = useEstadisticasImagenes(control);
  if (imagenes.total === 0) return null;

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: "info.50" }}>
      <Typography variant="subtitle2" color="info.dark" gutterBottom>
        📊 Resumen de Imágenes
      </Typography>
      <Grid container spacing={2}>
        {[
          ["Total", imagenes.total],
          ["Listas", imagenes.listas],
          ["Procesando", imagenes.procesando],
          ["Tamaño", `${imagenes.tamanoKB}KB`],
        ].map(([etiqueta, valor]) => (
          <Grid key={etiqueta} size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {etiqueta}: {valor}
            </Typography>
          </Grid>
        ))}
      </Grid>
      {imagenes.procesando > 0 && (
        <Box mt={1}>
          <LinearProgress color="warning" />
          <Typography variant="caption" color="warning.dark">
            Esperando que terminen de procesarse las imágenes...
          </Typography>
        </Box>
      )}
    </Paper>
  );
});
