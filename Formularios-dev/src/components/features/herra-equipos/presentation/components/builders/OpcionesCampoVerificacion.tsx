"use client";

import React, { useState } from "react";
import {
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";

interface OpcionesCampoVerificacionProps {
  opciones: string[];
  permiteOtro: boolean;
  onChange: (opciones: string[]) => void;
  onPermiteOtroChange: (permiteOtro: boolean) => void;
  disabled?: boolean;
}

/**
 * Editor de la lista de valores de un campo de verificación de tipo
 * «Selección».
 *
 * El tipo existía en el builder pero no había dónde escribir los valores, así
 * que un campo «Selección» terminaba renderizándose como una caja de texto
 * cualquiera. Aquí se cargan, y con `permiteOtro` se decide si el inspector
 * puede escribir algo que no esté en la lista.
 */
export function OpcionesCampoVerificacion({
  opciones,
  permiteOtro,
  onChange,
  onPermiteOtroChange,
  disabled = false,
}: OpcionesCampoVerificacionProps) {
  const [borrador, setBorrador] = useState("");

  const agregar = () => {
    const valor = borrador.trim();
    if (!valor) return;
    // Comparación laxa para no crear «Camioneta» y «camioneta» como dos
    // opciones distintas, que en el reporte se leen como lo mismo.
    const yaEsta = opciones.some(
      (o) => o.trim().toLocaleLowerCase() === valor.toLocaleLowerCase(),
    );
    if (yaEsta) {
      setBorrador("");
      return;
    }
    onChange([...opciones, valor]);
    setBorrador("");
  };

  const quitar = (indice: number) =>
    onChange(opciones.filter((_, i) => i !== indice));

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        bgcolor: "action.hover",
        width: "100%",
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        Opciones de la selección
      </Typography>

      {opciones.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
          {opciones.map((opcion, i) => (
            <Chip
              key={`${opcion}-${i}`}
              label={opcion}
              size="small"
              onDelete={disabled ? undefined : () => quitar(i)}
            />
          ))}
        </Stack>
      )}

      {!disabled && (
        <Stack direction="row" gap={1} alignItems="center" sx={{ mt: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Escriba una opción y pulse Enter"
            value={borrador}
            onChange={(e) => setBorrador(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              // Sin esto el Enter envía el formulario del builder entero.
              e.preventDefault();
              agregar();
            }}
          />
          <Tooltip title="Agregar opción">
            <span>
              <IconButton
                type="button"
                size="small"
                color="primary"
                onClick={agregar}
                disabled={!borrador.trim()}
              >
                <Add />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      )}

      <FormControlLabel
        sx={{ mt: 0.5 }}
        control={
          <Checkbox
            size="small"
            checked={permiteOtro}
            onChange={(e) => onPermiteOtroChange(e.target.checked)}
            disabled={disabled}
          />
        }
        label={
          <Typography variant="caption">
            Permitir escribir otro valor fuera de la lista
          </Typography>
        }
      />

      {opciones.length === 0 && (
        <Typography variant="caption" color="warning.main" display="block">
          Sin opciones, el campo se comporta como texto libre.
        </Typography>
      )}
    </Box>
  );
}
