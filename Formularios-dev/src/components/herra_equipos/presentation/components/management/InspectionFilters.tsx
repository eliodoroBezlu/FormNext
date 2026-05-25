'use client';
import React from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Typography,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export interface InspectionFiltersValue {
  templateCode: string;
  status: string;
  location: string;
  submittedBy: string;
  startDate: string;
  endDate: string;
}

interface InspectionFiltersProps {
  filters: InspectionFiltersValue;
  onChange: (field: keyof InspectionFiltersValue, value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

export function InspectionFilters({
  filters,
  onChange,
  onSearch,
  onClear,
}: InspectionFiltersProps) {
  const router = useRouter();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: '8px' }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Filtros y Controles
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Código de Template"
            variant="outlined"
            size="small"
            value={filters.templateCode}
            onChange={(e) => onChange('templateCode', e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Estado</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => onChange('status', e.target.value)}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="draft">Borrador</MenuItem>
              <MenuItem value="completed">Completado</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Ubicación"
            variant="outlined"
            size="small"
            value={filters.location}
            onChange={(e) => onChange('location', e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Usuario"
            variant="outlined"
            size="small"
            value={filters.submittedBy}
            onChange={(e) => onChange('submittedBy', e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Fecha Inicio"
            type="date"
            variant="outlined"
            size="small"
            value={filters.startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Fecha Fin"
            type="date"
            variant="outlined"
            size="small"
            value={filters.endDate}
            onChange={(e) => onChange('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<ClearIcon />} onClick={onClear}>
            Limpiar Filtros
          </Button>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={onSearch}
            color="secondary"
          >
            Buscar
          </Button>
        </Box>

        <Button
          variant="contained"
          onClick={() => router.push('/dashboard/form-herra-equipos')}
          color="primary"
        >
          Nueva Inspección
        </Button>
      </Box>
    </Paper>
  );
}
