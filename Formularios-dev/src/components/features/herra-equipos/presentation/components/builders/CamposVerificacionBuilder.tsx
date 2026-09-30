"use client";

import { memo, useCallback } from "react";
import { useFieldArray, useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import {
  Box,
  Button as MuiButton,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { OpcionesCampoVerificacion } from "./OpcionesCampoVerificacion";
import type {
  FormBuilderDataHerraEquipos,
  VerificationFieldHerraEquipos,
  VerificationFieldType,
} from "../../../domain/models/BuilderTypes";

const DATA_SOURCES: Array<{ value: string; label: string }> = [
  { value: "area", label: "Área" },
  { value: "superintendencia", label: "Superintendencia" },
  { value: "trabajador", label: "Trabajador" },
  { value: "gerencia", label: "Gerencia" },
  { value: "cargo", label: "Cargo" },
  { value: "equipo", label: "Equipo" },
  { value: "vicepresidencia", label: "Vicepresidencia" },
  { value: "supervisor", label: "Supervisor" },
];

interface Props {
  control: Control<FormBuilderDataHerraEquipos>;
  setValue: UseFormSetValue<FormBuilderDataHerraEquipos>;
  disabled: boolean;
}

/** «Campos de Lista de Verificación» del constructor de herramientas. */
export function CamposVerificacionBuilder({ control, setValue, disabled }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: "verificationFields" });
  const agregar = useCallback(() => append({ label: "", type: "text" }), [append]);

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Campos de Lista de Verificación ({fields.length})</Typography>
          {!disabled && (
            <MuiButton type="button" variant="outlined" startIcon={<Add />} onClick={agregar} size="small">
              Agregar Campo
            </MuiButton>
          )}
        </Box>
        {fields.map((field, index) => (
          <CampoVerificacion
            key={field.id}
            index={index}
            control={control}
            setValue={setValue}
            disabled={disabled}
            onRemove={remove}
          />
        ))}
        {fields.length === 0 && (
          <Box
            p={3}
            textAlign="center"
            sx={{
              border: (theme) => `2px dashed ${theme.palette.mode === "dark" ? "#334155" : "#ddd"}`,
              borderRadius: 2,
              backgroundColor: (theme) => (theme.palette.mode === "dark" ? "background.default" : "#fafafa"),
            }}
          >
            <Typography color="text.secondary">No hay campos de verificación.</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

interface CampoProps extends Props {
  index: number;
  onRemove: (index: number) => void;
}

/** Una fila: vigila solo su propio campo, así que escribir aquí no redibuja las demás. */
const CampoVerificacion = memo(function CampoVerificacion({ index, control, setValue, disabled, onRemove }: CampoProps) {
  const ruta = `verificationFields.${index}` as const;
  const campo = (useWatch({ control, name: ruta }) ?? {}) as Partial<VerificationFieldHerraEquipos>;
  const tipo = campo.type ?? "text";

  const cambiarTipo = (nuevo: VerificationFieldType) => {
    setValue(`${ruta}.type`, nuevo);
    if (nuevo !== "autocomplete") setValue(`${ruta}.dataSource`, undefined);
    // La lista de opciones no significa nada fuera de «Selección»; dejarla
    // colgada haría que reaparezca si se vuelve a ese tipo por error.
    if (nuevo !== "select") {
      setValue(`${ruta}.options`, undefined);
      setValue(`${ruta}.permiteOtro`, undefined);
    }
    // En «Selección» el valor sale de la lista, así que el valor por defecto
    // se oculta y se limpia: un valor invisible que sigue aplicándose es peor
    // que no tenerlo.
    if (nuevo === "select") setValue(`${ruta}.valorPorDefecto`, undefined);
  };

  return (
    <Box mb={2}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="Etiqueta del Campo"
            value={campo.label ?? ""}
            size="small"
            onChange={(e) => setValue(`${ruta}.label`, e.target.value)}
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormControl fullWidth size="small" disabled={disabled}>
            <InputLabel>Tipo</InputLabel>
            <Select value={tipo} onChange={(e) => cambiarTipo(e.target.value as VerificationFieldType)} label="Tipo">
              <MenuItem value="text">Texto</MenuItem>
              <MenuItem value="date">Fecha</MenuItem>
              <MenuItem value="number">Número</MenuItem>
              <MenuItem value="select">Selección</MenuItem>
              <MenuItem value="autocomplete">Autocompletar</MenuItem>
              <MenuItem value="time">Hora</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6, sm: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={campo.obligatorio ?? false}
                onChange={(e) => setValue(`${ruta}.obligatorio`, e.target.checked)}
                disabled={disabled}
                size="small"
              />
            }
            label={<Typography variant="body2">Obligatorio</Typography>}
          />
        </Grid>
        {tipo === "autocomplete" && (
          <Grid size={{ xs: 12, sm: 2 }}>
            <FormControl fullWidth size="small" disabled={disabled}>
              <InputLabel>Origen de Datos</InputLabel>
              <Select
                value={campo.dataSource ?? ""}
                onChange={(e) => setValue(`${ruta}.dataSource`, e.target.value)}
                label="Origen de Datos"
              >
                {DATA_SOURCES.map((source) => (
                  <MenuItem key={source.value} value={source.value}>
                    {source.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        {/*
          Para los campos que siempre llevan lo mismo —«EMPRESA» es el caso que
          lo motivó—: se escribe aquí y el inspector se lo encuentra puesto. En
          «Selección» no se ofrece: ahí el valor sale de la lista.
        */}
        {tipo !== "select" && (
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Valor por defecto"
              placeholder="Opcional"
              disabled={disabled}
              value={campo.valorPorDefecto ?? ""}
              onChange={(e) => setValue(`${ruta}.valorPorDefecto`, e.target.value || undefined)}
              helperText="Se rellena solo si el campo está vacío; el inspector puede cambiarlo"
            />
          </Grid>
        )}
        {!disabled && (
          <Grid size={{ xs: "auto" }}>
            <IconButton color="error" onClick={() => onRemove(index)} size="small" aria-label="Eliminar campo">
              <Delete />
            </IconButton>
          </Grid>
        )}
        {tipo === "select" && (
          <Grid size={{ xs: 12 }}>
            <OpcionesCampoVerificacion
              opciones={campo.options ?? []}
              permiteOtro={campo.permiteOtro ?? false}
              onChange={(opciones) => setValue(`${ruta}.options`, opciones)}
              onPermiteOtroChange={(permiteOtro) => setValue(`${ruta}.permiteOtro`, permiteOtro)}
              disabled={disabled}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
});
