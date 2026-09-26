"use client";

import { useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { PhotoCamera, UploadFile } from "@mui/icons-material";
import {
  CapturaFotoDialog,
  hayCamaraDisponible,
} from "@/components/ui/camera/CapturaFotoDialog";
import {
  ETIQUETA_TIPO,
  TipoEntrega,
  descontoStock,
  type ArchivoAdjunto,
  type EntregaLinterna,
  type ReclasificarEntregaPayload,
} from "../../domain/models/Linterna";
import { linternasAdapter } from "../../infrastructure/adapters/linternasAdapter";

interface FormularioReclasificar extends FieldValues {
  tipo: TipoEntrega;
  motivo: string;
  justificacion: string;
  observacionDevolucion: string;
}

interface Props {
  entrega: EntregaLinterna;
  onCerrar: () => void;
  onReclasificar: (
    id: string,
    payload: ReclasificarEntregaPayload,
  ) => Promise<unknown>;
}

const TODOS_LOS_TIPOS = [
  TipoEntrega.DOTACION,
  TipoEntrega.CAMBIO,
  TipoEntrega.REPOSICION_PERDIDA,
];

/**
 * Qué pasa con el almacén al cambiar de tipo.
 *
 * Se calcula **antes** de confirmar y se enseña con esas palabras, porque es
 * la consecuencia que el operario no puede deducir de la pantalla: una pérdida
 * no descuenta hasta que se aprueba, así que pasar un cambio a pérdida devuelve
 * la unidad aunque la linterna ya haya salido físicamente del almacén.
 */
const efectoEnStock = (
  entrega: EntregaLinterna,
  destino: TipoEntrega,
): string | null => {
  const descontaba = descontoStock(entrega);
  // Dotación y cambio descuentan al registrarse; la pérdida nace pendiente y
  // no descuenta hasta que alguien la aprueba.
  const descontara = destino !== TipoEntrega.REPOSICION_PERDIDA;

  if (descontaba && !descontara) {
    return (
      "Vuelve una linterna al stock. Si la linterna ya salió físicamente, " +
      "el almacén queda descuadrado hasta que se apruebe la reposición."
    );
  }
  if (!descontaba && descontara) {
    return "Sale una linterna del stock ahora mismo.";
  }
  return null;
};

export function ReclasificarDialog({
  entrega,
  onCerrar,
  onReclasificar,
}: Props) {
  const destinos = TODOS_LOS_TIPOS.filter((t) => t !== entrega.tipo);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormularioReclasificar>({
    mode: "onTouched",
    defaultValues: {
      tipo: destinos[0],
      motivo: "",
      justificacion: "",
      observacionDevolucion: "",
    },
  });

  // `useWatch` y no `watch()`: el compilador de React rechaza el segundo.
  const destino = useWatch({ control, name: "tipo" });

  const [fotoDevolucion, setFotoDevolucion] = useState<ArchivoAdjunto | null>(
    null,
  );
  const [evidencias, setEvidencias] = useState<ArchivoAdjunto[]>([]);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [camaraPara, setCamaraPara] = useState<"foto" | "evidencia" | null>(
    null,
  );
  const [conCamara] = useState(hayCamaraDisponible);
  const inputFoto = useRef<HTMLInputElement>(null);
  const inputEvidencia = useRef<HTMLInputElement>(null);

  const esCambio = destino === TipoEntrega.CAMBIO;
  const esPerdida = destino === TipoEntrega.REPOSICION_PERDIDA;
  const aviso = efectoEnStock(entrega, destino);

  const subir = async (
    archivo: File | undefined,
    donde: "foto" | "evidencia",
  ) => {
    if (!archivo) return;
    setErrorArchivo(null);
    setSubiendo(true);
    try {
      const adjunto = await linternasAdapter.subirArchivo(archivo);
      if (donde === "foto") setFotoDevolucion(adjunto);
      else setEvidencias((prev) => [...prev, adjunto]);
    } catch (err) {
      setErrorArchivo(
        err instanceof Error ? err.message : "No se pudo subir el archivo.",
      );
    } finally {
      setSubiendo(false);
      if (inputFoto.current) inputFoto.current.value = "";
      if (inputEvidencia.current) inputEvidencia.current.value = "";
    }
  };

  const enviar = handleSubmit(async (datos) => {
    if (esCambio && !fotoDevolucion) {
      setErrorArchivo("Un cambio exige la foto de la linterna que se devuelve.");
      return;
    }

    try {
      await onReclasificar(entrega._id, {
        trabajador: entrega.trabajador,
        tipo: datos.tipo,
        motivo: datos.motivo,
        // Los bloques del tipo viejo no se arrastran: se manda solo lo que el
        // tipo nuevo admite, que es lo que el servidor va a validar.
        devolucion:
          esCambio && fotoDevolucion
            ? {
                foto: fotoDevolucion,
                observacion: datos.observacionDevolucion || undefined,
              }
            : undefined,
        perdida: esPerdida
          ? { justificacion: datos.justificacion, evidencias }
          : undefined,
        observacion: entrega.observacion,
      });
      onCerrar();
    } catch {
      // El hook ya dejó el mensaje en su Snackbar; el diálogo se queda abierto
      // con lo escrito para poder corregir y reintentar.
    }
  });

  return (
    <Dialog open onClose={onCerrar} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={enviar} noValidate>
        <DialogTitle>Reclasificar entrega</DialogTitle>

        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            Ahora es <strong>{ETIQUETA_TIPO[entrega.tipo]}</strong> de{" "}
            {entrega.nombreTrabajador}. Cambiar el tipo no es corregir un campo:
            cada tipo exige unos datos y mueve el stock de otra forma, así que
            hay que volver a declarar la entrega.
          </Alert>

          <Stack gap={2}>
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label="Pasa a ser">
                  {destinos.map((t) => (
                    <MenuItem key={t} value={t}>
                      {ETIQUETA_TIPO[t]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {aviso && <Alert severity="warning">{aviso}</Alert>}

            {esPerdida && (
              <Alert severity="info">
                Quedará <strong>pendiente de aprobación</strong>: en el flujo de
                pérdida la linterna sale cuando se autoriza, no antes.
              </Alert>
            )}

            <Controller
              name="motivo"
              control={control}
              rules={{
                required: "Diga por qué se reclasifica",
                minLength: {
                  value: 10,
                  message: "Sin un motivo entendible, dentro de un año nadie sabrá por qué cuadró así",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  minRows={2}
                  label="Motivo de la reclasificación"
                  placeholder="Qué se registró mal y por qué"
                  error={!!errors.motivo}
                  helperText={errors.motivo?.message}
                  data-question-error={errors.motivo ? "true" : undefined}
                />
              )}
            />

            {esPerdida && (
              <>
                <Controller
                  name="justificacion"
                  control={control}
                  rules={{
                    required: "Una pérdida exige la justificación del trabajador",
                    minLength: {
                      value: 15,
                      message: "Explique qué pasó con algo más de detalle",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      minRows={3}
                      label="Justificación de la pérdida"
                      placeholder="¿Qué pasó con la linterna?"
                      error={!!errors.justificacion}
                      helperText={errors.justificacion?.message}
                      data-question-error={
                        errors.justificacion ? "true" : undefined
                      }
                    />
                  )}
                />

                <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                  <input
                    ref={inputEvidencia}
                    type="file"
                    accept="image/*,application/pdf"
                    hidden
                    onChange={(e) => void subir(e.target.files?.[0], "evidencia")}
                  />
                  {conCamara && (
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      startIcon={<PhotoCamera />}
                      onClick={() => setCamaraPara("evidencia")}
                      disabled={subiendo}
                    >
                      Tomar foto
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    startIcon={<UploadFile />}
                    onClick={() => inputEvidencia.current?.click()}
                    disabled={subiendo}
                  >
                    Adjuntar evidencia
                  </Button>
                  {evidencias.map((ev, i) => (
                    <Chip
                      key={ev.url}
                      size="small"
                      label={ev.nombre}
                      onDelete={() =>
                        setEvidencias((prev) => prev.filter((_, j) => j !== i))
                      }
                    />
                  ))}
                </Stack>
              </>
            )}

            {esCambio && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Un cambio exige la foto de la linterna averiada: es la
                  constancia de que la anterior se devolvió.
                </Typography>

                <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                  <input
                    ref={inputFoto}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => void subir(e.target.files?.[0], "foto")}
                  />
                  {conCamara && (
                    <Button
                      type="button"
                      variant="contained"
                      size="small"
                      startIcon={<PhotoCamera />}
                      onClick={() => setCamaraPara("foto")}
                      disabled={subiendo}
                    >
                      Tomar foto
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    startIcon={<UploadFile />}
                    onClick={() => inputFoto.current?.click()}
                    disabled={subiendo}
                  >
                    {fotoDevolucion ? "Cambiar archivo" : "Subir archivo"}
                  </Button>
                  {fotoDevolucion && (
                    <Chip
                      size="small"
                      label={fotoDevolucion.nombre}
                      onDelete={() => setFotoDevolucion(null)}
                    />
                  )}
                </Stack>

                <Controller
                  name="observacionDevolucion"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Observación de la devolución"
                    />
                  )}
                />
              </>
            )}

            {entrega.devolucion && !esCambio && (
              <Alert severity="warning">
                Se soltará la foto de la devolución que tiene ahora: en una{" "}
                {ETIQUETA_TIPO[destino].toLowerCase()} no pinta nada.
              </Alert>
            )}

            {errorArchivo && (
              <Alert severity="error" onClose={() => setErrorArchivo(null)}>
                {errorArchivo}
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
            variant="contained"
            disabled={isSubmitting || subiendo}
          >
            {isSubmitting ? "Reclasificando…" : "Reclasificar"}
          </Button>
        </DialogActions>
      </Box>

      {/*
        La cámara se monta solo cuando hace falta: así el permiso no se pide al
        abrir el diálogo, sino cuando el usuario decide sacar la foto.
      */}
      {camaraPara && (
        <CapturaFotoDialog
          abierto
          titulo={
            camaraPara === "foto"
              ? "Foto de la linterna devuelta"
              : "Evidencia de la pérdida"
          }
          nombreBase={camaraPara === "foto" ? "devolucion" : "evidencia"}
          onCerrar={() => setCamaraPara(null)}
          onCapturar={(archivo) => void subir(archivo, camaraPara)}
        />
      )}
    </Dialog>
  );
}
