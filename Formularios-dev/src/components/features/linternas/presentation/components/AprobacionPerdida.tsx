"use client";

import { useState } from "react";
import { useForm, Controller, type FieldValues } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dynamic from "next/dynamic";
import type { SignatureFieldProps } from "@/components/ui/signature/SignatureField";
import type { EntregaLinterna } from "../../domain/models/Linterna";

const SignatureField = dynamic(
  () =>
    import("@/components/ui/signature/SignatureField").then(
      (m) => m.SignatureField,
    ),
  { ssr: false },
) as <T extends FieldValues>(p: SignatureFieldProps<T>) => React.ReactElement;

interface FormularioAprobacion extends FieldValues {
  comentario: string;
  firma: string;
}

interface Props {
  entrega: EntregaLinterna;
  onResolver: (
    id: string,
    aprobar: boolean,
    firma?: string,
    comentario?: string,
  ) => Promise<void>;
}

export function AprobacionPerdida({ entrega, onResolver }: Props) {
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<FormularioAprobacion>({
    mode: "onTouched",
    defaultValues: { comentario: "", firma: "" },
  });

  const [enviando, setEnviando] = useState(false);

  const resolver = async (aprobar: boolean) => {
    const { firma, comentario } = getValues();

    // Aprobar sin firma no autoriza nada; rechazar no la necesita.
    if (aprobar && !firma) {
      setError("firma", {
        message: "Para aprobar hace falta su firma.",
      });
      return;
    }
    clearErrors();
    setEnviando(true);
    try {
      await onResolver(entrega._id, aprobar, firma || undefined, comentario);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={600}>
        {entrega.nombreTrabajador}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {entrega.area} · solicitado por {entrega.registradoPor}
      </Typography>

      <Alert severity="warning" sx={{ mt: 1.5 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          Justificación del trabajador
        </Typography>
        <Typography variant="body2">{entrega.perdida?.justificacion}</Typography>
      </Alert>

      {!!entrega.perdida?.evidencias?.length && (
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
          {entrega.perdida.evidencias.map((ev) => (
            <Chip
              key={ev.url}
              size="small"
              label={ev.nombre}
              component="a"
              href={ev.url}
              target="_blank"
              clickable
            />
          ))}
        </Stack>
      )}

      <Controller
        name="comentario"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            size="small"
            multiline
            minRows={2}
            label="Comentario"
            sx={{ mt: 2 }}
          />
        )}
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Firma de quien autoriza
        </Typography>
        <Controller
          name="firma"
          control={control}
          render={({ field }) => (
            <SignatureField<FormularioAprobacion>
              fieldName="firma"
              control={control}
              setValue={setValue}
              value={field.value}
              onChange={field.onChange}
              error={!!errors.firma}
              helperText={errors.firma?.message}
            />
          )}
        />
      </Box>

      <Stack direction="row" gap={1} sx={{ mt: 2 }}>
        <Button
          type="button"
          variant="contained"
          color="success"
          disabled={enviando}
          onClick={() => void resolver(true)}
        >
          Aprobar y entregar
        </Button>
        <Button
          type="button"
          variant="outlined"
          color="error"
          disabled={enviando}
          onClick={() => void resolver(false)}
        >
          Rechazar
        </Button>
      </Stack>
    </Paper>
  );
}
