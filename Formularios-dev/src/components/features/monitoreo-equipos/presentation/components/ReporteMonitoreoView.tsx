"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, CircularProgress, Stack, Tooltip, Typography } from "@mui/material";
import { ArrowBack, PictureAsPdf } from "@mui/icons-material";
import { useUserRole } from "@/hooks/useUserRole";
import { accionesDelReporte } from "../../domain/accionesReporte";
import { useCatalogosMonitoreo } from "../../application/hooks/useCatalogosMonitoreo";
import { useReporteMonitoreo } from "../../application/hooks/useReporteMonitoreo";
import { urlDelPdf } from "../../infrastructure/adapters/monitoreoAdapter";
import { ChipEstado, formatearDia } from "./CamposReporte";
import { ReporteForm } from "./ReporteForm";

const LISTA = "/dashboard/monitoreo-equipos";

/** Un reporte de monitoreo: nuevo (sin `id`) o existente. */
export function ReporteMonitoreoView({ id, tagInicial }: { id?: string; tagInicial?: string }) {
  const router = useRouter();
  const { user } = useUserRole();
  const r = useReporteMonitoreo(id, tagInicial);
  const c = useCatalogosMonitoreo();

  const cargando = r.cargando || c.cargando;
  const error = r.error ?? c.error;
  const reporte = r.reporte;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: "auto" }}>
      <Stack direction="row" alignItems="center" gap={2} mb={3} flexWrap="wrap">
        <Button component={NextLink} href={LISTA} startIcon={<ArrowBack />} size="small">
          Reportes
        </Button>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={700}>
            {reporte
              ? `${reporte.codigo_interno ?? "Reporte"} · ${reporte.tag} · ${formatearDia(reporte.fecha)}`
              : "Nuevo reporte de monitoreo"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitoreo y/o inspección de equipos · 2.03.P01.R09
            {reporte && ` · elaborado por ${reporte.elaboradoPor}`}
            {reporte?.revisadoPor && ` · revisado por ${reporte.revisadoPor}`}
          </Typography>
        </Box>
        {reporte && <ChipEstado estado={reporte.estado} />}
        {reporte && (
          <Tooltip
            title={
              reporte.estado === "emitido"
                ? "El reporte emitido"
                : "Lo último guardado, con la marca de borrador o revisión"
            }
          >
            <Button
              component="a"
              href={urlDelPdf(reporte._id)}
              variant="outlined"
              size="small"
              startIcon={<PictureAsPdf />}
            >
              PDF
            </Button>
          </Tooltip>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => r.setError(null)}>
          {error.join(" · ")}
        </Alert>
      )}

      {cargando ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : id && !reporte ? null : (
        <ReporteForm
          // Un formulario por reporte: al pasar de nuevo a guardado se remonta limpio.
          key={reporte?._id ?? "nuevo"}
          reporte={reporte}
          tagInicial={tagInicial}
          antecedentes={r.antecedentes}
          catalogos={c.catalogos}
          bombas={c.bombas}
          fotosPorFila={c.fotosPorFila}
          acciones={accionesDelReporte(reporte, user?.username)}
          colorDeResultado={c.colorDeResultado}
          prellenar={r.prellenar}
          guardar={r.guardar}
          enviar={r.enviar}
          devolver={r.devolver}
          emitir={r.emitir}
          darDeBaja={r.darDeBaja}
          subirImagen={r.subirImagen}
          onCreado={(nuevo) => router.replace(`${LISTA}/${nuevo._id}`)}
          onDescartado={() => router.push(LISTA)}
        />
      )}
    </Box>
  );
}
