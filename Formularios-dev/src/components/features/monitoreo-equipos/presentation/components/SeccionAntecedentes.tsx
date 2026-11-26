"use client";

import NextLink from "next/link";
import { Alert, Box, Grid, Link, Paper, Typography } from "@mui/material";
import { soloDigitos } from "../../domain/formularioReporte";
import type { AntecedentesReporte, Catalogos } from "../../domain/models/Monitoreo";
import { CampoCatalogo, CampoTexto, formatearDia } from "./CamposReporte";
import { TablaPiezas } from "./TablaPiezas";

interface Props {
  antecedentes: AntecedentesReporte | null;
  catalogos: Catalogos;
  soloLectura: boolean;
  /** Las horas cambian los cálculos: al salir del campo se vuelven a pedir. */
  onCambioDeHoras: () => void;
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {etiqueta}
      </Typography>
      <Typography variant="body2">{valor || "—"}</Typography>
    </Box>
  );
}

/**
 * ANTECEDENTES: las lecturas del día, lo que el sistema sabe de la bomba
 * (equipo, última intervención), el enlace al informe anterior y la tabla de
 * piezas, que el analista completa.
 *
 * Sin TMEF, horas restantes, fecha tentativa, bombas pares ni tag de PI: los
 * pidió quitar Confiabilidad (2026-11-18).
 */
export function SeccionAntecedentes({
  antecedentes,
  catalogos,
  soloLectura,
  onCambioDeHoras,
}: Props) {
  const a = antecedentes;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        Antecedentes
      </Typography>

      <Typography variant="body2" fontWeight={600} mb={1}>
        Lecturas del día
      </Typography>
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <CampoTexto
            nombre="lecturas.horas"
            label="Horas"
            helperText="Solo números. Desde la última intervención"
            filtro={soloDigitos}
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
            soloLectura={soloLectura}
            onBlur={onCambioDeHoras}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <CampoTexto
            nombre="lecturas.fecha_horas"
            label="Leídas el"
            type="date"
            helperText="Si no es la fecha del reporte"
            soloLectura={soloLectura}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <CampoTexto
            nombre="lecturas.temp_referencia_c"
            label="Temp. referencia (°C)"
            slotProps={{ htmlInput: { inputMode: "decimal" } }}
            soloLectura={soloLectura}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <CampoCatalogo
            nombre="lecturas.punto_referencia"
            etiqueta="Tomada en"
            opciones={catalogos.punto_referencia}
            soloLectura={soloLectura}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <CampoCatalogo
            nombre="lecturas.instrumento"
            etiqueta="Instrumento"
            opciones={catalogos.instrumento}
            soloLectura={soloLectura}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <CampoTexto
            nombre="lecturas.emisividad"
            label="Emisividad"
            required
            helperText="Por defecto 0,95"
            slotProps={{ htmlInput: { inputMode: "decimal" } }}
            soloLectura={soloLectura}
          />
        </Grid>
      </Grid>

      {!a ? (
        <Alert severity="info">Elija la bomba para ver su ficha, sus piezas y su historial.</Alert>
      ) : (
        <>
          <Grid container spacing={2} mb={1}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Dato
                etiqueta="Equipo bomba"
                valor={[a.ficha.fabricante, a.ficha.modelo].filter(Boolean).join(" · ")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Dato
                etiqueta="Última intervención"
                valor={
                  a.ultima_intervencion
                    ? [
                        formatearDia(a.ultima_intervencion.fecha),
                        a.ultima_intervencion.tipo,
                        a.ultima_intervencion.ot && `OT ${a.ultima_intervencion.ot}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : "Sin registro"
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <CampoTexto
                nombre="informe_anterior_url"
                label="Informe anterior (enlace)"
                placeholder="https://…"
                type="url"
                soloLectura={soloLectura}
                helperText={
                  a.informe_anterior ? (
                    <>
                      Último emitido en el sistema:{" "}
                      <Link
                        component={NextLink}
                        href={`/dashboard/monitoreo-equipos/${a.informe_anterior.id}`}
                      >
                        {a.informe_anterior.codigo_interno ?? "sin código"} ·{" "}
                        {formatearDia(a.informe_anterior.fecha)}
                      </Link>
                    </>
                  ) : (
                    "Pegue el enlace al informe anterior"
                  )
                }
              />
            </Grid>
          </Grid>

          <TablaPiezas antecedentes={a} catalogos={catalogos} soloLectura={soloLectura} />
        </>
      )}
    </Paper>
  );
}
