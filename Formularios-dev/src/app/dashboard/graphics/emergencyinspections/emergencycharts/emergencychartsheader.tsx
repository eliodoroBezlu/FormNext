import React from "react";
import { Box, Typography, IconButton, Grid } from "@mui/material";
import { Security, Refresh } from "@mui/icons-material";

interface DashboardHeaderProps {
  tagsCount: number;
  inspeccionesCount: number;
  refreshing: boolean;
  onRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  tagsCount,
  inspeccionesCount,
  refreshing,
  onRefresh,
}) => {
  return (
    <Box sx={{background: "linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)", borderRadius: 2, p: 3, color: "white"}} textAlign="center" mb={3} >
      <Grid container display="flex" alignItems="center"  justifyContent="center">
        <Grid size={{ xs: 12, sm: "auto" }}>
          <Security
            sx={{
              fontSize: { xs: 36, sm: 40, md: 48 },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <Typography
            variant="h6"
            gutterBottom
            fontWeight="bold"
          >
            🚀 DASHBOARD DE INSPECCIONES
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
            }}
          >
            {tagsCount} Áreas • {inspeccionesCount} Inspecciones
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: "auto" }}>
          <IconButton
            onClick={onRefresh}
            disabled={refreshing}
            size="large"
          >
            <Refresh />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};
