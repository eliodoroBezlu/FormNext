'use client';

import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Container,
  Alert as MuiAlert,
  Button,
} from '@mui/material';
import SemaforoFormularios from './InspectionForm/SemaforoFormularios';
import { useControlSemestral } from './hooks/useControlSemestral';

export default function DashboardControlSemestral() {
  const { datosControl, año, setAño, cargando, error, cargarDatos } = useControlSemestral();

  if (cargando) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando datos del dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <MuiAlert severity="error" sx={{ mb: 2 }}>
          {error}
        </MuiAlert>
        <Box display="flex" gap={2}>
          <Button variant="contained" onClick={cargarDatos}>
            Reintentar
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Control Semestral de Formularios
        </Typography>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Año</InputLabel>
          <Select
            value={año}
            label="Año"
            onChange={(e) => setAño(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Mostrando {datosControl.length} formularios con{" "}
          {datosControl.reduce((acc, curr) => acc + curr.totalInstancias, 0)}{" "}
          respuestas en {año}
        </Typography>
      </Box>

      <Grid size={{ xs: 12, sm: 12 }}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Semáforo de Estados
            </Typography>
            <SemaforoFormularios datos={datosControl} />
          </CardContent>
        </Card>
      </Grid>
    </Container>
  );
}