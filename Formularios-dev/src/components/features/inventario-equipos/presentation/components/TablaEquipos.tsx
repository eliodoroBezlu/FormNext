"use client";

import {
  Box,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
} from "@mui/material";
import {
  ContentCopy as DuplicarIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import type { Equipo } from "../../domain/models/Equipo";

interface Props {
  cargando: boolean;
  visibles: Equipo[];
  total: number;
  pagina: number;
  porPagina: number;
  onPagina: (p: number) => void;
  onPorPagina: (n: number) => void;
  onVerEspecificaciones: (e: Equipo) => void;
  onEditar: (e: Equipo) => void;
  onDuplicar: (e: Equipo) => void;
  onEliminar: (e: Equipo) => void;
}

const COLUMNAS = 11;

export function TablaEquipos({
  cargando,
  visibles,
  total,
  pagina,
  porPagina,
  onPagina,
  onPorPagina,
  onVerEspecificaciones,
  onEditar,
  onDuplicar,
  onEliminar,
}: Props) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "background.default" } }}>
            <TableCell>Código</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Marca / Modelo</TableCell>
            <TableCell>Área</TableCell>
            <TableCell>Ubicación</TableCell>
            <TableCell>Responsable</TableCell>
            <TableCell align="center">Cant.</TableCell>
            <TableCell align="center">Estado</TableCell>
            <TableCell align="center">Datos técnicos</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cargando ? (
            Array.from({ length: 5 }, (_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={COLUMNAS}>
                  <Skeleton height={28} />
                </TableCell>
              </TableRow>
            ))
          ) : visibles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMNAS} align="center" sx={{ py: 3 }}>
                No hay equipos con estos filtros. Cambie los filtros o agregue uno con «Agregar equipo».
              </TableCell>
            </TableRow>
          ) : (
            visibles.map((e) => (
              <TableRow key={e._id} hover>
                <TableCell>
                  <Chip label={e.codigo} size="small" color="primary" variant="outlined" sx={{ fontFamily: "monospace" }} />
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{e.descripcion}</TableCell>
                <TableCell>{e.tipo_equipo}</TableCell>
                <TableCell>
                  {e.marca || "—"} / {e.modelo || "—"}
                </TableCell>
                <TableCell>
                  {e.area_id?.nombre ?? e.superintendencia_id?.nombre ?? e.gerencia_id?.nombre ?? "—"}
                </TableCell>
                <TableCell>{e.ubicacion_id?.ruta || e.ubicacion_id?.nombre || "—"}</TableCell>
                <TableCell>{e.responsable || "—"}</TableCell>
                <TableCell align="center">{e.cantidad}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={e.estado || "Operativo"}
                    color={!e.estado || e.estado === "Operativo" ? "success" : e.estado === "Mantenimiento" ? "warning" : "error"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  {Object.keys(e.especificaciones ?? {}).length > 0 ? (
                    <Tooltip title="Ver datos técnicos">
                      <IconButton color="info" size="small" onClick={() => onVerEspecificaciones(e)}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="Editar">
                    <IconButton color="primary" size="small" onClick={() => onEditar(e)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Agregar otro igual">
                    <IconButton color="primary" size="small" onClick={() => onDuplicar(e)}>
                      <DuplicarIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Box component="span" sx={{ display: "inline-block", width: 8 }} />
                  <Tooltip title="Eliminar">
                    <IconButton color="error" size="small" onClick={() => onEliminar(e)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={total}
        rowsPerPage={porPagina}
        page={pagina}
        onPageChange={(_, p) => onPagina(p)}
        onRowsPerPageChange={(ev) => onPorPagina(parseInt(ev.target.value, 10))}
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      />
    </TableContainer>
  );
}
