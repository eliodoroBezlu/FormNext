"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useReportesLinternas } from "@/components/features/linternas/application/hooks/useReportesLinternas";
import { ETIQUETA_ESTADO } from "@/components/features/linternas/domain/models/Linterna";

const fecha = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("es-BO") : "—";

function Indicador({
  valor,
  etiqueta,
  color = "text.primary",
}: {
  valor: number | string;
  etiqueta: string;
  color?: string;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
      <Typography variant="h4" fontWeight={700} color={color}>
        {valor}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {etiqueta}
      </Typography>
    </Paper>
  );
}

export default function ReportesLinternasPage() {
  const {
    resumen,
    porArea,
    porTrabajador,
    sinDotacion,
    perdidas,
    cargando,
    refrescar,
  } = useReportesLinternas();
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [buscar, setBuscar] = useState("");

  const personas = porTrabajador.filter((p) => {
    const q = buscar.trim().toLowerCase();
    if (!q) return true;
    return (
      p.nombre.toLowerCase().includes(q) || p.area.toLowerCase().includes(q)
    );
  });

  const cobertura =
    resumen.totalTrabajadores > 0
      ? Math.round((resumen.conDotacion / resumen.totalTrabajadores) * 100)
      : 0;

  // Lo entregado debería salir de lo ingresado. Si no cuadra, hay movimientos
  // que no pasaron por el sistema — que es justo lo que este reporte destapa.
  const descuadre = resumen.ingresadas - resumen.entregadas - resumen.stockDisponible;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700}>
        Reportes de linternas
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Cobertura de la dotación, dónde se pierden y si el consumo cuadra.
      </Typography>

      {cargando && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Indicador valor={resumen.conDotacion} etiqueta="Con dotación" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Indicador
            valor={resumen.sinDotacion}
            etiqueta="Sin dotación"
            color={resumen.sinDotacion > 0 ? "warning.main" : "success.main"}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Indicador
            valor={resumen.totalPerdidas}
            etiqueta="Pérdidas acumuladas"
            color={resumen.totalPerdidas > 0 ? "error.main" : "text.primary"}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Indicador
            valor={resumen.stockDisponible}
            etiqueta="En stock"
            color={resumen.stockDisponible > 0 ? "success.main" : "error.main"}
          />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Cobertura de la dotación
        </Typography>
        <Stack direction="row" alignItems="center" gap={2}>
          <LinearProgress
            variant="determinate"
            value={cobertura}
            sx={{ flex: 1, height: 10, borderRadius: 5 }}
          />
          <Typography variant="body2" fontWeight={600}>
            {cobertura}%
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {resumen.conDotacion} de {resumen.totalTrabajadores} trabajadores
          activos
        </Typography>

        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
          <Chip size="small" label={`${resumen.ingresadas} ingresadas`} />
          <Chip size="small" label={`${resumen.entregadas} entregadas`} />
          <Chip size="small" label={`${resumen.stockDisponible} en stock`} />
          {resumen.perdidasPendientes > 0 && (
            <Chip
              size="small"
              color="warning"
              label={`${resumen.perdidasPendientes} pendiente(s) de aprobación`}
            />
          )}
        </Stack>

        {descuadre !== 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            El inventario no cuadra por {Math.abs(descuadre)} unidad(es):
            ingresadas − entregadas ≠ stock. Suele significar que se ajustó el
            stock a mano o que hubo entregas fuera del sistema.
          </Alert>
        )}
      </Paper>

      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Por área
      </Typography>
      <Paper variant="outlined" sx={{ mb: 3, overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Área</TableCell>
              <TableCell align="right">Dotados</TableCell>
              <TableCell align="right">Cambios</TableCell>
              <TableCell align="right">Pérdidas</TableCell>
              <TableCell align="right">Entregadas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {porArea.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Todavía no hay entregas registradas.
                </TableCell>
              </TableRow>
            ) : (
              porArea.map((f) => (
                <TableRow key={`${f.area}-${f.superintendencia}`}>
                  <TableCell>
                    <Typography variant="body2">{f.area}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {f.superintendencia}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{f.dotados}</TableCell>
                  <TableCell align="right">{f.cambios}</TableCell>
                  <TableCell align="right">
                    {f.perdidas > 0 ? (
                      <Chip size="small" color="error" label={f.perdidas} />
                    ) : (
                      0
                    )}
                  </TableCell>
                  <TableCell align="right">{f.entregadas}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        gap={2}
        mb={1}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            Por trabajador ({porTrabajador.length})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Ordenado por cuántas linternas recibió. Quien nunca recibió nada
            está más abajo, en «Sin dotación».
          </Typography>
        </Box>
        <TextField
          size="small"
          label="Buscar por nombre o área"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          sx={{ minWidth: 240 }}
        />
      </Stack>

      <Paper variant="outlined" sx={{ mb: 3, overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Trabajador</TableCell>
              <TableCell>Dotación</TableCell>
              <TableCell align="right">Cambios</TableCell>
              <TableCell>Último cambio</TableCell>
              <TableCell align="right">Pérdidas</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {personas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {porTrabajador.length === 0
                    ? "Todavía no hay entregas registradas."
                    : "Ningún trabajador coincide con la búsqueda."}
                </TableCell>
              </TableRow>
            ) : (
              personas.map((p) => (
                <TableRow key={p.trabajador}>
                  <TableCell>
                    <Typography variant="body2">{p.nombre}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.area}
                    </Typography>
                    {p.pendienteDeAprobacion && (
                      <Chip
                        size="small"
                        color="warning"
                        label="pendiente"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {p.tieneDotacion ? (
                      <Chip
                        size="small"
                        color="success"
                        variant="outlined"
                        label={fecha(p.fechaDotacion)}
                      />
                    ) : (
                      <Chip size="small" label="Sin dotación" />
                    )}
                  </TableCell>
                  <TableCell align="right">{p.cambios}</TableCell>
                  <TableCell>{fecha(p.ultimoCambio)}</TableCell>
                  <TableCell align="right">
                    {p.perdidas > 0 ? (
                      <Chip size="small" color="error" label={p.perdidas} />
                    ) : (
                      0
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {p.totalRecibidas}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        gap={2}
        mb={1}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          Pérdidas del período
        </Typography>
        <Stack direction="row" gap={1}>
          <TextField
            size="small"
            type="date"
            label="Desde"
            InputLabelProps={{ shrink: true }}
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
          <TextField
            size="small"
            type="date"
            label="Hasta"
            InputLabelProps={{ shrink: true }}
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              void refrescar({
                desde: desde || undefined,
                hasta: hasta || undefined,
              })
            }
          >
            Filtrar
          </Button>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ mb: 3, overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Trabajador</TableCell>
              <TableCell>Área</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Justificación</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {perdidas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Sin pérdidas en el período.
                </TableCell>
              </TableRow>
            ) : (
              perdidas.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>{fecha(p.createdAt)}</TableCell>
                  <TableCell>{p.nombreTrabajador}</TableCell>
                  <TableCell>{p.area}</TableCell>
                  <TableCell>{ETIQUETA_ESTADO[p.estado]}</TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography variant="caption">
                      {p.perdida?.justificacion}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Sin dotación ({sinDotacion.length})
      </Typography>
      <Paper variant="outlined" sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Trabajador</TableCell>
              <TableCell>Área</TableCell>
              <TableCell>Superintendencia</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sinDotacion.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Todos tienen su dotación.
                </TableCell>
              </TableRow>
            ) : (
              sinDotacion.slice(0, 100).map((t) => (
                <TableRow key={t._id}>
                  <TableCell>{t.nomina}</TableCell>
                  <TableCell>{t.area}</TableCell>
                  <TableCell>{t.superintendencia}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {sinDotacion.length > 100 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", p: 1.5 }}
          >
            Mostrando los primeros 100 de {sinDotacion.length}.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
