"use client";

import { useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { AddPhotoAlternate, ArrowBack, ArrowForward, Delete } from "@mui/icons-material";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ValoresReporte } from "../../domain/formularioReporte";
import type { ImagenSubida, UsoDeImagen } from "../../domain/models/Monitoreo";
import { CampoTexto, ImagenMonitoreo } from "./CamposReporte";

/** Las mismas que acepta el backend (\`MAX_ANEXOS\`). */
const MAX_ANEXOS = 24;

interface Props {
  soloLectura: boolean;
  subirImagen: (archivo: File, uso: UsoDeImagen) => Promise<ImagenSubida>;
  onError: (motivos: unknown) => void;
}

/**
 * ANEXOS: imágenes de más, que no entran en la recopilación. Se habilitan
 * solo si el reporte las necesita y salen al final del PDF, antes de las
 * firmas, con la misma grilla que las fotos.
 */
export function SeccionAnexos({ soloLectura, subirImagen, onError }: Props) {
  const { control } = useFormContext<ValoresReporte>();
  const { fields, append, remove, swap } = useFieldArray({ control, name: "anexos" });
  const [habilitado, setHabilitado] = useState(fields.length > 0);
  const [subiendo, setSubiendo] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);
  const visible = habilitado || fields.length > 0;

  // En solo lectura y sin anexos no hay nada que mostrar.
  if (soloLectura && fields.length === 0) return null;

  const subir = async (archivos: FileList | null) => {
    if (!archivos?.length) return;
    const lista = Array.from(archivos).slice(0, MAX_ANEXOS - fields.length);
    setSubiendo(true);
    try {
      for (const archivo of lista) {
        const { archivo: nombre, ancho, alto } = await subirImagen(archivo, "foto");
        append({ archivo: nombre, descripcion: "", referencia: false, ancho, alto });
      }
    } catch (e) {
      onError(e);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} flexWrap="wrap">
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Anexos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Imágenes de más. Van al final del reporte, antes de las firmas.
          </Typography>
        </Box>
        {!soloLectura && (
          <FormControlLabel
            label="Este reporte lleva anexos"
            control={
              <Switch
                checked={visible}
                // Con imágenes cargadas no se apaga: primero hay que quitarlas.
                disabled={fields.length > 0}
                onChange={(e) => setHabilitado(e.target.checked)}
              />
            }
          />
        )}
      </Stack>

      {visible && (
        <Box mt={2}>
          {!soloLectura && (
            <>
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
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                startIcon={subiendo ? <CircularProgress size={16} /> : <AddPhotoAlternate />}
                disabled={subiendo || fields.length >= MAX_ANEXOS}
                onClick={() => entrada.current?.click()}
              >
                Agregar imágenes ({fields.length} de {MAX_ANEXOS})
              </Button>
            </>
          )}

          <Grid container spacing={2}>
            {fields.map((f, i) => (
              <Grid key={f.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 1 }}>
                  <ImagenMonitoreo archivo={f.archivo} alt={`Anexo ${i + 1}`} />
                  <Box mt={1}>
                    <CampoTexto
                      nombre={`anexos.${i}.descripcion`}
                      label={`Descripción del anexo ${i + 1}`}
                      multiline
                      soloLectura={soloLectura}
                    />
                  </Box>
                  {!soloLectura && (
                    <Stack direction="row" justifyContent="flex-end">
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
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  );
}
