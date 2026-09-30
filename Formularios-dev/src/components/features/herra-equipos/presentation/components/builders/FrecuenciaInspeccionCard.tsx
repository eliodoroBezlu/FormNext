"use client";

import { useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import {
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { FormBuilderDataHerraEquipos, UnidadFrecuencia } from "../../../domain/models/BuilderTypes";

const UNIDADES_FRECUENCIA: Array<{ value: UnidadFrecuencia; label: string }> = [
  { value: "diaria", label: "Diaria" },
  { value: "semanal", label: "Semanal" },
  { value: "mensual", label: "Mensual" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
  { value: "personalizada", label: "Personalizada (días)" },
];

interface Props {
  control: Control<FormBuilderDataHerraEquipos>;
  setValue: UseFormSetValue<FormBuilderDataHerraEquipos>;
  disabled: boolean;
}

/**
 * Frecuencia de inspección. Vigila su propia configuración y las etiquetas de
 * los campos de verificación (para elegir el campo del código de equipo);
 * escribir una pregunta no la toca.
 */
export function FrecuenciaInspeccionCard({ control, setValue, disabled }: Props) {
  const [frecuencia, campoCodigoEquipo, campos] = useWatch({
    control,
    name: ["frecuencia", "campoCodigoEquipo", "verificationFields"],
  });
  const unidad = frecuencia?.unidad || "mensual";

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Frecuencia de Inspección
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Si se activa, un código de equipo ya inspeccionado con este tipo de plantilla dejará de estar disponible
          hasta que se cumpla la frecuencia configurada.
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={frecuencia?.activa ?? false}
                  onChange={(e) =>
                    setValue("frecuencia", {
                      unidad,
                      valorPersonalizado: frecuencia?.valorPersonalizado,
                      activa: e.target.checked,
                    })
                  }
                  disabled={disabled}
                />
              }
              label="Activar control de frecuencia"
            />
          </Grid>
          {frecuencia?.activa && (
            <>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small" disabled={disabled}>
                  <InputLabel>Frecuencia</InputLabel>
                  <Select
                    value={unidad}
                    label="Frecuencia"
                    onChange={(e) => setValue("frecuencia.unidad", e.target.value as UnidadFrecuencia)}
                  >
                    {UNIDADES_FRECUENCIA.map((u) => (
                      <MenuItem key={u.value} value={u.value}>
                        {u.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {unidad === "personalizada" && (
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Días"
                    value={frecuencia?.valorPersonalizado ?? ""}
                    onChange={(e) => setValue("frecuencia.valorPersonalizado", Number(e.target.value))}
                    disabled={disabled}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small" disabled={disabled}>
                  <InputLabel>Campo de código de equipo</InputLabel>
                  <Select
                    value={campoCodigoEquipo || ""}
                    label="Campo de código de equipo"
                    onChange={(e) => setValue("campoCodigoEquipo", e.target.value)}
                  >
                    {(campos ?? []).map((f, idx) => (
                      <MenuItem key={idx} value={f?.label} disabled={!f?.label}>
                        {f?.label || "(sin etiqueta)"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
