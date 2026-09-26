"use client";

import { useEffect, useState } from "react";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import type { Trabajador } from "@/types/trabajador";
import { prestamosAdapter } from "../../infrastructure/adapters/prestamosAdapter";

interface Props {
  value: Trabajador | null;
  onChange: (trabajador: Trabajador | null) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
}

/**
 * Elige a quién pertenece la solicitud.
 *
 * Se busca por nómina o CI porque en el turno se identifica a la gente por
 * carnet tanto como por nombre. La lista se recorta a 50 resultados: son casi
 * doscientas personas y un desplegable con todas no se lee.
 *
 * Tiene su propio selector en vez de reutilizar el de linternas a propósito:
 * un módulo no importa componentes de otro. El roster llega por el adaptador
 * de este módulo, así que la Regla de Oro se mantiene.
 */
export function SelectorSolicitante({
  value,
  onChange,
  label = "Solicitante",
  helperText,
  disabled = false,
}: Props) {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;

    prestamosAdapter
      .trabajadores()
      .then((lista) => {
        if (vigente) setTrabajadores(lista);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  return (
    <Autocomplete
      options={trabajadores}
      value={value}
      loading={cargando}
      disabled={disabled}
      getOptionLabel={(t) => t.nomina}
      isOptionEqualToValue={(a, b) => a._id === b._id}
      filterOptions={(opciones, { inputValue }) => {
        const q = inputValue.trim().toLowerCase();
        if (!q) return opciones.slice(0, 50);
        return opciones
          .filter(
            (t) =>
              t.nomina?.toLowerCase().includes(q) ||
              t.ci?.toLowerCase().includes(q),
          )
          .slice(0, 50);
      }}
      onChange={(_, valor) => onChange(valor)}
      noOptionsText="Sin coincidencias"
      renderOption={(props, t) => {
        const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & {
          key: string;
        };
        return (
          <Box component="li" key={key} {...rest}>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {t.nomina}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                CI {t.ci} · {t.area || "Sin área"}
              </Typography>
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="Nombre o CI"
          helperText={cargando ? "Cargando roster…" : helperText}
        />
      )}
    />
  );
}
