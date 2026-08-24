"use client";

import React, { useState } from "react";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Inventory2, Remove } from "@mui/icons-material";
import {
  TIPOS_SPCC,
  disponiblesDelTipo,
  fotoDelTipo,
  type CrearSolicitudPayload,
  type EquipoPrestable,
} from "../../domain/models/Prestamo";

interface SolicitudFormProps {
  abierto: boolean;
  /** Solo para ilustrar y contar: aquí ya no se elige ningún equipo concreto. */
  disponibles: EquipoPrestable[];
  areas: string[];
  areaPorDefecto?: string;
  onCerrar: () => void;
  onGuardar: (payload: CrearSolicitudPayload) => Promise<boolean>;
}

const hoy = () => new Date().toISOString().slice(0, 10);

const enUnaSemana = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
};

/** Cantidad pedida por tipo, indexada por la clave del inventario. */
type Cantidades = Record<string, number>;

const SIN_CANTIDADES: Cantidades = {};

export function SolicitudForm({
  abierto,
  disponibles,
  areas,
  areaPorDefecto,
  onCerrar,
  onGuardar,
}: SolicitudFormProps) {
  const [area, setArea] = useState(areaPorDefecto ?? "");
  const [motivo, setMotivo] = useState("");
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(enUnaSemana);
  const [cantidades, setCantidades] = useState<Cantidades>(SIN_CANTIDADES);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const total = Object.values(cantidades).reduce((s, n) => s + n, 0);
  const rangoValido = Boolean(desde && hasta && hasta >= desde);
  const puedeGuardar =
    Boolean(area.trim()) && Boolean(motivo.trim()) && rangoValido && total > 0;

  /**
   * El tope por tipo es lo que hay libre hoy.
   *
   * Es una guía, no una reserva: entre la solicitud y la entrega el almacén se
   * mueve. Quien entrega vuelve a mirar el stock real y es quien decide.
   */
  const cambiar = (clave: string, delta: number) =>
    setCantidades((prev) => {
      const tope = disponiblesDelTipo(disponibles, clave);
      const siguiente = Math.min(Math.max((prev[clave] ?? 0) + delta, 0), tope);
      return { ...prev, [clave]: siguiente };
    });

  const guardar = async () => {
    if (!puedeGuardar) {
      setAviso(
        total === 0
          ? "Indique cuántos equipos necesita de al menos un tipo."
          : "Falta el área, el motivo o las fechas del préstamo.",
      );
      return;
    }
    setGuardando(true);
    const bien = await onGuardar({
      areaSolicitante: area.trim(),
      motivo: motivo.trim(),
      fechaInicioPrevista: desde,
      fechaDevolucionPrevista: hasta,
      solicitado: Object.entries(cantidades)
        .filter(([, cantidad]) => cantidad > 0)
        .map(([tipoEquipo, cantidad]) => ({ tipoEquipo, cantidad })),
    });
    setGuardando(false);
    if (bien) {
      setMotivo("");
      setCantidades(SIN_CANTIDADES);
      onCerrar();
    }
  };

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="md" fullWidth>
      <DialogTitle>Solicitar préstamo de SPCC</DialogTitle>
      <DialogContent dividers>
        {aviso && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setAviso(null)}>
            {aviso}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Autocomplete
              freeSolo
              options={areas}
              value={area}
              onChange={(_, v) => setArea(v ?? "")}
              onInputChange={(_, v, razon) => {
                if (razon === "input") setArea(v);
              }}
              renderInput={(p) => (
                <TextField {...p} label="Área que solicita" required />
              )}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              fullWidth
              required
              type="date"
              label="Préstamo desde"
              slotProps={{ inputLabel: { shrink: true } }}
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              helperText="Cuándo recogen los equipos"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              fullWidth
              required
              type="date"
              label="Hasta"
              slotProps={{ inputLabel: { shrink: true } }}
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              error={Boolean(hasta) && !rangoValido}
              helperText={
                Boolean(hasta) && !rangoValido
                  ? "No puede ser anterior al inicio"
                  : "Sirve para saber qué está atrasado"
              }
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={2}
              label="Motivo"
              placeholder="Para qué se necesitan los equipos"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </Grid>
        </Grid>

        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            ¿Qué necesita y cuántos?
          </Typography>
          <Chip
            size="small"
            label={`${total} equipo(s)`}
            color={total > 0 ? "primary" : "default"}
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          Indique la cantidad por tipo. Los códigos concretos los asigna el
          almacén al entregarlos.
        </Typography>

        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          {TIPOS_SPCC.map((tipo) => {
            const libres = disponiblesDelTipo(disponibles, tipo.clave);
            const cantidad = cantidades[tipo.clave] ?? 0;
            const foto = fotoDelTipo(disponibles, tipo.clave);

            return (
              <Grid size={{ xs: 12, sm: 6 }} key={tipo.clave}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    display: "flex",
                    gap: 1.5,
                    alignItems: "center",
                    borderColor: cantidad > 0 ? "primary.main" : "divider",
                    opacity: libres === 0 ? 0.6 : 1,
                  }}
                >
                  <Avatar
                    variant="rounded"
                    src={foto}
                    sx={{ width: 56, height: 56, bgcolor: "action.hover" }}
                  >
                    <Inventory2 />
                  </Avatar>

                  <Box flex={1} minWidth={0}>
                    <Typography variant="body2" fontWeight={600}>
                      {tipo.etiqueta}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {tipo.descripcion}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={libres === 0 ? "error.main" : "success.main"}
                    >
                      {libres === 0
                        ? "Sin unidades libres"
                        : `${libres} disponible(s)`}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={0.5}>
                    <IconButton
                      type="button"
                      size="small"
                      aria-label={`Quitar un ${tipo.etiqueta}`}
                      disabled={cantidad === 0}
                      onClick={() => cambiar(tipo.clave, -1)}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      sx={{ minWidth: 24, textAlign: "center" }}
                    >
                      {cantidad}
                    </Typography>
                    <IconButton
                      type="button"
                      size="small"
                      aria-label={`Añadir un ${tipo.etiqueta}`}
                      disabled={cantidad >= libres}
                      onClick={() => cambiar(tipo.clave, 1)}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={() => void guardar()}
          disabled={guardando || !puedeGuardar}
        >
          {guardando ? "Registrando…" : "Solicitar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
