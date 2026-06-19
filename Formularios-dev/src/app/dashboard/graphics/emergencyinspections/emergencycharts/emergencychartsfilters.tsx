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
  OutlinedInput,
  Checkbox,
  ListItemText,
  Chip,
  Box,
} from "@mui/material";
import { FilterAlt } from "@mui/icons-material";
import { chartColors } from "@/styles/chartTheme";

interface DashboardFiltersProps {
  filtroSuperintendencia: string;
  filtroAreas: string[];
  filtroTags: string[];
  filtroMes: string;
  filtroAño: string;
  onSuperintendenciaChange: (value: string) => void;
  onAreasChange: (value: string[]) => void;
  onTagsChange: (value: string[]) => void;
  onMesChange: (value: string) => void;
  onAñoChange: (value: string) => void;
  superintendencias: string[];
  areas: string[];
  tags: string[];
  meses: string[];
  años: string[];
}

const styles = {
  smallFont: {
    fontSize: "0.85rem",
  },
  menuItem: {
    fontSize: "0.85rem",
    py: 0.5,
  },
  select: {
    fontSize: "0.85rem",
    "& .MuiSelect-select": {
      fontSize: "0.85rem",
      display: "flex",
      flexWrap: "wrap",
      gap: 0.5,
    },
  },
};

export const DashboardFilters = ({
  filtroSuperintendencia,
  filtroAreas,
  filtroTags,
  filtroMes,
  filtroAño,
  onSuperintendenciaChange,
  onAreasChange,
  onTagsChange,
  onMesChange,
  onAñoChange,
  superintendencias,
  areas,
  tags,
  meses,
  años,
}: DashboardFiltersProps) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <FilterAlt sx={{ color: chartColors.barraActivos }} />
          <Typography
            variant="h6"
            color={chartColors.barraActivos}
            fontWeight="bold"
            sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" } }}
          >
            FILTROS
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {/* Superintendencia */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
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
                    {sup.length > 30 ? sup.substring(0, 30) + "..." : sup}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Área (Multi-select) */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={styles.smallFont}>Áreas</InputLabel>
              <Select
                multiple
                value={filtroAreas}
                onChange={(e) =>
                  onAreasChange(
                    typeof e.target.value === "string"
                      ? e.target.value.split(",")
                      : e.target.value,
                  )
                }
                input={<OutlinedInput label="Áreas" sx={styles.smallFont} />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
                sx={styles.select}
              >
                {areas.map((area) => (
                  <MenuItem key={area} value={area} sx={styles.menuItem}>
                    <Checkbox
                      checked={filtroAreas.indexOf(area) > -1}
                      size="small"
                    />
                    <ListItemText
                      primary={area}
                      primaryTypographyProps={{ fontSize: "0.85rem" }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Tags (Multi-select) */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={styles.smallFont}>Tags</InputLabel>
              <Select
                multiple
                value={filtroTags}
                onChange={(e) =>
                  onTagsChange(
                    typeof e.target.value === "string"
                      ? e.target.value.split(",")
                      : e.target.value,
                  )
                }
                input={<OutlinedInput label="Tags" sx={styles.smallFont} />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
                sx={styles.select}
              >
                {tags.map((tag) => (
                  <MenuItem key={tag} value={tag} sx={styles.menuItem}>
                    <Checkbox
                      checked={filtroTags.indexOf(tag) > -1}
                      size="small"
                    />
                    <ListItemText
                      primary={tag}
                      primaryTypographyProps={{ fontSize: "0.85rem" }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Mes (Single-select) */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={styles.smallFont}>Mes</InputLabel>
              <Select
                value={filtroMes}
                label="Mes"
                onChange={(e) => onMesChange(e.target.value)}
                sx={styles.select}
              >
                {meses.map((mes) => (
                  <MenuItem key={mes} value={mes} sx={styles.menuItem}>
                    {mes}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Año */}
          <Grid size={{ xs: 12, sm: 6, md: 1.6 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={styles.smallFont}>Año</InputLabel>
              <Select
                value={filtroAño}
                label="Año"
                onChange={(e) => onAñoChange(e.target.value)}
                sx={styles.select}
              >
                <MenuItem value="" sx={styles.menuItem}>
                  Todos
                </MenuItem>
                {años.map((año) => (
                  <MenuItem key={año} value={año} sx={styles.menuItem}>
                    {año}
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
