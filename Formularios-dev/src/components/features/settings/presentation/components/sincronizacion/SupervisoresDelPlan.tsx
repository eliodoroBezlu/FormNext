"use client";

import { Box, Chip, FormControlLabel, Paper, Stack, Switch, Typography } from "@mui/material";
import type { VistaPrevia } from "../../../domain/models/sincronizacionTrabajadores";

interface Props {
  supervisores: VistaPrevia["supervisores"];
  aplicar: boolean;
  setAplicar: (valor: boolean) => void;
}

/** Quién gana o pierde el rol de supervisor en forms según el Portal IAM. */
export function SupervisoresDelPlan({ supervisores, aplicar, setAplicar }: Props) {
  const { ganan, pierden } = supervisores;
  if (ganan.length + pierden.length === 0) return null;

  const lista = (titulo: string, personas: typeof ganan, color: "success" | "warning") =>
    personas.length > 0 && (
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {titulo}
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {personas.map((p) => (
            <Chip key={`${p.idIam}-${p.nomina}`} size="small" color={color} variant="outlined" label={p.nomina} />
          ))}
        </Stack>
      </Box>
    );

  return (
    <Paper variant="outlined" component="section" aria-labelledby="grupo-supervisores" sx={{ mb: 2, px: 2, py: 1.5 }}>
      <Typography id="grupo-supervisores" variant="subtitle1" component="h3" sx={{ fontWeight: 600 }}>
        Supervisores
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Quién figura como supervisor en forms (responsables de cierre, aprobaciones) según su rol en el Portal IAM.
      </Typography>
      {lista("Pasan a ser supervisores", ganan, "success")}
      {lista("Dejan de ser supervisores", pierden, "warning")}
      <FormControlLabel
        sx={{ mt: 1 }}
        control={<Switch checked={aplicar} onChange={(e) => setAplicar(e.target.checked)} />}
        label="Actualizar supervisores"
      />
    </Paper>
  );
}
