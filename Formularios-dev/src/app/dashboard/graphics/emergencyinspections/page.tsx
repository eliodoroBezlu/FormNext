"use client";

import React, { useState, useMemo } from "react";
import {
  Paper,
  Grid,
  Box,
  Typography,
  Snackbar,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useDashboardData } from "./hooks/useDashboardData";
import { calcularEstadisticasPorArea } from "./utils/dashboardCalculations";
import { DashboardHeader } from "./emergencycharts/emergencychartsheader";
import { DashboardFilters } from "./emergencycharts/emergencychartsfilters";
import { DashboardCharts } from "./emergencycharts/emergencychartsCharts";
import { LiveCommandCenter } from "./emergencycharts/emergencychartsLiveCenter";
import { Refresh } from "@mui/icons-material";

const DashboardEmergencyInspections: React.FC = () => {
  const [filtroSuperintendencia, setFiltroSuperintendencia] =
    useState<string>("");
  const [filtroAreas, setFiltroAreas] = useState<string[]>([]);
  const [filtroTags, setFiltroTags] = useState<string[]>([]);
  const [filtroMes, setFiltroMes] = useState<string>("");
  const [filtroAño, setFiltroAño] = useState<string>("");

  const {
    tags,
    inspecciones,
    extintores,
    loading,
    error,
    lastUpdated,
    refreshing,
    fetchData,
  } = useDashboardData();

  // 1. Calcular opciones dinámicas para los filtros (Cascada)
  // Superintendencia -> Áreas
  const areasDisponibles = useMemo(() => {
    const filteredIns = filtroSuperintendencia
      ? inspecciones.filter(
          (ins) => ins.superintendencia === filtroSuperintendencia,
        )
      : inspecciones;
    return [...new Set(filteredIns.map((ins) => ins.area))].sort();
  }, [inspecciones, filtroSuperintendencia]);

  // Áreas -> Tags
  const tagsDisponibles = useMemo(() => {
    let filteredTags = tags;
    if (filtroSuperintendencia) {
      filteredTags = filteredTags.filter(
        (t) => t.superintendencia === filtroSuperintendencia,
      );
    }
    if (filtroAreas.length > 0) {
      filteredTags = filteredTags.filter((t) => filtroAreas.includes(t.area));
    }
    return [...new Set(filteredTags.map((t) => t.tag))].sort();
  }, [tags, filtroSuperintendencia, filtroAreas]);

  const mesesDisponibles = useMemo(() => {
    return [...new Set(inspecciones.map((ins) => ins.mesActual))].sort();
  }, [inspecciones]);

  const añosDisponibles = useMemo(() => {
    return [...new Set(inspecciones.map((ins) => ins.año.toString()))].sort();
  }, [inspecciones]);

  // Initialize filtroMes with the current month (or first available)
  React.useEffect(() => {
    if (mesesDisponibles.length > 0 && !filtroMes) {
      const mesActual = new Date()
        .toLocaleString("es-CL", { month: "long" })
        .toUpperCase();
      if (mesesDisponibles.includes(mesActual)) {
        setFiltroMes(mesActual);
      } else {
        setFiltroMes(mesesDisponibles[0]);
      }
    }
  }, [mesesDisponibles, filtroMes]);

  // Manejadores de cambios para limpiar cascadas dependientes
  const handleSuperintendenciaChange = (val: string) => {
    setFiltroSuperintendencia(val);
    setFiltroAreas([]);
    setFiltroTags([]);
  };

  const handleAreasChange = (val: string[]) => {
    setFiltroAreas(val);
    setFiltroTags([]);
  };

  // 2. Filtrar inspecciones en base a la multiselección y deduplicar por tag
  const inspeccionesFiltradas = useMemo(() => {
    const filtradas = inspecciones.filter((inspeccion) => {
      const cumpleSuperintendencia =
        !filtroSuperintendencia ||
        inspeccion.superintendencia === filtroSuperintendencia;
      const cumpleArea =
        filtroAreas.length === 0 || filtroAreas.includes(inspeccion.area);
      const cumpleTag =
        filtroTags.length === 0 || filtroTags.includes(inspeccion.tag);
      const cumpleMes = !filtroMes || inspeccion.mesActual === filtroMes;
      const cumpleAño = !filtroAño || inspeccion.año.toString() === filtroAño;

      return (
        cumpleSuperintendencia &&
        cumpleArea &&
        cumpleTag &&
        cumpleMes &&
        cumpleAño
      );
    });

    // Deduplicar por tag para conservar solo el formulario más reciente de cada tag
    const uniqueTagsMap = new Map<string, (typeof inspecciones)[0]>();
    for (const ins of filtradas) {
      const existing = uniqueTagsMap.get(ins.tag);
      if (!existing) {
        uniqueTagsMap.set(ins.tag, ins);
      } else {
        const existingDate = new Date(
          existing.fechaUltimaModificacion,
        ).getTime();
        const currentDate = new Date(ins.fechaUltimaModificacion).getTime();
        if (currentDate > existingDate) {
          uniqueTagsMap.set(ins.tag, ins);
        }
      }
    }

    return Array.from(uniqueTagsMap.values());
  }, [
    inspecciones,
    filtroSuperintendencia,
    filtroAreas,
    filtroTags,
    filtroMes,
    filtroAño,
  ]);

  // 3. Estadísticas basadas en datos filtrados y deduplicados
  const estadisticasGlobales = useMemo(
    () => calcularEstadisticasPorArea(inspeccionesFiltradas, tags, extintores),
    [inspeccionesFiltradas, tags, extintores],
  );

  // Listados únicos estáticos para inicializar Superintendencias
  const todasSuperintendencias = useMemo(
    () => [...new Set(inspecciones.map((ins) => ins.superintendencia))].sort(),
    [inspecciones],
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Cargando dashboard de sistemas de emergencia...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <Alert severity="error" sx={{ mb: 2, maxWidth: 500 }}>
          Error cargando datos: {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => fetchData(true)}
        >
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
        minHeight: "100vh",
      }}
    >
      <DashboardHeader
        tagsCount={tags.length}
        refreshing={refreshing}
        onRefresh={() => fetchData(true)}
      />

      <DashboardFilters
        filtroSuperintendencia={filtroSuperintendencia}
        filtroAreas={filtroAreas}
        filtroTags={filtroTags}
        filtroMes={filtroMes}
        filtroAño={filtroAño}
        onSuperintendenciaChange={handleSuperintendenciaChange}
        onAreasChange={handleAreasChange}
        onTagsChange={setFiltroTags}
        onMesChange={setFiltroMes}
        onAñoChange={setFiltroAño}
        superintendencias={todasSuperintendencias}
        areas={areasDisponibles}
        tags={tagsDisponibles}
        meses={mesesDisponibles}
        años={añosDisponibles}
      />

      <Grid container spacing={3}>
        <DashboardCharts
          estadisticasGlobales={estadisticasGlobales}
          extintores={extintores}
          inspeccionesFiltradas={inspeccionesFiltradas}
          filtroMes={filtroMes}
          filtroSuperintendencia={filtroSuperintendencia}
          filtroAreas={filtroAreas}
          filtroTags={filtroTags}
          tags={tags}
        />

        <LiveCommandCenter
          inspeccionesFiltradas={inspeccionesFiltradas}
          extintores={extintores}
        />
      </Grid>

      <Box textAlign="center" mt={3}>
        <Typography variant="body2">
          {refreshing
            ? "🔄 Actualizando..."
            : `🔄 Actualizado hace ${Math.round(
                (new Date().getTime() - lastUpdated.getTime()) / 1000,
              )} segundos - ${lastUpdated.toLocaleTimeString()}`}
        </Typography>
      </Box>

      <Snackbar
        open={refreshing}
        message="Actualizando datos..."
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
    </Paper>
  );
};

export default DashboardEmergencyInspections;
