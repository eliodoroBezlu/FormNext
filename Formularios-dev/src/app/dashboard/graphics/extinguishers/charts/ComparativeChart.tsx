import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
} from "@mui/material";
import { Warning, CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import type { AreaStats } from "../types/Iprops";
import { chartColors } from "@/styles/chartTheme";

interface ComparativeChartProps {
  stats: AreaStats[];
}

const ComparativeChart: React.FC<ComparativeChartProps> = ({ stats }) => {
  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📈 Métricas Comparativas
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2, fontWeight: "bold" }}>
          <Grid size={{ xs: 3 }}>
            <Typography>Área</Typography>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <Typography>Total</Typography>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <Typography>Insp</Typography>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <Typography>Activos</Typography>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Typography>% Completado</Typography>
          </Grid>
        </Grid>

        {stats.map((area: AreaStats) => (
          <Grid
            key={area.area}
            container
            spacing={2}
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Grid size={{ xs: 3 }}>
              <Box display="flex" alignItems="center" gap={1}>
                {area.porcentaje >= 80 ? (
                  <CheckCircle
                    sx={{ color: chartColors.estadoSuccess }}
                    fontSize="small"
                  />
                ) : area.porcentaje >= 60 ? (
                  <ErrorIcon
                    sx={{ color: chartColors.estadoWarning }}
                    fontSize="small"
                  />
                ) : (
                  <Warning
                    sx={{ color: chartColors.estadoError }}
                    fontSize="small"
                  />
                )}
                <Typography>{area.area}</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 2 }}>
              <Chip
                label={area.total}
                variant="outlined"
                size="small"
                sx={{
                  color: chartColors.barraTotal,
                  borderColor: chartColors.barraTotal,
                }}
              />
            </Grid>
            <Grid size={{ xs: 2 }}>
              <Chip
                label={area.inspeccionados}
                variant="outlined"
                size="small"
                sx={{
                  color: chartColors.barraInspeccionados,
                  borderColor: chartColors.barraInspeccionados,
                }}
              />
            </Grid>
            <Grid size={{ xs: 2 }}>
              <Chip
                label={area.activos}
                variant="outlined"
                size="small"
                sx={{
                  color: chartColors.barraActivos,
                  borderColor: chartColors.barraActivos,
                }}
              />
            </Grid>
            <Grid size={{ xs: 3 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <LinearProgress
                  variant="determinate"
                  value={area.porcentaje}
                  sx={{
                    flexGrow: 1,
                    height: 8,
                    borderRadius: 4,
                    "& .MuiLinearProgress-bar": {
                      backgroundColor:
                        area.porcentaje >= 80
                          ? chartColors.estadoSuccess
                          : area.porcentaje >= 60
                            ? chartColors.estadoWarning
                            : chartColors.estadoError,
                    },
                  }}
                />
                <Typography variant="body2" minWidth={35}>
                  {area.porcentaje}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        ))}
      </CardContent>
    </Card>
  );
};

export default ComparativeChart;