import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { chartColors, tortaColors } from "@/styles/chartTheme";

interface PieDataItem {
  name: string;
  value: number;
  total: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface GraphicCakeProps {
  datosPastel: PieDataItem[];
}

const GraphicCake: React.FC<GraphicCakeProps> = ({ datosPastel }) => {
  return (
    <Card elevation={3}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: chartColors.colorTextoPrimario }}
        >
          📊 Por Área
        </Typography>
        <Box height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={datosPastel}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill={chartColors.tortaPrimario}
                dataKey="value"
              >
                {datosPastel.map((entry: PieDataItem, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={tortaColors[index % tortaColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GraphicCake;