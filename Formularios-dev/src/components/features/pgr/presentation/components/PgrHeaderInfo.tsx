"use client";

import { Card, CardContent, Grid, Typography, alpha, useTheme } from "@mui/material";
import type { ReactNode } from "react";
import { Pgr } from "../../domain/models/IProps";

export interface PgrHeaderInfoField {
  label: string;
  value: ReactNode;
}

export interface PgrHeaderInfoProps {
  pgr: Pgr;
  /** Campos adicionales mostrados junto al Código; cada uno ocupa una columna. */
  extraFields: PgrHeaderInfoField[];
  /** Color semántico base del panel (mapeado a `theme.palette`). */
  color?: "info" | "success";
}

/**
 * Bloque de cabecera compartido (Código + campos contextuales) usado tanto en
 * el flujo de aprobación como en el de seguimiento de un PGR. Reemplaza la
 * duplicación que existía entre `aprobacion/[id]/page.tsx` y
 * `seguimiento/[id]/page.tsx`.
 */
export function PgrHeaderInfo({ pgr, extraFields, color = "info" }: PgrHeaderInfoProps) {
  const theme = useTheme();
  const base = color === "success" ? theme.palette.success.main : theme.palette.info.main;

  return (
    <Card
      elevation={0}
      sx={{
        mb: 4,
        borderRadius: 2,
        backgroundColor: alpha(base, 0.06),
        border: `1px solid ${alpha(base, 0.25)}`,
      }}
    >
      <CardContent>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Código del Plan
            </Typography>
            <Typography variant="h6">{pgr.codigoAutogenerado}</Typography>
          </Grid>
          {extraFields.map((field) => (
            <Grid size={{ xs: 12, sm: 3 }} key={field.label}>
              <Typography variant="body2" color="text.secondary">
                {field.label}
              </Typography>
              <Typography variant="body1">{field.value}</Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
