"use client";

import { Alert, Box, Paper, Typography } from "@mui/material";
import { CheckCircleOutline, ErrorOutline } from "@mui/icons-material";
import type {
  ResultadoDeAplicar,
  Resumen,
  TipoDeItem,
} from "../../../domain/models/sincronizacionTrabajadores";

const ACCION: Record<TipoDeItem, string> = {
  nuevo: "Agregado",
  cambio: "Actualizado",
  baja: "Dado de baja",
  problema: "",
};

interface Props {
  resultado: ResultadoDeAplicar;
  resumen: Resumen;
}

/** Qué se hizo con cada ficha elegida; los que fallaron, primero. */
export function ResultadoSincronizacion({ resultado, resumen }: Props) {
  const ordenados = [...resultado.resultados].sort((a, b) => Number(a.ok) - Number(b.ok));

  return (
    <Box>
      <Alert severity={resumen.severidad} sx={{ mb: 2 }} role="status">
        {resumen.mensaje}
      </Alert>

      {ordenados.length > 0 && (
        <Paper variant="outlined">
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {ordenados.map((r) => (
              <Box
                component="li"
                key={r.idIam}
                sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", px: 2, py: 1, borderBottom: 1, borderColor: "divider", "&:last-child": { borderBottom: 0 } }}
              >
                {r.ok ? (
                  <CheckCircleOutline color="success" aria-hidden sx={{ mt: 0.25 }} />
                ) : (
                  <ErrorOutline color="error" aria-hidden sx={{ mt: 0.25 }} />
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {r.nomina}
                  </Typography>
                  <Typography variant="body2" color={r.ok ? "text.secondary" : "error.main"}>
                    {r.ok ? ACCION[r.tipo] : `No se pudo aplicar: ${r.error ?? "error desconocido"}`}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
