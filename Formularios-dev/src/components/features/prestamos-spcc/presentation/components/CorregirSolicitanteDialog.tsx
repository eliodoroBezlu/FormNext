"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { Trabajador } from "@/types/trabajador";
import { SelectorSolicitante } from "./SelectorSolicitante";
import type {
  CorregirSolicitantePayload,
  SolicitudPrestamo,
} from "../../domain/models/Prestamo";

interface Props {
  solicitud: SolicitudPrestamo;
  onCerrar: () => void;
  onCorregir: (
    id: string,
    payload: CorregirSolicitantePayload,
  ) => Promise<boolean>;
}

const MOTIVO_MINIMO = 10;

/**
 * Corrige a nombre de quién está una solicitud ya registrada.
 *
 * Funciona **también sobre las entregadas y firmadas**, que es justo el caso
 * que hay que arreglar: las mal atribuidas son las viejas. Por eso el aviso
 * del acta: el sello de la firma es un hash sobre la imagen, no sobre el
 * contenido, así que el papel impreso seguirá diciendo el nombre anterior.
 */
export function CorregirSolicitanteDialog({
  solicitud,
  onCerrar,
  onCorregir,
}: Props) {
  const [solicitante, setSolicitante] = useState<Trabajador | null>(null);
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const actual = solicitud.solicitanteNombre ?? solicitud.solicitanteUsername;
  const puedeGuardar =
    Boolean(solicitante) && motivo.trim().length >= MOTIVO_MINIMO;

  const guardar = async () => {
    if (!solicitante) {
      setAviso("Elija a quién pidió los equipos.");
      return;
    }
    if (motivo.trim().length < MOTIVO_MINIMO) {
      setAviso(
        "Explique por qué se corrige: es lo único que lo justificará después.",
      );
      return;
    }

    setGuardando(true);
    const bien = await onCorregir(solicitud._id, {
      solicitanteId: solicitante._id,
      motivo: motivo.trim(),
    });
    setGuardando(false);
    if (bien) onCerrar();
  };

  return (
    <Dialog open onClose={onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>Corregir el solicitante</DialogTitle>

      <DialogContent dividers>
        <Stack gap={2}>
          {aviso && (
            <Alert severity="warning" onClose={() => setAviso(null)}>
              {aviso}
            </Alert>
          )}

          <Box>
            <Typography variant="body2" color="text.secondary">
              Solicitud <strong>{solicitud.numero}</strong>
            </Typography>
            <Typography variant="body2">
              Ahora figura a nombre de <strong>{actual}</strong>
              {solicitud.registradoPor && solicitud.registradoPor !== actual
                ? ` · la registró ${solicitud.registradoPor}`
                : ""}
            </Typography>
          </Box>

          <SelectorSolicitante
            value={solicitante}
            onChange={setSolicitante}
            label="Pasa a nombre de"
            helperText="Quien pidió los equipos de verdad"
          />

          <TextField
            fullWidth
            multiline
            minRows={2}
            required
            label="Motivo de la corrección"
            placeholder="Por ejemplo: lo pidió Pérez en la oficina y se registró con mi usuario"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />

          <Alert severity="info">
            El nombre anterior <strong>no se pierde</strong>: queda guardado con
            quién corrigió y por qué, y el acta lo muestra al pie. Si hay una
            copia impresa en circulación, seguirá diciendo «{actual}» — por eso
            se deja constancia.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button type="button" onClick={onCerrar} disabled={guardando}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={() => void guardar()}
          disabled={guardando || !puedeGuardar}
        >
          {guardando ? "Guardando…" : "Corregir"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
