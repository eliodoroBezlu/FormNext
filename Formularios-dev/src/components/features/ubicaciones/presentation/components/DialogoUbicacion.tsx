"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import {
  hermanoDadoDeBaja,
  padresPosibles,
  type NodoUbicacion,
} from "../../domain/models/arbolUbicaciones";
import { SelectorUbicacion } from "./SelectorUbicacion";

interface ValoresUbicacion {
  nombre: string;
  padre: string | null;
}

interface DialogoUbicacionProps<T extends NodoUbicacion> {
  open: boolean;
  /** Todas las ubicaciones, incluidas las dadas de baja. */
  nodos: T[];
  /** La que se edita, o `null` para crear. */
  editando: T | null;
  /** Padre sugerido al crear («Agregar debajo»). */
  padreInicial: string | null;
  onGuardar: (valores: ValoresUbicacion) => Promise<boolean>;
  onRestaurar: (nodo: T) => Promise<boolean>;
  onCerrar: () => void;
}

/**
 * Crear, renombrar o mover una ubicación. Mover es cambiar el padre: todo lo
 * que cuelga de ella se va con ella.
 */
export function DialogoUbicacion<T extends NodoUbicacion>({
  open,
  nodos,
  editando,
  padreInicial,
  onGuardar,
  onRestaurar,
  onCerrar,
}: DialogoUbicacionProps<T>) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ValoresUbicacion>({
    defaultValues: { nombre: "", padre: null },
    mode: "onTouched",
  });

  useEffect(() => {
    if (open) {
      reset({
        nombre: editando?.nombre ?? "",
        padre: editando ? editando.padre : padreInicial,
      });
    }
  }, [open, editando, padreInicial, reset]);

  const nombre = useWatch({ control, name: "nombre" });
  const padre = useWatch({ control, name: "padre" });

  const opcionesPadre = padresPosibles(nodos, editando?._id ?? null);
  const nodoPadre = nodos.find((n) => n._id === padre);
  const nombreLimpio = nombre.replace(/\s+/g, " ").trim();
  const rutaFinal = nombreLimpio
    ? nodoPadre
      ? `${nodoPadre.ruta} › ${nombreLimpio}`
      : nombreLimpio
    : "";

  const dadaDeBaja = nombreLimpio ? hermanoDadoDeBaja(nodos, padre, nombreLimpio) : undefined;

  const seMueve = !!editando && (editando.padre ?? null) !== (padre ?? null);
  const arrastradas = editando
    ? nodos.filter((n) => n.ancestros.includes(editando._id)).length
    : 0;

  const guardar = async (valores: ValoresUbicacion) => {
    const ok = await onGuardar({ nombre: nombreLimpio, padre: valores.padre });
    if (ok) onCerrar();
  };

  const restaurar = async () => {
    if (dadaDeBaja && (await onRestaurar(dadaDeBaja))) onCerrar();
  };

  return (
    <Dialog open={open} onClose={onCerrar} maxWidth="sm" fullWidth>
      <Box component="form" noValidate onSubmit={handleSubmit(guardar)}>
        <DialogTitle>{editando ? "Editar ubicación" : "Nueva ubicación"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Controller
              name="padre"
              control={control}
              render={({ field }) => (
                <SelectorUbicacion
                  opciones={opcionesPadre}
                  valor={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Ubicación padre"
                  placeholder="Ninguna (ubicación principal)"
                  helperText="Vacío = ubicación principal. Solo se ofrecen las que tienen lugar (máximo 7 niveles)."
                />
              )}
            />
            <TextField
              fullWidth
              required
              autoFocus
              label="Nombre"
              {...register("nombre", {
                validate: {
                  requerido: (v) => v.trim().length > 0 || "El nombre es requerido",
                  sinSeparador: (v) =>
                    !v.includes(">") || "No puede contener '>': se usa para separar niveles en el Excel",
                },
              })}
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
            />

            {rutaFinal && (
              <Typography variant="body2" color="text.secondary">
                Quedará como: <strong>{rutaFinal}</strong>
              </Typography>
            )}

            {seMueve && arrastradas > 0 && (
              <Alert severity="info">
                Se mueven también las {arrastradas} ubicación(es) que cuelgan de esta.
              </Alert>
            )}

            {dadaDeBaja && (
              <Alert
                severity="warning"
                action={
                  <Button type="button" color="inherit" size="small" onClick={restaurar}>
                    Restaurar
                  </Button>
                }
              >
                «{dadaDeBaja.ruta}» ya existe, dada de baja. Se puede restaurar en vez de crearla de nuevo.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || !!dadaDeBaja}>
            Guardar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
