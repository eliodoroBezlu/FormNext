"use client";

import React from "react";
import {
  Alert,
  Autocomplete,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import AutocompleteCustom from "@/components/ui/autocomplete/AutocompleteCustom";
import type { Tecnico, Vista } from "../../domain/models/dashboardModels";
import { MESES, añosDisponibles, type Periodo } from "../../domain/models/carpetaVirtual";

interface CarpetaFiltrosProps {
  usuario: Tecnico;
  areaDelPerfil?: string;
  vista: Vista;
  onVista: (v: Vista) => void;
  tecnico: Tecnico;
  tecnicos: Tecnico[];
  onTecnico: (t: Tecnico) => void;
  area: string | null;
  onArea: (a: string | null) => void;
  periodo: Periodo;
  onPeriodo: (p: Periodo) => void;
}

const etiquetaTecnico = (t: Tecnico) => (t.nombre && t.nombre !== t.username ? `${t.nombre} (${t.username})` : t.username);

/** Pestañas (por técnico / por área), a quién o qué área se mira, y el mes y el año. */
export function CarpetaFiltros({
  usuario,
  areaDelPerfil,
  vista,
  onVista,
  tecnico,
  tecnicos,
  onTecnico,
  area,
  onArea,
  periodo,
  onPeriodo,
}: CarpetaFiltrosProps) {
  return (
    <>
      <Tabs
        value={vista}
        onChange={(_, v: Vista) => onVista(v)}
        sx={{ mb: 3, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Tab value="tecnico" label="Por técnico" />
        <Tab value="area" label="Por área" />
      </Tabs>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-start", mb: 3 }}>
        <Box sx={{ flex: "1 1 320px", maxWidth: 480 }}>
          {vista === "tecnico" ? (
            <Autocomplete
              size="small"
              options={tecnicos}
              value={tecnico}
              getOptionLabel={etiquetaTecnico}
              isOptionEqualToValue={(a, b) => a.username === b.username}
              // Vaciarlo vuelve a quien mira: siempre hay alguien elegido.
              onChange={(_, t) => onTecnico(t ?? usuario)}
              renderInput={(params) => <TextField {...params} label="Técnico" />}
            />
          ) : (
            <AutocompleteCustom
              dataSource="area"
              label="Área que se muestra"
              placeholder="Elegí un área"
              value={area}
              onChange={onArea}
            />
          )}
        </Box>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Mes</InputLabel>
          <Select
            label="Mes"
            value={periodo.mes ?? 0}
            onChange={(e) => onPeriodo({ ...periodo, mes: Number(e.target.value) || null })}
          >
            <MenuItem value={0}>Todo el año</MenuItem>
            {MESES.map((m, i) => (
              <MenuItem key={m} value={i + 1}>
                {m.charAt(0) + m.slice(1).toLowerCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Año</InputLabel>
          <Select
            label="Año"
            value={periodo.año}
            onChange={(e) => onPeriodo({ ...periodo, año: Number(e.target.value) })}
          >
            {añosDisponibles().map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {vista === "tecnico" && tecnico.username !== usuario.username && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Estás viendo las inspecciones de <strong>{etiquetaTecnico(tecnico)}</strong>.
        </Alert>
      )}
      {vista === "area" && !area && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          {areaDelPerfil
            ? "Elegí un área para ver sus inspecciones."
            : "Tu perfil no tiene un área asignada. Elegí una para ver sus inspecciones."}
        </Alert>
      )}
      {vista === "area" && area && areaDelPerfil && area !== areaDelPerfil && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          Estás viendo <strong>{area}</strong>, que no es tu área ({areaDelPerfil}).
        </Alert>
      )}
    </>
  );
}
