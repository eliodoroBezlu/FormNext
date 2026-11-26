"use client";

import { Grid, IconButton, MenuItem, Paper, TextField } from "@mui/material";
import { Clear as ClearIcon } from "@mui/icons-material";
import { SelectorUbicacion } from "@/components/features/ubicaciones/presentation/components/SelectorUbicacion";
import type { FiltrosEquipos as Filtros } from "../../domain/filtrosEquipos";
import type { CatalogosInventario } from "../../domain/models/Equipo";

interface Props {
  filtros: Filtros;
  cambiar: <K extends keyof Filtros>(campo: K, valor: Filtros[K]) => void;
  catalogos: CatalogosInventario;
  tipos: string[];
}

export function FiltrosEquipos({ filtros, cambiar, catalogos, tipos }: Props) {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Buscar"
            placeholder="Código, descripción, marca, responsable…"
            value={filtros.texto}
            onChange={(e) => cambiar("texto", e.target.value)}
            slotProps={{
              input: {
                endAdornment: filtros.texto ? (
                  <IconButton size="small" aria-label="Borrar búsqueda" onClick={() => cambiar("texto", "")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : undefined,
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Área"
            value={filtros.area}
            onChange={(e) => cambiar("area", e.target.value)}
          >
            <MenuItem value="">
              <em>Todas</em>
            </MenuItem>
            {catalogos.areas.map((a) => (
              <MenuItem key={a._id} value={a._id}>
                {a.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectorUbicacion
            opciones={catalogos.ubicaciones}
            valor={filtros.ubicacion || null}
            onChange={(id) => cambiar("ubicacion", id ?? "")}
            label="Ubicación"
            placeholder="Todas"
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Tipo de equipo"
            value={filtros.tipo}
            onChange={(e) => cambiar("tipo", e.target.value)}
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {tipos.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );
}
