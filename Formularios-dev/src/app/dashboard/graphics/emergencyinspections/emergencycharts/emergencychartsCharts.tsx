import React from "react";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AreaStats, ChartData} from "../types/IProps";
import { chartColors } from "@/styles/chartTheme";

interface DashboardChartsProps {
  estadisticasGlobales: AreaStats[];
}

export const DashboardCharts = ({
  estadisticasGlobales,
}: DashboardChartsProps) => {
  const getBarData = (): ChartData[] => {
    return estadisticasGlobales.slice(0, 10).map((area) => ({
      name: area.area.length > 12 ? area.area.substring(0, 12) + "..." : area.area,
      cumplimiento: area.cumplimiento,
      inspecciones: area.totalInspecciones,
      extintores: area.extintoresInspeccionados,
      tendencia: area.tendencia,
    }));
  };

  const getPieData = () => {
    const optimo = estadisticasGlobales.filter(
      (s) => s.estado === "OPTIMO"
    ).length;
    const advertencia = estadisticasGlobales.filter(
      (s) => s.estado === "ADVERTENCIA"
    ).length;
    const critico = estadisticasGlobales.filter(
      (s) => s.estado === "CRITICO"
    ).length;

    return [
      { name: "Óptimo", value: optimo, color: chartColors.colorExito },
      { name: "Advertencia", value: advertencia, color: chartColors.barraPendientes},
      { name: "Crítico", value: critico, color: chartColors.colorError},
    ];
  };

  const barData = getBarData();

  return (
    <>
      <Grid size={{ xs: 12, md: 8 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              fontWeight="bold"
              sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}
            >
               Cumplimiento por Área
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="cumplimiento"
                    name="Cumplimiento %"
                    fill={chartColors.barraTotal}
                  />
                  <Bar
                    dataKey="extintores"
                    name="Extintores"
                    fill={chartColors.barraInspeccionados}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              fontWeight="bold"
            >
             Estado General
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill={chartColors.barraTotal}
                    dataKey="value"
                  >
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};