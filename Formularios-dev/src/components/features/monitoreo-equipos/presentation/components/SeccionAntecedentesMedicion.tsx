"use client";

import NextLink from "next/link";
import { Box, Grid, Link, Paper, Typography } from "@mui/material";
import type { AntecedentesReporte, Catalogos } from "../../domain/models/Monitoreo";
import { CampoCatalogo, CampoTexto, formatearDia } from "./CamposReporte";

const RUTA = "/dashboard/monitoreo-equipos";

interface Props {
  antecedentes: AntecedentesReporte | null;
  catalogos: Catalogos;
  soloLectura: boolean;
}

/**
 * ANTECEDENTES de un reporte con medición de espesores (ultrasonido): el
 * equipo de UT y su calibración, el texto que escribe el analista y lo
 * anterior. No hay ficha de piezas: el equipo puede no ser una bomba.
 */
export function SeccionAntecedentesMedicion({ antecedentes, catalogos, soloLectura }: Props) {
  const a = antecedentes;
  const anterior = a?.informe_anterior;
  const medicion = a?.medicion_anterior;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        Antecedentes
      </Typography>

      <Typography variant="body2" fontWeight={600} mb={1}>
        Equipo de ultrasonido
      </Typography>
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CampoCatalogo
            nombre="lecturas.instrumento"
            etiqueta="Equipo UT"
            opciones={catalogos.instrumento}
            soloLectura={soloLectura}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <CampoTexto
            nombre="lecturas.velocidad_ms"
            label="Velocidad (m/s)"
            helperText="Acero: 5920"
            slotProps={{ htmlInput: { inputMode: "decimal" } }}
            soloLectura={soloLectura}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <CampoTexto
            nombre="lecturas.frecuencia_mhz"
            label="Sensor (MHz)"
            helperText="P. ej. 7,5"
            slotProps={{ htmlInput: { inputMode: "decimal" } }}
            soloLectura={soloLectura}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={12}>
          <CampoTexto
            nombre="antecedentes_texto"
            label="Antecedentes"
            helperText="Cambios, paradas o intervenciones desde la última medición"
            multiline
            minRows={2}
            soloLectura={soloLectura}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CampoTexto
            nombre="informe_anterior_url"
            label="Informe anterior (enlace)"
            placeholder="https://…"
            type="url"
            soloLectura={soloLectura}
            helperText={
              anterior ? (
                <>
                  Último emitido en el sistema:{" "}
                  <Link component={NextLink} href={`${RUTA}/${anterior.id}`}>
                    {anterior.codigo_interno ?? "sin código"} · {formatearDia(anterior.fecha)}
                  </Link>
                </>
              ) : (
                "Pegue el enlace al informe anterior"
              )
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Medición anterior
            </Typography>
            <Typography variant="body2">
              {medicion ? (
                <Link component={NextLink} href={`${RUTA}/${medicion.id}`}>
                  {medicion.codigo_interno ?? "sin código"} · {formatearDia(medicion.fecha)}
                </Link>
              ) : (
                "Sin medición emitida de este tag"
              )}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
