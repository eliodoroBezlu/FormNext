import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { chartColors } from "@/styles/chartTheme";

interface BarDataItem {
  area: string;
  Total: number;
  Inspeccionados: number;
  Activos: number;
}

interface BarChartProps {
  datosBarras: BarDataItem[];
}

const BarChart: React.FC<BarChartProps> = ({ datosBarras }) => {
  return (
    <Card elevation={3}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: chartColors.colorTextoPrimario }}
        >
          📋 Estado por Ubicación
        </Typography>
        <Box height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={datosBarras}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="area" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Total" fill={chartColors.barraTotal} />
              <Bar
                dataKey="Inspeccionados"
                fill={chartColors.barraInspeccionados}
              />
              <Bar dataKey="Activos" fill={chartColors.barraActivos} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BarChart;