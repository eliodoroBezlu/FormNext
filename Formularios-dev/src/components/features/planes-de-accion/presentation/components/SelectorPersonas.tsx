"use client";

import { Autocomplete, Chip, CircularProgress, TextField } from "@mui/material";
import { personasDe, textoDePersonas } from "../../domain/personas";

interface SelectorPersonasProps {
  label: string;
  /** El texto guardado: uno o varios nombres separados por coma. */
  value: string;
  onChange: (texto: string) => void;
  onBlur?: () => void;
  /** Los trabajadores que se sugieren; `null` mientras cargan. */
  opciones: string[] | null;
  error?: boolean;
  helperText?: string;
  size?: "small" | "medium";
  required?: boolean;
}

/**
 * Una o varias personas, elegidas de los trabajadores o escritas a mano
 * (Enter agrega el nombre escrito). Devuelve el texto con los nombres
 * separados por coma.
 */
export function SelectorPersonas({
  label,
  value,
  onChange,
  onBlur,
  opciones,
  error,
  helperText,
  size = "medium",
  required,
}: SelectorPersonasProps) {
  const elegidas = personasDe(value);
  const cargando = opciones === null;

  return (
    <Autocomplete
      multiple
      freeSolo
      options={opciones ?? []}
      loading={cargando}
      value={elegidas}
      filterSelectedOptions
      onChange={(_e, nuevas) => onChange(textoDePersonas(nuevas))}
      onBlur={onBlur}
      renderValue={(valores, getItemProps) =>
        valores.map((nombre, indice) => {
          const { key, ...props } = getItemProps({ index: indice });
          return <Chip key={key} label={nombre} size="small" {...props} />;
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={elegidas.length === 0 ? "Busque o escriba y presione Enter" : undefined}
          size={size}
          required={required}
          error={error}
          helperText={helperText ?? "Una o varias personas"}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {cargando && <CircularProgress size={18} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
