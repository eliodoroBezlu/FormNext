"use client";

import { Alert, Box, Button, Card, CardContent, CircularProgress, Snackbar, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SaveIcon from "@mui/icons-material/Save";
import dayjs from "dayjs";
import {
  ActividadPgr,
  CategoriaEjecucionKey,
  PendingFile,
  Pgr,
  SeguimientoActividadState,
} from "../../domain/models/IProps";
import { ActividadSeguimientoRow } from "./ActividadSeguimientoRow";
import { PgrHeaderInfo } from "./PgrHeaderInfo";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export interface PgrSeguimientoViewProps {
  pgr: Pgr;
  seguimientoData: Record<string, SeguimientoActividadState>;
  pendingFiles: Record<string, PendingFile[]>;
  saving: boolean;
  onChange: (
    actId: string,
    field: keyof SeguimientoActividadState,
    value: string | dayjs.Dayjs | null,
  ) => void;
  onFileUpload: (actId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePendingFile: (actId: string, index: number) => void;
  onRemoveSavedFile: (actId: string, index: number) => void;
  onCantidadChange: (
    actId: string,
    mes: number,
    categoria: CategoriaEjecucionKey,
    cantidad: number,
  ) => void;
  onGuardar: () => void;
  onVerDashboard: () => void;
  snackbar: SnackbarState;
  onCloseSnackbar: () => void;
}

export function PgrSeguimientoView({
  pgr,
  seguimientoData,
  pendingFiles,
  saving,
  onChange,
  onFileUpload,
  onRemovePendingFile,
  onRemoveSavedFile,
  onCantidadChange,
  onGuardar,
  onVerDashboard,
  snackbar,
  onCloseSnackbar,
}: PgrSeguimientoViewProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 4, maxWidth: "1200px", margin: "0 auto" }}>
        <Typography variant="h4" gutterBottom>
          Seguimiento y Ejecución
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          Tablero de Control de Actividades
        </Typography>

        <PgrHeaderInfo
          pgr={pgr}
          color="success"
          extraFields={[
            { label: "Aprobado por", value: pgr.aprobadoPor },
            { label: "Fecha de Aprobación", value: pgr.fechaAprobacion },
            { label: "Gestión", value: pgr.gestion },
          ]}
        />

        <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            {pgr.actividades.map((act: ActividadPgr) => (
              <ActividadSeguimientoRow
                key={act._id}
                actividad={act}
                data={seguimientoData[act._id]}
                pendingFiles={pendingFiles[act._id] || []}
                saving={saving}
                onChange={onChange}
                onCantidadChange={onCantidadChange}
                onFileUpload={onFileUpload}
                onRemovePendingFile={onRemovePendingFile}
                onRemoveSavedFile={onRemoveSavedFile}
              />
            ))}
          </CardContent>
        </Card>

        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<DashboardIcon />}
            onClick={onVerDashboard}
            type="button"
            sx={{ borderRadius: 4, textTransform: "none", px: 4 }}
          >
            Ver Dashboard
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={onGuardar}
            disabled={saving}
            type="button"
            sx={{ borderRadius: 4, textTransform: "none", px: 4 }}
          >
            {saving ? "Guardando..." : "Guardar Seguimiento"}
          </Button>
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
