import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { FilterAlt } from "@mui/icons-material";
import { chartColors } from "@/styles/chartTheme";

interface DashboardFiltersProps {
  filtroSuperintendencia: string;
  filtroArea: string;
  filtroMes: string;
  onSuperintendenciaChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onMesChange: (value: string) => void;
  superintendencias: string[];
  areas: string[];
  meses: string[];
}

const styles = {
  smallFont: {
    fontSize: "0.85rem",
  },
  menuItem: {
    fontSize: "0.85rem",
    py: 1,
  },
  select: {
    fontSize: "0.85rem",
    "& .MuiSelect-select": {
      fontSize: "0.85rem",
    },
  },
};

export const DashboardFilters = ({
  filtroSuperintendencia,
  filtroArea,
  filtroMes,
  onSuperintendenciaChange,
  onAreaChange,
  onMesChange,
  superintendencias,
  areas,
  meses,
}:DashboardFiltersProps) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          color={chartColors.barraActivos}
          fontWeight="bold"
          sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" } }}
        >
          <FilterAlt />
          FILTROS
        </Typography>

        <Grid container spacing={{ xs: 1, sm: 2 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={styles.smallFont}>Superintendencia</InputLabel>
              <Select
                value={filtroSuperintendencia}
                label="Superintendencia"
                onChange={(e) => onSuperintendenciaChange(e.target.value)}
                sx={styles.select}
              >
                <MenuItem value="" sx={styles.menuItem}>
                  Todas
                </MenuItem>
                {superintendencias.map((sup) => (
                  <MenuItem
                    key={sup}
                    value={sup}
                    sx={styles.menuItem}
                    title={sup}
                  >
                    {sup.length > 50 ? sup.substring(0, 50) + "..." : sup}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={styles.smallFont}>Área</InputLabel>
              <Select
                value={filtroArea}
                label="Área"
                onChange={(e) => onAreaChange(e.target.value)}
                sx={styles.select}
              >
                <MenuItem value="" sx={styles.menuItem}>
                  Todas
                </MenuItem>
                {areas.map((area) => (
                  <MenuItem key={area} value={area} sx={styles.menuItem}>
                    {area}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={styles.smallFont}>Mes</InputLabel>
              <Select
                value={filtroMes}
                label="Mes"
                onChange={(e) => onMesChange(e.target.value)}
                sx={styles.select}
              >
                <MenuItem value="" sx={styles.menuItem}>
                  Todos
                </MenuItem>
                {meses.map((mes) => (
                  <MenuItem key={mes} value={mes} sx={styles.menuItem}>
                    {mes}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
