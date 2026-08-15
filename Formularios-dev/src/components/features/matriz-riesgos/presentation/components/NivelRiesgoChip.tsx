"use client";

import { Box, Chip, Tooltip, Typography } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import {
  colorDeNivel,
  escalonesReducidos,
  requierePgr,
} from "../../domain/matrizHelpers";

interface NivelRiesgoChipProps {
  nivel?: string | null;
  size?: "small" | "medium";
  /** Marca visualmente los niveles que obligan a generar PGR. */
  marcarPgr?: boolean;
}

/** Chip de nivel de riesgo con el color del semáforo del formulario. */
export function NivelRiesgoChip({
  nivel,
  size = "small",
  marcarPgr = false,
}: NivelRiesgoChipProps) {
  if (!nivel) {
    return <Chip label="—" size={size} variant="outlined" />;
  }

  const chip = (
    <Chip
      label={nivel}
      size={size}
      sx={{
        bgcolor: colorDeNivel(nivel),
        color: "#fff",
        fontWeight: 600,
        letterSpacing: 0.2,
      }}
    />
  );

  return marcarPgr && requierePgr(nivel) ? (
    <Tooltip title="Este nivel obliga a generar actividades en el PGR">
      {chip}
    </Tooltip>
  ) : (
    chip
  );
}

interface TransicionNivelProps {
  inicial?: string | null;
  actual?: string | null;
  size?: "small" | "medium";
}

/**
 * El «antes → después» del riesgo.
 *
 * Es la diferencia real con el Excel, donde el nivel actual aparece como un
 * número sin explicar de dónde sale: acá se ve que los controles lo redujeron
 * y en cuánto.
 */
export function TransicionNivel({
  inicial,
  actual,
  size = "small",
}: TransicionNivelProps) {
  const escalones = escalonesReducidos(inicial, actual);

  return (
    <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
      <NivelRiesgoChip nivel={inicial} size={size} />
      <ArrowForward fontSize="small" sx={{ color: "text.disabled" }} />
      <NivelRiesgoChip nivel={actual} size={size} marcarPgr />
      {escalones > 0 && (
        <Typography variant="caption" color="success.main" fontWeight={600}>
          −{escalones} {escalones === 1 ? "nivel" : "niveles"}
        </Typography>
      )}
      {escalones === 0 && inicial && actual && (
        <Typography variant="caption" color="text.secondary">
          sin reducción
        </Typography>
      )}
    </Box>
  );
}
