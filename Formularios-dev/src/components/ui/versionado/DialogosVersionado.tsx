"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type {
  EntradaHistorial,
  EstadoRevision,
  PlantillaVersionada,
} from "@/types/versionado";

/**
 * Piezas visuales del versionado de plantillas. Sin datos ni llamadas: todo
 * llega por props (ver `hooks/useVersionadoPlantilla`).
 */

const ETIQUETA: Record<EstadoRevision, string> = {
  borrador: "Borrador",
  vigente: "Vigente",
  obsoleta: "Obsoleta",
};

const COLOR: Record<EstadoRevision, "warning" | "success" | "default"> = {
  borrador: "warning",
  vigente: "success",
  obsoleta: "default",
};

export function ChipEstadoRevision({ estado }: { estado: EstadoRevision }) {
  return <Chip size="small" label={ETIQUETA[estado]} color={COLOR[estado]} variant={estado === "obsoleta" ? "outlined" : "filled"} />;
}

const fecha = (iso?: string) =>
  iso ? new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(new Date(iso)) : "—";

// ─── Publicar ──────────────────────────────────────────────────────────────

interface DialogoPublicarProps {
  /** El borrador a publicar; `null` = cerrado. */
  plantilla: PlantillaVersionada | null;
  /** Aviso extra (p. ej. formularios con Excel o pantalla hechos a mano). */
  advertencia?: string;
  trabajando: boolean;
  onCancelar: () => void;
  onConfirmar: (motivo: string) => void;
}

/**
 * Pide el motivo del cambio y confirma. Se monta con `key` por plantilla, así
 * que el motivo arranca vacío cada vez sin un efecto que lo limpie.
 */
export function DialogoPublicarRevision({ plantilla, advertencia, trabajando, onCancelar, onConfirmar }: DialogoPublicarProps) {
  const [motivo, setMotivo] = useState("");
  const valido = motivo.trim().length > 0;

  return (
    <Dialog open={!!plantilla} onClose={onCancelar} maxWidth="sm" fullWidth>
      <DialogTitle>Publicar {plantilla?.revision}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2">
            <strong>{plantilla?.revision}</strong> de «{plantilla?.name}» pasa a ser la revisión <strong>vigente</strong>:
            todas las inspecciones nuevas se harán con ella. La revisión vigente actual queda <strong>obsoleta</strong>; las
            inspecciones ya hechas con ella se siguen viendo tal como se hicieron.
          </Typography>
          {advertencia && <Alert severity="warning">{advertencia}</Alert>}
          <TextField
            label="Motivo del cambio"
            placeholder="Ej.: se agregó la pregunta sobre el arnés doble en la sección 3"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            multiline
            minRows={2}
            required
            autoFocus
            helperText="Queda registrado en el historial de revisiones."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={onCancelar} disabled={trabajando}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="contained"
          color="success"
          disabled={!valido || trabajando}
          onClick={() => onConfirmar(motivo.trim())}
          startIcon={trabajando ? <CircularProgress size={16} /> : undefined}
        >
          Publicar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Revisión bloqueada ────────────────────────────────────────────────────

interface DialogoBloqueadaProps {
  bloqueo: { plantilla: PlantillaVersionada; motivo: string } | null;
  trabajando: boolean;
  onCerrar: () => void;
  onCrearRevision: (plantilla: PlantillaVersionada) => void;
  onVer?: (plantilla: PlantillaVersionada) => void;
}

/** Explica por qué no se puede editar y ofrece crear la revisión siguiente. */
export function DialogoRevisionBloqueada({ bloqueo, trabajando, onCerrar, onCrearRevision, onVer }: DialogoBloqueadaProps) {
  const esVigente = (bloqueo?.plantilla.estadoRevision ?? "vigente") === "vigente";
  return (
    <Dialog open={!!bloqueo} onClose={onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>No se puede editar {bloqueo?.plantilla.revision}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="info">{bloqueo?.motivo}</Alert>
          {esVigente && (
            <Typography variant="body2">
              <strong>Crear nueva revisión</strong> hace una copia de «{bloqueo?.plantilla.name}» como borrador. En el
              borrador se cambia lo que haga falta (preguntas, orden, puntajes) y al publicarlo pasa a ser la vigente. Las
              inspecciones ya hechas no cambian.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {onVer && bloqueo && (
          <Button type="button" onClick={() => onVer(bloqueo.plantilla)}>
            Solo ver
          </Button>
        )}
        <Button type="button" onClick={onCerrar} disabled={trabajando}>
          Cancelar
        </Button>
        {esVigente && bloqueo && (
          <Button
            type="button"
            variant="contained"
            disabled={trabajando}
            onClick={() => onCrearRevision(bloqueo.plantilla)}
            startIcon={trabajando ? <CircularProgress size={16} /> : undefined}
          >
            Crear nueva revisión
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ─── Historial ─────────────────────────────────────────────────────────────

interface DialogoHistorialProps {
  historial: { plantilla: PlantillaVersionada; entradas: EntradaHistorial[] } | null;
  onCerrar: () => void;
  /** Abrir una revisión en solo lectura. */
  onVer?: (id: string) => void;
}

export function DialogoHistorialRevisiones({ historial, onCerrar, onVer }: DialogoHistorialProps) {
  return (
    <Dialog open={!!historial} onClose={onCerrar} maxWidth="md" fullWidth>
      <DialogTitle>
        Historial de revisiones
        <Typography variant="body2" color="text.secondary">
          {historial?.plantilla.name} · {historial?.plantilla.code}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Revisión</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Vigente desde</TableCell>
                <TableCell>Motivo del cambio</TableCell>
                <TableCell align="right">Inspecciones</TableCell>
                {onVer && <TableCell />}
              </TableRow>
            </TableHead>
            <TableBody>
              {historial?.entradas.map((e) => (
                <TableRow key={e._id}>
                  <TableCell>{e.revision}</TableCell>
                  <TableCell>
                    <ChipEstadoRevision estado={e.estadoRevision} />
                  </TableCell>
                  <TableCell>
                    {e.estadoRevision === "borrador" ? "—" : fecha(e.vigenteDesde)}
                    {e.obsoletaDesde && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        hasta {fecha(e.obsoletaDesde)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {e.motivoCambio ?? (e.estadoRevision === "borrador" ? "En preparación" : "—")}
                    {e.publicadaPor && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        publicada por {e.publicadaPor}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">{e.inspecciones}</TableCell>
                  {onVer && (
                    <TableCell>
                      <Button type="button" size="small" onClick={() => onVer(e._id)}>
                        Ver
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={onCerrar}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
