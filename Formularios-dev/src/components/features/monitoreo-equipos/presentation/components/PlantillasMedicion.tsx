"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { usePlantillasMedicion } from "../../application/hooks/usePlantillasMedicion";
import { celdasDe } from "../../domain/espesores";
import type { PlantillaMedicion } from "../../domain/models/Monitoreo";
import { formatearDia } from "./CamposReporte";
import { EditorPlantillaMedicion } from "./EditorPlantillaMedicion";

/**
 * Las plantillas de medición de espesores: cuando un reporte elige uno de
 * estos tags con su técnica, se carga con esta grilla en vez de la ficha de
 * la bomba.
 */
export function PlantillasMedicion() {
  const m = usePlantillasMedicion();
  /** `undefined`: cerrado; `null`: una nueva. */
  const [editando, setEditando] = useState<PlantillaMedicion | null | undefined>(undefined);
  const [borrando, setBorrando] = useState<PlantillaMedicion | null>(null);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} gap={2}>
        <Typography variant="subtitle1" fontWeight={700}>
          Plantillas de medición de espesores
        </Typography>
        <Button
          type="button"
          variant="outlined"
          size="small"
          startIcon={<Add />}
          disabled={m.cargando}
          onClick={() => setEditando(null)}
        >
          Nueva plantilla
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" mb={2}>
        La grilla de cada TAG con su técnica (p. ej. 250SA225 con ultrasonido activo): piezas, zonas,
        anillos y puntos, y los diagramas del equipo. Los reportes ya creados conservan la suya.
      </Typography>

      {m.error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => m.setError(null)}>
          {m.error.join(" · ")}
        </Alert>
      )}

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>TAG</TableCell>
            <TableCell>Técnica</TableCell>
            <TableCell>Tabla</TableCell>
            <TableCell align="right">Piezas</TableCell>
            <TableCell align="right">Puntos</TableCell>
            <TableCell>Actualizada</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {m.plantillas.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography variant="body2" color="text.secondary">
                  {m.cargando ? "Cargando…" : "Todavía no hay plantillas."}
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {m.plantillas.map((p) => (
            <TableRow key={p._id}>
              <TableCell>
                <strong>{p.tag}</strong>
              </TableCell>
              <TableCell>{p.tecnica}</TableCell>
              <TableCell>{p.titulo}</TableCell>
              <TableCell align="right">{p.piezas.length}</TableCell>
              <TableCell align="right">{celdasDe(p)}</TableCell>
              <TableCell>{formatearDia(p.updatedAt)}</TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                <Tooltip title="Editar">
                  <IconButton type="button" size="small" onClick={() => setEditando(p)}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton type="button" size="small" onClick={() => setBorrando(p)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editando !== undefined && (
        <EditorPlantillaMedicion
          plantilla={editando}
          tecnicas={m.tecnicas}
          onCerrar={() => setEditando(undefined)}
          guardar={m.guardar}
          subirDiagrama={m.subirDiagrama}
        />
      )}

      <Dialog open={!!borrando} onClose={() => setBorrando(null)}>
        <DialogTitle>¿Eliminar la plantilla?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {borrando?.tag} · {borrando?.tecnica}. Los reportes ya creados conservan su grilla; los
            nuevos de este TAG con esta técnica se harán sin ella.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setBorrando(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            color="error"
            variant="contained"
            onClick={() => {
              if (borrando) void m.eliminar(borrando._id);
              setBorrando(null);
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
