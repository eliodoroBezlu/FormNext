"use client";

import { Box, Button, CircularProgress, type ButtonProps } from "@mui/material";
import { keyframes } from "@emotion/react";
import { Check } from "@mui/icons-material";
import type { EstadoDeGuardado } from "@/hooks/useEstadoDeGuardado";

const aparecer = keyframes`
  from { transform: scale(0.6); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

export interface BotonGuardarProps extends Omit<ButtonProps, "children"> {
  estado: EstadoDeGuardado;
  /** Lo que dice en reposo: «Guardar», «Guardar corrección»… */
  etiqueta: string;
  etiquetaGuardando?: string;
  etiquetaGuardado?: string;
}

/**
 * Botón de guardar que responde: «Guardando…» con un indicador mientras espera
 * y «✓ Guardado» en verde al terminar (con `useEstadoDeGuardado`). El cambio se
 * anuncia a los lectores de pantalla y el visto no se anima con «reducir
 * movimiento».
 */
export function BotonGuardar({
  estado,
  etiqueta,
  etiquetaGuardando = "Guardando…",
  etiquetaGuardado = "Guardado",
  disabled,
  color,
  variant = "contained",
  ...props
}: BotonGuardarProps) {
  const guardado = estado === "guardado";
  return (
    <Button
      {...props}
      variant={variant}
      color={guardado ? "success" : color}
      // Mientras guarda o muestra «Guardado» no se puede volver a pulsar.
      disabled={disabled || estado !== "inactivo"}
      sx={[
        { minWidth: 140 },
        // Deshabilitado por estar guardando no debe verse gris.
        estado !== "inactivo" && {
          "&.Mui-disabled": {
            color: "primary.contrastText",
            bgcolor: guardado ? "success.main" : "primary.main",
            opacity: guardado ? 1 : 0.85,
          },
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
      startIcon={
        estado === "guardando" ? (
          <CircularProgress size={16} color="inherit" />
        ) : guardado ? (
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              animation: `${aparecer} 0.2s ease-out`,
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          >
            <Check fontSize="small" />
          </Box>
        ) : (
          props.startIcon
        )
      }
    >
      <span aria-live="polite">
        {estado === "guardando" ? etiquetaGuardando : guardado ? etiquetaGuardado : etiqueta}
      </span>
    </Button>
  );
}
