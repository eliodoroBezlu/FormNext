"use client";

import { useState } from "react";
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { NivelRiesgoChip } from "@/components/features/matriz-riesgos/presentation/components/NivelRiesgoChip";
import {
  ActividadPropuesta,
  EfectoConsolidacion,
} from "../../domain/models/IProps";

/** Cómo se anuncia cada efecto. El texto importa: es lo que decide el usuario. */
const EFECTO: Record<
  EfectoConsolidacion,
  { label: string; color: "success" | "info" | "warning" | "default" }
> = {
  nueva: { label: "Nueva", color: "success" },
  acumula: { label: "Suma riesgos", color: "info" },
  "sube-nivel": { label: "Sube de nivel", color: "warning" },
  "sin-cambios": { label: "Sin cambios", color: "default" },
};

interface Props {
  propuesta: ActividadPropuesta;
}

/**
 * Una actividad propuesta, con los riesgos que la originan desplegables.
 *
 * Ese detalle es el que justifica la actividad ante una auditoría: sin él la
 * pantalla sería una lista de tareas sin decir de qué riesgo salió cada una.
 */
export function ConsolidacionPropuestaRow({ propuesta }: Props) {
  const [abierto, setAbierto] = useState(false);
  const efecto = EFECTO[propuesta.efecto];

  return (
    <>
      <TableRow
        hover
        sx={{
          "& > *": { borderBottom: abierto ? "unset" : undefined },
          opacity: propuesta.efecto === "sin-cambios" ? 0.65 : 1,
        }}
      >
        <TableCell padding="checkbox">
          <IconButton
            size="small"
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-label={
              abierto ? "Ocultar riesgos cubiertos" : "Ver riesgos cubiertos"
            }
            aria-expanded={abierto}
          >
            {abierto ? (
              <KeyboardArrowDown fontSize="small" />
            ) : (
              <KeyboardArrowRight fontSize="small" />
            )}
          </IconButton>
        </TableCell>

        <TableCell>
          <NivelRiesgoChip nivel={propuesta.nivelRiesgoMaximo} />
        </TableCell>

        <TableCell sx={{ maxWidth: 320 }}>
          <Typography variant="body2" fontWeight={600}>
            {propuesta.verificador}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {propuesta.descripcion}
          </Typography>
        </TableCell>

        <TableCell>
          <Stack direction="row" gap={0.5} flexWrap="wrap">
            {propuesta.areas.map((area) => (
              <Chip key={area} label={area} size="small" variant="outlined" />
            ))}
          </Stack>
        </TableCell>

        <TableCell align="center">
          <Typography variant="body2">
            {propuesta.riesgosCubiertos.length}
          </Typography>
        </TableCell>

        <TableCell>
          <Chip label={efecto.label} size="small" color={efecto.color} />
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell sx={{ py: 0 }} colSpan={6}>
          <Collapse in={abierto} timeout="auto" unmountOnExit>
            <Box sx={{ py: 1.5, pl: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                Riesgos que cubre esta actividad
              </Typography>
              <Stack gap={0.75} mt={1}>
                {propuesta.riesgosCubiertos.map((r) => (
                  <Box
                    key={`${r.matrizCodigo}-${r.riesgoNumero}`}
                    display="flex"
                    alignItems="flex-start"
                    gap={1}
                  >
                    <NivelRiesgoChip nivel={r.nivelActual} />
                    <Box>
                      <Typography variant="body2">
                        #{r.riesgoNumero} {r.descripcionRiesgo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {r.areaNombre} · {r.matrizCodigo} v{r.matrizVersion}
                        {r.categoria ? ` · ${r.categoria}` : ""}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
