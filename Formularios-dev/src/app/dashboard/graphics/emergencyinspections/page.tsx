'use client';

import React, { useState } from 'react';
import {
  Paper,
  Grid,
  Box,
  Typography,
  Snackbar,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useDashboardData } from './hooks/useDashboardData';
import { useDashboardCalculations } from './hooks/useDashboardCalculations';
import { DashboardHeader } from './emergencycharts/emergencychartsheader';
import { DashboardFilters } from './emergencycharts/emergencychartsfilters';
import { DashboardAlerts } from './emergencycharts/emergencychartsalerts';
import { DashboardMetrics } from './emergencycharts/emergencychartsMetrics';
import { DashboardCharts } from './emergencycharts/emergencychartsCharts';
import { LiveCommandCenter } from './emergencycharts/emergencychartsLiveCenter';
import { Refresh } from '@mui/icons-material';

const DashboardEmergencyInspections: React.FC = () => {
  const [filtroSuperintendencia, setFiltroSuperintendencia] = useState<string>('');
  const [filtroArea, setFiltroArea] = useState<string>('');
  const [filtroMes, setFiltroMes] = useState<string>('');

  const {
    tags,
    inspecciones,
    loading,
    error,
    lastUpdated,
    refreshing,
    fetchData,
  } = useDashboardData();

  const { calcularEstadisticasPorArea, calcularPromedioCumplimiento } = useDashboardCalculations();

  const inspeccionesFiltradas = inspecciones.filter((inspeccion) => {
    const cumpleSuperintendencia =
      !filtroSuperintendencia || inspeccion.superintendencia.includes(filtroSuperintendencia);
    const cumpleArea = !filtroArea || inspeccion.area.includes(filtroArea);
    const cumpleMes = !filtroMes || inspeccion.mesActual === filtroMes;

    return cumpleSuperintendencia && cumpleArea && cumpleMes;
  });

  const estadisticasGlobales = calcularEstadisticasPorArea(inspeccionesFiltradas);
  const promedioCumplimiento = calcularPromedioCumplimiento(inspeccionesFiltradas);
  const alertasCriticas = estadisticasGlobales.filter((area) => area.estado === 'CRITICO');
  const areasSinInspecciones = estadisticasGlobales.filter((area) => area.totalInspecciones === 0);

  const getSuperintendencias = () => [...new Set(inspecciones.map((ins) => ins.superintendencia))];
  const getAreas = () => [...new Set(inspecciones.map((ins) => ins.area))];
  const getMeses = () => [...new Set(inspecciones.map((ins) => ins.mesActual))];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap={2}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Cargando dashboard de inspecciones...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap={2}>
        <Alert severity="error" sx={{ mb: 2, maxWidth: 500 }}>
          Error cargando datos: {error}
        </Alert>
        <Button variant="contained" startIcon={<Refresh />} onClick={() => fetchData(true)}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },

        minHeight: '100vh',
      }}
    >
      <DashboardHeader
        tagsCount={tags.length}
        inspeccionesCount={inspeccionesFiltradas.length}
        refreshing={refreshing}
        onRefresh={() => fetchData(true)}
      />

      <DashboardFilters
        filtroSuperintendencia={filtroSuperintendencia}
        filtroArea={filtroArea}
        filtroMes={filtroMes}
        onSuperintendenciaChange={setFiltroSuperintendencia}
        onAreaChange={setFiltroArea}
        onMesChange={setFiltroMes}
        superintendencias={getSuperintendencias()}
        areas={getAreas()}
        meses={getMeses()}
      />

      <DashboardAlerts
        alertasCriticas={alertasCriticas}
        areasSinInspecciones={areasSinInspecciones}
      />

      <Grid container spacing={3}>
        <DashboardMetrics
          tagsCount={tags.length}
          inspeccionesCount={inspeccionesFiltradas.length}
          promedioCumplimiento={promedioCumplimiento}
          alertasCriticasCount={alertasCriticas.length}
          estadisticasGlobales={estadisticasGlobales}
        />

        <DashboardCharts estadisticasGlobales={estadisticasGlobales} />

        <LiveCommandCenter
          estadisticasGlobales={estadisticasGlobales}
          alertasCriticasCount={alertasCriticas.length}
        />
      </Grid>

      <Box
        textAlign="center"
        mt={3}
        
      >
        <Typography variant="body2">
          {refreshing
            ? '🔄 Actualizando...'
            : `🔄 Actualizado hace ${Math.round(
                (new Date().getTime() - lastUpdated.getTime()) / 1000
              )} segundos - ${lastUpdated.toLocaleTimeString()}`}
        </Typography>
      </Box>

      <Snackbar
        open={refreshing}
        message="Actualizando datos..."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </Paper>
  );
};

export default DashboardEmergencyInspections;