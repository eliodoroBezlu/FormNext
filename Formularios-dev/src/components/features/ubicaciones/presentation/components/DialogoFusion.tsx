"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import {
  destinosDeFusion,
  type NodoUbicacion,
} from "../../domain/models/arbolUbicaciones";
import { SelectorUbicacion } from "./SelectorUbicacion";

interface DialogoFusionProps<T extends NodoUbicacion> {
  /** La ubicación que desaparece. `null` = diálogo cerrado. */
  origen: T | null;
  nodos: T[];
  onFusionar: (origen: T, destino: T) => Promise<boolean>;
  onCerrar: () => void;
}

/**
 * Fusionar una ubicación en otra: pensado para los casi-duplicados heredados
 * del inventario («TALLER SOLDADURA» → «TALLER DE SOLDADURA»).
 *
 * El diálogo se monta con `key` por origen, así que el destino elegido
 * arranca vacío cada vez sin un efecto que lo limpie.
 */
export function DialogoFusion<T extends NodoUbicacion>({
  origen,
  nodos,
  onFusionar,
  onCerrar,
}: DialogoFusionProps<T>) {
  const [destinoId, setDestinoId] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const opciones = origen ? destinosDeFusion(nodos, origen._id) : [];
  const destino = opciones.find((o) => o._id === destinoId) ?? null;
  const hijas = origen ? nodos.filter((n) => n.padre === origen._id && n.activo).length : 0;

  const confirmar = async () => {
    if (!origen || !destino) return;
    setEnviando(true);
    const ok = await onFusionar(origen, destino);
    setEnviando(false);
    if (ok) onCerrar();
  };

  return (
    <Dialog open={!!origen} onClose={onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>Fusionar ubicación</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Typography variant="body2">
            Todo lo que está en <strong>{origen?.ruta}</strong> pasa a la ubicación que elijas, y{" "}
            <strong>{origen?.nombre}</strong> queda dada de baja.
          </Typography>
          <SelectorUbicacion
            opciones={opciones}
            valor={destinoId}
            onChange={setDestinoId}
            label="Fusionar en…"
            required
          />
          {destino && (
            <Alert severity="warning">
              Los equipos de «{origen?.ruta}»
              {hijas > 0 ? ` y sus ${hijas} ubicación(es) hijas` : ""} pasan a «{destino.ruta}». No se
              deshace automáticamente.
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="contained"
          color="warning"
          disabled={!destino || enviando}
          onClick={confirmar}
        >
          Fusionar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
