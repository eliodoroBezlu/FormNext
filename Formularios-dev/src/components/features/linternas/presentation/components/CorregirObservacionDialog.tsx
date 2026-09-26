"use client";

import { Controller, useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import type {
  CorregirEntregaPayload,
  EntregaLinterna,
} from "../../domain/models/Linterna";

interface FormularioCorregir extends FieldValues {
  observacion: string;
}

interface Props {
  entrega: EntregaLinterna;
  onCerrar: () => void;
  onCorregir: (id: string, payload: CorregirEntregaPayload) => Promise<unknown>;
}

/**
 * El error de tecleo, y nada más.
 *
 * El tipo, el trabajador y los bloques **no** entran aquí: cambiar esos mueve
 * stock y estado, y eso va por reclasificar. Separarlo evita que una
 * corrección menor acabe siendo una conversión sin que nadie lo note.
 */
export function CorregirObservacionDialog({
  entrega,
  onCerrar,
  onCorregir,
}: Props) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormularioCorregir>({
    mode: "onTouched",
    defaultValues: { observacion: entrega.observacion ?? "" },
  });

  const enviar = handleSubmit(async (datos) => {
    try {
      await onCorregir(entrega._id, { observacion: datos.observacion });
      onCerrar();
    } catch {
      // El mensaje del servidor ya se muestra arriba.
    }
  });

  return (
    <Dialog open onClose={onCerrar} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={enviar} noValidate>
        <DialogTitle>Corregir la observación</DialogTitle>

        <DialogContent dividers>
          <DialogContentText variant="body2" sx={{ mb: 2 }}>
            Solo la observación. Para cambiar el tipo de entrega use
            «Reclasificar»; para dejarla sin efecto, «Anular».
          </DialogContentText>

          <Controller
            name="observacion"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                minRows={3}
                label="Observación"
                placeholder="Déjelo vacío para borrar lo que decía"
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button type="button" onClick={onCerrar} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
