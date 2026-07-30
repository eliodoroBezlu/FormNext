"use client";

import { useMemo, useState } from "react";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {
  ActividadPgr,
  CategoriaEjecucionKey,
  PendingFile,
  SeguimientoActividadState,
} from "../../domain/models/IProps";
import {
  CATEGORIAS_EJECUCION,
  formatActividadLabel,
  getSemaforoBackground,
  getSemaforoColor,
  MESES_PGR,
} from "../../domain/pgrHelpers";
import { EvidenciasUploader } from "./EvidenciasUploader";
import { LeyendaCategorias, ProgramacionResumen } from "./ProgramacionResumen";

export interface ActividadSeguimientoRowProps {
  actividad: ActividadPgr;
  data: SeguimientoActividadState | undefined;
  pendingFiles: PendingFile[];
  saving: boolean;
  onChange: (
    actId: string,
    field: keyof SeguimientoActividadState,
    value: string | dayjs.Dayjs | null,
  ) => void;
  onFileUpload: (actId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePendingFile: (actId: string, index: number) => void;
  onRemoveSavedFile: (actId: string, index: number) => void;
  /**
   * Registra la cantidad ejecutada de un mes en una de las 3 categorías de
   * oportunidad. Si no se pasa, la sección de registro no se muestra.
   */
  onCantidadChange?: (
    actId: string,
    mes: number,
    categoria: CategoriaEjecucionKey,
    cantidad: number,
  ) => void;
  readonly?: boolean;
}

const SEMAFORO_OPTIONS = ["Antes del Mes", "En el Mes", "Atrasado"];

export function ActividadSeguimientoRow({
  actividad,
  data,
  pendingFiles,
  saving,
  onChange,
  onFileUpload,
  onRemovePendingFile,
  onRemoveSavedFile,
  onCantidadChange,
  readonly = false,
}: ActividadSeguimientoRowProps) {
  const theme = useTheme();
  const semaforoActual = data?.semaforoTiempo || "Pendiente";

  // Arranca en el primer mes con programación pendiente de ejecutar; si no
  // hay ninguno, en el primero programado. Evita que el usuario tenga que
  // buscar el mes correcto en una lista de 12.
  const mesInicial = useMemo(() => {
    const prog = actividad.programacion ?? [];
    const pendiente = prog.find(
      (p) =>
        p.programado > 0 &&
        (p.realMesPasado ?? 0) +
          (p.realDelMes ?? 0) +
          (p.realMesAdelantado ?? 0) <
          p.programado,
    );
    return pendiente?.mes ?? prog.find((p) => p.programado > 0)?.mes ?? 1;
  }, [actividad.programacion]);

  const [mesSeleccionado, setMesSeleccionado] = useState(mesInicial);

  const mesActual = (actividad.programacion ?? []).find(
    (p) => p.mes === mesSeleccionado,
  );

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Typography
            variant="subtitle2"
            sx={{
              backgroundColor: theme.palette.text.primary,
              color: theme.palette.background.paper,
              display: "inline-block",
              px: 1,
              borderRadius: 2,
              mr: 1,
            }}
          >
            {formatActividadLabel(actividad._id)}
          </Typography>
          <Typography variant="h6" display="inline" fontWeight="bold">
            {actividad.descripcion}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Responsable: <Typography component="span" color="text.primary">{actividad.responsable}</Typography>
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Entregable: <Typography component="span" color="text.primary">{actividad.entregable}</Typography>
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Programación / ejecución:
          </Typography>
          <ProgramacionResumen
            programacion={actividad.programacion}
            mesesProgramadosLegacy={actividad.mesesProgramados}
            mostrarEjecucion
          />
        </Grid>
      </Grid>

      {/*
        Registro de ejecución por categoría de oportunidad.
        Es lo que decide la eficiencia: lo ejecutado con retraso suma a
        eficacia pero NO a eficiencia. Los colores replican los de la
        planilla en Excel para no cambiarle el lenguaje visual al usuario.
      */}
      {onCantidadChange && (
        <Box mb={3}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
            mb={1}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Registrar ejecución del mes
            </Typography>
            <LeyendaCategorias />
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth size="small" disabled={readonly}>
                <InputLabel>Mes</InputLabel>
                <Select
                  label="Mes"
                  value={mesSeleccionado}
                  onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                >
                  {MESES_PGR.map((m, i) => (
                    <MenuItem key={m} value={i + 1}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {CATEGORIAS_EJECUCION.map((cat) => (
              <Grid key={cat.key} size={{ xs: 12, sm: 3 }}>
                <Tooltip title={cat.ayuda}>
                  <TextField
                    label={cat.label}
                    type="number"
                    size="small"
                    fullWidth
                    disabled={readonly}
                    value={mesActual?.[cat.key] ?? 0}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      onCantidadChange(
                        actividad._id,
                        mesSeleccionado,
                        cat.key,
                        Number.isFinite(n) && n >= 0 ? n : 0,
                      );
                    }}
                    inputProps={{ min: 0 }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: cat.fondo,
                        "& fieldset": { borderColor: cat.color, borderWidth: 2 },
                      },
                    }}
                  />
                </Tooltip>
              </Grid>
            ))}
          </Grid>

          {mesActual && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              {`Programado en ${MESES_PGR[mesSeleccionado - 1]}: ${mesActual.programado} · `}
              {`Ejecutado: ${
                (mesActual.realMesPasado ?? 0) +
                (mesActual.realDelMes ?? 0) +
                (mesActual.realMesAdelantado ?? 0)
              }`}
            </Typography>
          )}
        </Box>
      )}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Semáforo de Tiempo
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={semaforoActual}
                onChange={(e) => onChange(actividad._id, "semaforoTiempo", e.target.value)}
                sx={{
                  backgroundColor: getSemaforoBackground(
                    semaforoActual === "Pendiente" ? undefined : semaforoActual,
                  ),
                  "& .MuiSelect-select": { display: "flex", alignItems: "center", gap: 1 },
                }}
              >
                {SEMAFORO_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: getSemaforoColor(opt),
                        display: "inline-block",
                        mr: 1,
                      }}
                    />
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Fecha de Ejecución
            </Typography>
            <DatePicker
              value={data?.fechaEjecucion ? dayjs(data.fechaEjecucion) : null}
              onChange={(newValue) => onChange(actividad._id, "fechaEjecucion", newValue)}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </Box>
          <EvidenciasUploader
            actividadId={actividad._id}
            evidencias={data?.evidencias}
            pendingFiles={pendingFiles}
            saving={saving}
            onFileUpload={onFileUpload}
            onRemovePendingFile={onRemovePendingFile}
            onRemoveSavedFile={onRemoveSavedFile}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Observaciones de Ejecución
          </Typography>
          <TextField
            multiline
            rows={6}
            fullWidth
            placeholder="Describa el estado de la ejecución, desafíos, resultados..."
            value={data?.observaciones || ""}
            onChange={(e) => onChange(actividad._id, "observaciones", e.target.value)}
            sx={{
              backgroundColor: theme.palette.action.hover,
              "& fieldset": { border: "none" },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
