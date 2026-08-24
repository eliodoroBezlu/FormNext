"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Inventory2 } from "@mui/icons-material";
import { prestamosAdapter } from "../../infrastructure/adapters/prestamosAdapter";
import { SeleccionEntrega } from "./SeleccionEntrega";
import {
  ETIQUETA_DEVOLUCION,
  ETIQUETA_ESTADO,
  COLOR_ESTADO,
  diasDeAtraso,
  estaVencida,
  resumirSolicitado,
  type DevolverItemPayload,
  type EntregarPayload,
  type EquipoPrestable,
  type EstadoDevolucion,
  type LineaPrestamo,
  type SolicitudPrestamo,
} from "../../domain/models/Prestamo";

const fecha = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("es-BO") : "—";

interface DetallePrestamoProps {
  solicitudId: string | null;
  esAdmin: boolean;
  /** Catálogo libre, para elegir los equipos que salen al entregar. */
  disponibles: EquipoPrestable[];
  onCerrar: () => void;
  onDevolver: (id: string, items: DevolverItemPayload[]) => Promise<boolean>;
  onEntregar: (id: string, payload: EntregarPayload) => Promise<boolean>;
  onCancelar: (id: string) => Promise<boolean>;
}

/** Lo que el admin va marcando antes de confirmar la devolución. */
interface Marcado {
  marcado: boolean;
  estado: EstadoDevolucion;
  observacion: string;
}

