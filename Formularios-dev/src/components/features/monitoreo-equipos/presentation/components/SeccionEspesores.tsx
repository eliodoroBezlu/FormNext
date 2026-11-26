"use client";

import { Alert, Grid, Paper, Stack, Typography } from "@mui/material";
import { get, useFormContext, useWatch } from "react-hook-form";
import { celdasDe, minimosAnteriores } from "../../domain/espesores";
import { numero, type ValoresReporte } from "../../domain/formularioReporte";
import type { AntecedentesReporte } from "../../domain/models/Monitoreo";
import type { MedicionEnPantalla } from "../../application/hooks/useReporteMonitoreo";
import { formatearDia, ImagenMonitoreo } from "./CamposReporte";
import { TablaPiezaEspesores } from "./TablaPiezaEspesores";

interface Props {
  medicion: MedicionEnPantalla;
  antecedentes: AntecedentesReporte | null;
  soloLectura: boolean;
}

/**
 * La medición de espesores del reporte: los diagramas del equipo con sus
 * puntos y la grilla de la plantilla, pieza por pieza, con el mínimo de cada
 * zona y el de la medición anterior al lado.
 */
export function SeccionEspesores({ medicion, antecedentes, soloLectura }: Props) {
  const {
    control,
    formState: { errors },
  } = useFormContext<ValoresReporte>();
  const valores = useWatch({ control, name: "medicion_valores" });
  const { estructura, diagramas } = medicion;
  const error = get(errors, "medicion_valores") as { message?: string } | undefined;

  const anterior = antecedentes?.medicion_anterior;
  const anteriores = anterior ? minimosAnteriores(estructura, anterior.minimos) : [];
  const maxPuntos = Math.max(...estructura.piezas.flatMap((p) => p.zonas.map((z) => z.puntos)));
  const medidos = (valores ?? []).flat(3).filter((t) => numero(t) !== undefined).length;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={1} gap={2}>
        <Typography variant="subtitle1" fontWeight={700}>
          Medición de espesores
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {medidos} de {celdasDe(estructura)} puntos medidos · mm
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {estructura.titulo}
        {anterior &&
          ` · comparado con ${anterior.codigo_interno ?? "el informe anterior"} del ${formatearDia(anterior.fecha)}`}
      </Typography>

      {error?.message && (
        <Alert severity="error" sx={{ mb: 2 }} data-question-error="true">
          {error.message}
        </Alert>
      )}

      {diagramas.length > 0 && (
        <Grid container spacing={2} mb={2} justifyContent="center">
          {diagramas.map((d) => (
            <Grid key={d.archivo} size={{ xs: 12, sm: 6, md: 4 }}>
              <ImagenMonitoreo archivo={d.archivo} alt={d.descripcion || "Diagrama"} />
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                {d.descripcion}
              </Typography>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Sin la grilla en el formulario todavía (llega con la plantilla) no hay celdas que registrar. */}
      {(valores?.length ?? 0) === estructura.piezas.length &&
        estructura.piezas.map((p, i) => (
          <TablaPiezaEspesores
            key={`${i}-${p.nombre}`}
            pieza={p}
            indice={i}
            maxPuntos={maxPuntos}
            anteriores={anteriores[i]}
            soloLectura={soloLectura}
          />
        ))}
    </Paper>
  );
}
