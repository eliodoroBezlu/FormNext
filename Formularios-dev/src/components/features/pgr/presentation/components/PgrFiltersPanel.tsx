"use client";

import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Add as AddIcon, Clear as ClearIcon } from "@mui/icons-material";
import { PgrEstado, PgrFilters } from "../../domain/models/IProps";

export interface PgrFiltersPanelProps {
  filters: PgrFilters;
  onFilterChange: <K extends keyof PgrFilters>(key: K, value: PgrFilters[K]) => void;
  onClear: () => void;
  onNuevo: () => void;
  disabled?: boolean;
}

export function PgrFiltersPanel({
  filters,
  onFilterChange,
  onClear,
  onNuevo,
  disabled,
}: PgrFiltersPanelProps) {
  return (
    <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: "8px" }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Filtros y Controles
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Código"
            variant="outlined"
            size="small"
            value={filters.codigo}
            onChange={(e) => onFilterChange("codigo", e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Empresa"
            variant="outlined"
            size="small"
            value={filters.empresa}
            onChange={(e) => onFilterChange("empresa", e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Estado Flujo</InputLabel>
            <Select
              value={filters.estado}
              onChange={(e) => onFilterChange("estado", e.target.value)}
              label="Estado Flujo"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value={PgrEstado.BORRADOR}>Borrador</MenuItem>
              <MenuItem value={PgrEstado.EN_REVISION}>En Revisión</MenuItem>
              <MenuItem value={PgrEstado.CORREGIR}>Corregir</MenuItem>
              <MenuItem value={PgrEstado.APROBADO}>Aprobado</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Estatus Activo</InputLabel>
            <Select
              value={filters.activo}
              onChange={(e) => onFilterChange("activo", e.target.value)}
              label="Estatus Activo"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="true">Activo</MenuItem>
              <MenuItem value="false">Inactivo</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button variant="outlined" startIcon={<ClearIcon />} onClick={onClear} type="button">
          Limpiar Filtros
        </Button>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNuevo}
          color="primary"
          disabled={disabled}
          type="button"
        >
          Nuevo PGR
        </Button>
      </Box>
    </Paper>
  );
}
