"use client";

import React, { useEffect, useMemo } from "react";
import { usePgrList } from "@/components/features/pgr/application/hooks/usePgrList";
import { ActividadPgr, Pgr } from "@/components/features/pgr/domain/models/IProps";
import { getPgrEstadoColor } from "@/components/features/pgr/domain/pgrHelpers";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  useTheme,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function PgrDashboard() {
  const theme = useTheme();
  const { planes, isLoading, loadPlanes } = usePgrList();

  useEffect(() => {
    loadPlanes();
  }, [loadPlanes]);

  const metricas = useMemo(() => {
    let totalTareas = 0;
    let tareasAtrasadas = 0;
    let tareasCompletadas = 0;
    let planesAprobados = 0;

    planes.forEach((plan: Pgr) => {
      if (plan.estado === "APROBADO") planesAprobados++;

      plan.actividades?.forEach((actividad: ActividadPgr) => {
        totalTareas++;
        if (actividad.semaforoTiempo === "Atrasado") tareasAtrasadas++;
        if (actividad.estadoAprobacion === "APROBADO" && actividad.fechaEjecucion)
          tareasCompletadas++;
      });
    });

    const avance = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0;

    return { totalTareas, avance, tareasAtrasadas, planesAprobados, tareasCompletadas };
  }, [planes]);

  const distribucion = useMemo(() => {
    const tareasEnProceso =
      metricas.totalTareas - metricas.tareasCompletadas - metricas.tareasAtrasadas;
    return [
      { name: "Completado", value: metricas.tareasCompletadas },
      { name: "En Proceso", value: tareasEnProceso > 0 ? tareasEnProceso : 0 },
      { name: "Atrasado", value: metricas.tareasAtrasadas },
    ];
  }, [metricas]);

  const tareasResponsable = useMemo(() => {
    const responsableMap: Record<string, number> = {};
    planes.forEach((plan) => {
      plan.actividades?.forEach((actividad: ActividadPgr) => {
        // Una actividad puede tener varios responsables —grupos o personas—:
        // cuenta para cada uno, que es lo que mide la carga por responsable.
        for (const responsable of actividad.responsables ?? []) {
          responsableMap[responsable.nombre] =
            (responsableMap[responsable.nombre] || 0) + 1;
        }
      });
    });
    return Object.keys(responsableMap).map((key) => ({
      name: key,
      tareas: responsableMap[key],
    }));
  }, [planes]);

  const COLORS = ["#00C49F", "#0088FE", "#FF8042"];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Gerencial
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Reportes y Análisis de Gestión de Actividades
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filtros Globales
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Gestión</InputLabel>
              <Select defaultValue="Todas las Gestiones" label="Gestión">
                <MenuItem value="Todas las Gestiones">
                  Todas las Gestiones
                </MenuItem>
                <MenuItem value="2026">2026</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Estado del Flujo</InputLabel>
              <Select defaultValue="Todos los Estados" label="Estado del Flujo">
                <MenuItem value="Todos los Estados">Todos los Estados</MenuItem>
                <MenuItem value="BORRADOR">Borrador</MenuItem>
                <MenuItem value="EN_REVISION">En Revisión</MenuItem>
                <MenuItem value="APROBADO">Aprobado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tareas
              </Typography>
              <Typography variant="h3">{metricas.totalTareas}</Typography>
              <Typography variant="body2" color="textSecondary">
                Actividades planificadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                % de Avance
              </Typography>
              <Typography variant="h3">{metricas.avance}%</Typography>
              <Typography variant="body2" color="textSecondary">
                Progreso general
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography color="error" gutterBottom>
                Tareas Atrasadas
              </Typography>
              <Typography variant="h3" color="error">
                {metricas.tareasAtrasadas}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Requieren atención
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography color="success.main" gutterBottom>
                Planes Aprobados
              </Typography>
              <Typography variant="h3" color="success.main">
                {metricas.planesAprobados}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                En ejecución
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: 400, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribución del Cumplimiento
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={distribucion}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distribucion.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: 400, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tareas por Responsable
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={tareasResponsable}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tareas" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabla de Consolidación */}
      <Paper sx={{ p: 3, mt: 4, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold">Tabla de Consolidación</Typography>
          <Box gap={2} display="flex">
            <Button variant="outlined" startIcon={<PictureAsPdfIcon />} color="inherit" type="button" sx={{ textTransform: "none", borderRadius: 2 }}>
              Exportar PDF
            </Button>
            <Button variant="outlined" startIcon={<TableViewIcon />} color="inherit" type="button" sx={{ textTransform: "none", borderRadius: 2 }}>
              Exportar Excel
            </Button>
          </Box>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: theme.palette.action.hover }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Empresa</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Gerencia</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Gestión</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tareas</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Avance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!isLoading && planes.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                     No hay planes que coincidan con los filtros
                   </TableCell>
                </TableRow>
              ) : (
                planes.map((plan) => {
                   const total = plan.actividades?.length || 0;
                   const completadas = plan.actividades?.filter((a: ActividadPgr) => a.estadoAprobacion === 'APROBADO' && a.fechaEjecucion).length || 0;
                   const avance = total > 0 ? Math.round((completadas / total) * 100) : 0;
                   return (
                     <TableRow key={plan._id} hover>
                        <TableCell>{plan.codigoAutogenerado}</TableCell>
                        <TableCell>{plan.empresa}</TableCell>
                        <TableCell>{plan.gerencia}</TableCell>
                        <TableCell>{plan.gestion}</TableCell>
                        <TableCell>
                          <Chip
                            label={plan.estado}
                            color={getPgrEstadoColor(plan.estado)}
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                        <TableCell>{total}</TableCell>
                        <TableCell>{avance}%</TableCell>
                     </TableRow>
                   )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
