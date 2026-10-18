"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Add, ArrowBack } from "@mui/icons-material";
import { useCatalogosMonitoreo } from "../../application/hooks/useCatalogosMonitoreo";
import { useFichaBomba } from "../../application/hooks/useFichaBomba";
import { ChipEstado, ChipResultado, formatearDia } from "./CamposReporte";
import { ChipAlerta } from "./ChipAlerta";

const BASE = "/dashboard/monitoreo-equipos";

function Dato({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {etiqueta}
      </Typography>
      <Typography variant="body2" component="div">
        {valor || "—"}
      </Typography>
    </Box>
  );
}

/**
 * Todo lo de una bomba: su ficha, sus fechas, las piezas montadas y las ya
 * retiradas, sus intervenciones y todos sus reportes.
 */
export function FichaBombaView({ tag }: { tag: string }) {
  const router = useRouter();
  const { ficha, cargando, error } = useFichaBomba(tag);
  const { colorDeResultado } = useCatalogosMonitoreo();
  const esp = ficha?.equipo.especificaciones ?? {};
  const s = ficha?.situacion;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: "auto" }}>
      <Stack direction="row" alignItems="center" gap={2} mb={3} flexWrap="wrap">
        <Button component={NextLink} href={`${BASE}/bombas`} startIcon={<ArrowBack />} size="small">
          Bombas
        </Button>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={700}>
            {tag}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {[ficha?.equipo.marca, ficha?.equipo.modelo].filter(Boolean).join(" · ")}
          </Typography>
        </Box>
        <Button
          component={NextLink}
          href={`${BASE}/nuevo?tag=${encodeURIComponent(tag)}`}
          variant="contained"
          startIcon={<Add />}
        >
          Nuevo reporte
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.join(" · ")}
        </Alert>
      )}
      {cargando && (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {ficha && s && (
        <Stack gap={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Dato
                  etiqueta="Próximo monitoreo"
                  valor={
                    <ChipAlerta
                      alerta={s.alerta_monitoreo}
                      fecha={s.proximo_monitoreo}
                      dias={s.dias_para_monitoreo}
                    />
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Dato
                  etiqueta="Fecha tentativa de intervención"
                  valor={
                    <ChipAlerta
                      alerta={s.alerta_intervencion}
                      fecha={s.ultimo_reporte?.fecha_tentativa}
                      dias={s.dias_para_intervencion}
                      sinDatos={s.ultimo_reporte ? "Sin TMEF u horas" : "Sin reporte emitido"}
                    />
                  }
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Dato etiqueta="TMEF (hrs)" valor={esp["TMEF (hrs)"]} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Dato etiqueta="Frecuencia (días)" valor={esp["Frecuencia (días)"]} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Dato etiqueta="OT modelo" valor={esp["OT modelo"]} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Dato etiqueta="Servicio / proceso" valor={esp["Servicio / proceso"]} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Dato etiqueta="Bombas pares" valor={esp["Bombas pares"]} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Dato etiqueta="Tag de horas en PI" valor={esp["Tag de horas en PI"]} />
              </Grid>
            </Grid>
          </Paper>

          <Paper variant="outlined" sx={{ overflowX: "auto" }}>
            <Typography variant="subtitle1" fontWeight={700} p={2} pb={0}>
              Reportes ({ficha.reportes.length})
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell>Técnica</TableCell>
                  <TableCell>Resultado</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Elaboró / revisó</TableCell>
                  <TableCell>Fecha tentativa</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ficha.reportes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2" color="text.secondary">
                        Sin reportes todavía.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {ficha.reportes.map((r) => (
                  <TableRow
                    key={r._id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => router.push(`${BASE}/${r._id}`)}
                  >
                    <TableCell>{formatearDia(r.fecha)}</TableCell>
                    <TableCell>{r.codigo_interno ?? "—"}</TableCell>
                    <TableCell>{r.tecnica ?? "—"}</TableCell>
                    <TableCell>
                      <ChipResultado valor={r.resultado} color={colorDeResultado(r.resultado)} />
                    </TableCell>
                    <TableCell>
                      <ChipEstado estado={r.estado} />
                    </TableCell>
                    <TableCell>
                      {r.elaboradoPor}
                      {r.revisadoPor ? ` / ${r.revisadoPor}` : ""}
                    </TableCell>
                    <TableCell>{formatearDia(r.antecedentes?.fecha_tentativa)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper variant="outlined" sx={{ overflowX: "auto" }}>
            <Typography variant="subtitle1" fontWeight={700} p={2} pb={0}>
              Piezas (montadas y retiradas)
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Pieza</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Proveedor</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell>Instalada</TableCell>
                  <TableCell>Retirada</TableCell>
                  <TableCell align="right">Espesor nom. / prec. (mm)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ficha.componentes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2" color="text.secondary">
                        Sin piezas cargadas.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {ficha.componentes.map((c) => (
                  <TableRow key={c._id} sx={{ opacity: c.vigente ? 1 : 0.6 }}>
                    <TableCell>{c.pieza}</TableCell>
                    <TableCell>{c.vigente ? "Montada" : "Retirada"}</TableCell>
                    <TableCell>{c.proveedor ?? "—"}</TableCell>
                    <TableCell>{c.material ?? "—"}</TableCell>
                    <TableCell>{formatearDia(c.fecha_instalacion)}</TableCell>
                    <TableCell>{c.vigente ? "—" : formatearDia(c.retirado_en)}</TableCell>
                    <TableCell align="right">
                      {c.espesor_nominal_mm ?? "—"} / {c.espesor_precaucion_mm ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper variant="outlined" sx={{ overflowX: "auto" }}>
            <Typography variant="subtitle1" fontWeight={700} p={2} pb={0}>
              Intervenciones
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>OT</TableCell>
                  <TableCell align="right">Horas al intervenir</TableCell>
                  <TableCell>Piezas cambiadas</TableCell>
                  <TableCell>Nota</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ficha.intervenciones.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography variant="body2" color="text.secondary">
                        Sin intervenciones registradas.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {ficha.intervenciones.map((i) => (
                  <TableRow key={i._id}>
                    <TableCell>{formatearDia(i.fecha)}</TableCell>
                    <TableCell>{i.tipo ?? "—"}</TableCell>
                    <TableCell>{i.ot ?? "—"}</TableCell>
                    <TableCell align="right">{i.horas ?? "—"}</TableCell>
                    <TableCell>{i.piezas.join(", ") || "—"}</TableCell>
                    <TableCell>{i.nota ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      )}
    </Box>
  );
}
