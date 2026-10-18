"use client";

import { Autocomplete, Box, Chip, TextField, type TextFieldProps } from "@mui/material";
import { Controller, get, useFormContext, type Path } from "react-hook-form";
import type { ValoresReporte } from "../../domain/formularioReporte";
import type { EntradaCatalogo, EstadoReporte } from "../../domain/models/Monitoreo";
import { ETIQUETA_ESTADO } from "../../domain/models/Monitoreo";
import { urlDeImagen } from "../../infrastructure/adapters/monitoreoAdapter";

type Ruta = Path<ValoresReporte>;

/** `2026-10-06T00:00:00.000Z` → `06/10/2026`. Las fechas del reporte son días en UTC. */
export function formatearDia(iso?: string): string {
  if (!iso) return "—";
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

/**
 * Un campo de texto del reporte, conectado al formulario.
 *
 * Marca `data-question-error` en su contenedor (MUI no lleva `aria-invalid`
 * al DOM) para que el envío pueda llevar el foco al primer error, y borra su
 * error en cuanto el usuario escribe.
 */
export function CampoTexto({
  nombre,
  soloLectura,
  ...props
}: { nombre: Ruta; soloLectura?: boolean } & Omit<TextFieldProps, "name">) {
  const {
    control,
    clearErrors,
    formState: { errors },
  } = useFormContext<ValoresReporte>();
  const error = get(errors, nombre) as { message?: string } | undefined;

  return (
    <Controller
      name={nombre}
      control={control}
      render={({ field }) => (
        <Box data-question-error={error ? "true" : undefined}>
          <TextField
            {...props}
            name={field.name}
            inputRef={field.ref}
            value={(field.value as string | undefined) ?? ""}
            onBlur={(e) => {
              field.onBlur();
              props.onBlur?.(e);
            }}
            onChange={(e) => {
              field.onChange(e.target.value);
              if (error) clearErrors(nombre);
            }}
            fullWidth
            size="small"
            error={!!error}
            helperText={error?.message ?? props.helperText}
            slotProps={{
              ...props.slotProps,
              input: { ...(props.slotProps?.input as object), readOnly: soloLectura },
            }}
          />
        </Box>
      )}
    />
  );
}

/**
 * Un valor de una lista del monitoreo. **Solo vale lo que está en la lista**:
 * es lo que evita volver a los antecedentes escritos a mano de mil formas.
 * Si el reporte ya tenía un valor que después se sacó de la lista, se sigue
 * mostrando.
 */
export function CampoCatalogo({
  nombre,
  etiqueta,
  opciones,
  soloLectura,
  onElegir,
}: {
  nombre: Ruta;
  etiqueta: string;
  opciones: EntradaCatalogo[];
  soloLectura?: boolean;
  onElegir?: (valor: string) => void;
}) {
  const {
    control,
    clearErrors,
    formState: { errors },
  } = useFormContext<ValoresReporte>();
  const error = get(errors, nombre) as { message?: string } | undefined;

  return (
    <Controller
      name={nombre}
      control={control}
      render={({ field }) => {
        const valor = (field.value as string) || null;
        const valores = opciones.map((o) => o.valor);
        if (valor && !valores.includes(valor)) valores.push(valor);
        return (
          <Box data-question-error={error ? "true" : undefined}>
            <Autocomplete
              options={valores}
              value={valor}
              readOnly={soloLectura}
              onChange={(_, v) => {
                field.onChange(v ?? "");
                onElegir?.(v ?? "");
                if (error) clearErrors(nombre);
              }}
              onBlur={field.onBlur}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={field.ref}
                  label={etiqueta}
                  size="small"
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </Box>
        );
      }}
    />
  );
}

/** El resultado con el color del formato condicional del Excel. */
export function ChipResultado({ valor, color }: { valor?: string; color?: string }) {
  if (!valor) return <Chip size="small" label="Sin resultado" variant="outlined" />;
  return (
    <Chip
      size="small"
      label={valor}
      sx={{
        bgcolor: color ?? "grey.200",
        // INTERVENCIÓN INMEDIATA va en rojo con letra blanca, como en el formato.
        color: color?.toUpperCase() === "#FF0000" ? "#fff" : "#000",
        fontWeight: 600,
      }}
    />
  );
}

const COLOR_ESTADO: Record<EstadoReporte, "default" | "warning" | "success"> = {
  borrador: "default",
  pendiente_revision: "warning",
  emitido: "success",
};

export function ChipEstado({ estado }: { estado: EstadoReporte }) {
  return <Chip size="small" label={ETIQUETA_ESTADO[estado]} color={COLOR_ESTADO[estado]} />;
}

/**
 * Una imagen del módulo. **Se ajusta sin recortar** (`contain`): recortar una
 * termografía puede cortar la escala y la temperatura máxima de la cámara.
 */
export function ImagenMonitoreo({
  archivo,
  alt,
  proporcion = "4 / 3",
}: {
  archivo: string;
  alt: string;
  proporcion?: string;
}) {
  return (
    <Box
      component="img"
      src={urlDeImagen(archivo)}
      alt={alt}
      loading="lazy"
      sx={{
        width: "100%",
        aspectRatio: proporcion,
        objectFit: "contain",
        bgcolor: "grey.100",
        borderRadius: 1,
        display: "block",
      }}
    />
  );
}
