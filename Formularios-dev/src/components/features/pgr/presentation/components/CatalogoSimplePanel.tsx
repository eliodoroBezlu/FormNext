"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

/** Fila que este panel sabe editar: un nombre y, opcionalmente, un código. */
export interface ItemCatalogo {
  _id: string;
  codigo?: string;
  nombre: string;
  activo: boolean;
}

export interface CatalogoSimplePanelProps {
  titulo: string;
  descripcion: string;
  items: ItemCatalogo[];
  /** Si es `true` se pide y muestra un código corto además del nombre. */
  conCodigo?: boolean;
  guardando: boolean;
  onGuardar: (datos: { codigo: string; nombre: string }, id?: string) => void;
  onAlternar: (item: ItemCatalogo) => void;
}

/**
 * Lista editable de un catálogo de un solo dato.
 *
 * Sirve igual para las unidades de recurso (código + nombre) y los entregables
 * sugeridos (solo nombre): son la misma pantalla con una columna de diferencia.
 *
 * Nada se borra, se **desactiva**: un entregable retirado puede seguir
 * referenciado por actividades ya cargadas, y perderlo dejaría el dato viejo
 * sin explicación.
 */
export function CatalogoSimplePanel({
  titulo,
  descripcion,
  items,
  conCodigo = false,
  guardando,
  onGuardar,
  onAlternar,
}: CatalogoSimplePanelProps) {
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");

  const nuevo = editandoId === "nuevo";
  const puedeGuardar =
    nombre.trim().length > 0 && (!conCodigo || codigo.trim().length > 0);

  const abrirNuevo = () => {
    setEditandoId("nuevo");
    setCodigo("");
    setNombre("");
  };

  const abrirEdicion = (item: ItemCatalogo) => {
    setEditandoId(item._id);
    setCodigo(item.codigo ?? "");
    setNombre(item.nombre);
  };

  const cancelar = () => setEditandoId(null);

  const confirmar = () => {
    if (!puedeGuardar) return;
    onGuardar(
      { codigo: codigo.trim(), nombre: nombre.trim() },
      nuevo ? undefined : (editandoId ?? undefined),
    );
    setEditandoId(null);
  };

  const editor = (
    <Stack direction="row" gap={1} alignItems="center">
      {conCodigo && (
        <TextField
          label="Código"
          size="small"
          sx={{ width: 120 }}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
      )}
      <TextField
        label="Nombre"
        size="small"
        fullWidth
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") confirmar();
          if (e.key === "Escape") cancelar();
        }}
      />
      <IconButton
        color="primary"
        type="button"
        onClick={confirmar}
        disabled={!puedeGuardar || guardando}
        aria-label="Confirmar"
      >
        <CheckIcon />
      </IconButton>
      <IconButton type="button" onClick={cancelar} aria-label="Cancelar">
        <CloseIcon />
      </IconButton>
    </Stack>
  );

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {descripcion}
          </Typography>
        </Box>
        <Button
          variant="contained"
          type="button"
          startIcon={<AddIcon />}
          onClick={abrirNuevo}
          disabled={editandoId !== null}
          sx={{ textTransform: "none", whiteSpace: "nowrap" }}
        >
          Agregar
        </Button>
      </Stack>

      {nuevo && <Box mb={2}>{editor}</Box>}

      <Table size="small">
        <TableHead>
          <TableRow>
            {conCodigo && <TableCell sx={{ width: 140 }}>Código</TableCell>}
            <TableCell>Nombre</TableCell>
            <TableCell sx={{ width: 110 }}>Estado</TableCell>
            <TableCell align="right" sx={{ width: 110 }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={conCodigo ? 4 : 3}>
                <Typography variant="body2" color="text.secondary" py={2}>
                  Todavía no hay nada cargado.
                </Typography>
              </TableCell>
            </TableRow>
          )}

          {items.map((item) =>
            editandoId === item._id ? (
              <TableRow key={item._id}>
                <TableCell colSpan={conCodigo ? 4 : 3}>{editor}</TableCell>
              </TableRow>
            ) : (
              <TableRow key={item._id} hover>
                {conCodigo && (
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {item.codigo}
                    </Typography>
                  </TableCell>
                )}
                <TableCell>{item.nombre}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={item.activo ? "Activo" : "Inactivo"}
                    color={item.activo ? "success" : "default"}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <IconButton
                    size="small"
                    type="button"
                    onClick={() => abrirEdicion(item)}
                    disabled={editandoId !== null}
                    aria-label={`Editar ${item.nombre}`}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <Tooltip
                    title={
                      item.activo
                        ? "Desactivar: deja de ofrecerse en los formularios"
                        : "Volver a activar"
                    }
                  >
                    <IconButton
                      size="small"
                      type="button"
                      color={item.activo ? "warning" : "success"}
                      onClick={() => onAlternar(item)}
                      disabled={guardando}
                      aria-label={
                        item.activo
                          ? `Desactivar ${item.nombre}`
                          : `Activar ${item.nombre}`
                      }
                    >
                      <PowerSettingsNewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
