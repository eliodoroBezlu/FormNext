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
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { AreaStats, Extintor, FormularioInspeccion } from "../types/IProps";

// ─── Paleta de colores semáforo ───────────────────────────────────────────────
const COLORES_CUMPLIMIENTO: Record<string, string> = {
  OPTIMO: "#22c55e",
  ADVERTENCIA: "#f59e0b",
  CRITICO: "#ef4444",
};

export const getColorSemaforo = (pct: number): string => {
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
  /** Áreas de la superintendencia seleccionada (todas si no hay ninguna elegida). */
  areasDeSuperintendencia: string[];
  /** Click en una barra de cualquiera de los dos gráficos — recibe el nombre completo del área. */
  onAreaClick?: (area: string) => void;
}



interface ExtintoresConteoPorArea {
  name: string;
  value: number;
  inspeccionados: number;
  [key: string]: string | number;
}

// ─── Tooltip personalizado para cantidad/inspeccionados de extintores ────────
interface CustomTooltipExtintoresPayloadItem {
  payload?: {
    value?: number;
    inspeccionados?: number;
  };
}

const TooltipExtintoresCantidad = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: CustomTooltipExtintoresPayloadItem[];
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const cantidad = data.value ?? 0;
  const inspeccionados = data.inspeccionados ?? 0;
  const pct = cantidad > 0 ? Math.min(Math.round((inspeccionados / cantidad) * 100), 100) : 0;

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
        🧯 Cantidad: <strong>{cantidad}</strong>
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
          {pct}% cumplimiento
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Tooltip personalizado para cobertura (Inspeccionados vs No Inspeccionados) ─
interface CoberturaGlobalSlice {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface CustomTooltipCoberturaPayloadItem {
  payload?: CoberturaGlobalSlice;
}

const TooltipCobertura = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: CustomTooltipCoberturaPayloadItem[];
}) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

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
      <Typography variant="subtitle2" fontWeight="bold">
        {data.name}: <strong>{data.value}</strong> tag{data.value !== 1 ? "s" : ""}
      </Typography>
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
  areasDeSuperintendencia = [],
  onAreaClick,
}: DashboardChartsProps) => {
  // ── Gráfico 1: Cobertura de Inspecciones (Inspeccionados vs No Inspeccionados) ─
  const coberturaPorArea = useMemo(() => {
    return estadisticasGlobales.map((area) => ({
      name: area.area.length > 14 ? area.area.substring(0, 14) + "…" : area.area,
      fullName: area.area,
      "Cobertura %": area.cumplimiento,
      MetaTags: area.totalTags,
      InspeccionadosTags: area.totalInspecciones,
    }));
  }, [estadisticasGlobales]);

  const coberturaGlobalPie: CoberturaGlobalSlice[] = useMemo(() => {
    const totalMeta = coberturaPorArea.reduce((s, a) => s + a.MetaTags, 0);
    const totalInspeccionado = coberturaPorArea.reduce((s, a) => s + a.InspeccionadosTags, 0);
    const noInspeccionado = Math.max(totalMeta - totalInspeccionado, 0);

    return [
      { name: "Inspeccionados", value: totalInspeccionado },
      { name: "No Inspeccionados", value: noInspeccionado },
    ].filter((item) => item.value > 0);
  }, [coberturaPorArea]);

  // ── Extintores filtrados según los filtros globales (superintendencia, areas, tags) ──
  // Nota: los tags no tienen un campo "superintendencia" propio en el
  // backend — se filtra por pertenencia de área a la superintendencia
  // seleccionada (areasDeSuperintendencia ya viene resuelta desde el
  // catálogo canónico de Área/Superintendencia).
  const extintoresFiltradosGlobal = useMemo(() => {
    let filtrados = extintores;

    if (filtroSuperintendencia) {
      filtrados = filtrados.filter((e) =>
        areasDeSuperintendencia.includes(e.area)
      );
    }

    if (filtroAreas.length > 0) {
      filtrados = filtrados.filter((e) => filtroAreas.includes(e.area));
    }

    if (filtroTags.length > 0) {
      filtrados = filtrados.filter((e) => filtroTags.includes(e.tag));
    }

    return filtrados;
  }, [extintores, filtroSuperintendencia, filtroAreas, filtroTags, areasDeSuperintendencia]);

  // ── Gráfico 2: Cantidad de Extintores por Área + Inspeccionados (bar chart) ──
  const extintoresPorAreaConteo: ExtintoresConteoPorArea[] = useMemo(() => {
    const areasConExtintores = [
      ...new Set(extintoresFiltradosGlobal.map((e) => e.area)),
    ].sort();

    return areasConExtintores
      .map((area) => {
        const cantidad = extintoresFiltradosGlobal.filter((e) => e.area === area).length;

        const inspeccionesDelArea = inspeccionesFiltradas.filter((ins) => ins.area === area);
        const inspeccionados = inspeccionesDelArea.reduce((sum, ins) => {
          const mesParaInspeccion = filtroMes || ins.mesActual;
          const mesData = ins.meses[mesParaInspeccion];
          return sum + (mesData?.inspeccionesExtintor?.length ?? 0);
        }, 0);

        return {
          name: area,
          value: cantidad,
          // Tope al total de extintores del área para visualización consistente.
          inspeccionados: Math.min(inspeccionados, cantidad),
        };
      })
      .filter((item) => item.value > 0);
  }, [extintoresFiltradosGlobal, inspeccionesFiltradas, filtroMes]);

  const totalExtintores = extintoresPorAreaConteo.reduce(
    (s, a) => s + a.value,
    0,
  );
  const totalInspeccionados = extintoresPorAreaConteo.reduce(
    (s, a) => s + a.inspeccionados,
    0,
  );
  const pctGlobalInspeccionados =
    totalExtintores > 0
      ? Math.min(Math.round((totalInspeccionados / totalExtintores) * 100), 100)
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
              Tags de extintores inspeccionados vs. no inspeccionados
            </Typography>
            <Box height={320}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coberturaGlobalPie}
                    cx="50%"
                    cy="50%"
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    labelLine={false}
                    label={({ name, percent }) =>
                      percent && percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ""
                    }
                  >
                    {coberturaGlobalPie.map((entry) => (
                      <Cell
                        key={`cell-cobertura-${entry.name}`}
                        fill={
                          entry.name === "Inspeccionados"
                            ? COLORES_CUMPLIMIENTO.OPTIMO
                            : COLORES_CUMPLIMIENTO.CRITICO
                        }
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipCobertura />} />
                  <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* ── Gráfico 2: Cantidad de Extintores por Área ────────────────────── */}
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
              Cantidad de Extintores por Área
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Distribución de extintores registrados por área
            </Typography>

            <Box display="flex" gap={1} mb={1.5} flexWrap="wrap" alignItems="center">
              <Chip
                size="small"
                label={`🧯 Cantidad total: ${totalExtintores} extintores`}
                sx={{ bgcolor: "#e0f2fe", color: "#0369a1", fontWeight: 600, fontSize: "0.75rem" }}
              />
              <Chip
                size="small"
                label={`✅ Inspeccionados: ${totalInspeccionados}`}
                sx={{ bgcolor: "#dcfce7", color: "#15803d", fontWeight: 600, fontSize: "0.75rem" }}
              />
              <Chip
                size="small"
                label={`${pctGlobalInspeccionados}% global`}
                sx={{
                  bgcolor: getColorSemaforo(pctGlobalInspeccionados),
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                }}
              />
            </Box>

            <Box height={280}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={extintoresPorAreaConteo}
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
                  <Tooltip content={<TooltipExtintoresCantidad />} />
                  <Legend
                    formatter={(value) =>
                      value === "value" ? "🧯 Cantidad" : "✅ Inspeccionados"
                    }
                    wrapperStyle={{ fontSize: "0.8rem" }}
                  />
                  {/* Barra de cantidad total de extintores del área - gris de fondo */}
                  <Bar
                    dataKey="value"
                    name="value"
                    fill="#e2e8f0"
                    stroke="#94a3b8"
                    strokeWidth={1}
                    radius={[4, 4, 0, 0]}
                    cursor={onAreaClick ? "pointer" : undefined}
                    onClick={(entry) => {
                      const name = (entry as { name?: string } | undefined)?.name;
                      if (name) onAreaClick?.(name);
                    }}
                  />
                  {/* Barra de inspeccionados - color semáforo según % de cumplimiento */}
                  <Bar
                    dataKey="inspeccionados"
                    name="inspeccionados"
                    radius={[4, 4, 0, 0]}
                    cursor={onAreaClick ? "pointer" : undefined}
                    onClick={(entry) => {
                      const name = (entry as { name?: string } | undefined)?.name;
                      if (name) onAreaClick?.(name);
                    }}
                  >
                    {extintoresPorAreaConteo.map((entry, index) => {
                      const pct =
                        entry.value > 0
                          ? Math.round((entry.inspeccionados / entry.value) * 100)
                          : 0;
                      return (
                        <Cell key={`cell-extintores-bar-${index}`} fill={getColorSemaforo(pct)} />
                      );
                    })}
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