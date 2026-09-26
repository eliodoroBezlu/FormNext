"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { PictureAsPdf } from "@mui/icons-material";
import { linternasAdapter } from "../../infrastructure/adapters/linternasAdapter";
import {
  AccionesEntrega,
  type AccionesEntregaProps,
} from "./AccionesEntrega";
import {
  ETIQUETA_ESTADO,
  ETIQUETA_TIPO,
  EstadoEntrega,
  TipoEntrega,
  type EntregaLinterna,
  type EstadoTrabajador,
} from "../../domain/models/Linterna";

const COLOR_ESTADO: Record<
  EstadoEntrega,
  "default" | "success" | "warning" | "error"
> = {
  [EstadoEntrega.REGISTRADA]: "success",
  [EstadoEntrega.APROBADA]: "success",
  [EstadoEntrega.PENDIENTE_APROBACION]: "warning",
  [EstadoEntrega.RECHAZADA]: "error",
  // Gris a propósito: una entrega anulada no es un fallo, es un asiento que
  // se queda pero ya no cuenta.
  [EstadoEntrega.ANULADA]: "default",
};

const fecha = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("es-BO") : "—";

interface Props {
  estado: EstadoTrabajador;
  historial: EntregaLinterna[];
  /**
   * Corregir el historial. **Ausente = solo lectura**: quien no puede
   * reclasificar ni anular no ve el menú, en vez de verlo y chocar con un 403.
   * El gate por rol vive en la página, que es quien conoce al usuario.
   */
  acciones?: Omit<AccionesEntregaProps, "entrega">;
}

export function EstadoTrabajadorPanel({
  estado,
  historial,
  acciones,
}: Props) {
  const [descargando, setDescargando] = useState<string | null>(null);
  const [errorActa, setErrorActa] = useState<string | null>(null);

  const descargar = async (id: string) => {
    setErrorActa(null);
    setDescargando(id);
    try {
      await linternasAdapter.descargarActa(id);
    } catch (err) {
      setErrorActa(
        err instanceof Error ? err.message : "No se pudo generar el acta.",
      );
    } finally {
      setDescargando(null);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={600}>
        {estado.nombre}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {estado.area} · {estado.superintendencia}
      </Typography>

      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
        <Chip
          size="small"
          label={estado.tieneDotacion ? "Con dotación" : "Sin dotación"}
          color={estado.tieneDotacion ? "success" : "default"}
        />
        <Chip size="small" label={`${estado.totalCambios} cambio(s)`} />
        <Chip
          size="small"
          label={`${estado.totalPerdidas} pérdida(s)`}
          color={estado.totalPerdidas > 0 ? "warning" : "default"}
        />
        <Chip
          size="small"
          variant="outlined"
          label={`Última entrega: ${fecha(estado.ultimaEntrega)}`}
        />
      </Stack>

      {estado.pendienteDeAprobacion && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Tiene una reposición pendiente de aprobación. Hasta que se resuelva no
          se puede registrar otra entrega.
        </Alert>
      )}

      {historial.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Historial
          </Typography>
          <Stack gap={0.75} sx={{ mt: 0.5 }}>
            {historial.map((h) => (
              <Box key={h._id}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  size="small"
                  label={ETIQUETA_TIPO[h.tipo]}
                  color={
                    h.tipo === TipoEntrega.REPOSICION_PERDIDA
                      ? "warning"
                      : "default"
                  }
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={ETIQUETA_ESTADO[h.estado]}
                  color={COLOR_ESTADO[h.estado]}
                />
                <Typography variant="caption" color="text.secondary">
                  {/*
                    Sin `fechaEntrega` no se cae en `createdAt`: en las
                    dotaciones anteriores al sistema eso mostraría el día en
                    que se cargaron, y quien lo lea entendería que la linterna
                    se entregó ese día. Es mejor decir que no se sabe.
                  */}
                  {h.fechaEntrega
                    ? fecha(h.fechaEntrega)
                    : "fecha no registrada"}
                  {h.firmaTrabajador
                    ? ` · firmada (${h.firmaTrabajador.metodo})`
                    : " · sin firmar"}
                </Typography>
                <Tooltip title="Descargar acta">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => void descargar(h._id)}
                      disabled={descargando === h._id}
                    >
                      <PictureAsPdf fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                {acciones && <AccionesEntrega entrega={h} {...acciones} />}
              </Box>

              {/*
                El rastro de lo corregido va **debajo de la fila**, no escondido
                en un detalle: si el almacén cuadró de una forma rara, esto es
                lo único que lo explica.
              */}
              {h.reclasificaciones?.map((r) => (
                <Typography
                  key={`${r.fecha}-${r.tipoNuevo}`}
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ pl: 1, fontStyle: "italic" }}
                >
                  Era {ETIQUETA_TIPO[r.tipoAnterior]} · reclasificada por{" "}
                  {r.reclasificadaPor} el {fecha(r.fecha)}: {r.motivo}
                </Typography>
              ))}

              {h.estado === EstadoEntrega.ANULADA && (
                <Typography
                  variant="caption"
                  color="error.main"
                  display="block"
                  sx={{ pl: 1, fontStyle: "italic" }}
                >
                  Anulada por {h.anuladaPor ?? "—"} el{" "}
                  {fecha(h.fechaAnulacion)}
                  {h.motivoAnulacion ? `: ${h.motivoAnulacion}` : ""}
                </Typography>
              )}
              </Box>
            ))}
          </Stack>

          {errorActa && (
            <Alert severity="error" sx={{ mt: 1 }} onClose={() => setErrorActa(null)}>
              {errorActa}
            </Alert>
          )}
        </Box>
      )}
    </Paper>
  );
}
