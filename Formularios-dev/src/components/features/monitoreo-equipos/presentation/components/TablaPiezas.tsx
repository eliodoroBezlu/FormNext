"use client";

import { Box, Button, Grid, Paper, Stack, Typography } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  piezasDesdeAntecedentes,
  soloDigitos,
  type ValoresReporte,
} from "../../domain/formularioReporte";
import type { AntecedentesReporte, Catalogos } from "../../domain/models/Monitoreo";
import { CampoCatalogo, CampoTexto } from "./CamposReporte";

interface Props {
  antecedentes: AntecedentesReporte | null;
  catalogos: Catalogos;
  soloLectura: boolean;
}

const horas = (n?: number) => (n === undefined ? undefined : n.toLocaleString("es-BO"));

/**
 * Las cuatro piezas de desgaste, como salen en la tabla del reporte. Se
 * llenan solas con la ficha de la bomba; el analista completa o corrige, y lo
 * que deja vacío toma el dato de la ficha. Las horas vacías se calculan con
 * las horas del día.
 */
export function TablaPiezas({ antecedentes, catalogos, soloLectura }: Props) {
  const { control, setValue } = useFormContext<ValoresReporte>();
  const { fields } = useFieldArray({ control, name: "piezas" });
  const calculadas = new Map(
    (antecedentes?.componentes ?? []).map((c) => [c.pieza, c.horas_trabajo]),
  );

  return (
    <Box mt={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} gap={1}>
        <Box>
          <Typography variant="body2" fontWeight={600}>
            Piezas
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Vienen de la ficha de la bomba. Lo que deje vacío toma el dato de la ficha; las horas
            vacías se calculan con las horas del día. Al emitirse el reporte, lo que complete aquí
            queda en la ficha (una fecha de instalación nueva cuenta como cambio de pieza).
          </Typography>
        </Box>
        {!soloLectura && antecedentes && (
          <Button
            type="button"
            size="small"
            startIcon={<Refresh />}
            onClick={() =>
              setValue("piezas", piezasDesdeAntecedentes(antecedentes), { shouldDirty: true })
            }
          >
            Volver a la ficha
          </Button>
        )}
      </Stack>

      <Stack gap={1.5}>
        {fields.map((f, i) => (
          <Paper key={f.id} variant="outlined" sx={{ p: 1.5 }}>
            <Typography variant="body2" fontWeight={700} mb={1}>
              {f.pieza}
            </Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6, md: 2 }}>
                <CampoTexto
                  nombre={`piezas.${i}.fecha_instalacion`}
                  label="Fecha instalación"
                  type="date"
                  soloLectura={soloLectura}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <CampoCatalogo
                  nombre={`piezas.${i}.proveedor`}
                  etiqueta="Proveedor"
                  opciones={catalogos.proveedor}
                  soloLectura={soloLectura}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <CampoCatalogo
                  nombre={`piezas.${i}.condicion_inicial`}
                  etiqueta="Condición inicial"
                  opciones={catalogos.condicion_inicial}
                  soloLectura={soloLectura}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <CampoTexto nombre={`piezas.${i}.material`} label="Material" soloLectura={soloLectura} />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <CampoTexto
                  nombre={`piezas.${i}.horas_trabajo`}
                  label="Hrs. trabajo"
                  filtro={soloDigitos}
                  slotProps={{ htmlInput: { inputMode: "numeric" } }}
                  placeholder={horas(calculadas.get(f.pieza))}
                  helperText={
                    calculadas.get(f.pieza) !== undefined
                      ? `Calculadas: ${horas(calculadas.get(f.pieza))}`
                      : "Vacío: se calculan"
                  }
                  soloLectura={soloLectura}
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
