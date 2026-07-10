"use client";

import React, { useState, useMemo } from "react";
import { 
  Box, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Typography, 
  Card, 
  CardContent 
} from "@mui/material";
import { EquipoBackend } from "@/lib/actions/equipo-actions";

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
  const [selectedCode, setSelectedCode] = useState<string>("");

  // Filtrar equipos por el área seleccionada
  const filteredEquipos = useMemo(() => {
    if (!selectedArea) return [];
    const normSelected = selectedArea.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return equipos.filter((e) => {
      const areaNombre = e.area_id?.nombre || "";
      const normArea = areaNombre.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return normArea === normSelected || normArea.includes(normSelected) || normSelected.includes(normArea);
    });
  }, [equipos, selectedArea]);

  const handleContinue = () => {
    if (!selectedCode) return;
    const selectedEquip = filteredEquipos.find((e) => e.codigo === selectedCode);
    onSelect(selectedArea, selectedCode, selectedEquip);
  };

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
                  setSelectedCode(""); // Reset code when area changes
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
            <FormControl fullWidth disabled={!selectedArea || filteredEquipos.length === 0}>
              <InputLabel id="step1-select-code-label">TAG / Código de Herramienta</InputLabel>
              <Select
                labelId="step1-select-code-label"
                value={selectedCode}
                label="TAG / Código de Herramienta"
                onChange={(e) => setSelectedCode(e.target.value)}
              >
                <MenuItem value="">
                  <em>Seleccione un código</em>
                </MenuItem>
                {filteredEquipos.map((opt) => (
                  <MenuItem key={opt._id} value={opt.codigo}>
                    {opt.codigo} {opt.descripcion ? `(${opt.descripcion})` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box display="flex" flexDirection="column" gap={2} alignItems="center">
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleContinue}
            disabled={!selectedCode}
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
