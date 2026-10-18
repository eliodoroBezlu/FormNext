"use client";

import { useRef, useState } from "react";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { FactCheck, UploadFile } from "@mui/icons-material";
import type { ResultadoImportacion } from "../../domain/models/Monitoreo";

interface Props {
  revision: ResultadoImportacion | null;
  trabajando: boolean;
  onRevisar: (archivo: File) => void;
  onAplicar: (archivo: File) => void;
}

/**
 * La «Planilla de carga - bombas.xlsx»: primero se revisa (no escribe nada) y
 * solo si no hay problemas graves se aplica. Subirla de nuevo no duplica.
 */
export function CargaPlanilla({ revision, trabajando, onRevisar, onAplicar }: Props) {
  const entrada = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const graves = revision?.problemas.filter((p) => p.grave) ?? [];
  const avisos = revision?.problemas.filter((p) => !p.grave) ?? [];

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={700}>
        Planilla de carga de bombas
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Ficha, piezas instaladas e intervenciones de cada bomba. Primero se revisa; nada se
        escribe hasta aplicar.
      </Typography>

      <input
        ref={entrada}
        hidden
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={(e) => {
          const elegido = e.target.files?.[0] ?? null;
          setArchivo(elegido);
          if (elegido) onRevisar(elegido);
          e.target.value = "";
        }}
      />
      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
        <Button
          type="button"
          variant="outlined"
          startIcon={<UploadFile />}
          disabled={trabajando}
          onClick={() => entrada.current?.click()}
        >
          {archivo ? "Elegir otra planilla" : "Elegir planilla y revisar"}
        </Button>
        {archivo && (
          <Typography variant="body2" color="text.secondary">
            {archivo.name}
          </Typography>
        )}
      </Stack>

      {revision && (
        <Box mt={2}>
          <Alert severity={revision.aplicado ? "success" : graves.length ? "error" : "info"}>
            {revision.aplicado ? "Planilla aplicada. " : "Revisión: "}
            {revision.bombas.nuevas.length} bombas nuevas, {revision.bombas.actualizadas.length}{" "}
            actualizadas · piezas: {revision.componentes.nuevos} nuevas,{" "}
            {revision.componentes.reemplazados} reemplazadas, {revision.componentes.actualizados}{" "}
            actualizadas · intervenciones: {revision.intervenciones.nuevas} nuevas,{" "}
            {revision.intervenciones.actualizadas} actualizadas.
          </Alert>

          {graves.length > 0 && (
            <Alert severity="error" sx={{ mt: 1 }}>
              <strong>Hay que corregir la planilla antes de aplicarla:</strong>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {graves.map((p, i) => (
                  <li key={i}>
                    {p.hoja}
                    {p.fila ? `, fila ${p.fila}` : ""}: {p.mensaje}
                  </li>
                ))}
              </Box>
            </Alert>
          )}
          {avisos.length > 0 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <strong>Avisos (no impiden aplicar):</strong>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {avisos.map((p, i) => (
                  <li key={i}>
                    {p.hoja}
                    {p.fila ? `, fila ${p.fila}` : ""}: {p.mensaje}
                  </li>
                ))}
              </Box>
            </Alert>
          )}

          {!revision.aplicado && graves.length === 0 && archivo && (
            <Button
              type="button"
              variant="contained"
              startIcon={<FactCheck />}
              sx={{ mt: 2 }}
              disabled={trabajando}
              onClick={() => onAplicar(archivo)}
            >
              Aplicar la planilla
            </Button>
          )}
        </Box>
      )}
    </Paper>
  );
}
