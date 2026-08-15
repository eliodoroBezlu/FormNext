"use client";

import { useState } from "react";
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import {
  DeleteOutline,
  EditOutlined,
  KeyboardArrowDown,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { RiesgoIdentificado } from "../../domain/models/IProps";
import { colorEficacia } from "../../domain/matrizHelpers";
import { TransicionNivel } from "./NivelRiesgoChip";
import { TablaControles } from "./TablaControles";

interface Props {
  riesgo: RiesgoIdentificado;
  editable: boolean;
  ocupado: boolean;
  /** Columnas de la tabla, para el `colSpan` de la fila desplegada. */
  columnas: number;
  onEditar: () => void;
  onEliminar: () => void;
}

/**
 * Un riesgo: una fila con su evaluación y, al desplegarla, sus controles.
 *
 * La evaluación es **una** —peligro, riesgo, exposición, posibilidad,
 * severidad y los dos niveles— y los controles son **muchos**. Antes los
 * controles se reducían al número de la columna «Ctrl» y solo se podían ver
 * abriendo el formulario de edición, que en una matriz aprobada ni siquiera
 * está disponible.
 *
 * Arranca colapsada: una actividad puede tener 16 riesgos de hasta 18 controles
 * cada uno, y desplegarlo todo de entrada sería ilegible.
 */
export function RiesgoFila({
  riesgo,
  editable,
  ocupado,
  columnas,
  onEditar,
  onEliminar,
}: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <TableRow hover sx={{ "& > *": { borderBottom: abierto ? "unset" : undefined } }}>
        <TableCell padding="checkbox">
          <IconButton
            size="small"
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-label={
              abierto
                ? `Ocultar los controles del riesgo N°${riesgo.numero}`
                : `Ver los ${riesgo.controles.length} controles del riesgo N°${riesgo.numero}`
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

        <TableCell>{riesgo.numero}</TableCell>
        <TableCell sx={{ maxWidth: 220 }}>
          <Typography variant="body2" noWrap title={riesgo.descripcionPeligro}>
            {riesgo.descripcionPeligro || riesgo.familiaPeligro}
          </Typography>
        </TableCell>
        <TableCell sx={{ maxWidth: 260 }}>
          <Typography variant="body2" noWrap title={riesgo.descripcionRiesgo}>
            {riesgo.descripcionRiesgo || riesgo.familiaRiesgo}
          </Typography>
        </TableCell>
        <TableCell align="center">{riesgo.exposicion}</TableCell>
        <TableCell align="center">{riesgo.posibilidad}</TableCell>
        <TableCell align="center">{riesgo.probabilidad ?? "—"}</TableCell>
        <TableCell align="center">{riesgo.severidad}</TableCell>
        <TableCell align="center">{riesgo.resultado ?? "—"}</TableCell>
        <TableCell>
          <TransicionNivel
            inicial={riesgo.nivelInicial}
            actual={riesgo.nivelActual}
          />
        </TableCell>
        <TableCell align="center">{riesgo.controles.length}</TableCell>
        {editable && (
          <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
            <IconButton
              type="button"
              size="small"
              aria-label={`Editar el riesgo N°${riesgo.numero}`}
              onClick={onEditar}
            >
              <EditOutlined fontSize="small" />
            </IconButton>
            <IconButton
              type="button"
              size="small"
              disabled={ocupado}
              aria-label={`Eliminar el riesgo N°${riesgo.numero}`}
              onClick={onEliminar}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </TableCell>
        )}
      </TableRow>

      <TableRow>
        <TableCell sx={{ py: 0, border: 0 }} colSpan={columnas}>
          <Collapse in={abierto} timeout="auto" unmountOnExit>
            <Box my={2} ml={4}>
              <Typography variant="subtitle2" gutterBottom>
                Peligro
              </Typography>
              <Typography variant="body2" mb={2}>
                <strong>{riesgo.familiaPeligro}</strong>
                {riesgo.descripcionPeligro && ` — ${riesgo.descripcionPeligro}`}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Riesgo
              </Typography>
              <Typography variant="body2" mb={2}>
                <strong>{riesgo.familiaRiesgo}</strong>
                {riesgo.descripcionRiesgo && ` — ${riesgo.descripcionRiesgo}`}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Controles ({riesgo.controles.length})
              </Typography>
              {riesgo.controles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Sin controles declarados: el nivel no se reduce.
                </Typography>
              ) : (
                <TablaControles
                  controles={riesgo.controles}
                  renderEficacia={(i) => {
                    const eficacia = riesgo.controles[i].eficacia;
                    return (
                      <Chip
                        size="small"
                        label={eficacia ?? "sin evaluar"}
                        color={colorEficacia(eficacia)}
                        variant={eficacia ? "filled" : "outlined"}
                      />
                    );
                  }}
                />
              )}

              {riesgo.trazabilidad && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Trazabilidad
                  </Typography>
                  <Typography variant="body2">{riesgo.trazabilidad}</Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
