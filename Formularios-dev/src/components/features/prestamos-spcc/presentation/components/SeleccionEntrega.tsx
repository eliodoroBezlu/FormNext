"use client";

import React from "react";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Checkbox,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Inventory2 } from "@mui/icons-material";
import {
  TIPOS_SPCC,
  disponiblesDelTipo,
  type EquipoPrestable,
  type LineaSolicitada,
} from "../../domain/models/Prestamo";

interface SeleccionEntregaProps {
  /** Lo que pidió el solicitante, por tipo. */
  solicitado: LineaSolicitada[];
  /** Catálogo libre ahora mismo. */
  disponibles: EquipoPrestable[];
  elegidos: EquipoPrestable[];
  onCambiar: (equipos: EquipoPrestable[]) => void;
}

/**
 * Elección de los equipos que salen del almacén.
 *
 * Vive en la entrega y no en la solicitud a propósito: quien pide sabe cuántos
 * arneses necesita, pero cuáles salen depende de qué haya libre ese día, y eso
 * solo lo sabe quien abre el almacén.
 *
 * Solo se muestran los tipos que se pidieron —enseñar los cinco convertiría la
 * pantalla en un catálogo y escondería lo que realmente hay que preparar.
 */
export function SeleccionEntrega({
  solicitado,
  disponibles,
  elegidos,
  onCambiar,
}: SeleccionEntregaProps) {
  /** Reemplaza la selección de **un** tipo, dejando intactos los demás. */
  const cambiarTipo = (clave: string, nuevos: EquipoPrestable[]) =>
    onCambiar([...elegidos.filter((e) => e.tipo_equipo !== clave), ...nuevos]);

  return (
    <Stack spacing={1.5}>
      <Alert severity="info">
        Elija los códigos que salen del almacén. Puede entregar más o menos de
        lo pedido: manda lo que realmente se lleva.
      </Alert>

      {solicitado.map((linea) => {
        const tipo = TIPOS_SPCC.find((t) => t.clave === linea.tipoEquipo);
        const etiqueta = tipo?.etiqueta ?? linea.tipoEquipo;
        const opciones = disponibles.filter(
          (e) => e.tipo_equipo === linea.tipoEquipo,
        );
        const deEsteTipo = elegidos.filter(
          (e) => e.tipo_equipo === linea.tipoEquipo,
        );
        const libres = disponiblesDelTipo(disponibles, linea.tipoEquipo);

        return (
          <Paper variant="outlined" sx={{ p: 1.5 }} key={linea.tipoEquipo}>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              flexWrap="wrap"
              sx={{ mb: 1 }}
            >
              <Typography variant="body2" fontWeight={600}>
                {etiqueta}
              </Typography>
              <Chip size="small" label={`Pedidos: ${linea.cantidad}`} />
              <Chip
                size="small"
                label={`Elegidos: ${deEsteTipo.length}`}
                color={
                  deEsteTipo.length === linea.cantidad
                    ? "success"
                    : deEsteTipo.length === 0
                      ? "default"
                      : "warning"
                }
              />
              {libres < linea.cantidad && (
                <Chip
                  size="small"
                  color="error"
                  label={`Solo hay ${libres} libre(s)`}
                />
              )}
            </Box>

            <Autocomplete
              multiple
              disableCloseOnSelect
              options={opciones}
              value={deEsteTipo}
              onChange={(_, v) => cambiarTipo(linea.tipoEquipo, v)}
              getOptionLabel={(o) => o.codigo}
              isOptionEqualToValue={(a, b) => a._id === b._id}
              noOptionsText="No hay equipos libres de este tipo"
              renderOption={(props, opcion, { selected }) => {
                const { key, ...rest } =
                  props as React.HTMLAttributes<HTMLLIElement> & {
                    key: string;
                  };
                return (
                  <Box
                    component="li"
                    key={key}
                    {...rest}
                    sx={{ display: "flex", gap: 1.5, alignItems: "center" }}
                  >
                    <Checkbox checked={selected} size="small" sx={{ p: 0.5 }} />
                    <Avatar
                      variant="rounded"
                      src={opcion.fotos?.[0]?.url}
                      sx={{ width: 36, height: 36 }}
                    >
                      <Inventory2 fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {opcion.codigo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {opcion.descripcion}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
              renderInput={(p) => (
                <TextField
                  {...p}
                  size="small"
                  label={`Códigos de ${etiqueta.toLowerCase()}`}
                  placeholder="Buscar por código o descripción"
                />
              )}
            />
          </Paper>
        );
      })}
    </Stack>
  );
}
