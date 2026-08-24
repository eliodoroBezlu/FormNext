"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { PhotoCamera, UploadFile } from "@mui/icons-material";
import dynamic from "next/dynamic";
import type { SignatureFieldProps } from "@/components/ui/signature/SignatureField";
import type { FieldValues } from "react-hook-form";
import {
  ETIQUETA_TIPO,
  TipoEntrega,
  type ArchivoAdjunto,
  type EstadoTrabajador,
  type RegistrarEntregaPayload,
} from "../../domain/models/Linterna";
import { linternasAdapter } from "../../infrastructure/adapters/linternasAdapter";
import {
  CapturaFotoDialog,
  hayCamaraDisponible,
} from "@/components/ui/camera/CapturaFotoDialog";

const SignatureField = dynamic(
  () =>
    import("@/components/ui/signature/SignatureField").then(
      (m) => m.SignatureField,
    ),
  { ssr: false },
) as <T extends FieldValues>(p: SignatureFieldProps<T>) => React.ReactElement;

interface FormularioEntrega extends FieldValues {
  tipo: TipoEntrega;
  justificacion: string;
  observacionDevolucion: string;
  observacion: string;
  firma: string;
}

interface Props {
  estado: EstadoTrabajador;
  stockDisponible: number;
  onRegistrar: (payload: RegistrarEntregaPayload) => Promise<unknown>;
}

