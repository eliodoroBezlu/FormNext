"use client";

import {
  Box,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import { ActividadEstado, ActividadPgr, AprobacionRespuesta } from "../../domain/models/IProps";
import {
  formatActividadLabel,
  textoResponsables,
} from "../../domain/pgrHelpers";
import { ProgramacionResumen } from "./ProgramacionResumen";

export interface ActividadAprobacionRowProps {
  actividad: ActividadPgr;
  respuesta: AprobacionRespuesta | undefined;
  onEstadoChange: (actividadId: string, value: ActividadEstado) => void;
  onMotivoChange: (actividadId: string, value: string) => void;
}

export function ActividadAprobacionRow({
  actividad,
  respuesta,
  onEstadoChange,
  onMotivoChange,
}: ActividadAprobacionRowProps) {
  const theme = useTheme();
  const estadoActual = respuesta?.estado || ActividadEstado.APROBADO;

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12 }}>
          <Typography
            variant="subtitle2"
            sx={{
              backgroundColor: theme.palette.action.hover,
              display: "inline-block",
              px: 1,
              borderRadius: 1,
              mr: 1,
            }}
          >
            {formatActividadLabel(actividad._id)}
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold" display="inline">
            {actividad.descripcion}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Responsable:
          </Typography>
          <Typography variant="body2">{textoResponsables(actividad)}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Verificador:
          </Typography>
          <Typography variant="body2">{actividad.verificador}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Programación:
          </Typography>
          <ProgramacionResumen
            programacion={actividad.programacion}
            mesesProgramadosLegacy={actividad.mesesProgramados}
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      <Grid container alignItems="flex-start" spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <RadioGroup
            row
            value={estadoActual}
            onChange={(e) =>
              onEstadoChange(actividad._id, e.target.value as ActividadEstado)
            }
          >
            <FormControlLabel
              value={ActividadEstado.APROBADO}
              control={<Radio color="success" />}
              label={
                <Box display="flex" alignItems="center" gap={0.5} color="success.main">
                  <CheckCircleOutlineIcon fontSize="small" /> Aprobar
                </Box>
              }
            />
            <FormControlLabel
              value={ActividadEstado.RECHAZADO}
              control={<Radio color="error" />}
              label={
                <Box display="flex" alignItems="center" gap={0.5} color="error.main">
                  <CancelIcon fontSize="small" /> Rechazar
                </Box>
              }
            />
          </RadioGroup>
        </Grid>
        {estadoActual === ActividadEstado.RECHAZADO && (
          <Grid size={{ xs: 12, md: 8 }} data-question-error="true">
            <Typography variant="body2" color="error.main" fontWeight="bold" gutterBottom>
              Motivo del rechazo (obligatorio)
            </Typography>
            <TextField
              multiline
              rows={2}
              fullWidth
              placeholder="Especifique las correcciones necesarias..."
              color="error"
              value={respuesta?.motivo || ""}
              onChange={(e) => onMotivoChange(actividad._id, e.target.value)}
              error={!respuesta?.motivo}
            />
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
