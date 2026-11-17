"use client";

import { Box, Divider } from "@mui/material";
import type { ReactNode } from "react";

interface StickyBarProps {
  children: ReactNode;
  /**
   * Clase semántica del contenedor. Los formularios de inspección pasan
   * `save-submit-buttons`: la página de detalle la usa para dejar pulsables
   * estos botones cuando bloquea el resto (patrón 5 de `CLAUDE.md`).
   */
  className?: string;
}

/**
 * Barra de acciones fija al pie de un formulario: queda a la vista mientras
 * se recorre el formulario, separada del contenido por una línea y una sombra
 * suave hacia arriba.
 */
export function StickyBar({ children, className }: StickyBarProps) {
  return (
    <Box
      className={className}
      sx={{
        position: "sticky",
        bottom: 0,
        zIndex: 10,
        bgcolor: "background.paper",
      }}
    >
      <Divider />
      <Box sx={{ py: 2, boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}>{children}</Box>
    </Box>
  );
}
