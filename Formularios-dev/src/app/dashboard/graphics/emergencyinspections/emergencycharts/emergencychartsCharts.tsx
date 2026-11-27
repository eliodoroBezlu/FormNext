"use client";

import React, { useMemo } from "react";
import { Grid, Card, CardContent, Typography, Box, Chip, Button, Alert, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
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
  Cell,
} from "recharts";
import {
  CoberturaMes,
  EstadoExtintor,
  AreaDelMes,
  ETIQUETA_ESTADO,
  COLOR_ESTADO,
  nivelCobertura,
} from "../utils/coberturaMensual";

interface DashboardChartsProps {
  cobertura: CoberturaMes;
  /** Click en una porción de la torta (o en su botón): lista de extintores en ese estado. */
  onEstadoClick: (estado: EstadoExtintor) => void;
  /** Click en una barra: detalle por tag del área. */
  onAreaClick: (area: string) => void;
  /** Ver los códigos inspeccionados que no cuentan (dados de baja o sin registro). */
  onFueraDeCatalogoClick: () => void;
}

const ESTADOS: EstadoExtintor[] = ["conforme", "con-observacion", "no-inspeccionado"];

const cajaTooltip = {
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  p: 1.5,
  boxShadow: 3,
  minWidth: 180,
} as const;

// `type` y no `interface`: Recharts pide datos con índice de texto, y un alias de tipo lo cumple.
type PorcionTorta = {
  estado: EstadoExtintor;
  name: string;
  value: number;
};

const TooltipTorta = ({ active, payload }: { active?: boolean; payload?: { payload?: PorcionTorta }[] }) => {
  const d = payload?.[0]?.payload;
  if (!active || !d) return null;
  return (
    <Box sx={cajaTooltip}>
      <Typography variant="subtitle2" fontWeight="bold">
        {d.name}: {d.value} extintor{d.value !== 1 ? "es" : ""}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Clic para ver la lista
      </Typography>
    </Box>
  );
};

