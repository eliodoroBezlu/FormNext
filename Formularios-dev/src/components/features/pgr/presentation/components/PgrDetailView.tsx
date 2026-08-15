"use client";

import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import Link from "next/link";
import { ActividadPgr, Pgr, PgrEstado } from "../../domain/models/IProps";
import {
  getActividadEstadoColor,
  getSemaforoColor,
  MESES_PGR,
  textoResponsables,
} from "../../domain/pgrHelpers";
import { IndicadoresPanel } from "./IndicadoresPanel";
import { ProgramacionResumen } from "./ProgramacionResumen";
import { PgrDetalleFormData } from "../../application/hooks/usePgrDetalle";

export interface PgrDetailViewProps {
  pgr: Pgr;
  isViewMode: boolean;
  formData: PgrDetalleFormData;
  onChange: (field: keyof PgrDetalleFormData, value: string) => void;
  saving: boolean;
  onSave: () => void;
  onBack: () => void;
}

export function PgrDetailView({
  pgr,
  isViewMode,
  formData,
  onChange,
  saving,
  onSave,
  onBack,
}: PgrDetailViewProps) {
  const theme = useTheme();

  return (
    <Box p={4} maxWidth="1200px" mx="auto">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="outlined"
            type="button"
            sx={{ borderRadius: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" fontWeight="bold">
            {isViewMode ? "Detalles Generales del PGR" : "Editar PGR"}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1.5}>
          {/* Un PGR aprobado ya no admite programación nueva: el backend la
              rechaza, así que la entrada no se ofrece. */}
          {pgr.estado !== PgrEstado.APROBADO && (
            <Button
              variant="outlined"
              startIcon={<AccountTreeIcon />}
              component={Link}
              href={`/dashboard/pgr/consolidacion/${pgr._id}`}
              sx={{ borderRadius: 2 }}
            >
              Consolidar matrices
            </Button>
          )}
          {!isViewMode && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={onSave}
              disabled={saving}
              type="button"
              sx={{ borderRadius: 2, px: 3 }}
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          )}
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom color="text.secondary">
          Información Básica
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Código Autogenerado"
              value={formData.codigoAutogenerado}
              disabled
              InputProps={{ readOnly: true }}
              sx={{ backgroundColor: theme.palette.action.hover }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={isViewMode}>
              <InputLabel>Estado Flujo</InputLabel>
              <Select
                value={formData.estado}
                onChange={(e) => onChange("estado", e.target.value)}
                label="Estado Flujo"
              >
                <MenuItem value={PgrEstado.BORRADOR}>Borrador</MenuItem>
                <MenuItem value={PgrEstado.EN_REVISION}>En Revisión</MenuItem>
                <MenuItem value={PgrEstado.CORREGIR}>Corregir</MenuItem>
                <MenuItem value={PgrEstado.APROBADO}>Aprobado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Empresa"
              value={formData.empresa}
              onChange={(e) => onChange("empresa", e.target.value)}
              disabled={isViewMode}
              InputProps={{ readOnly: isViewMode }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Vicepresidencia"
              value={formData.vicepresidencia}
              onChange={(e) => onChange("vicepresidencia", e.target.value)}
              disabled={isViewMode}
              InputProps={{ readOnly: isViewMode }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Gerencia"
              value={formData.gerencia}
              onChange={(e) => onChange("gerencia", e.target.value)}
              disabled={isViewMode}
              InputProps={{ readOnly: isViewMode }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Superintendencia"
              value={formData.superintendencia}
              onChange={(e) => onChange("superintendencia", e.target.value)}
              disabled={isViewMode}
              InputProps={{ readOnly: isViewMode }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Gestión"
              value={formData.gestion}
              onChange={(e) => onChange("gestion", e.target.value)}
              disabled={isViewMode}
              InputProps={{ readOnly: isViewMode }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Estatus"
              value={pgr.activo !== false ? "Activo" : "Inactivo"}
              disabled
              InputProps={{ readOnly: true }}
              sx={{ backgroundColor: theme.palette.action.hover }}
            />
          </Grid>
        </Grid>

        {/* Indicadores del PGR: los calcula el backend a partir de la
            programación, no se persisten. */}
        {pgr.indicadores && (
          <Box mt={6}>
            <Typography variant="h6" gutterBottom color="text.secondary">
              Indicadores
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <IndicadoresPanel
                  titulo="Periodo"
                  subtitulo={`Acumulado hasta ${
                    MESES_PGR[(pgr.mesCorte ?? 12) - 1]
                  }`}
                  indicadores={pgr.indicadores.periodo}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <IndicadoresPanel
                  titulo="Total gestión"
                  subtitulo={`Ventana de ${pgr.ventanaGestion ?? 12} ${
                    (pgr.ventanaGestion ?? 12) === 1 ? "mes" : "meses"
                  }`}
                  indicadores={pgr.indicadores.gestion}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        <Box mt={6}>
          <Typography variant="h6" gutterBottom color="text.secondary">
            Actividades Planificadas y Seguimiento
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ backgroundColor: theme.palette.action.hover }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Descripción</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Responsable</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Meses</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Estado Aprobación</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Fecha Ejecución</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Semáforo</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Evidencias</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!pgr.actividades || pgr.actividades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No hay actividades registradas en este PGR
                    </TableCell>
                  </TableRow>
                ) : (
                  pgr.actividades.map((act: ActividadPgr) => (
                    <TableRow key={act._id} hover>
                      <TableCell>{act.descripcion}</TableCell>
                      <TableCell>{textoResponsables(act)}</TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        <ProgramacionResumen
                          programacion={act.programacion}
                          mesesProgramadosLegacy={act.mesesProgramados}
                          mesCorte={pgr.mesCorte}
                          mostrarEjecucion
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={act.estadoAprobacion || "PENDIENTE"}
                          color={getActividadEstadoColor(act.estadoAprobacion)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {act.fechaEjecucion ? (
                          new Date(act.fechaEjecucion).toLocaleDateString()
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Sin registrar
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {act.semaforoTiempo ? (
                          <Chip
                            label={act.semaforoTiempo}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: getSemaforoColor(act.semaforoTiempo),
                              color: getSemaforoColor(act.semaforoTiempo),
                            }}
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {!act.evidencias || act.evidencias.length === 0 ? (
                          <Typography variant="caption" color="text.secondary">
                            Sin evidencias
                          </Typography>
                        ) : (
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            {act.evidencias.map((url: string, i: number) => (
                              <Typography
                                key={i}
                                component="a"
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                variant="caption"
                                sx={{ color: theme.palette.primary.main, textDecoration: "none" }}
                              >
                                Ver Evidencia {i + 1}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Box>
  );
}
