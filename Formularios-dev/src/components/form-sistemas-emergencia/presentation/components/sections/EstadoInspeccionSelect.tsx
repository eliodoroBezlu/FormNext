// src/components/form-sistemas-emergencia/presentation/components/sections/EstadoInspeccionSelect.tsx

import React from "react";
import { FormControl, Select, MenuItem, type SelectChangeEvent, FormHelperText } from "@mui/material";
import type { EstadoInspeccion } from "@/types/formTypes";

interface EstadoInspeccionSelectProps {
  value: EstadoInspeccion;
  onChange: (event: SelectChangeEvent) => void;
  disabled?: boolean;
  cantidad?: number | string;
  error?: boolean;
  helperText?: string;
}

export const EstadoInspeccionSelect = ({
  value,
  onChange,
  disabled = false,
  cantidad,
  error = false,
  helperText,
}: EstadoInspeccionSelectProps) => {
  // Si cantidad es estrictamente 0, el único valor válido es N/A.
  // Si es mayor que 0, los únicos valores válidos son ✓ y X.
  const esCero = cantidad === 0 || cantidad === "0";
  const esVacio = cantidad === "" || cantidad === undefined || cantidad === null;

  return (
    <FormControl fullWidth size="small" error={error}>
      <Select 
        value={value || ""} 
        onChange={onChange} 
        disabled={disabled} 
        displayEmpty
        error={error}
      >
        <MenuItem value="" disabled>Seleccionar</MenuItem>
        
        {/* Si es cero, solo mostramos N/A */}
        {esCero && <MenuItem value="N/A">N/A</MenuItem>}

        {/* Si es mayor que cero, mostramos ✓ y X */}
        {!esCero && !esVacio && <MenuItem value="✓">✓</MenuItem>}
        {!esCero && !esVacio && <MenuItem value="X">X</MenuItem>}

        {/* Si está vacío, permitimos todo por ahora */}
        {esVacio && <MenuItem value="✓">✓</MenuItem>}
        {esVacio && <MenuItem value="X">X</MenuItem>}
        {esVacio && <MenuItem value="N/A">N/A</MenuItem>}
      </Select>
      {error && helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default EstadoInspeccionSelect;
