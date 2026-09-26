"use client";

import { Controller, useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ETIQUETA_TIPO,
  descontoStock,
  type AnularEntregaPayload,
  type EntregaLinterna,
} from "../../domain/models/Linterna";

interface FormularioAnular extends FieldValues {
  motivo: string;
  linternaRecuperada: boolean;
}

interface Props {
  entrega: EntregaLinterna;
  onCerrar: () => void;
  onAnular: (id: string, payload: AnularEntregaPayload) => Promise<unknown>;
}

/**
 * Anula una entrega que no debía registrarse.
 *
 * El asiento se queda —la información no se borra— pero sale de los recuentos
 * de dotación. La casilla del stock existe porque **el sistema no puede saber**
 * si la linterna volvió al almacén: reponer siempre dejaría en el inventario
 * una unidad que no está en la estantería, y no reponer nunca perdería una que
 * sí volvió. Lo declara quien anula, y por eso nace desmarcada.
 */
export function AnularDialog({ entrega, onCerrar, onAnular }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormularioAnular>({
    mode: "onTouched",
    defaultValues: { motivo: "", linternaRecuperada: false },
  });

  /** Si no descontó nada, no hay stock que reponer y preguntarlo confunde. */
  const puedeReponer = descontoStock(entrega);

  const enviar = handleSubmit(async (datos) => {
    try {
      await onAnular(entrega._id, {
        motivo: datos.motivo,
        linternaRecuperada: puedeReponer ? datos.linternaRecuperada : undefined,
      });
      onCerrar();
    } catch {
      // El mensaje del servidor ya se muestra arriba; el diálogo se queda
      // abierto con lo escrito.
    }
  });

  return (
    <Dialog open onClose={onCerrar} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={enviar} noValidate>
        <DialogTitle>Anular entrega</DialogTitle>

        <DialogContent dividers>
          <Stack gap={2}>
            <Alert severity="warning">
              La <strong>{ETIQUETA_TIPO[entrega.tipo]}</strong> de{" "}
              {entrega.nombreTrabajador} dejará de contar como dotación. El
              registro no se borra: queda con el motivo, quién lo anuló y
              cuándo.
            </Alert>

            <Controller
              name="motivo"
              control={control}
              rules={{
                required: "Diga por qué se anula",
                minLength: {
                  value: 10,
                  message:
                    "Sin un motivo entendible, dentro de un año nadie sabrá por qué se anuló",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  minRows={2}
                  label="Motivo de la anulación"
                  placeholder="Por ejemplo: registro duplicado"
                  error={!!errors.motivo}
                  helperText={errors.motivo?.message}
                  data-question-error={errors.motivo ? "true" : undefined}
                />
              )}
            />

            {puedeReponer ? (
              <Box>
                <Controller
                  name="linternaRecuperada"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="La linterna volvió al almacén"
                    />
                  )}
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Márquelo solo si la tiene delante. Si la unidad salió y no
                  volvió, dejarlo sin marcar es lo correcto: el inventario debe
                  decir lo que hay en la estantería.
                </Typography>
              </Box>
            ) : (
              <Alert severity="info">
                Esta entrega nunca descontó stock, así que no hay nada que
                reponer.
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button type="button" onClick={onCerrar} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            color="error"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Anulando…" : "Anular"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
