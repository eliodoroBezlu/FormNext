"use client";

import { useState } from "react";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  RadioButtonUnchecked,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  cambioClaveSchema,
  REQUISITOS_CLAVE,
  type CambioClaveDatos,
} from "../../domain/schemas/cambioClave.schema";
import { useCambiarClave } from "../../application/hooks/useCambiarClave";

interface Props {
  open: boolean;
  onClose: () => void;
}

const VACIO: CambioClaveDatos = { actual: "", nueva: "", confirmar: "" };

/**
 * Cambio de la contraseña propia. La contraseña es del IAM: es la misma para
 * forms, Sync y el portal, y el aviso de arriba lo dice para que nadie se
 * sorprenda al entrar a Sync.
 */
export function CambiarClaveDialog({ open, onClose }: Props) {
  const { cambiar } = useCambiarClave();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CambioClaveDatos>({
    defaultValues: VACIO,
    mode: "onTouched",
    resolver: zodResolver(cambioClaveSchema),
  });

  const cerrar = () => {
    if (isSubmitting) return;
    reset(VACIO);
    setErrorGeneral(null);
    onClose();
  };

  const enviar = async (datos: CambioClaveDatos) => {
    setErrorGeneral(null);
    const r = await cambiar(datos);
    if (r.ok) return; // el hook ya navega a la pantalla de entrada
    if (r.campo) setError(r.campo, { message: r.mensaje }, { shouldFocus: true });
    else setErrorGeneral(r.mensaje);
  };

  return (
    <Dialog open={open} onClose={cerrar} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Cambiar contraseña</DialogTitle>
      <Box component="form" noValidate onSubmit={handleSubmit(enviar)}>
        <DialogContent sx={{ pt: 0 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Es tu contraseña para forms, Sync y el portal: cambia en los tres.
            Al guardar se cerrarán tus sesiones y volverás a iniciar sesión.
          </Alert>

          {errorGeneral && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorGeneral}
            </Alert>
          )}

          <Stack spacing={2}>
            <CampoClave
              control={control}
              name="actual"
              label="Contraseña actual"
              autoComplete="current-password"
              error={errors.actual?.message}
              autoFocus
            />
            <CampoClave
              control={control}
              name="nueva"
              label="Contraseña nueva"
              autoComplete="new-password"
              error={errors.nueva?.message}
            />
            <Requisitos control={control} />
            <CampoClave
              control={control}
              name="confirmar"
              label="Repite la contraseña nueva"
              autoComplete="new-password"
              error={errors.confirmar?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button type="button" onClick={cerrar} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
          >
            {isSubmitting ? "Guardando…" : "Cambiar contraseña"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

interface CampoClaveProps {
  control: Control<CambioClaveDatos>;
  name: keyof CambioClaveDatos;
  label: string;
  autoComplete: string;
  error?: string;
  autoFocus?: boolean;
}

function CampoClave({ control, name, label, autoComplete, error, autoFocus }: CampoClaveProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TextField
          {...field}
          inputRef={field.ref}
          label={label}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          fullWidth
          error={!!error}
          helperText={error}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setVisible((v) => !v)}
                    edge="end"
                  >
                    {visible ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
}

/** Lista de reglas que se marcan a medida que la contraseña nueva las cumple. */
function Requisitos({ control }: { control: Control<CambioClaveDatos> }) {
  const nueva = useWatch({ control, name: "nueva" }) ?? "";
  return (
    <Box component="ul" sx={{ m: 0, pl: 0, listStyle: "none" }} aria-label="Requisitos de la contraseña">
      {REQUISITOS_CLAVE.map((r) => {
        const cumple = r.cumple(nueva);
        return (
          <Box
            component="li"
            key={r.texto}
            sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.25 }}
          >
            {cumple ? (
              <CheckCircle fontSize="small" color="success" />
            ) : (
              <RadioButtonUnchecked fontSize="small" color="disabled" />
            )}
            <Typography variant="body2" color={cumple ? "text.primary" : "text.secondary"}>
              {r.texto}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
