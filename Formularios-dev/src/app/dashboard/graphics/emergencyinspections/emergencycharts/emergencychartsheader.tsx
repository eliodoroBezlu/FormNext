import React from "react";
import { Box, Typography, IconButton, Grid } from "@mui/material";
import { Security, Refresh } from "@mui/icons-material";
import { superficieDeMarca } from "@/styles/marca";

interface DashboardHeaderProps {
  tagsCount: number;
  refreshing: boolean;
  onRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  refreshing,
  onRefresh,
}) => {
  return (
    <Box
      sx={{
        background: (theme) => superficieDeMarca(theme.palette.mode),
        borderRadius: 2,
        p: 3,
        color: "white",
      }}
      textAlign="center"
      mb={3}
    >
      <Grid
        container
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Grid size={{ xs: 12, sm: "auto" }}>
          <Security
            sx={{
              fontSize: { xs: 36, sm: 40, md: 48 },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            SISTEMAS DE EMERGENCIA
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: "auto" }}>
          <IconButton
            onClick={onRefresh}
            disabled={refreshing}
            size="large"
            sx={{ color: "white" }}
          >
            <Refresh />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};
