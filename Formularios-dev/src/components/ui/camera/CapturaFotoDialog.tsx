"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { Cameraswitch, PhotoCamera, Replay } from "@mui/icons-material";

/** Lado de la cámara. En un almacén se usa la trasera casi siempre. */
type Lado = "environment" | "user";

interface CapturaFotoDialogProps {
  abierto: boolean;
  titulo?: string;
  /** Nombre base del archivo resultante, sin extensión. */
  nombreBase?: string;
  onCerrar: () => void;
  /** Recibe la foto ya como `File`, lista para subir. */
  onCapturar: (archivo: File) => void;
}

/**
 * Lado más largo de la imagen guardada, en píxeles.
 *
 * Una cámara de teléfono entrega 4000 px y unos 5 MB por foto. Para una
 * constancia de que la linterna se devolvió eso no aporta nada, y el backend
 * corta el cuerpo en 10 MB. A 1600 px se lee perfectamente el estado del
 * equipo y el archivo baja a unos pocos cientos de kB.
 */
const LADO_MAXIMO = 1600;

const CALIDAD_JPEG = 0.9;

/**
 * ¿Puede este navegador abrir la cámara siquiera?
 *
 * `getUserMedia` solo existe en **contexto seguro**: HTTPS o `localhost`.
 * Servido por IP y HTTP plano, `navigator.mediaDevices` ni aparece. Saberlo
 * antes de pintar el botón evita ofrecer algo que va a fallar al pulsarlo.
 *
 * Se consulta a través de una función y no de una constante de módulo porque
 * en el render del servidor no existe `window`.
 *
 * **Cuidado al reutilizarla:** devuelve `false` en el servidor y `true` en el
 * cliente, así que usarla para decidir qué pintar en el **primer** render de
 * un árbol que sí llega en el HTML del servidor provoca un desajuste de
 * hidratación. En `EntregaForm` es seguro porque ese formulario solo aparece
 * después de que el usuario elige a un trabajador, es decir, ya en el cliente.
 * En un caso servido desde el arranque, léela en un efecto.
 */
export const hayCamaraDisponible = (): boolean =>
  typeof window !== "undefined" &&
  window.isSecureContext &&
  !!navigator.mediaDevices?.getUserMedia;

/** Traduce el fallo de `getUserMedia` a algo que el usuario pueda resolver. */
const explicarFallo = (error: unknown): string => {
  const nombre = (error as { name?: string })?.name;
  if (nombre === "NotAllowedError" || nombre === "SecurityError") {
    return "El navegador bloqueó la cámara. Permítala en el candado de la barra de direcciones y vuelva a intentarlo.";
  }
  if (nombre === "NotFoundError" || nombre === "OverconstrainedError") {
    return "No se encontró ninguna cámara en este equipo. Puede subir la foto desde un archivo.";
  }
  if (nombre === "NotReadableError") {
    return "Otra aplicación está usando la cámara. Ciérrela y vuelva a intentarlo.";
  }
  return "No se pudo abrir la cámara. Puede subir la foto desde un archivo.";
};

/**
 * Toma una foto con la cámara del dispositivo y la devuelve como `File`.
 *
 * Existe porque en campo la evidencia se saca en el momento: obligar a
 * fotografiar con la cámara del teléfono, guardar y luego buscar el archivo
 * es el camino por el que las fotos terminan sin adjuntar.
 *
 * **Requiere contexto seguro.** `getUserMedia` solo funciona en HTTPS o en
 * `localhost`; servido por IP y HTTP plano el navegador lo bloquea sin
 * preguntar. Por eso el botón de subir archivo se queda donde está: es el
 * camino que siempre funciona.
 */
