// app/dashboard/graphics/extinguishers/page.tsx
"use client";

import React from "react";
import {
  Box,
  Grid,
  Paper,
  Container,
  Button,
  Alert,
  Typography,
  LinearProgress,
  Card,
} from "@mui/material";
import {
  FireExtinguisher,
  Warning,
  Refresh,
  Error as ErrorIcon,
} from "@mui/icons-material";
import GraphicCake from "./charts/GraphicCake";
import BarChart from "./charts/BarChart";
import ComparativeChart from "./charts/ComparativeChart";
import MetricsCards from "./charts/MetricsCards";
import { useExtintoresData } from "./hook/useEstadisticasExtintores";

interface PieDataItem {
  name: string;
  value: number;
  total: number;
}

interface BarDataItem {
  area: string;
  Total: number;
  Inspeccionados: number;
  Activos: number;
}

const DashboardExtintores: React.FC = () => {
  const {
    extintores,
    loading,
    lastUpdate,
    error,
    handleRetry,
    calcularEstadisticas,
    areasConAlerta,
  } = useExtintoresData();

  // Preparar datos para los componentes
  const stats = calcularEstadisticas();
  const datosPastel: PieDataItem[] = stats.map((area) => ({
    name: area.area,
    value: area.porcentaje,
    total: area.total,
  }));
  const datosBarras: BarDataItem[] = stats.map((area) => ({
    area: area.area,
    Total: area.total,
    Inspeccionados: area.inspeccionados,
    Activos: area.activos,
  }));
  const alertas = areasConAlerta();

  // Pantalla de error
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <ErrorIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Error de Conexión
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleRetry}
          >
            Reintentar
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          Cargando datos de extintores...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <FireExtinguisher sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              🚀 DASHBOARD EXTINTORES
            </Typography>
            <Typography variant="subtitle1">
              Monitoreo en tiempo real del estado de los extintores
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Alerta */}
      {alertas.length > 0 && (
        <Alert
          severity="warning"
          icon={<Warning />}
          sx={{ mb: 3 }}
          action={
            <Button variant="contained" size="small" onClick={handleRetry}>
              Actualizar
            </Button>
          }
        >
          ALERTA: {alertas.length} área(s) con inspecciones bajas
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Métricas Principales */}
        <MetricsCards extintores={extintores} />

        {/* Gráfico de Torta */}
        <Grid size={{ xs: 12, md: 6 }}>
          <GraphicCake datosPastel={datosPastel} />
        </Grid>

        {/* Gráfico de Barras */}
        <Grid size={{ xs: 12, md: 6 }}>
          <BarChart datosBarras={datosBarras} />
        </Grid>

        {/* Tabla Comparativa */}
        <Grid size={{ xs: 12 }}>
          <ComparativeChart stats={stats} />
        </Grid>
      </Grid>

      {/* Footer con última actualización */}
      <Card
        sx={{
          mt: 3,
          p: 2,
          textAlign: "center",
          borderRadius: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2">
          🔄 Actualizado hace 15 segundos - {lastUpdate}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={handleRetry}
          size="small"
        >
          Actualizar
        </Button>
      </Card>
    </Container>
  );
};

export default DashboardExtintores;
