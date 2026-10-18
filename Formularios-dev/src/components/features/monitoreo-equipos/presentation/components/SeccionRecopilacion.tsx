"use client";

import { useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddPhotoAlternate,
  ArrowBack,
  ArrowForward,
  Delete,
  ShowChart,
} from "@mui/icons-material";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { ValoresReporte } from "../../domain/formularioReporte";
import type { ImagenSubida, UsoDeImagen } from "../../domain/models/Monitoreo";
import { CampoTexto, ImagenMonitoreo } from "./CamposReporte";
import { VistaPreviaFotos } from "./VistaPreviaFotos";

/** El formato trae a lo sumo una página de fotos; 12 sobran. */
const MAX_FOTOS = 12;
/** 21,9 × 7,16 cm: la caja del gráfico de PI en el formato. */
const PROPORCION_GRAFICO = "21.9 / 7.16";

interface Props {
  soloLectura: boolean;
  fotosPorFila: number;
  subirImagen: (archivo: File, uso: UsoDeImagen) => Promise<ImagenSubida>;
  onError: (motivos: unknown) => void;
}

/** RECOPILACIÓN Y TABULACIÓN DE DATOS: fotos con su descripción y el gráfico. */
export function SeccionRecopilacion({ soloLectura, fotosPorFila, subirImagen, onError }: Props) {
  const { control, setValue } = useFormContext<ValoresReporte>();
  const { fields, append, remove, swap } = useFieldArray({ control, name: "fotos" });
  const fotos = useWatch({ control, name: "fotos" });
  const grafico = useWatch({ control, name: "grafico" });
  const [subiendo, setSubiendo] = useState<UsoDeImagen | null>(null);
  const entradaFotos = useRef<HTMLInputElement>(null);
  const entradaGrafico = useRef<HTMLInputElement>(null);

  const subirFotos = async (archivos: FileList | null) => {
    if (!archivos?.length) return;
    const lista = Array.from(archivos).slice(0, MAX_FOTOS - fields.length);
    setSubiendo("foto");
    try {
      // Una por una: en orden, y si una falla las anteriores ya quedaron.
      for (const archivo of lista) {
        const { archivo: nombre, ancho, alto } = await subirImagen(archivo, "foto");
        append({ archivo: nombre, descripcion: "", referencia: false, ancho, alto });
      }
    } catch (e) {
      onError(e);
    } finally {
      setSubiendo(null);
    }
  };

  const subirGrafico = async (archivos: FileList | null) => {
    const archivo = archivos?.[0];
    if (!archivo) return;
    setSubiendo("grafico");
    try {
      const { archivo: nombre, ancho, alto } = await subirImagen(archivo, "grafico");
      setValue(
        "grafico",
        { archivo: nombre, descripcion: grafico?.descripcion ?? "", referencia: false, ancho, alto },
        { shouldDirty: true },
      );
    } catch (e) {
      onError(e);
    } finally {
      setSubiendo(null);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={700}>
          Recopilación y tabulación de datos
        </Typography>
        {!soloLectura && (
          <>
            <input
              ref={entradaFotos}
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => {
                void subirFotos(e.target.files);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={subiendo === "foto" ? <CircularProgress size={16} /> : <AddPhotoAlternate />}
              disabled={subiendo !== null || fields.length >= MAX_FOTOS}
              onClick={() => entradaFotos.current?.click()}
            >
              Agregar fotos
            </Button>
          </>
        )}
      </Stack>

      {fields.length === 0 && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Sin fotos. Cada foto lleva su descripción debajo, en la misma página.
        </Typography>
      )}

      <Grid container spacing={2} mb={2}>
        {fields.map((f, i) => (
          <Grid key={f.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 1 }}>
              <ImagenMonitoreo archivo={f.archivo} alt={`Foto ${i + 1}`} />
              <Box mt={1}>
                <CampoTexto
                  nombre={`fotos.${i}.descripcion`}
                  label={`Descripción de la foto ${i + 1}`}
                  multiline
                  soloLectura={soloLectura}
                />
              </Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Controller
                  name={`fotos.${i}.referencia`}
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      label="Foto de referencia"
                      control={
                        <Checkbox
                          size="small"
                          checked={!!field.value}
                          disabled={soloLectura}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                    />
                  )}
                />
                {!soloLectura && (
                  <Stack direction="row">
                    <Tooltip title="Antes">
                      <span>
                        <IconButton type="button" size="small" disabled={i === 0} onClick={() => swap(i, i - 1)}>
                          <ArrowBack fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Después">
                      <span>
                        <IconButton
                          type="button"
                          size="small"
                          disabled={i === fields.length - 1}
                          onClick={() => swap(i, i + 1)}
                        >
                          <ArrowForward fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Quitar">
                      <IconButton type="button" size="small" onClick={() => remove(i)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <VistaPreviaFotos fotos={fotos ?? []} fotosPorFila={fotosPorFila} />

      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={3} mb={1}>
        <Typography variant="body2" fontWeight={600}>
          Gráfico (ancho completo)
        </Typography>
        {!soloLectura && (
          <Stack direction="row" gap={1}>
            <input
              ref={entradaGrafico}
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                void subirGrafico(e.target.files);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              size="small"
              variant="outlined"
              startIcon={subiendo === "grafico" ? <CircularProgress size={16} /> : <ShowChart />}
              disabled={subiendo !== null}
              onClick={() => entradaGrafico.current?.click()}
            >
              {grafico ? "Reemplazar" : "Subir gráfico"}
            </Button>
            {grafico && (
              <Button
                type="button"
                size="small"
                color="error"
                onClick={() => setValue("grafico", null, { shouldDirty: true })}
              >
                Quitar
              </Button>
            )}
          </Stack>
        )}
      </Stack>
      {grafico ? (
        <>
          <ImagenMonitoreo archivo={grafico.archivo} alt="Gráfico" proporcion={PROPORCION_GRAFICO} />
          <Box mt={1}>
            <CampoTexto nombre="grafico.descripcion" label="Descripción del gráfico" soloLectura={soloLectura} />
          </Box>
        </>
      ) : (
        <Box
          sx={{
            aspectRatio: PROPORCION_GRAFICO,
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Captura de PI · 21,9 × 7,16 cm
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