export function DetallePrestamo({
  solicitudId,
  esAdmin,
  disponibles,
  onCerrar,
  onDevolver,
  onEntregar,
  onCancelar,
}: DetallePrestamoProps) {
  const [solicitud, setSolicitud] = useState<SolicitudPrestamo | null>(null);
  const [items, setItems] = useState<LineaPrestamo[]>([]);
  const [marcas, setMarcas] = useState<Record<string, Marcado>>({});
  /** Equipos que el almacén va eligiendo para esta entrega. */
  const [aEntregar, setAEntregar] = useState<EquipoPrestable[]>([]);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    if (!solicitudId) return;
    let vigente = true;
    void prestamosAdapter.detalle(solicitudId).then((d) => {
      if (!vigente || !d) return;
      setSolicitud(d.solicitud);
      setItems(d.items);
      setMarcas({});
      setAEntregar([]);
    });
    return () => {
      vigente = false;
    };
  }, [solicitudId]);

  if (!solicitudId || !solicitud) return null;

  const fuera = items.filter((i) => i.estado === "entregado");
  const marcados = Object.entries(marcas).filter(([, m]) => m.marcado);

  /**
   * Hay que elegir equipos antes de entregar.
   *
   * `items.length === 0` distingue las solicitudes nuevas —que solo declaran
   * cantidades— de las anteriores al cambio, que ya nacieron con sus líneas y
   * se entregan sin elegir nada.
   */
  const puedePreparar =
    esAdmin && solicitud.estado === "solicitada" && items.length === 0;

  const SIN_MARCAR: Marcado = {
    marcado: false,
    estado: "operativo",
    observacion: "",
  };

  const cambiar = (id: string, cambio: Partial<Marcado>) =>
    setMarcas((prev) => ({
      ...prev,
      // La línea puede no estar todavía en el mapa: se marca por primera vez
      // al pulsar la casilla.
      [id]: { ...(prev[id] ?? SIN_MARCAR), ...cambio },
    }));

  const confirmarDevolucion = async () => {
    setOcupado(true);
    const bien = await onDevolver(
      solicitud._id,
      marcados.map(([id, m]) => ({
        prestamo: id,
        estado: m.estado,
        observacion: m.observacion || undefined,
      })),
    );
    setOcupado(false);
    if (bien) onCerrar();
  };

  const accion = async (fn: () => Promise<boolean>) => {
    setOcupado(true);
    const bien = await fn();
    setOcupado(false);
    if (bien) onCerrar();
  };

  return (
    <Dialog open onClose={onCerrar} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          <span>{solicitud.numero}</span>
          <Chip
            size="small"
            label={ETIQUETA_ESTADO[solicitud.estado]}
            color={COLOR_ESTADO[solicitud.estado]}
          />
          {estaVencida(solicitud) && (
            <Chip
              size="small"
              color="error"
              label={`${diasDeAtraso(solicitud)} día(s) de atraso`}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Área:</strong> {solicitud.areaSolicitante}
          </Typography>
          <Typography variant="body2">
            <strong>Solicitó:</strong>{" "}
            {solicitud.solicitanteNombre ?? solicitud.solicitanteUsername}
          </Typography>
          <Typography variant="body2">
            <strong>Motivo:</strong> {solicitud.motivo}
          </Typography>
          <Typography variant="body2">
            <strong>Periodo del préstamo:</strong>{" "}
            {fecha(solicitud.fechaInicioPrevista ?? solicitud.fechaSolicitud)} —{" "}
            {fecha(solicitud.fechaDevolucionPrevista)}
          </Typography>
          {solicitud.solicitado && solicitud.solicitado.length > 0 && (
            <Typography variant="body2">
              <strong>Pedido:</strong>{" "}
              {resumirSolicitado(solicitud.solicitado)}
            </Typography>
          )}
          {solicitud.entrega && (
            <Typography variant="body2" color="text.secondary">
              Entregado el {fecha(solicitud.entrega.fecha)} por{" "}
              {solicitud.entrega.entregadoPor}
            </Typography>
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          {puedePreparar ? "Preparar la entrega" : `Equipos (${items.length})`}
        </Typography>

        {/*
          Mientras la solicitud está pendiente y no tiene líneas, lo que hay
          que enseñar no es una lista vacía sino el selector: es el momento en
          que se decide qué sale del almacén.
        */}
        {puedePreparar && (
          <SeleccionEntrega
            solicitado={solicitud.solicitado ?? []}
            disponibles={disponibles}
            elegidos={aEntregar}
            onCambiar={setAEntregar}
          />
        )}

        {esAdmin && solicitud.estado === "entregada" && fuera.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Marque los que vuelven. Puede devolver solo una parte: el préstamo
            se cierra solo cuando no quede ninguno fuera.
          </Alert>
        )}

        <Stack spacing={1.5}>
          {items.map((item) => {
            const devuelto = item.estado === "devuelto";
            const marca = marcas[item._id];
            const puedeDevolver =
              esAdmin && solicitud.estado === "entregada" && !devuelto;

            return (
              <Box
                key={item._id}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                  opacity: devuelto ? 0.65 : 1,
                }}
              >
                {puedeDevolver && (
                  <Checkbox
                    checked={!!marca?.marcado}
                    onChange={(e) =>
                      cambiar(item._id, { marcado: e.target.checked })
                    }
                  />
                )}
                <Avatar variant="rounded" src={item.foto} sx={{ width: 48, height: 48 }}>
                  <Inventory2 fontSize="small" />
                </Avatar>

                <Box flex={1}>
                  <Typography variant="body2" fontWeight={600}>
                    {item.codigo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.descripcion}
                  </Typography>

                  {devuelto && item.devolucion && (
                    <Box mt={0.5}>
                      <Chip
                        size="small"
                        label={`Devuelto · ${ETIQUETA_DEVOLUCION[item.devolucion.estado]}`}
                        color={
                          item.devolucion.estado === "operativo"
                            ? "success"
                            : "warning"
                        }
                      />
                      {item.devolucion.observacion && (
                        <Typography variant="caption" display="block" mt={0.5}>
                          {item.devolucion.observacion}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {puedeDevolver && marca?.marcado && (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mt={1}>
                      <TextField
                        select
                        size="small"
                        label="Estado"
                        sx={{ minWidth: 190 }}
                        value={marca.estado}
                        onChange={(e) =>
                          cambiar(item._id, {
                            estado: e.target.value as EstadoDevolucion,
                          })
                        }
                      >
                        {(
                          Object.keys(ETIQUETA_DEVOLUCION) as EstadoDevolucion[]
                        ).map((k) => (
                          <MenuItem key={k} value={k}>
                            {ETIQUETA_DEVOLUCION[k]}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        size="small"
                        fullWidth
                        label="Observación"
                        value={marca.observacion}
                        onChange={(e) =>
                          cambiar(item._id, { observacion: e.target.value })
                        }
                      />
                    </Stack>
                  )}
                </Box>
              </Box>
            );
          })}
        </Stack>

        {esAdmin && marcados.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Lo que no vuelva como «Operativo» quedará fuera del catálogo
            prestable hasta que se resuelva.
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button type="button" onClick={onCerrar}>
          Cerrar
        </Button>

        {esAdmin && solicitud.estado === "solicitada" && (
          <>
            <Button
              type="button"
              color="error"
              disabled={ocupado}
              onClick={() => void accion(() => onCancelar(solicitud._id))}
            >
              Cancelar solicitud
            </Button>
            <Button
              type="button"
              variant="contained"
              disabled={ocupado || (puedePreparar && aEntregar.length === 0)}
              onClick={() =>
                void accion(() =>
                  onEntregar(solicitud._id, {
                    equipos: aEntregar.map((e) => e._id),
                  }),
                )
              }
            >
              Registrar entrega
              {puedePreparar && aEntregar.length > 0
                ? ` (${aEntregar.length})`
                : ""}
            </Button>
          </>
        )}

        {esAdmin && solicitud.estado === "entregada" && (
          <Button
            type="button"
            variant="contained"
            disabled={ocupado || marcados.length === 0}
            onClick={() => void confirmarDevolucion()}
          >
            Devolver {marcados.length > 0 ? `(${marcados.length})` : ""}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
