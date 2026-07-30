"use client";

import { Control, Controller, FieldErrors, UseFormWatch } from "react-hook-form";
import {
  Autocomplete,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { AreaBackend } from "@/lib/actions/area-actions";
import type { SuperintendenciaBackend } from "@/lib/actions/superintendecia-actions";
import { PgrConfiguracionFormData } from "../../domain/schemas/pgrConfiguracionSchema";
import { MESES_PGR } from "../../domain/pgrHelpers";

export interface PgrEncabezadoFieldsProps {
  control: Control<PgrConfiguracionFormData>;
  watch: UseFormWatch<PgrConfiguracionFormData>;
  errors: FieldErrors<PgrConfiguracionFormData>;
  areasList: AreaBackend[];
  superintendenciasList: SuperintendenciaBackend[];
  disabled: boolean;
}

/**
 * Sección "Encabezado General" del formulario de configuración de un PGR:
 * empresa, vicepresidencia, gerencia, superintendencia, gestión y áreas.
 * Extraída de `PgrConfiguracionView` para mantener cada componente bajo
 * ~300 líneas (CLAUDE.md, regla 8).
 */
export function PgrEncabezadoFields({
  control,
  watch,
  errors,
  areasList,
  superintendenciasList,
  disabled,
}: PgrEncabezadoFieldsProps) {
  return (
    <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Encabezado General
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }} data-question-error={errors.empresa ? "true" : undefined}>
            <Controller
              name="empresa"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Empresa"
                  placeholder="Nombre de la empresa"
                  fullWidth
                  size="small"
                  disabled={disabled}
                  error={!!errors.empresa}
                  helperText={errors.empresa?.message}
                />
              )}
            />
          </Grid>
          <Grid
            size={{ xs: 12, md: 4 }}
            data-question-error={errors.vicepresidencia ? "true" : undefined}
          >
            <Controller
              name="vicepresidencia"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Vicepresidencia"
                  placeholder="VP"
                  fullWidth
                  size="small"
                  disabled={disabled}
                  error={!!errors.vicepresidencia}
                  helperText={errors.vicepresidencia?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} data-question-error={errors.gerencia ? "true" : undefined}>
            <Controller
              name="gerencia"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Gerencia"
                  placeholder="Gerencia"
                  fullWidth
                  size="small"
                  disabled={disabled}
                  error={!!errors.gerencia}
                  helperText={errors.gerencia?.message}
                />
              )}
            />
          </Grid>
          <Grid
            size={{ xs: 12, md: 4 }}
            data-question-error={errors.superintendencia ? "true" : undefined}
          >
            <Controller
              name="superintendencia"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={superintendenciasList.map((s) => s.nombre)}
                  disabled={disabled}
                  value={field.value || null}
                  onChange={(_, data) => field.onChange(data || "")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Superintendencia"
                      placeholder="Seleccione o escriba"
                      size="small"
                      error={!!errors.superintendencia}
                      helperText={errors.superintendencia?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small" error={!!errors.gestion}>
              <InputLabel>Gestión</InputLabel>
              <Controller
                name="gestion"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Gestión" disabled={disabled}>
                    <MenuItem value="2025">2025</MenuItem>
                    <MenuItem value="2026">2026</MenuItem>
                    <MenuItem value="2027">2027</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Áreas</InputLabel>
              <Controller
                name="areas"
                control={control}
                render={({ field }) => {
                  const selectedSuperintendencia = watch("superintendencia");
                  const areasFiltradas = (Array.isArray(areasList) ? areasList : []).filter(
                    (area) =>
                      !selectedSuperintendencia ||
                      area.superintendencia?.nombre === selectedSuperintendencia,
                  );
                  return (
                    <Select
                      {...field}
                      value={field.value || []}
                      multiple
                      label="Áreas"
                      disabled={disabled}
                      renderValue={(selected) => (selected as string[]).join(", ")}
                    >
                      {areasFiltradas.map((area) => (
                        <MenuItem key={area._id} value={area.nombre}>
                          {area.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  );
                }}
              />
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Controller
              name="supervisor"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ""}
                  label="Supervisor"
                  fullWidth
                  disabled={disabled}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Controller
              name="responsable"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ""}
                  label="Responsable"
                  fullWidth
                  disabled={disabled}
                />
              )}
            />
          </Grid>

          {/*
            Parámetros de cálculo de los indicadores. En la planilla original
            son las celdas de control $J$4 y $W$4: definen hasta qué mes
            acumulan eficacia y eficiencia. No son datos de la actividad.
          */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Controller
              name="mesCorte"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Mes de corte (periodo)</InputLabel>
                  <Select
                    {...field}
                    value={field.value ?? 12}
                    label="Mes de corte (periodo)"
                    disabled={disabled}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    {MESES_PGR.map((m, i) => (
                      <MenuItem key={m} value={i + 1}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Controller
              name="ventanaGestion"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Ventana de gestión</InputLabel>
                  <Select
                    {...field}
                    value={field.value ?? 12}
                    label="Ventana de gestión"
                    disabled={disabled}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    {MESES_PGR.map((m, i) => (
                      <MenuItem key={m} value={i + 1}>
                        {`Hasta ${m} (${i + 1} ${i === 0 ? "mes" : "meses"})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
