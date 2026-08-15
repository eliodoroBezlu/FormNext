"use client";

import {
  Alert,
  AlertTitle,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { CheckCircleOutline, WarningAmber } from "@mui/icons-material";
import { ResultadoAnalisis } from "../../domain/models/IProps";
import { distribucionPorNivel } from "../../domain/matrizHelpers";

interface ResumenAnalisisProps {
  analisis: ResultadoAnalisis;
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor?: string | number }) {
  return (
    <Box minWidth={150}>
      <Typography variant="caption" color="text.secondary" display="block">
        {etiqueta}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {valor || "—"}
      </Typography>
    </Box>
  );
}

/** Cabecera leída del archivo + conteos + distribución por nivel. */
export function ResumenAnalisis({ analisis }: ResumenAnalisisProps) {
  const { cabecera, resumen } = analisis;
  const distribucion = distribucionPorNivel(resumen.porNivel);
  const total = resumen.totalRiesgos || 1;
  const sinDiscrepancias = resumen.totalDiscrepancias === 0;

  return (
    <Stack spacing={2}>
      {/* El veredicto va primero: es lo que decide si se puede importar. */}
      {sinDiscrepancias ? (
        <Alert severity="success" icon={<CheckCircleOutline />}>
          <AlertTitle>Los cálculos coinciden</AlertTitle>
          El sistema recalculó los {resumen.totalRiesgos} riesgos y{" "}
          {resumen.totalControles} controles, y obtuvo exactamente los mismos
          valores que el archivo.
        </Alert>
      ) : (
        <Alert severity="error" icon={<WarningAmber />}>
          <AlertTitle>
            {resumen.totalDiscrepancias} valor(es) no coinciden
          </AlertTitle>
          En {resumen.riesgosConDiscrepancias} riesgo(s) el resultado calculado
          difiere del que trae el Excel. Hay que resolverlo antes de importar:
          guardar así dejaría enterrada una diferencia de metodología.
        </Alert>
      )}

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Datos del archivo
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={2.5}>
            <Dato etiqueta="Archivo" valor={analisis.archivo} />
            <Dato etiqueta="Hoja" valor={analisis.hoja} />
            <Dato etiqueta="Área" valor={cabecera.area} />
            <Dato etiqueta="Superintendencia" valor={cabecera.superintendencia} />
            <Dato etiqueta="Gerencia" valor={cabecera.gerencia} />
            <Dato etiqueta="Año" valor={cabecera.anio} />
            <Dato etiqueta="Elaborado por" valor={cabecera.elaboradoPor} />
            <Dato
              etiqueta="Revisado y aprobado por"
              valor={cabecera.revisadoAprobadoPor}
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" flexWrap="wrap" gap={2.5}>
            <Dato etiqueta="Riesgos" valor={resumen.totalRiesgos} />
            <Dato etiqueta="Controles" valor={resumen.totalControles} />
            <Dato
              etiqueta="Categorías"
              valor={resumen.categorias.join(", ")}
            />
            <Box minWidth={150}>
              <Typography variant="caption" color="text.secondary" display="block">
                Requieren PGR
              </Typography>
              <Chip
                size="small"
                color={resumen.requierenPgr > 0 ? "warning" : "default"}
                label={`${resumen.requierenPgr} de ${resumen.totalRiesgos}`}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Distribución por nivel de riesgo actual
          </Typography>
          <Stack spacing={1.25} mt={1.5}>
            {distribucion.map((d) => (
              <Box key={d.nivel}>
                <Box display="flex" justifyContent="space-between" mb={0.25}>
                  <Typography variant="body2">{d.nivel}</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {d.cantidad}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(d.cantidad / total) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    "& .MuiLinearProgress-bar": { bgcolor: d.color },
                  }}
                />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {analisis.advertencias.length > 0 && (
        <Alert severity="warning">
          <AlertTitle>Advertencias</AlertTitle>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {analisis.advertencias.map((a, i) => (
              <li key={i}>
                <Typography variant="body2">{a}</Typography>
              </li>
            ))}
          </Box>
        </Alert>
      )}
    </Stack>
  );
}
