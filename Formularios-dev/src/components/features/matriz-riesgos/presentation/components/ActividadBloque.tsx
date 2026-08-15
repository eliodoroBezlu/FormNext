"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  Add,
  DeleteOutline,
  EditOutlined,
  KeyboardArrowDown,
  KeyboardArrowRight,
} from "@mui/icons-material";
import {
  ActividadRiesgo,
  RiesgoIdentificado,
} from "../../domain/models/IProps";
import { RiesgoFila } from "./RiesgoFila";

/**
 * Columnas fijas de la tabla de riesgos (toggle incluido, «Acciones» no).
 * Se usa para el `colSpan` de la fila que despliega los controles: dejarlo
 * hardcodeado rompe la grilla en silencio al agregar o quitar una columna.
 */
const COLUMNAS_BASE = 11;

interface Props {
  actividad: ActividadRiesgo;
  editable: boolean;
  ocupado: boolean;
  onAgregarRiesgo: () => void;
  onEditarRiesgo: (riesgo: RiesgoIdentificado) => void;
  onEliminarRiesgo: (numero: number) => void;
  onEditarActividad: () => void;
  onEliminarActividad: () => void;
}

/**
 * Una actividad con sus riesgos.
 *
 * El encabezado —área, tarea, condición y categoría— se muestra **una vez**,
 * arriba. Antes se repetía en cada fila y hacía leer la tabla como si la
 * actividad tuviera decenas de controles, cuando los controles cuelgan de cada
 * riesgo por separado.
 */
export function ActividadBloque({
  actividad,
  editable,
  ocupado,
  onAgregarRiesgo,
  onEditarRiesgo,
  onEliminarRiesgo,
  onEditarActividad,
  onEliminarActividad,
}: Props) {
  const [abierto, setAbierto] = useState(true);

  return (
    <Paper variant="outlined" sx={{ mb: 2 }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          bgcolor: "action.hover",
        }}
      >
        <IconButton
          size="small"
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-label={
            abierto
              ? `Ocultar los riesgos de ${actividad.actividadTarea}`
              : `Ver los riesgos de ${actividad.actividadTarea}`
          }
          aria-expanded={abierto}
        >
          {abierto ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
        </IconButton>

        <Box flexGrow={1} minWidth={0}>
          <Typography variant="subtitle2" fontWeight={700}>
            {actividad.numero}. {actividad.actividadTarea}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {actividad.areaProcesoAlcance} · {actividad.condicion} ·{" "}
            {actividad.categoria}
          </Typography>
          {/* Solo la cantidad de riesgos. Acá NO va un nivel de riesgo ni el
              total de controles: el nivel es propiedad de cada riesgo —estos 16
              van de BAJA a INACEPTABLE— y los controles cuelgan de cada uno por
              separado. Resumirlos en la actividad le atribuye algo que en la
              metodología no le corresponde. */}
          <Box mt={1}>
            <Chip
              size="small"
              variant="outlined"
              label={`${actividad.riesgos.length} riesgo(s)`}
            />
          </Box>
        </Box>

        {editable && (
          <Stack direction="row" gap={0.5}>
            <Button
              type="button"
              size="small"
              startIcon={<Add />}
              onClick={onAgregarRiesgo}
            >
              Riesgo
            </Button>
            <IconButton
              type="button"
              size="small"
              onClick={onEditarActividad}
              aria-label={`Editar la actividad ${actividad.actividadTarea}`}
            >
              <EditOutlined fontSize="small" />
            </IconButton>
            <IconButton
              type="button"
              size="small"
              disabled={ocupado}
              onClick={onEliminarActividad}
              aria-label={`Eliminar la actividad ${actividad.actividadTarea}`}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Stack>
        )}
      </Box>

      <Collapse in={abierto} timeout="auto" unmountOnExit>
        {actividad.riesgos.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            py={3}
          >
            Esta actividad todavía no tiene riesgos.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>N°</TableCell>
                  <TableCell>Peligro</TableCell>
                  <TableCell>Riesgo</TableCell>
                  <TableCell align="center">Exp</TableCell>
                  <TableCell align="center">Pos</TableCell>
                  <TableCell align="center">Prob</TableCell>
                  <TableCell align="center">Sev</TableCell>
                  <TableCell align="center">Result</TableCell>
                  <TableCell>Nivel inicial → actual</TableCell>
                  <TableCell align="center">Ctrl</TableCell>
                  {editable && <TableCell align="right">Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {actividad.riesgos.map((r) => (
                  <RiesgoFila
                    key={r.numero}
                    riesgo={r}
                    editable={editable}
                    ocupado={ocupado}
                    columnas={COLUMNAS_BASE + (editable ? 1 : 0)}
                    onEditar={() => onEditarRiesgo(r)}
                    onEliminar={() => onEliminarRiesgo(r.numero)}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Collapse>
    </Paper>
  );
}
