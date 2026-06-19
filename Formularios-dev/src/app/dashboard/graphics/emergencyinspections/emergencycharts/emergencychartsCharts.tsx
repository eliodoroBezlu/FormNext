"use client";

import React, { useMemo } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { AreaStats, FormularioInspeccion, Extintor, Tag } from "../types/IProps";

// ─── Paleta de colores semáforo ───────────────────────────────────────────────
const COLORES_CUMPLIMIENTO: Record<string, string> = {
  OPTIMO: "#22c55e",
  ADVERTENCIA: "#f59e0b",
  CRITICO: "#ef4444",
};

const getColorSemaforo = (pct: number): string => {
  if (pct >= 90) return COLORES_CUMPLIMIENTO.OPTIMO;
  if (pct >= 60) return COLORES_CUMPLIMIENTO.ADVERTENCIA;
  return COLORES_CUMPLIMIENTO.CRITICO;
};

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface DashboardChartsProps {
  estadisticasGlobales: AreaStats[];
  extintores: Extintor[];
  inspeccionesFiltradas: FormularioInspeccion[];
  filtroMes: string;
  filtroSuperintendencia: string;
  filtroAreas: string[];
  filtroTags: string[];
  tags: Tag[];
}



interface ExtintoresChartData {
  name: string;
  fullName: string;
  Activos: number;
  Inspeccionados: number;
  InspeccionadosReales: number;
  pct: number;
}

// ─── Tooltip personalizado para extintores ────────────────────────────────────
interface CustomTooltipPayloadItem {
  payload?: {
    Activos?: number;
    InspeccionadosReales?: number;
    pct?: number;
  };
}

const TooltipExtintores = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: CustomTooltipPayloadItem[];
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const activos = data.Activos ?? 0;
  const inspeccionadosReales = data.InspeccionadosReales ?? 0;
  const pct = data.pct ?? 0;

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.5,
        boxShadow: 3,
        minWidth: 180,
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" mb={0.5}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        🎯 Meta (Activos): <strong>{activos}</strong>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        ✅ Inspeccionados: <strong>{inspeccionadosReales}</strong>
      </Typography>
      <Box
        mt={0.5}
        px={1}
        py={0.25}
        borderRadius={1}
        display="inline-block"
        sx={{ bgcolor: getColorSemaforo(pct), color: "white" }}
      >
        <Typography variant="caption" fontWeight="bold">
          {pct}% cumplimiento
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Tooltip personalizado para cobertura ──────────────────────────────────────
interface CustomTooltipCoberturaPayloadItem {
  payload?: {
    MetaTags?: number;
    InspeccionadosTags?: number;
    "Cobertura %"?: number;
  };
}

