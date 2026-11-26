"use client";

import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add, AddPhotoAlternate, Delete } from "@mui/icons-material";
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { MAX_DIAGRAMAS, MAX_PIEZAS_MEDICION } from "../../domain/espesores";
import type { EntradaCatalogo, ImagenSubida, PlantillaMedicion } from "../../domain/models/Monitoreo";
import {
  celdasDeValores,
  PIEZA_VACIA,
  valoresDePlantilla,
  type ValoresPlantilla,
} from "../../domain/plantillaMedicion";
import { motivosDeError } from "../../infrastructure/adapters/monitoreoAdapter";
import { ImagenMonitoreo } from "./CamposReporte";
import { EditorPiezaMedicion } from "./EditorPiezaMedicion";

interface Props {
  /** `null`: una plantilla nueva. */
  plantilla: PlantillaMedicion | null;
  tecnicas: EntradaCatalogo[];
  onCerrar: () => void;
  guardar: (v: ValoresPlantilla, id?: string) => Promise<string[] | null>;
  subirDiagrama: (archivo: File) => Promise<ImagenSubida>;
}

/** La técnica que se mide con grilla: la que se sugiere en una plantilla nueva. */
const TECNICA_SUGERIDA = "ULTRASONIDO ACTIVO";

/**
 * La grilla con que se mide un tag con una técnica: piezas, zonas, anillos y
 * puntos, y los diagramas del equipo. Los reportes ya creados conservan la
 * suya: cambiar esta solo afecta a los nuevos.
 */
export function EditorPlantillaMedicion({ plantilla, tecnicas, onCerrar, guardar, subirDiagrama }: Props) {
  const sugerida = tecnicas.some((t) => t.valor === TECNICA_SUGERIDA) ? TECNICA_SUGERIDA : "";
  const metodos = useForm<ValoresPlantilla>({
    defaultValues: valoresDePlantilla(plantilla, sugerida),
    mode: "onTouched",
  });
  const { control, handleSubmit, formState } = metodos;
  const piezas = useFieldArray({ control, name: "piezas" });
  const diagramas = useFieldArray({ control, name: "diagramas" });
  const [errores, setErrores] = useState<string[] | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);
  const puntos = celdasDeValores(useWatch({ control, name: "piezas" }));

  const onGuardar = async (v: ValoresPlantilla) => {
    setErrores(null);
    const motivos = await guardar(v, plantilla?._id);
    if (motivos) setErrores(motivos);
    else onCerrar();
  };

  const onInvalido = () => {
    setErrores(["Revise los campos marcados."]);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>('[data-question-error="true"]')
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }),
    );
  };

  const subir = async (archivos: FileList | null) => {
    if (!archivos?.length) return;
    setSubiendo(true);
    try {
      for (const archivo of Array.from(archivos).slice(0, MAX_DIAGRAMAS - diagramas.fields.length)) {
        const { archivo: nombre, ancho, alto } = await subirDiagrama(archivo);
        diagramas.append({ archivo: nombre, descripcion: "", ancho, alto });
      }
    } catch (e) {
      setErrores(motivosDeError(e));
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <Dialog open onClose={onCerrar} maxWidth="md" fullWidth scroll="paper">
      <FormProvider {...metodos}>
        <Box component="form" noValidate onSubmit={handleSubmit(onGuardar, onInvalido)}>
          <DialogTitle>
            {plantilla ? `Plantilla de ${plantilla.tag} · ${plantilla.tecnica}` : "Nueva plantilla de medición"}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} mb={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="tag"
                  control={control}
                  rules={{ required: "Escriba el TAG" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="TAG"
                      size="small"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message ?? "Puede no ser una bomba"}
                      data-question-error={fieldState.error ? "true" : undefined}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <Controller
                  name="tecnica"
                  control={control}
                  rules={{ required: "Elija la técnica" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      select
                      label="Técnica"
                      size="small"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message ?? "El reporte con este TAG y esta técnica usa la grilla"}
                    >
                      {tecnicas.map((t) => (
                        <MenuItem key={t._id} value={t.valor}>
                          {t.valor}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={12}>
                <Controller
                  name="titulo"
                  control={control}
                  rules={{ required: "Escriba el título de la tabla" }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Título de la tabla"
                      placeholder="Medición de espesores en el muestreador 250SA225 L2"
                      size="small"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" fontWeight={700}>
                Diagramas del equipo
              </Typography>
              <input
                ref={entrada}
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => {
                  void subir(e.target.files);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                size="small"
                startIcon={subiendo ? <CircularProgress size={16} /> : <AddPhotoAlternate />}
                disabled={subiendo || diagramas.fields.length >= MAX_DIAGRAMAS}
                onClick={() => entrada.current?.click()}
              >
                Agregar diagrama
              </Button>
            </Stack>
            <Grid container spacing={2} mb={3}>
              {diagramas.fields.length === 0 && (
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">
                    Los dibujos con las piezas y los puntos (A, B, C…) que se miden.
                  </Typography>
                </Grid>
              )}
              {diagramas.fields.map((d, i) => (
                <Grid key={d.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <ImagenMonitoreo archivo={d.archivo} alt={`Diagrama ${i + 1}`} />
                  <Stack direction="row" alignItems="center" mt={1}>
                    <Controller
                      name={`diagramas.${i}.descripcion`}
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Descripción" size="small" fullWidth />
                      )}
                    />
                    <IconButton type="button" aria-label="Quitar diagrama" onClick={() => diagramas.remove(i)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </Grid>
              ))}
            </Grid>

            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" fontWeight={700}>
                Piezas ({piezas.fields.length}) · {puntos} puntos por medición
              </Typography>
            </Stack>
            <Stack gap={2}>
              {piezas.fields.map((p, i) => (
                <EditorPiezaMedicion
                  key={p.id}
                  indice={i}
                  total={piezas.fields.length}
                  onQuitar={() => piezas.remove(i)}
                  onMover={(hacia) => piezas.move(i, i + hacia)}
                />
              ))}
            </Stack>
            <Button
              type="button"
              startIcon={<Add />}
              sx={{ mt: 2 }}
              disabled={piezas.fields.length >= MAX_PIEZAS_MEDICION}
              onClick={() => piezas.append({ ...PIEZA_VACIA, zonas: [...PIEZA_VACIA.zonas] })}
            >
              Agregar pieza
            </Button>

            {errores && (
              <Alert severity="error" sx={{ mt: 2 }} onClose={() => setErrores(null)}>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {errores.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </Box>
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button type="button" onClick={onCerrar}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={formState.isSubmitting}>
              Guardar
            </Button>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
}
