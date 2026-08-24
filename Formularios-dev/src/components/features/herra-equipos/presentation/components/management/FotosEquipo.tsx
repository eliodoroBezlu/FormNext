"use client";

import React, { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddPhotoAlternate,
  ArrowBack,
  ArrowForward,
  Delete,
} from "@mui/icons-material";
import Image from "next/image";
import { subirFotoEquipo, type FotoEquipo } from "@/lib/actions/equipo-actions";

/** Una foto de móvil ronda los 3–8 MB; por encima de esto no es una foto. */
const TAMANO_MAXIMO = 10 * 1024 * 1024;

const TIPOS_ACEPTADOS = ["image/jpeg", "image/png", "image/webp"];

interface FotosEquipoProps {
  fotos: FotoEquipo[];
  onChange: (fotos: FotoEquipo[]) => void;
  readonly?: boolean;
}

/**
 * Gestiona las fotos de un equipo del inventario.
 *
 * El **orden importa**: la primera es la portada, la que se ve en los listados
 * y en el selector de préstamo. Por eso hay flechas para reordenar y no un
 * simple «marcar como principal» — mover la que se quiere de portada al primer
 * puesto también decide el resto del orden, que es lo que se muestra al abrir
 * el equipo.
 */
export function FotosEquipo({
  fotos,
  onChange,
  readonly = false,
}: FotosEquipoProps) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const elegirArchivos = async (lista: FileList | null) => {
    if (!lista || lista.length === 0) return;
    setError(null);
    setSubiendo(true);

    const subidas: FotoEquipo[] = [];
    const rechazadas: string[] = [];

    for (const archivo of Array.from(lista)) {
      if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
        rechazadas.push(`${archivo.name}: solo se admiten JPG, PNG o WebP`);
        continue;
      }
      if (archivo.size > TAMANO_MAXIMO) {
        rechazadas.push(
          `${archivo.name}: pesa ${Math.round(archivo.size / 1024 / 1024)} MB y el máximo son 10 MB`,
        );
        continue;
      }

      try {
        const datos = new FormData();
        datos.append("file", archivo);
        const subida = await subirFotoEquipo(datos);
        subidas.push({
          url: subida.url,
          nombre: archivo.name,
          mime: subida.mimetype,
          tamano: subida.size,
        });
      } catch {
        rechazadas.push(`${archivo.name}: no se pudo subir`);
      }
    }

    // Las que sí subieron se conservan aunque otras fallen: repetir todo el
    // lote por un archivo malo es tiempo perdido.
    if (subidas.length > 0) onChange([...fotos, ...subidas]);
    if (rechazadas.length > 0) setError(rechazadas.join(" · "));

    setSubiendo(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const quitar = (indice: number) =>
    onChange(fotos.filter((_, i) => i !== indice));

  const mover = (indice: number, salto: number) => {
    const destino = indice + salto;
    if (destino < 0 || destino >= fotos.length) return;
    const copia = [...fotos];
    [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
    onChange(copia);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Fotos
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {fotos.length === 0
            ? "sin fotos"
            : `${fotos.length} · la primera es la portada`}
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
        {fotos.map((foto, indice) => (
          <Box
            key={`${foto.url}-${indice}`}
            sx={{
              position: "relative",
              width: 132,
              borderRadius: 1,
              overflow: "hidden",
              border: (t) =>
                `2px solid ${indice === 0 ? t.palette.primary.main : t.palette.divider}`,
            }}
          >
            <Box sx={{ position: "relative", width: "100%", height: 100 }}>
              <Image
                src={foto.url}
                alt={foto.nombre ?? `Foto ${indice + 1}`}
                fill
                sizes="132px"
                style={{ objectFit: "cover" }}
                unoptimized
              />
            </Box>

            {indice === 0 && (
              <Chip
                label="Portada"
                size="small"
                color="primary"
                sx={{
                  position: "absolute",
                  top: 4,
                  left: 4,
                  height: 20,
                  fontSize: "0.65rem",
                }}
              />
            )}

            {!readonly && (
              <Box
                display="flex"
                justifyContent="space-between"
                sx={{ px: 0.5, py: 0.25 }}
              >
                <Box>
                  <Tooltip title="Mover antes">
                    <span>
                      <IconButton
                        size="small"
                        type="button"
                        disabled={indice === 0}
                        onClick={() => mover(indice, -1)}
                      >
                        <ArrowBack fontSize="inherit" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Mover después">
                    <span>
                      <IconButton
                        size="small"
                        type="button"
                        disabled={indice === fotos.length - 1}
                        onClick={() => mover(indice, 1)}
                      >
                        <ArrowForward fontSize="inherit" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
                <Tooltip title="Quitar">
                  <IconButton
                    size="small"
                    type="button"
                    color="error"
                    onClick={() => quitar(indice)}
                  >
                    <Delete fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {!readonly && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={TIPOS_ACEPTADOS.join(",")}
            multiple
            hidden
            onChange={(e) => void elegirArchivos(e.target.files)}
          />
          <Button
            type="button"
            variant="outlined"
            size="small"
            startIcon={
              subiendo ? <CircularProgress size={16} /> : <AddPhotoAlternate />
            }
            disabled={subiendo}
            onClick={() => inputRef.current?.click()}
          >
            {subiendo ? "Subiendo…" : "Añadir fotos"}
          </Button>
        </>
      )}
    </Box>
  );
}
