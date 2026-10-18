"use client";

import { Chip, Stack, Typography } from "@mui/material";
import type { Alerta } from "../../domain/models/Monitoreo";
import { formatearDia } from "./CamposReporte";

const COLOR: Record<Alerta, "error" | "warning" | "success" | "default"> = {
  vencida: "error",
  proxima: "warning",
  al_dia: "success",
  sin_datos: "default",
};

/** «en 19 d», «hoy», «hace 3 d». */
export function enDias(dias?: number): string {
  if (dias === undefined) return "";
  if (dias === 0) return "hoy";
  return dias > 0 ? `en ${dias} d` : `hace ${-dias} d`;
}

/** Una fecha con su urgencia: el color dice si está vencida, próxima o al día. */
export function ChipAlerta({
  alerta,
  fecha,
  dias,
  sinDatos = "Sin reporte emitido",
}: {
  alerta: Alerta;
  fecha?: string;
  dias?: number;
  sinDatos?: string;
}) {
  if (alerta === "sin_datos" || !fecha) {
    return (
      <Typography variant="body2" color="text.secondary">
        {sinDatos}
      </Typography>
    );
  }
  return (
    <Stack direction="row" gap={1} alignItems="center">
      <Typography variant="body2">{formatearDia(fecha)}</Typography>
      <Chip size="small" color={COLOR[alerta]} label={enDias(dias)} />
    </Stack>
  );
}
