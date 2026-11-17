"use client";

import { Chip, type ChipProps } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";

/** Los colores semánticos del tema que puede tener un estado. */
export type ColorDeEstado = "default" | "info" | "warning" | "success" | "error";

export interface EstadoChipProps {
  etiqueta: string;
  /** Sale de la tabla de estados del dominio (`docs/SISTEMA_DE_DISENO.md`, 1.3). */
  color: ColorDeEstado;
  size?: "small" | "medium";
  icono?: ChipProps["icon"];
  /** Texto al pasar el mouse (por ejemplo, el código de la plantilla). */
  title?: string;
}

const tonos = (theme: Theme, color: ColorDeEstado) =>
  color === "default"
    ? { main: theme.palette.secondary.main, light: theme.palette.secondary.light, dark: theme.palette.text.secondary }
    : theme.palette[color];

/**
 * El chip de un estado: fondo teñido del color del estado y el texto en su
 * tono oscuro (claro en modo oscuro), así se lee en los dos modos con buen
 * contraste. Un mismo estado se ve igual en tarjetas, tablas y reportes: el
 * color no se elige aquí, lo trae el dominio.
 */
export function EstadoChip({ etiqueta, color, size = "small", icono, title }: EstadoChipProps) {
  return (
    <Chip
      label={etiqueta}
      size={size}
      icon={icono}
      title={title}
      sx={(theme) => {
        const tono = tonos(theme, color);
        const oscuro = theme.palette.mode === "dark";
        return {
          bgcolor: alpha(tono.main, oscuro ? 0.18 : 0.12),
          color: oscuro ? tono.light : tono.dark,
          border: "1px solid",
          borderColor: alpha(tono.main, oscuro ? 0.4 : 0.3),
          fontWeight: 600,
          "& .MuiChip-icon": { color: "inherit" },
          // Un cambio de estado se ve, no salta.
          transition: "background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease",
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        };
      }}
    />
  );
}
