"use client";

import { useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CheckCircle, Send, Undo } from "@mui/icons-material";
import {
  AccionesMatriz,
  EstadoMatriz,
} from "../../domain/models/IProps";

type TipoAccion = "revision" | "aprobar" | "devolver";

const DIALOGO: Record<
  TipoAccion,
  { titulo: string; etiqueta: string; ayuda: string; obligatorio: boolean }
> = {
  revision: {
    titulo: "Enviar a revisión",
    etiqueta: "Observaciones (opcional)",
    ayuda:
      "La matriz pasa a revisión. Mientras esté en revisión no se puede editar.",
    obligatorio: false,
  },
  aprobar: {
    titulo: "Aprobar matriz",
    etiqueta: "Observaciones (opcional)",
    ayuda:
      "Al aprobar, la matriz queda vigente y sus riesgos críticos podrán consolidarse en el PGR de la superintendencia. Si había una versión anterior aprobada, queda superada.",
    obligatorio: false,
  },
  devolver: {
    titulo: "Devolver para corregir",
    etiqueta: "Motivo",
    ayuda: "La matriz vuelve a borrador. El motivo queda en el historial.",
    obligatorio: true,
  },
};

interface AccionesMatrizBarProps {
  estado: EstadoMatriz;
  acciones: AccionesMatriz | null;
  procesando: boolean;
  onEnviarARevision: (observaciones?: string) => void;
  onAprobar: (observaciones?: string) => void;
  onDevolver: (motivo: string) => void;
}

export function AccionesMatrizBar({
  estado,
  acciones,
  procesando,
  onEnviarARevision,
  onAprobar,
  onDevolver,
}: AccionesMatrizBarProps) {
  const [dialogo, setDialogo] = useState<TipoAccion | null>(null);
  const [texto, setTexto] = useState("");

  if (!acciones) return null;

  const sinAcciones =
    !acciones.puedeEnviarARevision &&
    !acciones.puedeAprobar &&
    !acciones.puedeDevolver;

  const confirmar = () => {
    if (dialogo === "revision") onEnviarARevision(texto || undefined);
    if (dialogo === "aprobar") onAprobar(texto || undefined);
    if (dialogo === "devolver") onDevolver(texto);
    setDialogo(null);
    setTexto("");
  };

  const cfg = dialogo ? DIALOGO[dialogo] : null;

  return (
    <Box>
      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
        {acciones.puedeEnviarARevision && (
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => setDialogo("revision")}
            disabled={procesando}
          >
            Enviar a revisión
          </Button>
        )}
        {acciones.puedeDevolver && (
          <Button
            variant="outlined"
            color="warning"
            startIcon={<Undo />}
            onClick={() => setDialogo("devolver")}
            disabled={procesando}
          >
            Devolver para corregir
          </Button>
        )}
        {acciones.puedeAprobar && (
          <Button
            variant="contained"
            color="success"
            startIcon={
              procesando ? <CircularProgress size={18} /> : <CheckCircle />
            }
            onClick={() => setDialogo("aprobar")}
            disabled={procesando}
          >
            Aprobar matriz
          </Button>
        )}
      </Stack>

      {/*
        Si no se puede aprobar, se dice por qué. Un botón gris sin explicación
        obliga a adivinar; los motivos vienen calculados del backend.
      */}
      {estado === "EN_REVISION" &&
        !acciones.puedeAprobar &&
        acciones.impedimentosParaAprobar.length > 0 && (
          <Alert severity="warning" sx={{ mt: 1.5 }}>
            <AlertTitle>Todavía no se puede aprobar</AlertTitle>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {acciones.impedimentosParaAprobar.map((m, i) => (
                <li key={i}>
                  <Typography variant="body2">{m}</Typography>
                </li>
              ))}
            </Box>
          </Alert>
        )}

      {sinAcciones && estado === "APROBADA" && (
        <Alert severity="success" sx={{ mt: 1.5 }}>
          Matriz aprobada y vigente. Para modificarla hay que importar o crear
          una versión nueva: las aprobadas no se editan, así se garantiza que un
          PGR ya generado no cambie por detrás.
        </Alert>
      )}

      {sinAcciones && estado === "SUPERADA" && (
        <Alert severity="info" sx={{ mt: 1.5 }}>
          Esta versión fue reemplazada por una posterior. Se conserva como
          histórico.
        </Alert>
      )}

      <Dialog
        open={dialogo !== null}
        onClose={() => setDialogo(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{cfg?.titulo}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {cfg?.ayuda}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label={cfg?.etiqueta}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogo(null)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={confirmar}
            disabled={cfg?.obligatorio && !texto.trim()}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
