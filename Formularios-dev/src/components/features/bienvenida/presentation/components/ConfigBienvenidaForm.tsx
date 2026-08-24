"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Delete, Image as ImagenIcon } from "@mui/icons-material";
import { bienvenidaAdapter } from "../../infrastructure/adapters/bienvenidaAdapter";
import { PantallaBienvenida } from "./PantallaBienvenida";
import {
  BIENVENIDA_POR_DEFECTO,
  CATALOGO_ANIMACIONES,
  resolver,
  type BienvenidaDeArea,
  type ClaveAnimacion,
  type ConfigBienvenida,
} from "../../domain/models/Bienvenida";

/** Área con la que se previsualiza; vacío = el mensaje general. */
const SIN_AREA = "";

/**
 * El backend solo acepta imágenes de Cloudinary, y no por capricho: es el
 * único host externo que permite la CSP del frontend (`img-src`). Guardar otra
 * URL sería guardar un enlace que el navegador va a bloquear.
 *
 * Se comprueba también aquí para decirlo mientras se escribe, en vez de
 * esperar al error del servidor al guardar.
 */
const esUrlDeCloudinary = (url?: string): boolean => {
  if (!url) return false;
  try {
    return new URL(url).hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
};

/**
 * Configuración de la pantalla de bienvenida.
 *
 * La vista previa no es un extra: elegir una animación a ciegas y tener que
 * cerrar sesión para verla es la fricción que hace que nadie use la pantalla.
 * Y usa **el mismo componente** que la de verdad, así que lo que se ve aquí es
 * exactamente lo que va a salir.
 */
export function ConfigBienvenidaForm() {
  const [config, setConfig] = useState<ConfigBienvenida>(BIENVENIDA_POR_DEFECTO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [areaPrevia, setAreaPrevia] = useState(SIN_AREA);
  const [subiendo, setSubiendo] = useState(false);
  /** Instantánea de lo último confirmado por el servidor, para detectar cambios. */
  const [guardado, setGuardado] = useState("");
  const entradaArchivo = useRef<HTMLInputElement>(null);

  /**
   * Sube la imagen y guarda **solo la URL** que devuelve Cloudinary. El
   * archivo no pasa por nuestra base: lo que se almacena es un enlace.
   */
  const subirLogo = async (archivo?: File) => {
    if (!archivo) return;
    setSubiendo(true);
    setError(null);
    try {
      cambiar("logoUrl", await bienvenidaAdapter.subirLogo(archivo));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    } finally {
      setSubiendo(false);
      // Sin esto, volver a elegir el mismo archivo no dispara `onChange`.
      if (entradaArchivo.current) entradaArchivo.current.value = "";
    }
  };

  useEffect(() => {
    let vigente = true;

    // Se lee `crudo` y no el endpoint público: éste caduca los mensajes fuera
    // de vigencia, y editar uno caducado lo borraría sin querer al guardar.
    bienvenidaAdapter
      .obtenerCrudo()
      .then((c) => {
        if (!vigente) return;
        setConfig(c);
        setGuardado(JSON.stringify(c));
      })
      .catch((e: unknown) => {
        if (vigente) setError(e instanceof Error ? e.message : "No se pudo cargar.");
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  const cambiar = <C extends keyof ConfigBienvenida>(
    campo: C,
    valor: ConfigBienvenida[C],
  ) => setConfig((prev) => ({ ...prev, [campo]: valor }));

  const cambiarArea = (indice: number, cambios: Partial<BienvenidaDeArea>) =>
    setConfig((prev) => ({
      ...prev,
      porArea: prev.porArea.map((a, i) =>
        i === indice ? { ...a, ...cambios } : a,
      ),
    }));

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      // Se descartan las filas de área sin nombre: el backend las rechazaría
      // y es mejor no mandar algo que ya se sabe inválido.
      const limpio = {
        ...config,
        porArea: config.porArea.filter((a) => a.area.trim()),
        consejos: config.consejos.filter((c) => c.trim()),
        // Un campo vacío se manda como ausente, no como `""`: hay validaciones
        // —la del logotipo— que aceptan que no venga pero rechazan la cadena
        // vacía, y eso tumbaba el guardado entero.
        logoUrl: config.logoUrl?.trim() || undefined,
      };
      const confirmado = await bienvenidaAdapter.guardar(limpio);
      setConfig(confirmado);
      setGuardado(JSON.stringify(confirmado));
      setAviso("Configuración guardada.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <Typography color="text.secondary">Cargando configuración…</Typography>;
  }

  const previa = resolver(config, areaPrevia || undefined);

  /**
   * ¿Hay algo escrito que todavía no está en la base?
   *
   * Subir el logotipo lo deja en la pantalla y en la vista previa, pero no lo
   * guarda: hace falta pulsar «Guardar». Sin decirlo, es fácil salir creyendo
   * que ya está puesto y encontrarse con que no aparece al entrar.
   */
  const haycambios = JSON.stringify(config) !== guardado;

  return (
    <Box sx={{ maxWidth: 1100 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ── Ajustes ── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.activa}
                  onChange={(e) => cambiar("activa", e.target.checked)}
                />
              }
              label="Mostrar la pantalla de bienvenida"
            />

            <TextField
              fullWidth
              label="Mensaje"
              value={config.mensaje}
              onChange={(e) => cambiar("mensaje", e.target.value)}
              slotProps={{ htmlInput: { maxLength: 120 } }}
              helperText="Lo que se lee en grande. Corto: se ve un segundo."
            />

            <TextField
              fullWidth
              label="Submensaje (opcional)"
              value={config.submensaje ?? ""}
              onChange={(e) => cambiar("submensaje", e.target.value)}
              slotProps={{ htmlInput: { maxLength: 200 } }}
            />

            <TextField
              select
              fullWidth
              label="Animación"
              value={config.animacion}
              onChange={(e) =>
                cambiar("animacion", e.target.value as ClaveAnimacion)
              }
              helperText={
                CATALOGO_ANIMACIONES.find((a) => a.clave === config.animacion)
                  ?.descripcion
              }
            >
              {CATALOGO_ANIMACIONES.map((a) => (
                <MenuItem key={a.clave} value={a.clave}>
                  {a.etiqueta}
                </MenuItem>
              ))}
            </TextField>

            {/*
              El logo solo aparece cuando la animación elegida lo usa: un campo
              que no afecta a nada es ruido, y peor, hace pensar que sí.
            */}
            {config.animacion === "logo" && (
              <Box>
                <TextField
                  fullWidth
                  label="URL del logotipo"
                  placeholder="https://res.cloudinary.com/…/logo.png"
                  value={config.logoUrl ?? ""}
                  onChange={(e) => cambiar("logoUrl", e.target.value)}
                  error={Boolean(config.logoUrl) && !esUrlDeCloudinary(config.logoUrl)}
                  helperText={
                    Boolean(config.logoUrl) && !esUrlDeCloudinary(config.logoUrl)
                      ? "Debe ser una imagen de res.cloudinary.com: es el único host que permite la política de seguridad del sistema."
                      : "Pegue un enlace o suba la imagen desde su equipo."
                  }
                />

                {/* Mismo patrón que el constructor de formularios: o pega la
                    URL, o sube el archivo y la URL se rellena sola. */}
                {/*
                  Los formatos van explícitos y no como `image/*`: así el
                  selector no ofrece cosas que aquí no sirven (BMP, TIFF) y
                  queda claro que el SVG sí vale.
                */}
                <input
                  ref={entradaArchivo}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  hidden
                  onChange={(e) => void subirLogo(e.target.files?.[0])}
                />
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<ImagenIcon />}
                  disabled={subiendo}
                  sx={{ mt: 1 }}
                  onClick={() => entradaArchivo.current?.click()}
                >
                  {subiendo ? "Subiendo…" : "Subir imagen (PNG, JPG, SVG o WebP · máx 5 MB)"}
                </Button>

                {!config.logoUrl && !subiendo && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Eligió «Logotipo» pero no hay imagen configurada: se mostrará
                    el círculo de siempre.
                  </Alert>
                )}
              </Box>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                type="number"
                label="Tiempo mínimo (ms)"
                value={config.duracionMinimaMs}
                onChange={(e) =>
                  cambiar("duracionMinimaMs", Number(e.target.value))
                }
                helperText="Evita el parpadeo si la sesión abre muy rápido"
              />
              <TextField
                type="number"
                label="Aviso de tardanza (ms)"
                value={config.duracionMaximaMs}
                onChange={(e) =>
                  cambiar("duracionMaximaMs", Number(e.target.value))
                }
                helperText="Pasado esto, la pantalla avisa de que va lento"
              />
            </Stack>

            <Divider />

            {/* ── Consejos ── */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Consejos de seguridad
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Se muestra uno al azar. Es el único momento del día en que todos
                miran la misma pantalla.
              </Typography>

              <Stack spacing={1} sx={{ mt: 1.5 }}>
                {config.consejos.map((c, i) => (
                  <Stack direction="row" spacing={1} key={i}>
                    <TextField
                      fullWidth
                      size="small"
                      value={c}
                      onChange={(e) =>
                        cambiar(
                          "consejos",
                          config.consejos.map((x, j) =>
                            j === i ? e.target.value : x,
                          ),
                        )
                      }
                    />
                    <IconButton
                      type="button"
                      aria-label="Quitar consejo"
                      onClick={() =>
                        cambiar(
                          "consejos",
                          config.consejos.filter((_, j) => j !== i),
                        )
                      }
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
                <Button
                  type="button"
                  size="small"
                  startIcon={<Add />}
                  sx={{ alignSelf: "flex-start" }}
                  onClick={() => cambiar("consejos", [...config.consejos, ""])}
                >
                  Añadir consejo
                </Button>
              </Stack>
            </Box>

            <Divider />

            {/* ── Por área ── */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Mensaje por área
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Lo que no se rellene aquí usa el mensaje y la animación
                generales.
              </Typography>

              <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                {config.porArea.map((a, i) => (
                  <Paper variant="outlined" sx={{ p: 1.5 }} key={i}>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          size="small"
                          label="Área"
                          value={a.area}
                          onChange={(e) =>
                            cambiarArea(i, { area: e.target.value })
                          }
                          sx={{ minWidth: 160 }}
                        />
                        <TextField
                          select
                          size="small"
                          label="Animación"
                          value={a.animacion ?? ""}
                          onChange={(e) =>
                            cambiarArea(i, {
                              animacion:
                                (e.target.value as ClaveAnimacion) || undefined,
                            })
                          }
                          sx={{ minWidth: 160 }}
                        >
                          <MenuItem value="">La general</MenuItem>
                          {CATALOGO_ANIMACIONES.map((o) => (
                            <MenuItem key={o.clave} value={o.clave}>
                              {o.etiqueta}
                            </MenuItem>
                          ))}
                        </TextField>
                        <IconButton
                          type="button"
                          aria-label="Quitar área"
                          onClick={() =>
                            cambiar(
                              "porArea",
                              config.porArea.filter((_, j) => j !== i),
                            )
                          }
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                      <TextField
                        fullWidth
                        size="small"
                        label="Mensaje del área"
                        value={a.mensaje ?? ""}
                        onChange={(e) =>
                          cambiarArea(i, { mensaje: e.target.value })
                        }
                      />
                    </Stack>
                  </Paper>
                ))}
                <Button
                  type="button"
                  size="small"
                  startIcon={<Add />}
                  sx={{ alignSelf: "flex-start" }}
                  onClick={() =>
                    cambiar("porArea", [...config.porArea, { area: "" }])
                  }
                >
                  Añadir área
                </Button>
              </Stack>
            </Box>

            <Divider />

            {/* ── Mantenimiento ── */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.mantenimiento.activo}
                    onChange={(e) =>
                      cambiar("mantenimiento", {
                        ...config.mantenimiento,
                        activo: e.target.checked,
                      })
                    }
                  />
                }
                label="Modo mantenimiento"
              />
              {config.mantenimiento.activo && (
                <>
                  <Alert severity="warning" sx={{ mb: 1.5 }}>
                    Con esto activo, el aviso pisa cualquier otro mensaje. No
                    impide entrar: solo informa.
                  </Alert>
                  <TextField
                    fullWidth
                    size="small"
                    label="Aviso de mantenimiento"
                    value={config.mantenimiento.mensaje ?? ""}
                    onChange={(e) =>
                      cambiar("mantenimiento", {
                        ...config.mantenimiento,
                        mensaje: e.target.value,
                      })
                    }
                  />
                </>
              )}
            </Box>

            <Button
              type="button"
              variant="contained"
              size="large"
              disabled={guardando || !haycambios}
              onClick={() => void guardar()}
            >
              {guardando
                ? "Guardando…"
                : haycambios
                  ? "Guardar cambios"
                  : "Guardado"}
            </Button>
          </Stack>
        </Grid>

        {/* ── Vista previa ── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ position: "sticky", top: 16 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Vista previa
              </Typography>
              <TextField
                select
                size="small"
                value={areaPrevia}
                onChange={(e) => setAreaPrevia(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value={SIN_AREA}>General</MenuItem>
                {config.porArea
                  .filter((a) => a.area.trim())
                  .map((a) => (
                    <MenuItem key={a.area} value={a.area}>
                      {a.area}
                    </MenuItem>
                  ))}
              </TextField>
            </Stack>

            <Paper variant="outlined" sx={{ overflow: "hidden" }}>
              <PantallaBienvenida contenido={previa} pantallaCompleta={false} />
            </Paper>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 1 }}
            >
              Es el mismo componente que se usa al entrar, así que lo que se ve
              aquí es lo que va a salir.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={!!aviso}
        autoHideDuration={4000}
        onClose={() => setAviso(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setAviso(null)}>
          {aviso}
        </Alert>
      </Snackbar>
    </Box>
  );
}
