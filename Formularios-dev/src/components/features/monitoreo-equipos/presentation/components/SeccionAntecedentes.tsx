"use client";

import NextLink from "next/link";
import {
  Alert,
  Box,
  Grid,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { AntecedentesReporte, Catalogos } from "../../domain/models/Monitoreo";
import { CampoCatalogo, CampoTexto, formatearDia } from "./CamposReporte";

interface Props {
  antecedentes: AntecedentesReporte | null;
  catalogos: Catalogos;
  soloLectura: boolean;
  /** Las horas cambian los cálculos: al salir del campo se vuelven a pedir. */
  onCambioDeHoras: () => void;
}

const num = (n?: number, unidad = "") =>
  n === undefined ? "—" : `${n.toLocaleString("es-BO")}${unidad}`;

function Dato({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {etiqueta}
      </Typography>
      <Typography variant="body2">{valor || "—"}</Typography>
    </Box>
  );
}

/**
 * ANTECEDENTES normalizados: lo que el sistema ya sabe de la bomba (ficha,
 * piezas montadas, última intervención) más las lecturas del día.
 *
 * Lo de la bomba no se escribe aquí: viene del inventario y se copia en el
 * reporte. Se rehace al guardar el borrador y se congela al enviar.
 */
export function SeccionAntecedentes({
  antecedentes,
  catalogos,
  soloLectura,
  onCambioDeHoras,
}: Props) {
  const a = antecedentes;
  const vencido = a?.horas_restantes !== undefined && a.horas_restantes < 0;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        Antecedentes
      </Typography>

      <Typography variant="body2" fontWeight={600} mb={1}>
        Lecturas del día
      </Typography>
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <CampoTexto
            nombre="lecturas.horas"
            label="Horas"
            helperText="Desde la última intervención"
            slotProps={{ htmlInput: { inputMode: "decimal" } }}
            soloLectura={soloLectura}
            onBlur={onCambioDeHoras}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <CampoTexto
            nombre="lecturas.fecha_horas"
            label="Leídas el"
            type="date"
            helperText="Si no es la fecha del reporte"
            soloLectura={soloLectura}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <CampoTexto
            nombre="lecturas.temp_referencia_c"
            label="Temp. referencia (°C)"
            slotProps={{ htmlInput: { inputMode: "decimal" } }}
            soloLectura={soloLectura}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <CampoCatalogo
            nombre="lecturas.punto_referencia"
            etiqueta="Tomada en"
            opciones={catalogos.punto_referencia}
            soloLectura={soloLectura}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <CampoCatalogo
            nombre="lecturas.instrumento"
            etiqueta="Instrumento"
            opciones={catalogos.instrumento}
            soloLectura={soloLectura}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <CampoTexto
            nombre="lecturas.emisividad"
            label="Emisividad"
            slotProps={{ htmlInput: { inputMode: "decimal" } }}
            placeholder="0,95"
            soloLectura={soloLectura}
          />
        </Grid>
      </Grid>

      {!a ? (
        <Alert severity="info">Elija la bomba para ver su ficha, sus piezas y su historial.</Alert>
      ) : (
        <>
          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Dato etiqueta="Fabricante / modelo" valor={[a.ficha.fabricante, a.ficha.modelo].filter(Boolean).join(" · ")} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Dato etiqueta="TMEF" valor={num(a.ficha.tmef_hrs, " h")} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Dato
                etiqueta="Horas restantes"
                valor={
                  <Box component="span" sx={{ color: vencido ? "error.main" : undefined }}>
                    {num(a.horas_restantes, " h")}
                    {vencido && " (pasó el TMEF)"}
                  </Box>
                }
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Dato etiqueta="Fecha tentativa" valor={formatearDia(a.fecha_tentativa)} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Dato etiqueta="Servicio / proceso" valor={a.ficha.servicio} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Dato etiqueta="Bombas pares" valor={a.ficha.pares} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Dato
                etiqueta="Informe anterior"
                valor={
                  a.informe_anterior ? (
                    <Link component={NextLink} href={`/dashboard/monitoreo-equipos/${a.informe_anterior.id}`}>
                      {a.informe_anterior.codigo_interno ?? "Sin código"} ·{" "}
                      {formatearDia(a.informe_anterior.fecha)}
                    </Link>
                  ) : (
                    "Ninguno emitido"
                  )
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Dato
                etiqueta="Última intervención"
                valor={
                  a.ultima_intervencion
                    ? [
                        formatearDia(a.ultima_intervencion.fecha),
                        a.ultima_intervencion.tipo,
                        a.ultima_intervencion.ot && `OT ${a.ultima_intervencion.ot}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : "Sin registro"
                }
              />
            </Grid>
          </Grid>

          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Pieza</TableCell>
                  <TableCell>Proveedor</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell align="right">Dureza (HB)</TableCell>
                  <TableCell align="right">Espesor nom. / prec. (mm)</TableCell>
                  <TableCell>Instalada</TableCell>
                  <TableCell align="right">Horas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {a.componentes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2" color="text.secondary">
                        Sin piezas cargadas para esta bomba.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {a.componentes.map((c) => (
                  <TableRow key={c.pieza}>
                    <TableCell>{c.pieza}</TableCell>
                    <TableCell>{c.proveedor ?? "—"}</TableCell>
                    <TableCell>{c.material ?? "—"}</TableCell>
                    <TableCell align="right">{num(c.dureza_hb)}</TableCell>
                    <TableCell align="right">
                      {num(c.espesor_nominal_mm)} / {num(c.espesor_precaucion_mm)}
                    </TableCell>
                    <TableCell>{formatearDia(c.fecha_instalacion)}</TableCell>
                    <TableCell align="right">{num(c.horas_trabajo)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </>
      )}
    </Paper>
  );
}
