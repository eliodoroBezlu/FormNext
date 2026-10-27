"use client";

import { Autocomplete, Chip, CircularProgress, TextField } from "@mui/material";
import type { ResponsableCierreOption } from "../../infrastructure/adapters/trabajadoresAdapter";

interface SelectorResponsablesCierreProps {
  /** `null`: todavía no llegaron. */
  supervisores: ResponsableCierreOption[] | null;
  /** Los usuarios elegidos, en orden (el primero es el principal). */
  usuarios: string[];
  /** Lo que la tarea tiene en texto, para avisar si no está en la lista. */
  nombreGuardado?: string;
  onChange: (seleccion: ResponsableCierreOption[]) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: boolean;
  /** Reemplaza la ayuda de siempre (por ejemplo, un error o por qué está bloqueado). */
  helperText?: string;
  size?: "small" | "medium";
  required?: boolean;
}

/**
 * Uno o más responsables de área para el cierre: supervisores y
 * superintendentes con acceso al sistema, agrupados por rol. Cada uno ve la
 * tarea en su lista de planes.
 */
const GRUPO: Record<ResponsableCierreOption["rol"], string> = {
  supervisor: "Supervisores",
  superintendente: "Superintendentes",
};

/** En qué orden van los grupos. */
const ORDEN: Record<ResponsableCierreOption["rol"], number> = {
  supervisor: 0,
  superintendente: 1,
};

export function SelectorResponsablesCierre({
  supervisores,
  usuarios,
  nombreGuardado,
  onChange,
  onBlur,
  disabled,
  error,
  helperText,
  size = "medium",
  required,
}: SelectorResponsablesCierreProps) {
  // Agrupar exige que cada grupo venga junto.
  const lista = [...(supervisores ?? [])].sort(
    (a, b) =>
      ORDEN[a.rol] - ORDEN[b.rol] || a.nomina.localeCompare(b.nomina, "es"),
  );
  const cargando = supervisores === null;
  const elegidos = usuarios
    .map((u) => lista.find((s) => s.username === u))
    .filter((s): s is ResponsableCierreOption => !!s);
  // Uno cargado antes del selector (texto libre) no está en la lista: se
  // avisa en vez de mostrarlo vacío.
  const fueraDeLista = !cargando && elegidos.length === 0 && !!nombreGuardado;

  return (
    <Autocomplete
      multiple
      options={lista}
      groupBy={(s) => GRUPO[s.rol]}
      loading={cargando}
      value={elegidos}
      getOptionLabel={(s) => `${s.nomina} - ${s.puesto}`}
      isOptionEqualToValue={(a, b) => a.username === b.username}
      onChange={(_e, nuevos) => onChange(nuevos)}
      onBlur={onBlur}
      disabled={disabled}
      filterSelectedOptions
      renderValue={(valores, getItemProps) =>
        valores.map((s, indice) => {
          const { key, ...props } = getItemProps({ index: indice });
          return <Chip key={key} label={s.nomina} size="small" {...props} />;
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Responsables de Área para Cierre"
          placeholder={elegidos.length === 0 ? "Seleccione uno o más responsables" : undefined}
          size={size}
          required={required}
          error={error}
          helperText={
            helperText ??
            (fueraDeLista
              ? `Ahora: «${nombreGuardado}», que no está entre los supervisores ni superintendentes con acceso. Elige al menos uno para que vea la tarea.`
              : "Supervisores o superintendentes con acceso al sistema")
          }
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
