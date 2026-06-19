import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import {
  TrendingUp,
  Warning,
  CheckCircle,
  AssignmentTurnedIn,
} from "@mui/icons-material";
import { DashboardMetricsProps } from "../types/IProps";


export const DashboardMetrics = ({
  tagsCount,
  coberturaInspecciones,
  cumplimientoExtintores,
  alertasCriticasCount,
}: DashboardMetricsProps) => {
  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardContent>
          <Grid container spacing={2} textAlign="center">
            {/* Tags Activos */}
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <AssignmentTurnedIn
                color="primary"
                sx={{ fontSize: { xs: 30, md: 40 } }}
              />
              <Typography variant="h6" fontWeight="bold">
                {tagsCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">Tags Activos</Typography>
            </Grid>

            {/* Cobertura de Tags */}
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <TrendingUp color="info" sx={{ fontSize: { xs: 30, md: 40 } }} />
              <Typography variant="h6" fontWeight="bold">
                {coberturaInspecciones}%
              </Typography>
              <Typography variant="body2" color="text.secondary">Cobertura de Tags</Typography>
            </Grid>

            {/* Cumplimiento de Extintores */}
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <CheckCircle color="secondary" sx={{ fontSize: { xs: 30, md: 40 } }} />
              <Typography variant="h6" fontWeight="bold">
                {cumplimientoExtintores}%
              </Typography>
              <Typography variant="body2" color="text.secondary">Cumplimiento Extintores</Typography>
            </Grid>

            {/* Alertas */}
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <Warning color="warning" sx={{ fontSize: { xs: 30, md: 40 } }} />
              <Typography variant="h6" fontWeight="bold">
                {alertasCriticasCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">Alertas (Cobertura &lt; 70%)</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
};