export function EntregaForm({ estado, stockDisponible, onRegistrar }: Props) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormularioEntrega>({
    mode: "onTouched",
    defaultValues: {
      tipo: estado.siguienteAccion,
      justificacion: "",
      observacionDevolucion: "",
      observacion: "",
      firma: "",
    },
  });

  // `useWatch` y no `watch()`: el compilador de React rechaza el segundo.
  const tipo = useWatch({ control, name: "tipo" });
  const [fotoDevolucion, setFotoDevolucion] = useState<ArchivoAdjunto | null>(
    null,
  );
  const [evidencias, setEvidencias] = useState<ArchivoAdjunto[]>([]);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const inputFoto = useRef<HTMLInputElement>(null);
  const inputEvidencia = useRef<HTMLInputElement>(null);

  // Guardián de salida: perder una firma ya trazada obliga a repetirla con la
  // persona delante.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  /**
   * Qué adjunto está esperando la foto de la cámara. `null` = diálogo cerrado.
   * Se guarda el destino y no solo un booleano porque la misma cámara sirve
   * para la foto de la devolución y para las evidencias de una pérdida.
   */
  const [camaraPara, setCamaraPara] = useState<"foto" | "evidencia" | null>(
    null,
  );

  /**
   * Se resuelve en el inicializador y no en cada render: `window` no existe
   * durante el render de servidor, y calcularlo una vez basta —el navegador
   * no pasa a ser seguro a media sesión—.
   */
  const [conCamara] = useState(hayCamaraDisponible);

  const subir = async (
    archivo: File | undefined,
    destino: "foto" | "evidencia",
  ) => {
    if (!archivo) return;
    setErrorArchivo(null);
    setSubiendo(true);
    try {
      const adjunto = await linternasAdapter.subirArchivo(archivo);
      if (destino === "foto") setFotoDevolucion(adjunto);
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

  const esPerdida = tipo === TipoEntrega.REPOSICION_PERDIDA;
  const esCambio = tipo === TipoEntrega.CAMBIO;
  // En una pérdida la linterna sale al aprobar, así que el stock no bloquea
  // registrar la solicitud.
  const sinStock = stockDisponible < 1 && !esPerdida;

  const enviar = handleSubmit(async (datos) => {
    if (esCambio && !fotoDevolucion) {
      setErrorArchivo("Un cambio exige la foto de la linterna que se devuelve.");
      return;
    }

    await onRegistrar({
      trabajador: estado.trabajador,
      tipo: datos.tipo,
      // En una pérdida no se firma ahora: se firma al recibir, tras aprobar.
      firmaTrabajador: esPerdida ? undefined : datos.firma || undefined,
      metodoFirma: "dibujada",
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
      observacion: datos.observacion || undefined,
    });

    reset();
    setFotoDevolucion(null);
    setEvidencias([]);
  });

  return (
    <Box component="form" onSubmit={enviar} noValidate>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="tipo"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth label="Tipo de entrega">
                <MenuItem
                  value={TipoEntrega.DOTACION}
                  disabled={estado.tieneDotacion}
                >
                  {ETIQUETA_TIPO[TipoEntrega.DOTACION]}
                </MenuItem>
                <MenuItem
                  value={TipoEntrega.CAMBIO}
                  disabled={!estado.tieneDotacion}
                >
                  {ETIQUETA_TIPO[TipoEntrega.CAMBIO]}
                </MenuItem>
                <MenuItem
                  value={TipoEntrega.REPOSICION_PERDIDA}
                  disabled={!estado.tieneDotacion}
                >
                  {ETIQUETA_TIPO[TipoEntrega.REPOSICION_PERDIDA]}
                </MenuItem>
              </TextField>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="observacion"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Observación (opcional)" />
            )}
          />
        </Grid>

        {esCambio && (
          <Grid size={{ xs: 12 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Devolución de la linterna averiada
              </Typography>
              <Typography variant="caption" color="text.secondary">
                La foto es obligatoria: es la constancia de que la anterior se
                entregó.
              </Typography>

              <Stack direction="row" gap={1} alignItems="center" sx={{ mt: 1.5 }}>
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
                    sx={{ mt: 2 }}
                  />
                )}
              />
            </Paper>
          </Grid>
        )}

        {esPerdida && (
          <Grid size={{ xs: 12 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Justificación de la pérdida
              </Typography>
              <Typography variant="caption" color="text.secondary">
                La redacta el trabajador. Queda pendiente hasta que la apruebe
                un superintendente o supervisor.
              </Typography>

              <Controller
                name="justificacion"
                control={control}
                rules={{
                  required: "La justificación es obligatoria",
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
                    label="¿Qué pasó?"
                    error={!!errors.justificacion}
                    helperText={errors.justificacion?.message}
                    data-question-error={
                      errors.justificacion ? "true" : undefined
                    }
                    sx={{ mt: 2 }}
                  />
                )}
              />

              <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap" sx={{ mt: 2 }}>
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
                  Adjuntar archivo
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
            </Paper>
          </Grid>
        )}

        {!esPerdida && (
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Firma de recibo del trabajador
            </Typography>
            <Controller
              name="firma"
              control={control}
              rules={{ required: "La firma del trabajador es obligatoria" }}
              render={({ field }) => (
                <Box data-question-error={errors.firma ? "true" : undefined}>
                  <SignatureField<FormularioEntrega>
                    fieldName="firma"
                    control={control}
                    setValue={setValue}
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.firma}
                    helperText={errors.firma?.message}
                  />
                </Box>
              )}
            />
          </Grid>
        )}

        {esPerdida && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">
              El trabajador firmará el recibo cuando la reposición esté
              aprobada. Primero se autoriza, después se entrega.
            </Alert>
          </Grid>
        )}

        {errorArchivo && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error" onClose={() => setErrorArchivo(null)}>
              {errorArchivo}
            </Alert>
          </Grid>
        )}

        {sinStock && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="warning">
              No hay linternas en stock. Registre un ingreso antes de entregar.
            </Alert>
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={
              isSubmitting ||
              subiendo ||
              sinStock ||
              estado.pendienteDeAprobacion
            }
          >
            {esPerdida ? "Enviar a aprobación" : "Registrar entrega"}
          </Button>
        </Grid>
      </Grid>

      {/*
        La cámara se monta solo cuando hace falta: así el permiso no se pide
        al abrir el formulario, sino cuando el usuario decide sacar la foto.
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
    </Box>
  );
}
