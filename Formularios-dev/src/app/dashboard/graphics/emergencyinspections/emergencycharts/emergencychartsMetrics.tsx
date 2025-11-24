import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import {
  CorporateFare,
  CalendarMonth,
  TrendingUp,
  Warning,
  Person,
} from "@mui/icons-material";
import { DashboardMetricsProps } from "../types/IProps";

export const DashboardMetrics = ({
  tagsCount,
  inspeccionesCount,
  promedioCumplimiento,
  alertasCriticasCount,
  estadisticasGlobales,
}: DashboardMetricsProps) => {
  const responsablesUnicos = new Set(
    estadisticasGlobales
      .map((area) =>
        area.responsable?.trim().toUpperCase().replace(/\s+/g, " ")
      )
      .filter(
        (resp) =>
          resp && resp !== "N/A" && resp !== "SIN ASIGNAR" && resp.length > 0
      )
  ).size;

  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardContent>
          <Grid container spacing={2} textAlign="center">
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
              <CorporateFare
                color="primary"
                sx={{ fontSize: { xs: 30, md: 40 } }}
              />
              <Typography variant="h6" fontWeight="bold">
                {tagsCount}
              </Typography>
              <Typography variant="body2">Áreas</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
              <CalendarMonth
                color="success"
                sx={{ fontSize: { xs: 30, md: 40 } }}
              />
              <Typography variant="h6" fontWeight="bold">
                {inspeccionesCount}
              </Typography>
              <Typography variant="body2">Inspecciones</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
              <TrendingUp color="info" sx={{ fontSize: { xs: 30, md: 40 } }} />
              <Typography variant="h6" fontWeight="bold">
                {promedioCumplimiento}%
              </Typography>
              <Typography variant="body2">Cumplimiento</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
              <Warning color="warning" sx={{ fontSize: { xs: 30, md: 40 } }} />
              <Typography variant="h6" fontWeight="bold">
                {alertasCriticasCount}
              </Typography>
              <Typography variant="body2">Alertas</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2.4 }}>
              <Person color="secondary" sx={{ fontSize: { xs: 30, md: 40 } }} />
              <Typography variant="h6" fontWeight="bold">
                {responsablesUnicos}
              </Typography>
              <Typography variant="body2">Responsables</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
};
