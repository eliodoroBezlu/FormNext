"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import type {
  CorregirTareaDTO,
  TareaObservacion,
} from "../../domain/models/IProps";
import {
  faltantesParaEstado,
  NOMBRE_DEL_ESTADO,
} from "../../domain/requisitosTarea";

interface CorregirTareaDialogProps {
  open: boolean;
  tarea: TareaObservacion | null;
  onClose: () => void;
  onCorregir: (tareaId: string, data: CorregirTareaDTO) => Promise<void>;
}

type FormCorreccion = Required<Omit<CorregirTareaDTO, "estado">> & {
  estado: NonNullable<CorregirTareaDTO["estado"]>;
};

/** `YYYY-MM-DD` para un `<input type="date">`; vacío si no hay fecha. */
const comoDia = (fecha?: Date | string) =>
  fecha ? new Date(fecha).toISOString().slice(0, 10) : "";

/**
 * Corrección del admin. A diferencia del formulario de avance, aquí se puede
 * cambiar cualquier dato de seguimiento y llevar la tarea a cualquier estado,
 * también hacia atrás, para arreglar algo que se cargó mal. Pide un motivo y
 * todo queda en el historial con lo que había antes.
 *
 * Lo que no hace es dejar la tarea en un estado sin los datos que ese estado
 * exige: lo que falta se muestra mientras se edita y el backend lo vuelve a
 * comprobar.
 */
export function CorregirTareaDialog({
  open,
  tarea,
  onClose,
  onCorregir,
}: CorregirTareaDialogProps) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<FormCorreccion>({
    mode: "onTouched",
    defaultValues: {
      motivo: "",
      estado: tarea?.estado ?? "abierto",
      familiaPeligro: tarea?.familiaPeligro ?? "",
      accionPropuesta: tarea?.accionPropuesta ?? "",
      responsableAreaCierre: tarea?.responsableAreaCierre ?? "",
      fechaCumplimientoAcordada: comoDia(tarea?.fechaCumplimientoAcordada),
      fechaCumplimientoEfectiva: comoDia(tarea?.fechaCumplimientoEfectiva),
    },
  });

  const valores = useWatch({ control });
  const faltan = faltantesParaEstado(
    {
      ...valores,
      fechaHallazgo: tarea?.fechaHallazgo,
      evidencias: tarea?.evidencias,
    },
    valores.estado ?? "abierto",
  );

  const guardar = async (data: FormCorreccion) => {
    if (!tarea?._id) return;
    setGuardando(true);
    setError(null);
    try {
      await onCorregir(tarea._id, data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo corregir");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Corregir tarea</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(guardar)}
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <Alert severity="info">
            Como administrador puedes cambiar los datos y el estado, también a
            uno anterior. La corrección queda en el historial de la tarea con
            el motivo y lo que había antes.
          </Alert>

          {tarea?.aprobado && (
            <Alert severity="warning">
              Esta tarea está aprobada: si deja de estar cerrada, pierde la
              aprobación.
            </Alert>
          )}

          <Controller
            name="estado"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Estado" size="small">
                {Object.entries(NOMBRE_DEL_ESTADO).map(([valor, nombre]) => (
                  <MenuItem key={valor} value={valor}>
                    {nombre}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="familiaPeligro"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Familia de peligro" size="small" />
            )}
          />

          <Controller
            name="accionPropuesta"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Acción propuesta"
                size="small"
                multiline
                minRows={2}
              />
            )}
          />

          <Controller
            name="responsableAreaCierre"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Responsable de área para el cierre"
                size="small"
              />
            )}
          />

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Controller
              name="fechaCumplimientoAcordada"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label="Fecha acordada"
                  size="small"
                  sx={{ flex: 1, minWidth: 180 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
            <Controller
              name="fechaCumplimientoEfectiva"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label="Fecha efectiva"
                  size="small"
                  sx={{ flex: 1, minWidth: 180 }}
                  helperText="Vacía para borrarla"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Box>

          {faltan.length > 0 && (
            <Alert severity="warning">
              Para dejarla en {NOMBRE_DEL_ESTADO[valores.estado ?? "abierto"]}{" "}
              falta: {faltan.join("; ")}.
              {faltan.some((f) => f.includes("evidencia")) &&
                " Las evidencias se suben desde «Editar»."}
            </Alert>
          )}

          <Controller
            name="motivo"
            control={control}
            rules={{
              required: "El motivo es obligatorio",
              validate: (v) =>
                v.trim().length >= 10 || "Explica el motivo (al menos 10 caracteres)",
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Motivo de la corrección"
                size="small"
                multiline
                minRows={2}
                required
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ?? "Queda en el historial de la tarea"
                }
              />
            )}
          />

          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button type="button" onClick={onClose} disabled={guardando}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={handleSubmit(guardar)}
          disabled={guardando || faltan.length > 0}
        >
          {guardando ? <CircularProgress size={20} /> : "Guardar corrección"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
