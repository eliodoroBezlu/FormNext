"use client";

import React from "react";
import { Box, CircularProgress, LinearProgress, useMediaQuery } from "@mui/material";
import type { ClaveAnimacion } from "../../domain/models/Bienvenida";

interface AnimacionCargaProps {
  clave: ClaveAnimacion;
  /** Solo lo usa la animación «logo». */
  logoUrl?: string;
}

/**
 * Dibuja la animación elegida del catálogo.
 *
 * Todo con CSS y MUI: **cero dependencias nuevas**. Una librería de animación
 * añadiría peso a la primera pantalla que carga el sistema, que es justo donde
 * menos conviene.
 *
 * Respeta `prefers-reduced-motion`. No es un adorno de accesibilidad: hay
 * personas a las que el movimiento en pantalla les provoca mareo real, y esta
 * pantalla aparece sin que nadie la pida.
 */
export function AnimacionCarga({ clave, logoUrl }: AnimacionCargaProps) {
  const menosMovimiento = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Con el sistema pidiendo menos movimiento se cae a un indicador quieto, no
  // a "nada": sin ninguna señal, una espera larga parece un cuelgue.
  if (menosMovimiento || clave === "ninguna") {
    return clave === "ninguna" ? null : (
      <CircularProgress variant="determinate" value={70} size={44} />
    );
  }

  if (clave === "barra") {
    return (
      <Box sx={{ width: 220 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (clave === "puntos") {
    return (
      <Box sx={{ display: "flex", gap: 1.2 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: "primary.main",
              animation: "latido 1.2s ease-in-out infinite",
              // El desfase es lo que convierte tres puntos parpadeando en una
              // onda que se lee como progreso.
              animationDelay: `${i * 0.16}s`,
              "@keyframes latido": {
                "0%, 80%, 100%": { opacity: 0.25, transform: "scale(0.8)" },
                "40%": { opacity: 1, transform: "scale(1.15)" },
              },
            }}
          />
        ))}
      </Box>
    );
  }

  if (clave === "logo" && logoUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element -- host remoto configurable; `next/image` exigiría declararlo en next.config */
      <img
        src={logoUrl}
        alt=""
        style={{ maxWidth: 160, maxHeight: 80, objectFit: "contain" }}
        // El logo es decorativo aquí (el mensaje ya dice de qué sistema es),
        // por eso `alt` vacío: que el lector de pantalla no lo repita.
      />
    );
  }

  if (clave === "casco") {
    return (
      <Box
        component="svg"
        viewBox="0 0 64 44"
        aria-hidden="true"
        sx={{
          width: 76,
          height: 52,
          fill: "none",
          stroke: "currentColor",
          color: "primary.main",
          strokeWidth: 3,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "& path": {
            strokeDasharray: 180,
            animation: "trazo 2s ease-in-out infinite",
          },
          "@keyframes trazo": {
            "0%": { strokeDashoffset: 180 },
            "55%, 100%": { strokeDashoffset: 0 },
          },
        }}
      >
        <path d="M8 34c0-13 10-24 24-24s24 11 24 24" />
        <path d="M4 34h56" />
        <path d="M32 10V4" />
      </Box>
    );
  }

  return <CircularProgress size={44} />;
}