const TooltipCobertura = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: CustomTooltipCoberturaPayloadItem[];
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const meta = data.MetaTags ?? 0;
  const inspeccionados = data.InspeccionadosTags ?? 0;
  const pct = data["Cobertura %"] ?? 0;

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.5,
        boxShadow: 3,
        minWidth: 180,
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" mb={0.5}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        🎯 Meta (Tags): <strong>{meta}</strong>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        ✅ Inspeccionados: <strong>{inspeccionados}</strong>
      </Typography>
      <Box
        mt={0.5}
        px={1}
        py={0.25}
        borderRadius={1}
        display="inline-block"
        sx={{ bgcolor: getColorSemaforo(pct), color: "white" }}
      >
        <Typography variant="caption" fontWeight="bold">
          {pct}% cobertura
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
export const DashboardCharts = ({
  estadisticasGlobales = [],
  extintores = [],
  inspeccionesFiltradas = [],
  filtroMes = "",
  filtroSuperintendencia = "",
  filtroAreas = [],
  filtroTags = [],
  tags = [],
}: DashboardChartsProps) => {
  // ── Gráfico 1: Cobertura de Inspecciones por Área (filtro global) ─────────
  const coberturaPorArea = useMemo(() => {
    return estadisticasGlobales.map((area) => ({
      name: area.area.length > 14 ? area.area.substring(0, 14) + "…" : area.area,
      fullName: area.area,
      "Cobertura %": area.cumplimiento,
      MetaTags: area.totalTags,
      InspeccionadosTags: area.totalInspecciones,
    }));
  }, [estadisticasGlobales]);

  // ── Gráfico 2: Extintores por Área (filtros globales) ───────────────────
  const extintoresPorArea: ExtintoresChartData[] = useMemo(() => {
    // 1. Filtrar extintores en base a los filtros globales (superintendencia, areas, tags)
    let extintoresFiltrados = extintores;

    if (filtroSuperintendencia) {
      const tagsMap = new Map(tags.map((t) => [t.tag, t.superintendencia]));
      extintoresFiltrados = extintoresFiltrados.filter(
        (e) => tagsMap.get(e.tag) === filtroSuperintendencia
      );
    }

    if (filtroAreas.length > 0) {
      extintoresFiltrados = extintoresFiltrados.filter((e) =>
        filtroAreas.includes(e.area)
      );
    }

    if (filtroTags.length > 0) {
      extintoresFiltrados = extintoresFiltrados.filter((e) =>
        filtroTags.includes(e.tag)
      );
    }

    const areasConExtintores = [...new Set(extintoresFiltrados.map((e) => e.area))].sort();

    return areasConExtintores.map((area) => {
      // Activos (meta) en esa área
      const activos = extintoresFiltrados.filter(
        (e) => e.area === area && e.activo === true
      ).length;

      // Inspecciones de esta área en el conjunto de inspecciones filtradas
      const inspeccionesDelArea = inspeccionesFiltradas.filter(
        (ins) => ins.area === area
      );

      // Sumar extintores inspeccionados
      const inspeccionados = inspeccionesDelArea.reduce((sum, ins) => {
        const mesParaInspeccion = filtroMes || ins.mesActual;
        const mesData = ins.meses[mesParaInspeccion];
        return sum + (mesData?.inspeccionesExtintor?.length ?? 0);
      }, 0);

      const pct =
        activos > 0
          ? Math.min(Math.round((inspeccionados / activos) * 100), 100)
          : 0;

      // Tope de 100% para visualización
      const inspeccionadosMostrar = Math.min(inspeccionados, activos);

      return {
        name: area.length > 14 ? area.substring(0, 14) + "…" : area,
        fullName: area,
        Activos: activos,
        Inspeccionados: inspeccionadosMostrar,
        InspeccionadosReales: inspeccionados,
        pct,
      };
    });
  }, [
    extintores,
    inspeccionesFiltradas,
    filtroSuperintendencia,
    filtroAreas,
    filtroTags,
    filtroMes,
    tags,
  ]);

  // Total global del mes seleccionado
  const totalActivos = extintoresPorArea.reduce((s, a) => s + a.Activos, 0);
  const totalInspeccionados = extintoresPorArea.reduce((s, a) => s + a.InspeccionadosReales, 0);
  const pctGlobal =
    totalActivos > 0
      ? Math.min(Math.round((totalInspeccionados / totalActivos) * 100), 100)
      : 0;



  return (
    <>
      {/* ── Gráfico 1: Cobertura de Inspecciones por Área ─────────────────── */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: "100%" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              fontWeight="bold"
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" } }}
            >
              Cobertura de Inspecciones por Área
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Porcentaje de tags de extintores inspeccionados respecto al total activo
            </Typography>
            <Box height={320}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coberturaPorArea} margin={{ bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    angle={-30}
                    textAnchor="end"
                    height={60}
                    fontSize={11}
                    tick={{ fill: "#6b7280" }}
                  />
                  <YAxis
                    fontSize={11}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fill: "#6b7280" }}
                  />
                  <Tooltip content={<TooltipCobertura />} />
                  <Bar dataKey="Cobertura %" radius={[4, 4, 0, 0]}>
                    {coberturaPorArea.map((entry, index) => (
                      <Cell
                        key={`cell-cobertura-${index}`}
                        fill={getColorSemaforo(entry["Cobertura %"])}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* ── Gráfico 2: Seguimiento de Extintores por Área ─────────────────── */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: "100%" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1}
              mb={0.5}
            >
              <Box>
                <Typography
                  variant="h6"
                  color="primary"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" } }}
                >
                  Seguimiento de Extintores por Área
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Meta mensual: inspeccionar el 100% de extintores activos
                </Typography>
              </Box>
            </Box>

            {/* Resumen global del mes */}
            <Box
              display="flex"
              gap={1}
              mb={1.5}
              flexWrap="wrap"
              alignItems="center"
            >
              <Chip
                size="small"
                label={`🎯 Meta total: ${totalActivos} extintores`}
                sx={{ bgcolor: "#e0f2fe", color: "#0369a1", fontWeight: 600, fontSize: "0.75rem" }}
              />
              <Chip
                size="small"
                label={`✅ Inspeccionados: ${totalInspeccionados}`}
                sx={{ bgcolor: "#dcfce7", color: "#15803d", fontWeight: 600, fontSize: "0.75rem" }}
              />
              <Chip
                size="small"
                label={`${pctGlobal}% global`}
                sx={{
                  bgcolor: getColorSemaforo(pctGlobal),
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                }}
              />
            </Box>

            <Box height={280}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={extintoresPorArea}
                  margin={{ bottom: 24 }}
                  barCategoryGap="30%"
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    angle={-30}
                    textAnchor="end"
                    height={60}
                    fontSize={11}
                    tick={{ fill: "#6b7280" }}
                  />
                  <YAxis
                    fontSize={11}
                    allowDecimals={false}
                    label={{
                      value: "Extintores",
                      angle: -90,
                      position: "insideLeft",
                      offset: 8,
                      style: { fontSize: 11, fill: "#9ca3af" },
                    }}
                    tick={{ fill: "#6b7280" }}
                  />
                  <Tooltip content={<TooltipExtintores />} />
                  <Legend
                    formatter={(value) =>
                      value === "Activos" ? "🎯 Activos (meta)" : "✅ Inspeccionados"
                    }
                    wrapperStyle={{ fontSize: "0.8rem" }}
                  />
                  {/* Barra de meta (activos) - gris de fondo */}
                  <Bar
                    dataKey="Activos"
                    name="Activos"
                    fill="#e2e8f0"
                    stroke="#94a3b8"
                    strokeWidth={1}
                    radius={[4, 4, 0, 0]}
                  />
                  {/* Barra de progreso (inspeccionados) - color semáforo */}
                  <Bar
                    dataKey="Inspeccionados"
                    name="Inspeccionados"
                    radius={[4, 4, 0, 0]}
                  >
                    {extintoresPorArea.map((entry, index) => (
                      <Cell
                        key={`cell-ext-${index}`}
                        fill={getColorSemaforo(entry.pct)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};