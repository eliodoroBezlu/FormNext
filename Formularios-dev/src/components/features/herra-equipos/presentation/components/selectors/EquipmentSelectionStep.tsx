"use client";

import React, { useState, useMemo } from "react";
import {
  Autocomplete,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { EquipoBackend } from "@/lib/actions/equipo-actions";

const norm = (s: string) =>
  s
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

interface EquipmentSelectionStepProps {
  templateCode: string;
  templateName: string;
  equipos: EquipoBackend[];
  areas: string[];
  onSelect: (area: string, code: string, equipo?: EquipoBackend) => void;
  onSkip: () => void;
}

export function EquipmentSelectionStep({
  templateCode,
  templateName,
  equipos,
  areas,
  onSelect,
  onSkip,
}: EquipmentSelectionStepProps) {
  const [selectedArea, setSelectedArea] = useState<string>("");
  /**
   * Se guarda el equipo entero, no el código.
   *
   * El código **dejó de ser único**: hay SPCC distintos con el mismo ID
   * interno, diferenciados por su RFID. Seleccionando por código, cinco
   * arneses quedaban inalcanzables porque siempre se resolvía el primero.
   */
  const [selected, setSelected] = useState<EquipoBackend | null>(null);

  /**
   * Equipos que se ofrecen para el área elegida.
   *
   * Además de los del área entran los de **ámbito superior**: uno de la
   * superintendencia lo puede inspeccionar cualquiera de sus áreas, y uno de
   * la gerencia, cualquiera. Es visibilidad — si el usuario puede inspeccionar
   * lo siguen decidiendo los roles.
   */
  const filteredEquipos = useMemo(() => {
    if (!selectedArea) return [];
    const buscada = norm(selectedArea);
    const superDelArea = norm(
      equipos.find((x) => norm(x.area_id?.nombre ?? "") === buscada)?.area_id
        ?.superintendencia?.nombre ?? "",
    );

    return equipos.filter((e) => {
      if (e.ambito === "gerencia") return true;

      if (e.ambito === "superintendencia") {
        const supEquipo = norm(e.superintendencia_id?.nombre ?? "");
        return !!supEquipo && !!superDelArea && supEquipo === superDelArea;
      }

      const area = norm(e.area_id?.nombre ?? "");
      if (!area) return false;
      return area === buscada || area.includes(buscada) || buscada.includes(area);
    });
  }, [equipos, selectedArea]);

  const handleContinue = () => {
    if (!selected) return;
    onSelect(selectedArea, selected.codigo, selected);
  };

  /**
   * Un vehículo se busca por su número interno **o** por su placa: son dos
   * identificadores distintos y el inspector rara vez tiene los dos a mano.
   * También se acepta la descripción, que es lo que se lee en el tablero.
   */
  const coincide = (equipo: EquipoBackend, consulta: string) => {
    const q = norm(consulta);
    if (!q) return true;
    return [equipo.codigo, equipo.placa, equipo.descripcion]
      .filter(Boolean)
      .some((campo) => norm(String(campo)).includes(q));
  };

  const etiqueta = (equipo: EquipoBackend) =>
    equipo.placa ? `${equipo.codigo} · ${equipo.placa}` : equipo.codigo;

  return (
    <Card sx={{ mb: 3, p: 2, borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
      <CardContent>
        <Typography variant="h6" align="center" fontWeight={600} sx={{ mb: 1 }}>
          Formulario de Inspección de Seguridad
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Código: {templateCode} — {templateName}
        </Typography>

        <Typography variant="subtitle1" align="center" fontWeight={500} sx={{ mb: 3 }}>
          Seleccione primero el área y el TAG para continuar
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="step1-select-area-label">Área</InputLabel>
              <Select
                labelId="step1-select-area-label"
                value={selectedArea}
                label="Área"
                onChange={(e) => {
                  setSelectedArea(e.target.value);
                  setSelected(null); // al cambiar de área la selección anterior deja de valer
                }}
              >
                <MenuItem value="">
                  <em>Seleccione un área</em>
                </MenuItem>
                {areas.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              disabled={!selectedArea || filteredEquipos.length === 0}
              options={filteredEquipos}
              value={selected}
              onChange={(_, valor) => setSelected(valor)}
              getOptionLabel={etiqueta}
              isOptionEqualToValue={(a, b) => a._id === b._id}
              filterOptions={(opciones, { inputValue }) =>
                opciones.filter((o) => coincide(o, inputValue))
              }
              renderOption={(props, opt) => {
                const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & {
                  key: string;
                };
                return (
                  <Box component="li" key={key} {...rest}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {etiqueta(opt)}
                      </Typography>
                      {opt.descripcion && (
                        <Typography variant="caption" color="text.secondary">
                          {opt.descripcion}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="TAG / Código o placa"
                  placeholder="Escriba el número interno o la placa"
                />
              )}
            />
          </Grid>
        </Grid>

        <Box display="flex" flexDirection="column" gap={2} alignItems="center">
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleContinue}
            disabled={!selected}
            sx={{ py: 1.5, fontWeight: "bold", textTransform: "none" }}
          >
            Continuar
          </Button>

          <Button
            variant="text"
            color="secondary"
            onClick={onSkip}
            sx={{ textTransform: "none", fontWeight: 500 }}
          >
            Omitir selección (Inspeccionar equipo nuevo o no registrado)
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
