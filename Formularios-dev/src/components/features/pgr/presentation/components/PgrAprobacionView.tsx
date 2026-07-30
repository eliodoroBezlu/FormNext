"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import { ActividadEstado, ActividadPgr, AprobacionRespuesta, Pgr } from "../../domain/models/IProps";
import { ActividadAprobacionRow } from "./ActividadAprobacionRow";
import { PgrHeaderInfo } from "./PgrHeaderInfo";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export interface PgrAprobacionViewProps {
  pgr: Pgr;
  aprobadoPor: string;
  onAprobadoPorChange: (value: string) => void;
  fechaAprobacion: Dayjs | null;
  onFechaAprobacionChange: (value: Dayjs | null) => void;
  respuestas: Record<string, AprobacionRespuesta>;
  onEstadoChange: (actividadId: string, value: ActividadEstado) => void;
  onMotivoChange: (actividadId: string, value: string) => void;
  isAllApproved: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  snackbar: SnackbarState;
  onCloseSnackbar: () => void;
}

export function PgrAprobacionView({
  pgr,
  aprobadoPor,
  onAprobadoPorChange,
  fechaAprobacion,
  onFechaAprobacionChange,
  respuestas,
  onEstadoChange,
  onMotivoChange,
  isAllApproved,
  isSubmitting,
  onSubmit,
  snackbar,
  onCloseSnackbar,
}: PgrAprobacionViewProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 4, maxWidth: "1200px", margin: "0 auto" }}>
        <Typography variant="h4" gutterBottom>
          Flujo de Aprobación
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          Revisión del Plan de Actividades
        </Typography>

        <PgrHeaderInfo
          pgr={pgr}
          color="info"
          extraFields={[
            { label: "Empresa", value: pgr.empresa },
            { label: "Gerencia", value: pgr.gerencia },
            { label: "Gestión", value: pgr.gestion },
          ]}
        />

        <Card elevation={0} sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Aprobado por"
                  fullWidth
                  size="small"
                  value={aprobadoPor}
                  onChange={(e) => onAprobadoPorChange(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Fecha"
                  value={fechaAprobacion}
                  onChange={onFechaAprobacionChange}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Lista de Tareas para Aprobación */}
        <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Criterios de Aprobación por Tarea
            </Typography>

            {pgr.actividades.map((act: ActividadPgr) => (
              <ActividadAprobacionRow
                key={act._id}
                actividad={act}
                respuesta={respuestas[act._id]}
                onEstadoChange={onEstadoChange}
                onMotivoChange={onMotivoChange}
              />
            ))}
          </CardContent>
        </Card>

        <Box display="flex" justifyContent="flex-end">
          {isAllApproved ? (
            <Button
              variant="contained"
              color="success"
              onClick={onSubmit}
              disabled={isSubmitting}
              type="button"
              startIcon={<CheckCircleOutlineIcon />}
              sx={{ borderRadius: 4, textTransform: "none", px: 4 }}
            >
              {isSubmitting ? "Enviando..." : "Aprobar Plan Completo"}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              onClick={onSubmit}
              disabled={isSubmitting}
              type="button"
              startIcon={<CancelIcon />}
              sx={{ borderRadius: 4, textTransform: "none", px: 4 }}
            >
              {isSubmitting ? "Enviando..." : "Corregir y Volver a Mandar"}
            </Button>
          )}
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={onCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={onCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}
