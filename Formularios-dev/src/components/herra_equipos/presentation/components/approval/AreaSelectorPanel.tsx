'use client';
import React, { useEffect, useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  Autocomplete,
  TextField,
} from '@mui/material';
import { FilterAlt, Search as SearchIcon } from '@mui/icons-material';
import { obtenerAreas } from '@/lib/actions/area-actions';

interface AreaSelectorPanelProps {
  userArea?: string;
  onConfirm: (areas: string[]) => void;
}

export function AreaSelectorPanel({ userArea, onConfirm }: AreaSelectorPanelProps) {
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(
    userArea ? [userArea] : [],
  );
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    async function fetchAreas() {
      try {
        const names = await obtenerAreas();
        setAvailableAreas(names);
      } catch {
        setFetchError(true);
      } finally {
        setLoadingAreas(false);
      }
    }
    fetchAreas();
  }, []);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        mb: 3,
        borderStyle: 'dashed',
        borderColor: 'primary.main',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <FilterAlt color="primary" />
        <Typography variant="subtitle1" fontWeight={700}>
          Selecciona las áreas a revisar
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Tu área asignada (<strong>{userArea || 'Sin área'}</strong>) está
        pre-seleccionada. Puedes agregar más áreas si tienes autorización para
        revisarlas.
      </Typography>

      {fetchError ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No se pudieron cargar las áreas del sistema. Recarga la página e
          intenta de nuevo.
        </Alert>
      ) : (
        <Autocomplete
          multiple
          options={availableAreas}
          value={selectedAreas}
          onChange={(_, newValue) => setSelectedAreas(newValue)}
          loading={loadingAreas}
          disableCloseOnSelect
          noOptionsText="No se encontraron áreas"
          loadingText="Cargando áreas..."
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option}
                {...getTagProps({ index })}
                key={option}
                color={option === userArea ? 'primary' : 'default'}
                size="small"
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Áreas disponibles"
              placeholder={loadingAreas ? 'Cargando...' : 'Selecciona un área'}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <SearchIcon
                      fontSize="small"
                      sx={{ mr: 0.5, color: 'text.secondary' }}
                    />
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
          sx={{ mb: 2 }}
        />
      )}

      <Button
        variant="contained"
        disabled={selectedAreas.length === 0 || loadingAreas}
        onClick={() => onConfirm(selectedAreas)}
        startIcon={<FilterAlt />}
      >
        Ver inspecciones pendientes ({selectedAreas.length} área
        {selectedAreas.length !== 1 ? 's' : ''})
      </Button>
    </Paper>
  );
}