export function CapturaFotoDialog({
  abierto,
  titulo = "Tomar foto",
  nombreBase = "foto",
  onCerrar,
  onCapturar,
}: CapturaFotoDialogProps) {
  const video = useRef<HTMLVideoElement>(null);
  const flujo = useRef<MediaStream | null>(null);

  const [lado, setLado] = useState<Lado>("environment");
  /**
   * Contador para volver a encender la cámara sin duplicar el código que la
   * abre: al incrementarlo cambian las dependencias del efecto y éste se
   * vuelve a ejecutar. Es lo que usa «Repetir».
   */
  const [intento, setIntento] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  /** Foto ya tomada, a la espera de que la acepten o la repitan. */
  const [previsualizacion, setPrevisualizacion] = useState<string | null>(null);
  const capturada = useRef<File | null>(null);

  /** Apaga la cámara. Sin esto el piloto del dispositivo se queda encendido. */
  const apagar = useCallback(() => {
    flujo.current?.getTracks().forEach((t) => t.stop());
    flujo.current = null;
    if (video.current) video.current.srcObject = null;
  }, []);

  useEffect(() => {
    if (!abierto) return;

    // La promesa se encadena aquí en vez de llamar a una función `async`: así
    // el efecto no ejecuta ningún setState de forma síncrona.
    let vigente = true;

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: lado }, audio: false })
      .then((stream) => {
        if (!vigente) {
          // El diálogo se cerró mientras se pedía permiso: la cámara que ya
          // se abrió hay que apagarla igual, o queda encendida sin dueño.
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        flujo.current = stream;
        if (video.current) video.current.srcObject = stream;
        setError(null);
        setListo(true);
      })
      .catch((e: unknown) => {
        if (vigente) setError(explicarFallo(e));
      });

    return () => {
      vigente = false;
      apagar();
      setListo(false);
    };
  }, [abierto, lado, intento, apagar]);

  /** Libera la URL de la vista previa cuando deja de mostrarse. */
  useEffect(() => {
    if (!previsualizacion) return;
    return () => URL.revokeObjectURL(previsualizacion);
  }, [previsualizacion]);

  const disparar = () => {
    const v = video.current;
    if (!v || !v.videoWidth) return;

    const escala = Math.min(1, LADO_MAXIMO / Math.max(v.videoWidth, v.videoHeight));
    const lienzo = document.createElement("canvas");
    lienzo.width = Math.round(v.videoWidth * escala);
    lienzo.height = Math.round(v.videoHeight * escala);

    const ctx = lienzo.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, lienzo.width, lienzo.height);

    lienzo.toBlob(
      (blob) => {
        if (!blob) return;
        const nombre = `${nombreBase}-${Date.now()}.jpg`;
        capturada.current = new File([blob], nombre, { type: "image/jpeg" });
        setPrevisualizacion(URL.createObjectURL(blob));
        // La cámara se apaga en cuanto hay foto: mientras se decide si sirve,
        // no hay razón para seguir grabando.
        apagar();
      },
      "image/jpeg",
      CALIDAD_JPEG,
    );
  };

  const repetir = () => {
    capturada.current = null;
    setPrevisualizacion(null);
    setIntento((n) => n + 1); // relanza el efecto y vuelve a encender la cámara
  };

  const aceptar = () => {
    if (!capturada.current) return;
    onCapturar(capturada.current);
    cerrar();
  };

  const cerrar = () => {
    apagar();
    capturada.current = null;
    setPrevisualizacion(null);
    setError(null);
    onCerrar();
  };

  return (
    <Dialog open={abierto} onClose={cerrar} maxWidth="sm" fullWidth>
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "4 / 3",
            bgcolor: "common.black",
            borderRadius: 1,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {previsualizacion ? (
            /* eslint-disable-next-line @next/next/no-img-element -- es un blob local, no una ruta que `next/image` pueda optimizar */
            <img
              src={previsualizacion}
              alt="Foto tomada"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <>
              <video
                ref={video}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {!listo && !error && (
                <CircularProgress sx={{ position: "absolute" }} />
              )}
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button type="button" onClick={cerrar}>
          Cancelar
        </Button>

        {previsualizacion ? (
          <Stack direction="row" gap={1}>
            <Button
              type="button"
              startIcon={<Replay />}
              onClick={repetir}
            >
              Repetir
            </Button>
            <Button type="button" variant="contained" onClick={aceptar}>
              Usar esta foto
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" gap={1}>
            <Button
              type="button"
              startIcon={<Cameraswitch />}
              onClick={() =>
                setLado((l) => (l === "environment" ? "user" : "environment"))
              }
              disabled={!listo}
            >
              Girar
            </Button>
            <Button
              type="button"
              variant="contained"
              startIcon={<PhotoCamera />}
              onClick={disparar}
              disabled={!listo}
            >
              Tomar foto
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
}
