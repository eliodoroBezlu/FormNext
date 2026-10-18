"use client";

import { Box, Paper, Typography } from "@mui/material";
import { distribuirFotos, proporcionDeCaja } from "../../domain/distribucionFotos";
import type { ImagenReporte } from "../../domain/models/Monitoreo";
import { ImagenMonitoreo } from "./CamposReporte";

/** Separación entre fotos, en % del ancho de la hoja. */
const SEPARACION = 2;

/**
 * Cómo quedarán las fotos en el PDF. Usa **la misma función** que el backend
 * (`distribuirFotos`), en porcentajes del ancho para no tener que medir.
 */
export function VistaPreviaFotos({
  fotos,
  fotosPorFila,
}: {
  fotos: ImagenReporte[];
  fotosPorFila: number;
}) {
  if (fotos.length === 0) return null;
  const d = distribuirFotos(fotos.length, fotosPorFila, 100, SEPARACION);
  // Ancho / alto para CSS; la función da alto / ancho, igual que en el PDF.
  const proporcion = `1 / ${proporcionDeCaja(fotos)}`;

  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        Así quedarán en el reporte ({fotosPorFila} por fila como máximo)
      </Typography>
      <Box sx={{ maxWidth: 620, mx: "auto", bgcolor: "background.paper", p: 1 }}>
        {d.filas.map((fila, i) => (
          <Box
            key={i}
            sx={{ display: "flex", gap: `${SEPARACION}%`, pl: `${fila.desplazamiento}%`, mb: 1 }}
          >
            {fila.indices.map((n) => (
              <Box key={fotos[n].archivo} sx={{ width: `${d.anchoCelda}%`, flex: "none" }}>
                <ImagenMonitoreo
                  archivo={fotos[n].archivo}
                  alt={fotos[n].descripcion}
                  proporcion={proporcion}
                />
                <Typography variant="caption" display="block" textAlign="center" noWrap>
                  {fotos[n].referencia ? "Referencia · " : ""}
                  {fotos[n].descripcion || "Sin descripción"}
                </Typography>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
