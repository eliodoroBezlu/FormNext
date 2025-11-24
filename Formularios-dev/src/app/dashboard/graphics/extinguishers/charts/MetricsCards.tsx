import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import { chartColors } from "@/styles/chartTheme";
import type { Extintor } from "../types/Iprops";

interface MetricsCardsProps {
  extintores: Extintor[];
}

interface MetricItem {
  title: string;
  value: number;
  color: string;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ extintores }) => {
  const metrics: MetricItem[] = [
    {
      title: "Total Extintores",
      value: extintores.length,
      color: chartColors.metricaTotal,
    },
    {
      title: "Inspeccionados",
      value: extintores.filter((e) => e.inspeccionado).length,
      color: chartColors.metricaInspeccionados,
    },
    {
      title: "Pendientes",
      value: extintores.filter((e) => !e.inspeccionado).length,
      color: chartColors.metricaPendientes,
    },
    {
      title: "Activos",
      value: extintores.filter((e) => e.activo).length,
      color: chartColors.metricaActivos,
    },
  ];

  return (
    <>
      {metrics.map((metric, index) => (
        <Grid key={index} size={{ xs: 12, md: 3 }}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {metric.title}
              </Typography>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: metric.color }}
              >
                {metric.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </>
  );
};

export default MetricsCards;