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
import { calcularEstadisticasPorArea, calcularDetalleTagsPorArea } from "./utils/dashboardCalculations";
import { DashboardHeader } from "./emergencycharts/emergencychartsheader";
import { DashboardFilters } from "./emergencycharts/emergencychartsfilters";
import { DashboardCharts } from "./emergencycharts/emergencychartsCharts";
import { LiveCommandCenter } from "./emergencycharts/emergencychartsLiveCenter";
import { TagDetailModal } from "./emergencycharts/emergencychartsTagDetailModal";
import { Refresh } from "@mui/icons-material";

// Lista fija de meses (siempre los 12, en orden cronológico) — no se deriva
// de los datos, para que el filtro no dependa de qué meses ya tienen inspecciones.
const MESES_DEL_AÑO = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

const DashboardEmergencyInspections: React.FC = () => {
  const [filtroSuperintendencia, setFiltroSuperintendencia] =
    useState<string>("");
  const [filtroAreas, setFiltroAreas] = useState<string[]>([]);
  const [filtroTags, setFiltroTags] = useState<string[]>([]);
  const [filtroMes, setFiltroMes] = useState<string>("");
  const [filtroAño, setFiltroAño] = useState<string>("");
  const [areaDetalle, setAreaDetalle] = useState<string | null>(null);

  const {
    tags,
    inspecciones,
    extintores,
    areas,
    loading,
    error,
    lastUpdated,
    refreshing,
    fetchData,
  } = useDashboardData();

  // 1. Calcular opciones dinámicas para los filtros (Cascada)
  // Fuente canónica: colección Área (con su Superintendencia poblada), NO el
  // texto libre guardado en cada inspección — así el filtro solo muestra las
  // superintendencias/áreas que realmente existen en la BD, sin duplicados
  // ni valores sueltos de registros viejos o mal cargados.
  const areasActivas = useMemo(() => areas.filter((a) => a.activo), [areas]);

  const todasSuperintendencias = useMemo(
    () =>
      [...new Set(areasActivas.map((a) => a.superintendencia?.nombre).filter(Boolean))].sort() as string[],
    [areasActivas],
  );

  // Superintendencia -> Áreas
  const areasDisponibles = useMemo(() => {
    const filtradas = filtroSuperintendencia
      ? areasActivas.filter((a) => a.superintendencia?.nombre === filtroSuperintendencia)
      : areasActivas;
    return [...new Set(filtradas.map((a) => a.nombre))].sort();
  }, [areasActivas, filtroSuperintendencia]);

  // Áreas -> Tags
  // Nota: `Tag.superintendencia` NO existe en el schema del backend (el
  // documento solo guarda tag/area/activo), así que nunca hay que filtrar
  // tags comparando ese campo — siempre da `undefined`. En su lugar se
  // reutiliza `areasDisponibles`, que ya resuelve correctamente qué áreas
  // pertenecen a la superintendencia seleccionada (o todas si no hay ninguna).
  const tagsDisponibles = useMemo(() => {
    let filteredTags = tags;
    if (filtroSuperintendencia) {
      filteredTags = filteredTags.filter((t) => areasDisponibles.includes(t.area));
    }
    if (filtroAreas.length > 0) {
      filteredTags = filteredTags.filter((t) => filtroAreas.includes(t.area));
    }
    return [...new Set(filteredTags.map((t) => t.tag))].sort();
  }, [tags, filtroSuperintendencia, filtroAreas, areasDisponibles]);

  // Tags filtrados por Superintendencia/Área — para que las estadísticas por
  // área (gráficos) solo consideren las áreas del filtro activo, en vez de
  // mostrar todas las áreas del sistema con 0% cuando hay un filtro puesto.
  const tagsParaEstadisticas = useMemo(() => {
    let filtered = tags;
    if (filtroSuperintendencia) {
      filtered = filtered.filter((t) => areasDisponibles.includes(t.area));
    }
    if (filtroAreas.length > 0) {
      filtered = filtered.filter((t) => filtroAreas.includes(t.area));
    }
    return filtered;
  }, [tags, filtroSuperintendencia, filtroAreas, areasDisponibles]);

  const mesesDisponibles = MESES_DEL_AÑO;

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
    () => calcularEstadisticasPorArea(inspeccionesFiltradas, tagsParaEstadisticas, extintores),
    [inspeccionesFiltradas, tagsParaEstadisticas, extintores],
  );

  // 4. Detalle por tag del área clickeada en cualquiera de los dos gráficos
  const detalleTagsArea = useMemo(() => {
    if (!areaDetalle) return [];
    return calcularDetalleTagsPorArea(areaDetalle, tags, extintores, inspeccionesFiltradas);
  }, [areaDetalle, tags, extintores, inspeccionesFiltradas]);

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
          areasDeSuperintendencia={areasDisponibles}
          onAreaClick={setAreaDetalle}
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

      <TagDetailModal
        open={!!areaDetalle}
        area={areaDetalle}
        detalle={detalleTagsArea}
        onClose={() => setAreaDetalle(null)}
      />
    </Paper>
  );
};

export default DashboardEmergencyInspections;
