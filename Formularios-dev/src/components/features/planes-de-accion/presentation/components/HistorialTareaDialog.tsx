"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import type { CambioDeTarea, TareaObservacion } from "../../domain/models/IProps";
import { NOMBRE_DEL_CAMPO, valorDelHistorial } from "../../domain/requisitosTarea";

interface HistorialTareaDialogProps {
  open: boolean;
  tarea: TareaObservacion | null;
  onClose: () => void;
}

const TIPO: Record<
  CambioDeTarea["tipo"],
  { texto: string; color: "default" | "warning" | "success" }
> = {
  avance: { texto: "Avance", color: "default" },
  correccion: { texto: "Corrección", color: "warning" },
  aprobacion: { texto: "Aprobación", color: "success" },
};

/** Quién cambió qué y cuándo, lo último primero. */
export function HistorialTareaDialog({
  open,
  tarea,
  onClose,
}: HistorialTareaDialogProps) {
  const entradas = [...(tarea?.historial ?? [])].reverse();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Historial de la tarea {tarea ? `#${tarea.numeroItem}` : ""}
      </DialogTitle>
      <DialogContent>
        {entradas.length === 0 ? (
          <Alert severity="info">
            Todavía no hay cambios registrados. El historial empezó a llevarse
            con esta versión: lo anterior no quedó guardado.
          </Alert>
        ) : (
          <Box component="ol" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {entradas.map((entrada, i) => (
              <Box component="li" key={`${entrada.fecha}-${i}`} sx={{ py: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                    mb: 0.5,
                  }}
                >
                  <Chip
                    size="small"
                    label={TIPO[entrada.tipo]?.texto ?? entrada.tipo}
                    color={TIPO[entrada.tipo]?.color ?? "default"}
                    variant="outlined"
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {entrada.usuario}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(entrada.fecha).toLocaleString("es-BO")}
                  </Typography>
                </Box>
                {entrada.motivo && (
                  <Typography variant="body2" sx={{ fontStyle: "italic", mb: 0.5 }}>
                    Motivo: {entrada.motivo}
                  </Typography>
                )}
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                  {entrada.cambios.map((c) => (
                    <Typography component="li" variant="body2" key={c.campo}>
                      <strong>{NOMBRE_DEL_CAMPO[c.campo] ?? c.campo}:</strong>{" "}
                      {valorDelHistorial(c.campo, c.antes)} →{" "}
                      {valorDelHistorial(c.campo, c.despues)}
                    </Typography>
                  ))}
                </Box>
                {i < entradas.length - 1 && <Divider sx={{ mt: 1.5 }} />}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button type="button" onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
