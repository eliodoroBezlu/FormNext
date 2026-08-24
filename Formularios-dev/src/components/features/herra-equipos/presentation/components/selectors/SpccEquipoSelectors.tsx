"use client";

import React from "react";
import { Autocomplete, Box, Chip, TextField, Typography } from "@mui/material";
import type { EquipoBackend } from "@/lib/actions/equipo-actions";
import type {
  ElementoSpcc,
  SeleccionSpcc,
} from "../../../domain/models/SpccElementos";

interface SpccEquipoSelectorsProps {
  /** Elementos que la plantilla realmente tiene. */
  elementos: ElementoSpcc[];
  /** Equipos ya filtrados por área. */
  equipos: EquipoBackend[];
  seleccion: SeleccionSpcc;
  onChange: (seleccion: SeleccionSpcc) => void;
  /** Mientras no haya área elegida no hay equipos que ofrecer. */
  deshabilitado?: boolean;
  /**
   * Mapa `código → área` de lo que está prestado ahora.
   *
   * Solo etiqueta; **no oculta nada**. Un SPCC guardado está en espera, pero
   * uno prestado es el que se va a usar — y por tanto el que más falta hace
   * inspeccionar. Lo único que aporta saberlo es dónde está.
   */
  prestados?: Record<string, string>;
}

/**
 * Un selector de equipo por cada elemento del SPCC.
 *
 * Todos son opcionales: el inspector marca solo lo que la persona lleva
 * puesto. Lo que elija decide qué secciones se inspeccionan y deja el código y
 * la marca ya escritos; lo que deje vacío sencillamente no aparece.
 *
 * Es un `Autocomplete` y no un `Select` porque hay 1.425 equipos: con una
 * lista desplegable habría que bajar cientos de opciones para encontrar un
 * código.
 */
export function SpccEquipoSelectors({
  elementos,
  equipos,
  seleccion,
  onChange,
  deshabilitado = false,
  prestados = {},
}: SpccEquipoSelectorsProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {elementos.map((elemento) => {
        const opciones = equipos.filter((e) =>
          elemento.tiposEquipo.includes(e.tipo_equipo),
        );
        const elegido = seleccion[elemento.clave];

        return (
          <Autocomplete
            key={elemento.clave}
            disabled={deshabilitado}
            options={opciones}
            value={
              opciones.find((o) => o.codigo === elegido?.codigo) ?? null
            }
            onChange={(_, valor) =>
              onChange({
                ...seleccion,
                [elemento.clave]: valor
                  ? {
                      codigo: valor.codigo,
                      marca: valor.marca,
                      descripcion: valor.descripcion,
                      tipo_equipo: valor.tipo_equipo,
                    }
                  : undefined,
              })
            }
            getOptionLabel={(o) => o.codigo}
            isOptionEqualToValue={(o, v) => o.codigo === v.codigo}
            noOptionsText="No hay equipos de este tipo en el área elegida"
            renderOption={(props, o) => {
              const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & {
                key: string;
              };
              return (
                <Box component="li" key={key} {...rest}>
                  <Box>
                    <Box display="flex" alignItems="center" gap={0.75}>
                      <Typography variant="body2" fontWeight={600}>
                        {o.codigo}
                      </Typography>
                      {prestados[o.codigo] && (
                        <Chip
                          size="small"
                          color="info"
                          variant="outlined"
                          label={`prestado a ${prestados[o.codigo]}`}
                          sx={{ height: 18, fontSize: "0.65rem" }}
                        />
                      )}
                    </Box>
                    {o.descripcion && (
                      <Typography variant="caption" color="text.secondary">
                        {o.descripcion}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={elemento.etiqueta}
                placeholder="Código — dejar vacío si no aplica"
                helperText={
                  deshabilitado
                    ? "Elija primero el área"
                    : opciones.length === 0
                      ? "Sin equipos disponibles de este tipo"
                      : `${opciones.length} disponible(s)`
                }
              />
            )}
          />
        );
      })}
    </Box>
  );
}
