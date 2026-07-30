"use client";

import {
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { IndicadoresVentana } from "../../domain/models/IProps";
import { formatPorcentaje, getColorIndicador } from "../../domain/pgrHelpers";

interface IndicadorProps {
  titulo: string;
  ayuda: string;
  valor: number | null;
  ejecutado: number;
  programado: number;
}

function Indicador({
  titulo,
  ayuda,
  valor,
  ejecutado,
  programado,
}: IndicadorProps) {
  const color = getColorIndicador(valor);

  return (
    <Box>
      <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
        <Typography variant="body2" color="text.secondary">
          {titulo}
        </Typography>
        <Tooltip title={ayuda}>
          <InfoOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
        </Tooltip>
      </Stack>

      <Typography variant="h5" fontWeight={700} sx={{ color }}>
        {formatPorcentaje(valor)}
      </Typography>

      <LinearProgress
        variant="determinate"
        value={(valor ?? 0) * 100}
        sx={{
          my: 0.75,
          height: 6,
          borderRadius: 3,
          "& .MuiLinearProgress-bar": { backgroundColor: color },
        }}
      />

      <Typography variant="caption" color="text.secondary">
        {`${ejecutado} de ${programado} programado${programado === 1 ? "" : "s"}`}
      </Typography>
    </Box>
  );
}

export interface IndicadoresPanelProps {
  titulo: string;
  indicadores?: IndicadoresVentana;
  subtitulo?: string;
}

/**
 * Los cuatro indicadores del PGR tal como los calcula la planilla oficial.
 *
 * La diferencia entre ambos no es cosmética: eficacia mide **cantidad** (se
 * hizo o no), eficiencia mide **oportunidad** (se hizo a tiempo). Lo ejecutado
 * con retraso suma a la primera pero no a la segunda, así que un plan puede
 * estar al 100 % de eficacia y muy por debajo en eficiencia.
 */
export function IndicadoresPanel({
  titulo,
  indicadores,
  subtitulo,
}: IndicadoresPanelProps) {
  if (!indicadores) return null;

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          {titulo}
        </Typography>
        {subtitulo && (
          <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
            {subtitulo}
          </Typography>
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Indicador
              titulo="Eficacia"
              ayuda="¿Se hizo la cantidad programada? Cuenta lo ejecutado a tiempo, adelantado y con retraso."
              valor={indicadores.porcentajeEficacia}
              ejecutado={indicadores.eficacia}
              programado={indicadores.programado}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Indicador
              titulo="Eficiencia"
              ayuda="¿Se hizo a tiempo? Descuenta lo ejecutado con retraso; solo cuentan «a tiempo» y «adelantado»."
              valor={indicadores.porcentajeEficiencia}
              ejecutado={indicadores.eficiencia}
              programado={indicadores.programado}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
