"use client";

import { useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Typography } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { FotosEquipo } from "@/components/features/herra-equipos/presentation/components/management/FotosEquipo";
import { numero, type OpcionTexto, type ValoresEquipo } from "../../domain/formularioEquipo";
import { ESTADOS_EQUIPO } from "../../domain/models/Equipo";
import { CampoSelect, CampoSugerido, CampoTexto } from "./CamposEquipo";

const CAMPOS_DE_LA_SECCION = ["cantidad", "costo", "estado", "codigo_antiguo", "frecuencia_uso", "observaciones"] as const;

/**
 * 4. Lo opcional, plegado: casi nunca cambia al cargar. Se abre solo si tiene
 * un error, para que el envío pueda llevar hasta él.
 */
export function SeccionMasDatos({ frecuencias }: { frecuencias: OpcionTexto[] }) {
  const { control, formState } = useFormContext<ValoresEquipo>();
  const [abierta, setAbierta] = useState(false);
  const conError = CAMPOS_DE_LA_SECCION.some((c) => formState.errors[c]);
  const [estado, cantidad, fotos] = useWatch({ control, name: ["estado", "cantidad", "fotos"] });

  const resumen = [
    estado || "Operativo",
    `${cantidad || 1} ${Number(cantidad) === 1 || !cantidad ? "unidad" : "unidades"}`,
    fotos?.length ? `${fotos.length} foto${fotos.length === 1 ? "" : "s"}` : "sin fotos",
  ].join(" · ");

  return (
    <Accordion
      expanded={abierta || conError}
      onChange={(_, v) => setAbierta(v)}
      disableGutters
      variant="outlined"
      sx={{ borderRadius: 1, "&::before": { display: "none" } }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} component="h3">
            Más datos (opcional)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {resumen} — estado, cantidad, código antiguo, frecuencia de uso, costo, observaciones y fotos
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <CampoSelect
              nombre="estado"
              label="Estado"
              opciones={ESTADOS_EQUIPO.map((e) => ({ valor: e, etiqueta: e }))}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <CampoTexto
              nombre="cantidad"
              label="Cantidad"
              reglas={{
                validate: (v) => {
                  const n = numero(String(v ?? ""));
                  return (n !== undefined && Number.isInteger(n) && n >= 1) || "Un número entero, 1 o más.";
                },
              }}
              slotProps={{ htmlInput: { inputMode: "numeric" } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <CampoTexto
              nombre="costo"
              label="Costo"
              reglas={{
                validate: (v) => {
                  const t = String(v ?? "").trim();
                  if (!t) return true;
                  const n = numero(t);
                  return (n !== undefined && n >= 0) || "Un número, o déjelo vacío.";
                },
              }}
              ayuda="Déjelo vacío si no lo sabe."
              slotProps={{ htmlInput: { inputMode: "decimal" } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CampoTexto nombre="codigo_antiguo" label="Código antiguo" ayuda="El código que tenía antes, si lo hay." />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CampoSugerido nombre="frecuencia_uso" label="Frecuencia de uso" opciones={frecuencias} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CampoTexto nombre="observaciones" label="Observaciones" multiline minRows={2} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="fotos"
              control={control}
              render={({ field }) => <FotosEquipo fotos={field.value ?? []} onChange={field.onChange} />}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
