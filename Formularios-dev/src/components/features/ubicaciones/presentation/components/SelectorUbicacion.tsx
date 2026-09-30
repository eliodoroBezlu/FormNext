"use client";

import { Autocomplete, Box, TextField } from "@mui/material";
import {
  ordenArbol,
  type NodoUbicacion,
} from "../../domain/models/arbolUbicaciones";

interface SelectorUbicacionProps<T extends NodoUbicacion> {
  /** Opciones posibles; se muestran en orden de árbol, con sangría por nivel. */
  opciones: T[];
  /** `_id` seleccionado, o `null`. */
  valor: string | null;
  onChange: (id: string | null) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  size?: "small" | "medium";
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  onBlur?: () => void;
}

/**
 * Selector de una ubicación del árbol. Muestra la **ruta completa** en el
 * campo y busca sobre ella (sin distinguir mayúsculas ni tildes): con varios
 * niveles, un nombre suelto como «Estante A» puede repetirse en bodegas
 * distintas, y solo la ruta dice cuál es cuál.
 */
export function SelectorUbicacion<T extends NodoUbicacion>({
  opciones,
  valor,
  onChange,
  label,
  placeholder,
  required,
  size = "medium",
  error,
  helperText,
  disabled,
  onBlur,
}: SelectorUbicacionProps<T>) {
  const ordenadas = ordenArbol(opciones);
  const seleccionada = ordenadas.find((o) => o._id === valor) ?? null;

  return (
    <Autocomplete
      options={ordenadas}
      value={seleccionada}
      onChange={(_, nueva) => onChange(nueva?._id ?? null)}
      onBlur={onBlur}
      getOptionLabel={(o) => o.ruta || o.nombre}
      isOptionEqualToValue={(a, b) => a._id === b._id}
      disabled={disabled}
      size={size}
      noOptionsText="Sin ubicaciones que coincidan"
      renderOption={({ key, ...props }, o) => (
        <Box component="li" key={key} {...props} sx={{ pl: `${1 + o.nivel * 2}em !important` }}>
          <Box>
            <Box component="span" sx={{ fontWeight: o.nivel === 0 ? 600 : 400 }}>
              {o.nombre}
            </Box>
            {o.nivel > 0 && (
              <Box component="div" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                {o.ruta}
              </Box>
            )}
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
}
