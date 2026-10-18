"use client";

import { Paper, Stack, Typography } from "@mui/material";
import type { MovimientoReporte } from "../../domain/models/Monitoreo";

const ACCION: Record<MovimientoReporte["accion"], string> = {
  creado: "Creado",
  enviado: "Enviado a revisión",
  devuelto: "Devuelto",
  emitido: "Emitido",
};

const momento = (iso: string) =>
  new Date(iso).toLocaleString("es-BO", { dateStyle: "short", timeStyle: "short" });

/** Quién hizo qué y cuándo. Un devuelto muestra su motivo: es lo que hay que corregir. */
export function HistorialReporte({ historial }: { historial: MovimientoReporte[] }) {
  if (historial.length === 0) return null;
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} mb={1}>
        Historial
      </Typography>
      <Stack gap={1}>
        {[...historial].reverse().map((m, i) => (
          <Typography key={i} variant="body2">
            <strong>{ACCION[m.accion]}</strong> · {m.por} · {momento(m.en)}
            {m.motivo && (
              <Typography component="span" variant="body2" color="warning.main" display="block">
                Motivo: {m.motivo}
              </Typography>
            )}
          </Typography>
        ))}
      </Stack>
    </Paper>
  );
}
