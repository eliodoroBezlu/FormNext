"use client";

import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import { ProgramacionMes } from "../../domain/models/IProps";
import { CATEGORIAS_EJECUCION, MESES_PGR } from "../../domain/pgrHelpers";

export interface ProgramacionResumenProps {
  programacion?: ProgramacionMes[];
  /** Meses posteriores al corte se atenúan. */
  mesCorte?: number;
  /** Muestra también lo ejecutado, no solo lo programado. */
  mostrarEjecucion?: boolean;
  /** Fallback para planes viejos que solo tienen `mesesProgramados`. */
  mesesProgramadosLegacy?: string[];
}

/**
 * Vista compacta de la programación anual de una actividad.
 *
 * Cada mes con cantidad programada se muestra como un chip. Si
 * `mostrarEjecucion` está activo, el borde del chip toma el color de la
 * categoría de oportunidad predominante — los mismos colores de la planilla
 * en Excel (rojo = con retraso, gris = a tiempo, verde = adelantado).
 */
export function ProgramacionResumen({
  programacion,
  mesCorte,
  mostrarEjecucion = false,
  mesesProgramadosLegacy,
}: ProgramacionResumenProps) {
  const conCantidad = (programacion ?? []).filter((p) => p.programado > 0);

  // Plan anterior a la matriz: no hay cantidades, solo los nombres de mes.
  if (conCantidad.length === 0) {
    const legacy = mesesProgramadosLegacy ?? [];
    return legacy.length > 0 ? (
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
        {legacy.map((m) => (
          <Chip key={m} label={m} size="small" variant="outlined" />
        ))}
      </Stack>
    ) : (
      <Typography variant="body2" color="text.secondary">
        Sin programación
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {conCantidad.map((p) => {
        const nombre = MESES_PGR[p.mes - 1] ?? `M${p.mes}`;
        const ejecutado =
          (p.realMesPasado ?? 0) +
          (p.realDelMes ?? 0) +
          (p.realMesAdelantado ?? 0);

        // La categoría con más unidades define el color del borde.
        const categoria = mostrarEjecucion
          ? CATEGORIAS_EJECUCION.reduce((mejor, c) =>
              (p[c.key] ?? 0) > (p[mejor.key] ?? 0) ? c : mejor,
            )
          : null;

        const usaColor = Boolean(categoria && ejecutado > 0);

        return (
          <Tooltip
            key={p.mes}
            title={
              mostrarEjecucion
                ? `${nombre}: ${ejecutado}/${p.programado} ejecutado` +
                  (usaColor ? ` — ${categoria!.label}` : "")
                : `${nombre}: ${p.programado} programado`
            }
          >
            <Chip
              size="small"
              variant="outlined"
              label={
                mostrarEjecucion
                  ? `${nombre} ${ejecutado}/${p.programado}`
                  : `${nombre} ${p.programado}`
              }
              sx={{
                opacity:
                  mesCorte !== undefined && p.mes > mesCorte ? 0.45 : 1,
                borderColor: usaColor ? categoria!.color : undefined,
                borderWidth: usaColor ? 2 : 1,
                backgroundColor: usaColor ? categoria!.fondo : undefined,
              }}
            />
          </Tooltip>
        );
      })}
    </Stack>
  );
}

/** Leyenda de las 3 categorías, para acompañar a la vista de seguimiento. */
export function LeyendaCategorias() {
  return (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
      {CATEGORIAS_EJECUCION.map((c) => (
        <Tooltip key={c.key} title={c.ayuda}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: 0.5,
                border: `2px solid ${c.color}`,
                backgroundColor: c.fondo,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {c.label}
            </Typography>
          </Stack>
        </Tooltip>
      ))}
    </Stack>
  );
}
