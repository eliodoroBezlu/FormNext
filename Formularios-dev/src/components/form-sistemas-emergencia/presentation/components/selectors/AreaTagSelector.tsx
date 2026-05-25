// src/components/form-sistemas-emergencia/presentation/components/selectors/AreaTagSelector.tsx

import React from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { CheckCircle, Autorenew, LockClock } from "@mui/icons-material";
import { TAGS_CON_SELECCION_EXTINTORES } from "@/lib/constants";
import type { ExtintorBackend } from "@/types/formTypes";
import ExtintoresChecklist from "./ExtintoresChecklist";
import ExtintoresVisualizacion from "./ExtintoresVisualizacion";

interface AreaTagSelectorProps {
  area: string;
  tag: string;
  areaOptions: string[];
  tagOptions: string[];
  tagUbicaciones: Record<string, string>;
  extintores: ExtintorBackend[];
  totalExtintoresActivos: number;
  extintoresSeleccionados: ExtintorBackend[];
  loading: boolean;
  onAreaChange: (area: string) => Promise<void>;
  onTagChange: (tag: string) => Promise<void>;
  determinarEstadoTag: (tag: string) => "pendiente" | "parcial" | "completado";
  onExtintoresSeleccionados: (seleccionados: ExtintorBackend[]) => void;
  onSubmit: () => Promise<void> | void;
}

export const AreaTagSelector = ({
  area,
  tag,
  areaOptions,
  tagOptions,
  tagUbicaciones,
  extintores,
  totalExtintoresActivos,
  loading,
  onAreaChange,
  onTagChange,
  determinarEstadoTag,
  onExtintoresSeleccionados,
  onSubmit,
}: AreaTagSelectorProps) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Seleccione primero el área y el TAG se completará automáticamente
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="area-select-label">Área</InputLabel>
            <Select
              labelId="area-select-label"
              id="area-select"
              value={area}
              label="Área"
              onChange={(e) => onAreaChange(e.target.value as string)}
              disabled={loading}
            >
              {areaOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth disabled={tagOptions.length === 0}>
            <InputLabel id="tag-label">TAG</InputLabel>
            <Select
              labelId="tag-label"
              id="tag-select"
              value={tag}
              label="TAG"
              onChange={(e) => onTagChange(e.target.value as string)}
              disabled={loading}
            >
              {tagOptions.map((option) => {
                const estado = determinarEstadoTag(option);
                const ubicacion = tagUbicaciones[option] || "";

                return (
                  <MenuItem key={option} value={option}>
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography component="span" sx={{ fontWeight: "bold" }}>
                          {option}
                        </Typography>
                        {ubicacion && (
                          <Typography
                            component="span"
                            sx={{
                              ml: 1,
                              color: "text.secondary",
                              fontSize: "0.875rem",
                              fontStyle: "italic",
                            }}
                          >
                            ({ubicacion})
                          </Typography>
                        )}
                      </Box>

                      {estado === "completado" ? (
                        <CheckCircle
                          sx={{ color: "success.main", fontSize: "1.2rem", ml: 1 }}
                          titleAccess="Todos inspeccionados"
                        />
                      ) : estado === "parcial" ? (
                        <Autorenew
                          sx={{ color: "warning.main", fontSize: "1.2rem", ml: 1 }}
                          titleAccess="Parcialmente inspeccionado"
                        />
                      ) : (
                        <LockClock
                          sx={{ color: "error.main", fontSize: "1.2rem", ml: 1 }}
                          titleAccess="Pendiente"
                        />
                      )}
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* VISUALIZACIÓN PREVIA / CHECKLIST SEGÚN TAG */}
      {area && tag && (
        TAGS_CON_SELECCION_EXTINTORES.includes(tag) ? (
          <ExtintoresChecklist
            tag={tag}
            extintores={extintores}
            onExtintoresSeleccionados={onExtintoresSeleccionados}
          />
        ) : (
          <Box mb={2}>
            <ExtintoresVisualizacion
              tag={tag}
              extintores={extintores}
              totalExtintoresActivos={totalExtintoresActivos}
            />
          </Box>
        )
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={onSubmit}
        disabled={loading || !tag}
        sx={{ mt: 2 }}
      >
        {loading ? "Verificando..." : "Continuar"}
      </Button>
    </Box>
  );
};
