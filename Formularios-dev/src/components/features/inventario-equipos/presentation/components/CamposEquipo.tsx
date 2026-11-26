"use client";

import type { ReactNode } from "react";
import { Autocomplete, Box, MenuItem, TextField, type TextFieldProps } from "@mui/material";
import {
  Controller,
  get,
  useFormContext,
  type FieldPath,
  type RegisterOptions,
} from "react-hook-form";
import type { ValoresEquipo } from "../../domain/formularioEquipo";
import type { OpcionTexto } from "../../domain/formularioEquipo";

type Ruta = FieldPath<ValoresEquipo>;
type Reglas = Omit<RegisterOptions<ValoresEquipo, Ruta>, "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled">;

interface Base {
  nombre: Ruta;
  label: string;
  reglas?: Reglas;
  /** Ayuda bajo el campo cuando no hay error. */
  ayuda?: ReactNode;
}

/**
 * Marca `data-question-error` en el contenedor (MUI no lleva `aria-invalid`
 * al DOM) para que un envío con errores lleve hasta el primero.
 */
function useCampo(nombre: Ruta) {
  const { control, formState } = useFormContext<ValoresEquipo>();
  const error = get(formState.errors, nombre) as { message?: string } | undefined;
  return { control, error };
}

/** Un campo de texto del formulario de equipo. */
export function CampoTexto({
  nombre,
  label,
  reglas,
  ayuda,
  ...props
}: Base & Omit<TextFieldProps, "name" | "label">) {
  const { control, error } = useCampo(nombre);
  return (
    <Controller
      name={nombre}
      control={control}
      rules={reglas}
      render={({ field }) => (
        <Box data-question-error={error ? "true" : undefined}>
          <TextField
            {...props}
            label={label}
            name={field.name}
            inputRef={field.ref}
            value={(field.value as string | undefined) ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            fullWidth
            required={!!reglas?.required}
            error={!!error}
            helperText={error?.message ?? ayuda}
          />
        </Box>
      )}
    />
  );
}

export interface OpcionSelect {
  valor: string;
  etiqueta: string;
}

/** Una lista desplegable cerrada (área, clasificación, estado…). */
export function CampoSelect({
  nombre,
  label,
  reglas,
  ayuda,
  opciones,
  vacio,
}: Base & { opciones: OpcionSelect[]; /** Texto si la lista está vacía. */ vacio?: string }) {
  const { control, error } = useCampo(nombre);
  return (
    <Controller
      name={nombre}
      control={control}
      rules={reglas}
      render={({ field }) => (
        <Box data-question-error={error ? "true" : undefined}>
          <TextField
            select
            label={label}
            name={field.name}
            inputRef={field.ref}
            value={(field.value as string | undefined) ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            fullWidth
            required={!!reglas?.required}
            error={!!error}
            helperText={error?.message ?? ayuda}
          >
            {opciones.length === 0 && (
              <MenuItem value="" disabled>
                {vacio ?? "No hay opciones cargadas"}
              </MenuItem>
            )}
            {opciones.map((o) => (
              <MenuItem key={o.valor} value={o.valor}>
                {o.etiqueta}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}
    />
  );
}

/**
 * Texto libre con sugerencias de lo ya cargado (marca, modelo, responsable).
 * Se puede escribir un valor nuevo; elegir uno existente evita variantes como
 * «BOCH» y «BOSCH» (Patrón 8 de `CLAUDE.md`).
 */
export function CampoSugerido({
  nombre,
  label,
  reglas,
  ayuda,
  opciones,
}: Base & { opciones: OpcionTexto[] }) {
  const { control, error } = useCampo(nombre);
  return (
    <Controller
      name={nombre}
      control={control}
      rules={reglas}
      render={({ field }) => (
        <Box data-question-error={error ? "true" : undefined}>
          <Autocomplete
            freeSolo
            options={opciones.map((o) => o.valor)}
            value={(field.value as string | undefined) ?? ""}
            onChange={(_, valor) => field.onChange(valor ?? "")}
            onInputChange={(_, valor, motivo) => {
              if (motivo === "input" || motivo === "clear") field.onChange(valor);
            }}
            onBlur={field.onBlur}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                name={field.name}
                inputRef={field.ref}
                required={!!reglas?.required}
                error={!!error}
                helperText={error?.message ?? ayuda}
              />
            )}
          />
        </Box>
      )}
    />
  );
}
