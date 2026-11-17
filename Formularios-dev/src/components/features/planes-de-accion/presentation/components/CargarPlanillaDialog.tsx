"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
} from "@mui/material";
import { UploadFile } from "@mui/icons-material";
import {
  filasParaRevisar,
  RESULTADO_DE_FILA,
  textoDelResumen,
  type FilaDeCarga,
  type ResultadoCargaPlanilla,
} from "../../domain/cargaPlanilla";
import { NOMBRE_DEL_CAMPO, valorDelHistorial } from "../../domain/requisitosTarea";
import { useCargaPlanilla } from "../../application/hooks/useCargaPlanilla";
import type { ActionResult } from "../../infrastructure/adapters/planesAccionAdapter";

interface CargarPlanillaDialogProps {
  open: boolean;
  onClose: () => void;
  onCargar: (
    formData: FormData,
    aplicar: boolean,
  ) => Promise<ActionResult<ResultadoCargaPlanilla>>;
}

function FilaRevisada({ fila, aplicado }: { fila: FilaDeCarga; aplicado: boolean }) {
  const { color } = RESULTADO_DE_FILA[fila.resultado];
  const etiqueta =
    aplicado && fila.resultado === "actualiza"
      ? "Actualizada"
      : RESULTADO_DE_FILA[fila.resultado].etiqueta;
  return (
    <Box
      component="li"
      sx={{
        listStyle: "none",
        py: 1.25,
        borderTop: 1,
        borderColor: "divider",
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
        flexWrap: { xs: "wrap", sm: "nowrap" },
      }}
    >
      <Box sx={{ minWidth: 120 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Fila {fila.fila}
          {fila.item !== undefined && ` · ítem ${fila.item}`}
        </Typography>
        <Chip label={etiqueta} color={color} size="small" sx={{ mt: 0.5 }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        {fila.motivo && <Typography variant="body2">{fila.motivo}</Typography>}
        {fila.cambios.map((c) => (
          <Typography key={c.campo} variant="body2" sx={{ overflowWrap: "anywhere" }}>
            <strong>{NOMBRE_DEL_CAMPO[c.campo] ?? c.campo}:</strong>{" "}
            {valorDelHistorial(c.campo, c.antes)} → {valorDelHistorial(c.campo, c.despues)}
          </Typography>
        ))}
        {fila.avisos.map((aviso) => (
          <Typography
            key={aviso}
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ mt: 0.25 }}
          >
            {aviso}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

/**
 * Subir la planilla de seguimiento descargada y editada (solo admin). Al
 * elegirla se muestra qué haría con cada fila; nada se guarda hasta «Aplicar».
 */
export function CargarPlanillaDialog({ open, onClose, onCargar }: CargarPlanillaDialogProps) {
  const { archivo, resultado, enCurso, error, elegir, aplicar, reiniciar } =
    useCargaPlanilla(onCargar);

  const cerrar = () => {
    if (enCurso) return;
    reiniciar();
    onClose();
  };

  const porAplicar = resultado && !resultado.aplicado ? resultado.resumen.actualiza : 0;
  const filas = resultado ? filasParaRevisar(resultado.filas) : [];

  return (
    <Dialog open={open} onClose={cerrar} maxWidth="md" fullWidth>
      <DialogTitle>Subir planilla de seguimiento</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Suba la planilla que descargó de este plan, con sus cambios. Se actualizan la
          familia de peligro, la acción propuesta, los responsables de cierre y las fechas
          acordada y efectiva; con fecha efectiva la tarea se cierra si ya tiene su
          evidencia. Los datos del hallazgo y las evidencias se cambian en el sistema.
          Primero verá qué pasaría con cada fila: nada se guarda hasta que confirme.
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          {/* Un <label> que abre el selector de archivos: no es un botón de formulario. */}
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFile />}
            disabled={!!enCurso || !!resultado?.aplicado}
          >
            {archivo ? "Elegir otra planilla" : "Elegir planilla (.xlsx)"}
            <input
              hidden
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => {
                elegir(e.target.files?.[0] ?? null);
                // Permite volver a elegir el mismo archivo después de editarlo.
                e.target.value = "";
              }}
            />
          </Button>
          {archivo && (
            <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
              {archivo.name}
            </Typography>
          )}
        </Box>

        {enCurso && (
          <Box sx={{ mt: 2 }} role="status">
            <LinearProgress />
            <Typography variant="caption" color="text.secondary">
              {enCurso === "revisando" ? "Revisando la planilla…" : "Aplicando los cambios…"}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {resultado && !enCurso && (
          <>
            <Alert severity={resultado.aplicado ? "success" : "info"} sx={{ mt: 2 }}>
              {resultado.aplicado ? "Aplicado: " : "Si aplica: "}
              {textoDelResumen(resultado.resumen, resultado.aplicado)}
            </Alert>
            {filas.length > 0 && (
              <Box component="ul" sx={{ p: 0, m: 0, mt: 1 }} aria-label="Filas de la planilla">
                {filas.map((f) => (
                  <FilaRevisada
                    key={`${f.fila}-${f.tareaId ?? ""}`}
                    fila={f}
                    aplicado={resultado.aplicado}
                  />
                ))}
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={cerrar} disabled={!!enCurso}>
          {resultado?.aplicado ? "Cerrar" : "Cancelar"}
        </Button>
        {porAplicar > 0 && (
          <Button type="button" variant="contained" onClick={aplicar} disabled={!!enCurso}>
            {porAplicar === 1 ? "Actualizar 1 tarea" : `Actualizar ${porAplicar} tareas`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