const TooltipArea = ({ active, payload }: { active?: boolean; payload?: { payload?: AreaDelMes }[] }) => {
  const a = payload?.[0]?.payload;
  if (!active || !a) return null;
  return (
    <Box sx={cajaTooltip}>
      <Typography variant="subtitle2" fontWeight="bold" mb={0.5}>
        {a.area}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Cantidad: <strong>{a.cantidad}</strong>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Inspeccionados: <strong>{a.inspeccionados}</strong> ({a.pct} %)
      </Typography>
      {a.conObservacion > 0 && (
        <Typography variant="body2" color="text.secondary">
          Con observación: <strong>{a.conObservacion}</strong>
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary">
        Tags inspeccionados: <strong>{a.tagsInspeccionados}/{a.tagsActivos}</strong>
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Clic para ver el detalle por tag
      </Typography>
    </Box>
  );
};

const Titulo = ({ children, ayuda }: { children: React.ReactNode; ayuda: string }) => (
  <>
    <Typography
      variant="h6"
      gutterBottom
      color="primary"
      fontWeight="bold"
      sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" } }}
    >
      {children}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
      {ayuda}
    </Typography>
  </>
);

export const DashboardCharts = ({
  cobertura,
  onEstadoClick,
  onAreaClick,
  onFueraDeCatalogoClick,
}: DashboardChartsProps) => {
  const theme = useTheme();
  const colorDe = (c: "success" | "warning" | "error") => theme.palette[c].main;
  const { totales, fueraDeCatalogo } = cobertura;
  const periodo = `${cobertura.mes}${cobertura.año ? ` ${cobertura.año}` : ""}`;

  const porciones: PorcionTorta[] = useMemo(() => {
    const cuenta: Record<EstadoExtintor, number> = {
      conforme: totales.inspeccionados - totales.conObservacion,
      "con-observacion": totales.conObservacion,
      "no-inspeccionado": totales.noInspeccionados,
    };
    return ESTADOS.map((estado) => ({ estado, name: ETIQUETA_ESTADO[estado], value: cuenta[estado] })).filter(
      (p) => p.value > 0,
    );
  }, [totales]);

  const areas = useMemo(() => cobertura.areas.filter((a) => a.cantidad > 0), [cobertura.areas]);
  const dadosDeBaja = fueraDeCatalogo.filter((f) => f.motivo === "dado-de-baja").length;

  return (
    <>
      {fueraDeCatalogo.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <Alert
            severity="warning"
            action={
              <Button type="button" color="inherit" size="small" onClick={onFueraDeCatalogoClick}>
                Ver códigos
              </Button>
            }
          >
            {fueraDeCatalogo.length} código{fueraDeCatalogo.length !== 1 ? "s" : ""} inspeccionado
            {fueraDeCatalogo.length !== 1 ? "s" : ""} en {periodo} no cuentan en la cobertura:{" "}
            {dadosDeBaja > 0 && `${dadosDeBaja} están dados de baja en el catálogo`}
            {dadosDeBaja > 0 && dadosDeBaja < fueraDeCatalogo.length && " y "}
            {fueraDeCatalogo.length - dadosDeBaja > 0 && `${fueraDeCatalogo.length - dadosDeBaja} no existen en el catálogo`}.
          </Alert>
        </Grid>
      )}

      {/* ── Torta: extintores por estado ─────────────────────────────────── */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: "100%" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Titulo ayuda={`Extintores activos del catálogo inspeccionados en ${periodo}`}>Cobertura de extintores</Titulo>

            <Box display="flex" gap={1} mb={1} flexWrap="wrap">
              <Chip
                size="small"
                label={`${totales.pct} % de extintores (${totales.inspeccionados}/${totales.cantidad})`}
                sx={{
                  bgcolor: colorDe(nivelCobertura(totales.pct)),
                  color: theme.palette.getContrastText(colorDe(nivelCobertura(totales.pct))),
                  fontWeight: 700,
                }}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`Tags inspeccionados: ${totales.tagsInspeccionados}/${totales.tagsActivos} (${totales.pctTags} %)`}
                sx={{ fontWeight: 600 }}
              />
            </Box>

            {totales.cantidad === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={8}>
                No hay extintores activos con los filtros elegidos.
              </Typography>
            ) : (
              <Box height={260}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={porciones}
                      cx="50%"
                      cy="50%"
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      labelLine={false}
                      label={({ percent }) => (percent && percent > 0.05 ? `${Math.round(percent * 100)} %` : "")}
                      cursor="pointer"
                      onClick={(_, index) => {
                        const p = porciones[index];
                        if (p) onEstadoClick(p.estado);
                      }}
                    >
                      {porciones.map((p) => (
                        <Cell
                          key={p.estado}
                          fill={colorDe(COLOR_ESTADO[p.estado])}
                          stroke={theme.palette.background.paper}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<TooltipTorta />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}

            {/* Leyenda que además abre la lista: se puede usar con el teclado. */}
            <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center" mt={1}>
              {ESTADOS.map((estado) => {
                const cuenta = porciones.find((p) => p.estado === estado)?.value ?? 0;
                const color = colorDe(COLOR_ESTADO[estado]);
                return (
                  <Button
                    key={estado}
                    type="button"
                    size="small"
                    variant="outlined"
                    disabled={cuenta === 0}
                    onClick={() => onEstadoClick(estado)}
                    startIcon={<Box component="span" sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />}
                    sx={{ borderColor: alpha(color, 0.5), color: "text.primary", textTransform: "none" }}
                  >
                    {ETIQUETA_ESTADO[estado]}: {cuenta}
                  </Button>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* ── Barras: cantidad vs. inspeccionados por área ─────────────────── */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: "100%" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Titulo ayuda={`Extintores activos por área y cuántos se inspeccionaron en ${periodo}`}>
              Extintores por área
            </Titulo>

            <Box display="flex" gap={1.5} mb={1} flexWrap="wrap" alignItems="center">
              <Box display="flex" alignItems="center" gap={0.5}>
                <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: alpha(theme.palette.text.secondary, 0.25) }} />
                <Typography variant="caption">Cantidad</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Inspeccionados:
              </Typography>
              {(
                [
                  ["success", "90 % o más"],
                  ["warning", "60–89 %"],
                  ["error", "menos de 60 %"],
                ] as const
              ).map(([nivel, texto]) => (
                <Box key={nivel} display="flex" alignItems="center" gap={0.5}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: colorDe(nivel) }} />
                  <Typography variant="caption">{texto}</Typography>
                </Box>
              ))}
            </Box>

            {areas.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={8}>
                No hay extintores activos con los filtros elegidos.
              </Typography>
            ) : (
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={areas} margin={{ bottom: 24 }} barCategoryGap="25%" barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="area"
                      angle={-30}
                      textAnchor="end"
                      height={70}
                      interval={0}
                      fontSize={11}
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis fontSize={11} allowDecimals={false} tick={{ fill: theme.palette.text.secondary }} />
                    <Tooltip content={<TooltipArea />} cursor={{ fill: theme.palette.action.hover }} />
                    <Bar
                      dataKey="cantidad"
                      fill={alpha(theme.palette.text.secondary, 0.25)}
                      radius={[4, 4, 0, 0]}
                      cursor="pointer"
                      onClick={(_, index) => {
                        const a = areas[index];
                        if (a) onAreaClick(a.area);
                      }}
                    />
                    <Bar
                      dataKey="inspeccionados"
                      radius={[4, 4, 0, 0]}
                      cursor="pointer"
                      onClick={(_, index) => {
                        const a = areas[index];
                        if (a) onAreaClick(a.area);
                      }}
                    >
                      {areas.map((a) => (
                        <Cell key={a.area} fill={colorDe(nivelCobertura(a.pct))} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};
