"use client";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography } from "@mui/material";
import type { Equipo } from "../../domain/models/Equipo";

const comoTexto = (v: unknown) => (v === true ? "Sí" : v === false ? "No" : v ? String(v) : "—");

/** Los datos técnicos de un equipo, de solo lectura. */
export function DialogoEspecificaciones({ equipo, onCerrar }: { equipo: Equipo | null; onCerrar: () => void }) {
  return (
    <Dialog open={!!equipo} onClose={onCerrar} maxWidth="xs" fullWidth>
      <DialogTitle>Datos técnicos — {equipo?.codigo}</DialogTitle>
      <DialogContent dividers>
        {equipo && (
          <Box display="flex" flexDirection="column" gap={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {equipo.tipo_equipo}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {equipo.descripcion}
              </Typography>
            </Box>
            <Divider />
            {Object.entries(equipo.especificaciones ?? {}).map(([k, v]) => (
              <Box key={k} display="flex" justifyContent="space-between" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  {k}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {comoTexto(v)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCerrar}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
