"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { AccountTree, EditNote, Refresh } from "@mui/icons-material";
import Link from "next/link";
import { usePgrConsolidacion } from "../../application/hooks/usePgrConsolidacion";
import { ConsolidacionPropuestaRow } from "./ConsolidacionPropuestaRow";

interface Props {
  pgrId: string;
}

/**
 * Consolidación de las matrices de riesgo aprobadas en el PGR.
 *
 * La matriz es por área y el PGR por superintendencia: acá se ve cómo las
 * matrices de todas las áreas se funden en un solo programa. Solo aportan los
 * riesgos SUSTANCIAL e INACEPTABLE, que son los que el procedimiento obliga a
 * programar.
 */
export function PgrConsolidacionView({ pgrId }: Props) {
  const {
    vista,
    isLoading,
    isSubmitting,
    error,
    desdoblarPorArea,
    setDesdoblarPorArea,
    hayCambios,
    consolidar,
    recargar,
    snackbar,
    closeSnackbar,
  } = usePgrConsolidacion(pgrId);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button type="button" size="small" onClick={recargar}>
            Reintentar
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!vista) return null;

  const nuevas = vista.propuestas.filter((p) => p.efecto === "nueva").length;
  const cambian = vista.propuestas.filter(
    (p) => p.efecto === "acumula" || p.efecto === "sube-nivel",
  ).length;

  return (
    <Stack gap={2.5}>
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          gap={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Consolidar desde las matrices de riesgo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {vista.pgrCodigo} · {vista.superintendencia} · gestión{" "}
              {vista.gestion}
            </Typography>
          </Box>

          <Stack direction="row" gap={1} alignItems="center">
            <Button
              type="button"
              variant="outlined"
              startIcon={<Refresh />}
              onClick={recargar}
              disabled={isSubmitting}
            >
              Actualizar
            </Button>
            <Button
              type="button"
              variant="contained"
              startIcon={<AccountTree />}
              onClick={() => void consolidar()}
              disabled={isSubmitting || !hayCambios}
            >
              {isSubmitting ? "Consolidando…" : "Consolidar"}
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack gap={1.25}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Áreas con matriz aprobada
            </Typography>
            <Stack direction="row" gap={0.5} flexWrap="wrap" mt={0.5}>
              {vista.areasConMatriz.length === 0 ? (
                <Typography variant="body2">—</Typography>
              ) : (
                vista.areasConMatriz.map((a) => (
                  <Chip
                    key={a.areaCodigo}
                    label={`${a.areaNombre} · ${a.matriz}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))
              )}
            </Stack>
          </Box>

          {vista.areasYaConsolidadas.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Áreas ya consolidadas
              </Typography>
              <Stack direction="row" gap={0.5} flexWrap="wrap" mt={0.5}>
                {vista.areasYaConsolidadas.map((a) => (
                  <Chip key={a} label={a} size="small" />
                ))}
              </Stack>
            </Box>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={desdoblarPorArea}
                onChange={(e) => setDesdoblarPorArea(e.target.checked)}
                disabled={isSubmitting}
              />
            }
            label={
              <Box>
                <Typography variant="body2">
                  Una actividad por área
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sin esto, dos áreas con el mismo verificador y la misma medida
                  comparten una sola actividad.
                </Typography>
              </Box>
            }
          />
        </Stack>
      </Paper>

      {vista.advertencias.map((a) => (
        <Alert key={a} severity="warning">
          {a}
        </Alert>
      ))}

      {vista.propuestas.length > 0 && (
        <Alert severity={hayCambios ? "info" : "success"}>
          {hayCambios
            ? `${nuevas} actividad(es) nueva(s) y ${cambian} con cambios sobre ${vista.propuestas.length} propuesta(s).`
            : "El PGR ya refleja todas las matrices aprobadas: no hay nada que consolidar."}
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Nivel</TableCell>
              <TableCell>Verificador y medida propuesta</TableCell>
              <TableCell>Áreas</TableCell>
              <TableCell align="center">Riesgos</TableCell>
              <TableCell>Efecto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vista.propuestas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    py={3}
                  >
                    Ninguna matriz aprobada de esta superintendencia aporta
                    riesgos SUSTANCIAL o INACEPTABLE.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              vista.propuestas.map((p) => (
                <ConsolidacionPropuestaRow key={p.clave} propuesta={p} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paso 3: la matriz aporta el qué —verificador y medida— pero no el
          quién ni con qué. Sin este enlace la consolidación terminaba en una
          pantalla sin salida. */}
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" gutterBottom>
          Después de consolidar
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Las actividades nacen sin responsable, recurso ni entregable: eso no
          sale de la matriz y hay que completarlo antes de aprobar el PGR. Ahí
          mismo se cargan los meses programados de cada una.
        </Typography>
        <Button
          type="button"
          variant="outlined"
          startIcon={<EditNote />}
          component={Link}
          href={`/dashboard/pgr/configuracion?id=${pgrId}`}
        >
          Completar las actividades
        </Button>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
