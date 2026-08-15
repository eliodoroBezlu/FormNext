"use client";

import { useState } from "react";
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ErrorOutline,
  KeyboardArrowDown,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { RiesgoAnalizado } from "../../domain/models/IProps";
import { NivelRiesgoChip, TransicionNivel } from "./NivelRiesgoChip";
import { TablaControles } from "./TablaControles";

/**
 * Muestra un valor derivado comparando lo que trae el Excel con lo que
 * calculó el sistema. Cuando coinciden se ve un solo número —que es lo
 * normal—; cuando no, se resalta el conflicto en rojo.
 */
function ValorComparado({
  excel,
  calculado,
}: {
  excel: string | number | null;
  calculado: string | number | null;
}) {
  const iguales = String(excel ?? "") === String(calculado ?? "");

  if (iguales) {
    return <Typography variant="body2">{calculado ?? "—"}</Typography>;
  }

  return (
    <Tooltip title="El archivo y el sistema no coinciden">
      <Box display="flex" alignItems="center" gap={0.5}>
        <Typography
          variant="body2"
          sx={{ textDecoration: "line-through", color: "text.disabled" }}
        >
          {excel ?? "—"}
        </Typography>
        <Typography variant="body2" color="error" fontWeight={700}>
          {calculado ?? "—"}
        </Typography>
      </Box>
    </Tooltip>
  );
}

function FilaRiesgo({ riesgo }: { riesgo: RiesgoAnalizado }) {
  const [abierto, setAbierto] = useState(false);
  const conProblemas =
    riesgo.discrepancias.length > 0 || riesgo.advertencias.length > 0;

  return (
    <>
      <TableRow
        hover
        sx={{
          "& > *": { borderBottom: "unset" },
          bgcolor: riesgo.discrepancias.length ? "error.light" : undefined,
        }}
      >
        <TableCell padding="none">
          <IconButton size="small" onClick={() => setAbierto(!abierto)}>
            {abierto ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={600}>
            {riesgo.numero}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            fila {riesgo.fila}
          </Typography>
        </TableCell>
        <TableCell sx={{ maxWidth: 260 }}>
          <Typography variant="body2" noWrap title={riesgo.descripcionRiesgo}>
            {riesgo.descripcionRiesgo || riesgo.familiaRiesgo || "—"}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {riesgo.categoria} · {riesgo.actividadTarea}
          </Typography>
        </TableCell>
        <TableCell align="center">{riesgo.exposicion}</TableCell>
        <TableCell align="center">{riesgo.posibilidad}</TableCell>
        <TableCell align="center">
          <ValorComparado
            excel={riesgo.probabilidadExcel}
            calculado={riesgo.probabilidad}
          />
        </TableCell>
        <TableCell align="center">{riesgo.severidad}</TableCell>
        <TableCell align="center">
          <ValorComparado
            excel={riesgo.resultadoExcel}
            calculado={riesgo.resultado}
          />
        </TableCell>
        <TableCell>
          <TransicionNivel
            inicial={riesgo.nivelInicial}
            actual={riesgo.nivelActual}
          />
        </TableCell>
        <TableCell align="center">{riesgo.controles.length}</TableCell>
        <TableCell align="center">
          {conProblemas && (
            <Tooltip
              title={[...riesgo.discrepancias.map((d) => d.campo), ...riesgo.advertencias].join(
                " · ",
              )}
            >
              <ErrorOutline
                fontSize="small"
                color={riesgo.discrepancias.length ? "error" : "warning"}
              />
            </Tooltip>
          )}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell sx={{ py: 0, border: 0 }} colSpan={11}>
          <Collapse in={abierto} timeout="auto" unmountOnExit>
            <Box my={2} ml={4}>
              <Typography variant="subtitle2" gutterBottom>
                Peligro
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>{riesgo.familiaPeligro}</strong> —{" "}
                {riesgo.descripcionPeligro}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Controles ({riesgo.controles.length})
              </Typography>
              <TablaControles
                controles={riesgo.controles}
                renderEficacia={(i) => (
                  <ValorComparado
                    excel={riesgo.controles[i].eficaciaExcel}
                    calculado={riesgo.controles[i].eficacia}
                  />
                )}
              />

              {riesgo.advertencias.length > 0 && (
                <Box mt={1.5}>
                  {riesgo.advertencias.map((a, i) => (
                    <Chip
                      key={i}
                      size="small"
                      color="warning"
                      variant="outlined"
                      label={a}
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

interface TablaRiesgosAnalizadosProps {
  riesgos: RiesgoAnalizado[];
  /** Muestra solo los riesgos con discrepancias. */
  soloConDiscrepancias?: boolean;
}

export function TablaRiesgosAnalizados({
  riesgos,
  soloConDiscrepancias = false,
}: TablaRiesgosAnalizadosProps) {
  const visibles = soloConDiscrepancias
    ? riesgos.filter((r) => r.discrepancias.length > 0)
    : riesgos;

  if (visibles.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 3 }} align="center">
        {soloConDiscrepancias
          ? "No hay discrepancias: el sistema reprodujo todos los valores del archivo."
          : "El archivo no contiene riesgos."}
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="none" />
            <TableCell>N°</TableCell>
            <TableCell>Riesgo</TableCell>
            <Tooltip title="Exposición">
              <TableCell align="center">Exp</TableCell>
            </Tooltip>
            <Tooltip title="Posibilidad">
              <TableCell align="center">Pos</TableCell>
            </Tooltip>
            <Tooltip title="Probabilidad — derivada de exposición y posibilidad">
              <TableCell align="center">Prob</TableCell>
            </Tooltip>
            <Tooltip title="Severidad">
              <TableCell align="center">Sev</TableCell>
            </Tooltip>
            <Tooltip title="Resultado — probabilidad × severidad">
              <TableCell align="center">Result</TableCell>
            </Tooltip>
            <TableCell>Nivel inicial → actual</TableCell>
            <TableCell align="center">Ctrl</TableCell>
            <TableCell align="center" />
          </TableRow>
        </TableHead>
        <TableBody>
          {visibles.map((r) => (
            <FilaRiesgo key={`${r.fila}-${r.numero}`} riesgo={r} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export { NivelRiesgoChip };
