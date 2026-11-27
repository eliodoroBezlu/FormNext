"use client";

import React from "react";
import { Autocomplete, Grid, TextField } from "@mui/material";
import { mismoNombre } from "@/lib/organizacion/cadenaOrganizativa";
import type { UsoMaestroOrganizativo } from "../../application/hooks/useMaestroOrganizativo";

type TamañoGrid = React.ComponentProps<typeof Grid>["size"];

export interface AreaYSuperintendencia {
  area: string;
  superintendencia: string;
}

interface FiltroAreaSuperintendenciaProps extends AreaYSuperintendencia {
  maestro: UsoMaestroOrganizativo;
  onChange: (valor: AreaYSuperintendencia) => void;
  /**
   * El área se puede escribir (Herramientas y Equipos: la anota el inspector y se busca por
   * «contiene»). Si no, solo se elige del maestro.
   */
  areaLibre?: boolean;
  tamañoArea?: TamañoGrid;
  tamañoSuperintendencia?: TamañoGrid;
}

/**
 * Área y Superintendencia enlazadas por el maestro: al elegir el área se completa su
 * superintendencia, y al elegir una superintendencia el área solo ofrece las suyas (y se vacía si
 * no era de ella). Devuelve dos celdas de `Grid` para ponerlas dentro de la fila de filtros.
 */
export function FiltroAreaSuperintendencia({
  maestro,
  area,
  superintendencia,
  onChange,
  areaLibre = false,
  tamañoArea = { xs: 12, md: 3 },
  tamañoSuperintendencia = { xs: 12, md: 4 },
}: FiltroAreaSuperintendenciaProps) {
  const elegirArea = (nueva: string) => {
    const suya = nueva ? maestro.superintendenciaDe(nueva) : null;
    onChange({ area: nueva, superintendencia: suya ?? superintendencia });
  };

  const elegirSuperintendencia = (nueva: string) => {
    const deLaArea = area ? maestro.superintendenciaDe(area) : null;
    const seQueda = !nueva || !deLaArea || mismoNombre(deLaArea, nueva);
    onChange({ area: seQueda ? area : "", superintendencia: nueva });
  };

  // Un valor que llega por la URL y ya no está en el maestro se sigue mostrando, en vez de que MUI
  // lo dé por inválido.
  const conValor = (opciones: string[], valor: string) =>
    valor && !opciones.some((o) => mismoNombre(o, valor)) ? [valor, ...opciones] : opciones;

  const completadaPorArea =
    !!area && !!superintendencia && mismoNombre(maestro.superintendenciaDe(area) ?? "", superintendencia);

  return (
    <>
      <Grid size={tamañoArea}>
        <Autocomplete
          size="small"
          freeSolo={areaLibre}
          options={conValor(maestro.areasDe(superintendencia || undefined), area)}
          value={area || null}
          loading={maestro.cargando}
          onChange={(_, valor) => elegirArea(valor ?? "")}
          onInputChange={(_, valor, motivo) => {
            if (areaLibre && motivo === "input") elegirArea(valor);
          }}
          renderInput={(params) => <TextField {...params} label="Área" placeholder="Todas" />}
        />
      </Grid>
      <Grid size={tamañoSuperintendencia}>
        <Autocomplete
          size="small"
          options={conValor(maestro.superintendencias, superintendencia)}
          value={superintendencia || null}
          loading={maestro.cargando}
          onChange={(_, valor) => elegirSuperintendencia(valor ?? "")}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Superintendencia"
              placeholder="Todas"
              helperText={completadaPorArea ? "Según el área elegida" : undefined}
            />
          )}
        />
      </Grid>
    </>
  );
}
