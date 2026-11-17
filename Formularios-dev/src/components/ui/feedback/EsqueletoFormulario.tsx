"use client";

import { Box, Paper, Skeleton, useMediaQuery } from "@mui/material";

interface EsqueletoFormularioProps {
  /** Cuántas secciones de preguntas dibujar. */
  secciones?: number;
  /** Lo que anuncia el lector de pantalla mientras carga. */
  etiqueta?: string;
}

/**
 * La forma de un formulario de inspección mientras llega su plantilla:
 * cabecera, datos generales y secciones de preguntas. En vez de un círculo
 * girando, se ve qué viene. Sin ondas con «reducir movimiento».
 */
export function EsqueletoFormulario({ secciones = 3, etiqueta = "Cargando el formulario" }: EsqueletoFormularioProps) {
  const animacion = useMediaQuery("(prefers-reduced-motion: reduce)") ? false : "wave";

  return (
    <Box role="status" aria-label={etiqueta} sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, sm: 3 } }}>
      {/* Cabecera: título y código */}
      <Skeleton animation={animacion} width="55%" height={40} />
      <Skeleton animation={animacion} width="20%" height={22} sx={{ mb: 3 }} />

      {/* Datos generales: una grilla de campos */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Skeleton animation={animacion} width={180} height={26} sx={{ mb: 2 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} animation={animacion} variant="rounded" height={52} />
          ))}
        </Box>
      </Paper>

      {/* Secciones con sus preguntas */}
      {Array.from({ length: secciones }, (_, s) => (
        <Paper key={s} sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
          <Skeleton animation={animacion} width="40%" height={28} sx={{ mb: 1.5 }} />
          {Array.from({ length: 3 }, (_, q) => (
            <Box key={q} sx={{ display: "flex", gap: 2, alignItems: "center", py: 1 }}>
              <Skeleton animation={animacion} width={28} height={22} />
              <Skeleton animation={animacion} sx={{ flex: 1 }} height={22} />
              <Skeleton animation={animacion} variant="rounded" width={120} height={40} />
            </Box>
          ))}
        </Paper>
      ))}
    </Box>
  );
}
