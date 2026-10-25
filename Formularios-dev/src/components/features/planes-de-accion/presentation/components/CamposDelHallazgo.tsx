"use client";

import { Controller, type Control } from "react-hook-form";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import type { CorregirTareaDTO } from "../../domain/models/IProps";
import { EMPRESAS } from "@/lib/catalogos/empresas";
import AutocompleteTrabajador from "@/components/ui/autocomplete/AutocompleteTrabajador";

type CamposHallazgo = Required<
  Pick<
    CorregirTareaDTO,
    | "fechaHallazgo"
    | "responsableObservacion"
    | "empresa"
    | "lugarFisico"
    | "actividad"
    | "descripcionObservacion"
  >
>;

interface CamposDelHallazgoProps<T extends CamposHallazgo> {
  control: Control<T>;
  /** La tarea salió de una IRO: avisa que corregirla vuelve a pisar estos datos. */
  vieneDeInspeccion: boolean;
}

const obligatorio = (nombre: string) => ({
  validate: (v: string) => v.trim() !== "" || `${nombre} no puede quedar vacío`,
});

/**
 * Los datos del hallazgo dentro de «Corregir tarea». Son obligatorios en la
 * tarea: se pueden cambiar, no vaciar (el backend también lo exige).
 */
export function CamposDelHallazgo<T extends CamposHallazgo>({
  control,
  vieneDeInspeccion,
}: CamposDelHallazgoProps<T>) {
  // Las rutas son fijas y existen en T: el cast evita que RHF pida un T exacto.
  const c = control as unknown as Control<CamposHallazgo>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Datos del hallazgo
      </Typography>
      {vieneDeInspeccion && (
        <Typography variant="caption" color="text.secondary">
          Vienen de la IRO. Si se corrige la IRO, el responsable, la empresa y
          el lugar se vuelven a tomar de ella.
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Controller
          name="fechaHallazgo"
          control={c}
          rules={obligatorio("La fecha del hallazgo")}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              type="date"
              label="Fecha del hallazgo"
              size="small"
              sx={{ flex: 1, minWidth: 180 }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        />
        <Controller
          name="empresa"
          control={c}
          rules={obligatorio("La empresa")}
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Autocomplete
              freeSolo
              options={EMPRESAS}
              value={value || null}
              onChange={(_e, nueva) => onChange(nueva ?? "")}
              onInputChange={(_e, texto, motivo) => {
                if (motivo === "input") onChange(texto);
              }}
              onBlur={onBlur}
              sx={{ flex: 1, minWidth: 180 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Empresa"
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          )}
        />
      </Box>

      <Controller
        name="responsableObservacion"
        control={c}
        rules={obligatorio("El responsable de la observación")}
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <AutocompleteTrabajador
            label="Responsable de la observación"
            value={value}
            onChange={(nomina) => onChange(nomina ?? "")}
            onBlur={onBlur}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Controller
          name="lugarFisico"
          control={c}
          rules={obligatorio("El lugar físico")}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Lugar físico"
              size="small"
              sx={{ flex: 1, minWidth: 180 }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="actividad"
          control={c}
          rules={obligatorio("La actividad")}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Actividad"
              size="small"
              sx={{ flex: 1, minWidth: 180 }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </Box>

      <Controller
        name="descripcionObservacion"
        control={c}
        rules={obligatorio("La descripción")}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Descripción de la observación"
            size="small"
            multiline
            minRows={2}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
    </Box>
  );
}
