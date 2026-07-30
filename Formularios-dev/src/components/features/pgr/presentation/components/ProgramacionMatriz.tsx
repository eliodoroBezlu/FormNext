"use client";

import { Control, Controller } from "react-hook-form";
import {
  Box,
  Chip,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { PgrConfiguracionFormData } from "../../domain/schemas/pgrConfiguracionSchema";
import { MESES_PGR } from "../../domain/pgrHelpers";

export interface ProgramacionMatrizProps {
  control: Control<PgrConfiguracionFormData>;
  /** Índice de la actividad dentro del field array. */
  actividadIndex: number;
  /** Mes de corte del PGR: los meses posteriores se marcan como fuera de periodo. */
  mesCorte?: number;
  disabled?: boolean;
  /** Total programado, para el resumen de la cabecera. */
  totalProgramado?: number;
  error?: string;
}

/**
 * Matriz de programación anual de una actividad: 12 casillas con la cantidad
 * programada por mes.
 *
 * Sustituye al multi-select de meses del modelo anterior, que solo registraba
 * *si* el mes tocaba pero no *cuánto* — sin cantidad no se pueden calcular
 * eficacia ni eficiencia, que son el objetivo del PGR.
 *
 * Se muestra en una fila con scroll horizontal en vez de 12 campos apilados:
 * con 50 actividades × 12 meses, apilarlos haría la pantalla inmanejable.
 */
export function ProgramacionMatriz({
  control,
  actividadIndex,
  mesCorte,
  disabled = false,
  totalProgramado,
  error,
}: ProgramacionMatrizProps) {
  const theme = useTheme();

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 0.5 }}
      >
        <Typography variant="caption" color="text.secondary">
          Programación mensual (cantidad por mes)
        </Typography>
        {totalProgramado !== undefined && (
          <Chip
            size="small"
            label={`Total: ${totalProgramado}`}
            color={totalProgramado > 0 ? "primary" : "default"}
            variant="outlined"
          />
        )}
      </Stack>

      {/* Scroll propio: la tabla no debe empujar el ancho de la página */}
      <Box sx={{ overflowX: "auto", pb: 0.5 }}>
        <Stack direction="row" spacing={0.5} sx={{ minWidth: 620 }}>
          {MESES_PGR.map((nombreMes, i) => {
            const fueraDePeriodo = mesCorte !== undefined && i + 1 > mesCorte;

            return (
              <Box key={nombreMes} sx={{ minWidth: 48, flex: "1 0 48px" }}>
                <Tooltip
                  title={
                    fueraDePeriodo
                      ? `${nombreMes} — fuera del periodo de corte`
                      : nombreMes
                  }
                >
                  <Typography
                    variant="caption"
                    align="center"
                    display="block"
                    sx={{
                      fontWeight: 600,
                      color: fueraDePeriodo
                        ? theme.palette.text.disabled
                        : theme.palette.text.secondary,
                    }}
                  >
                    {nombreMes}
                  </Typography>
                </Tooltip>

                <Controller
                  name={`actividades.${actividadIndex}.programacion.${i}.programado`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      size="small"
                      disabled={disabled}
                      value={field.value ?? 0}
                      onChange={(e) => {
                        // El input devuelve string; el schema espera number.
                        const n = parseInt(e.target.value, 10);
                        field.onChange(Number.isFinite(n) && n >= 0 ? n : 0);
                      }}
                      inputProps={{
                        min: 0,
                        style: { textAlign: "center", padding: "6px 2px" },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: fueraDePeriodo
                            ? theme.palette.action.disabledBackground
                            : undefined,
                        },
                      }}
                    />
                  )}
                />
              </Box>
            );
          })}
        </Stack>
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
