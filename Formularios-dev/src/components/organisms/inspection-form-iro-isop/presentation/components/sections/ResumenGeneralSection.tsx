// src/components/organisms/inspection-form-iro-isop/presentation/components/sections/ResumenGeneralSection.tsx

import React from "react";
import { Paper, Box, Typography, Grid } from "@mui/material";
import { Assessment } from "@mui/icons-material";

interface ResumenGeneralSectionProps {
  previewMetrics: {
    totalObtained: string;
    totalApplicable: string;
    totalNA: number;
    compliance: string;
  };
}

export const ResumenGeneralSection = ({ previewMetrics }: ResumenGeneralSectionProps) => {
  return (
    <Paper
      elevation={3}
      sx={{
        mb: 3,
        border: "2px solid",
        borderColor: "primary.main",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Assessment />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          RESUMEN GENERAL DE CUMPLIMIENTO
        </Typography>
      </Box>
      <Box p={3} sx={{ bgcolor: "background.paper" }}>
        <Grid container spacing={3} sx={{ textAlign: "center" }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: "medium", mb: 0.5 }}>
              Puntos Obtenidos
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "text.primary" }}>
              {previewMetrics.totalObtained}
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: "medium", mb: 0.5 }}>
              Puntos Aplicables
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "text.primary" }}>
              {previewMetrics.totalApplicable}
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: "medium", mb: 0.5 }}>
              Cantidad N/A
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "text.primary" }}>
              {previewMetrics.totalNA}
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: "medium", mb: 0.5 }}>
              % Cumplimiento Final
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "black", color: "primary.main" }}>
              {previewMetrics.compliance}%
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};
