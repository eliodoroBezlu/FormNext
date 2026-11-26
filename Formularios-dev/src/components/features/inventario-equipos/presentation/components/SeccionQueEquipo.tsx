"use client";

import { Autocomplete, Box, Grid, TextField, Typography } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import type { ValoresEquipo } from "../../domain/formularioEquipo";
import type { ConfigTipoEquipo } from "../../domain/models/Equipo";
import { CampoSelect, CampoTexto } from "./CamposEquipo";
import { TituloSeccion } from "./TituloSeccion";

interface Props {
  tipos: string[];
  configActiva: ConfigTipoEquipo | null;
  cambiarTipo: (tipo: string) => void;
}

/** 1. Qué equipo es: el tipo decide qué datos técnicos se piden. */
export function SeccionQueEquipo({ tipos, configActiva, cambiarTipo }: Props) {
  const {
    control,
    formState: { errors },
  } = useFormContext<ValoresEquipo>();
  const campos = configActiva?.campos ?? [];

  return (
    <Box>
      <TituloSeccion numero={1} titulo="¿Qué equipo es?" />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="tipo_equipo"
            control={control}
            rules={{ required: "Elija el tipo de equipo." }}
            render={({ field }) => (
              <Box data-question-error={errors.tipo_equipo ? "true" : undefined}>
                <Autocomplete
                  options={tipos}
                  value={field.value || null}
                  onChange={(_, valor) => cambiarTipo(valor ?? "")}
                  onBlur={field.onBlur}
                  autoHighlight
                  noOptionsText="No hay un tipo con ese nombre. Créelo en «Config. de formulario»."
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tipo de equipo"
                      name={field.name}
                      inputRef={field.ref}
                      required
                      autoFocus
                      placeholder="Amoladora, Esmeril, Escalera…"
                      error={!!errors.tipo_equipo}
                      helperText={errors.tipo_equipo?.message}
                    />
                  )}
                />
              </Box>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CampoTexto
            nombre="descripcion"
            label="Descripción"
            reglas={{ validate: (v) => !!String(v).trim() || "Escriba una descripción." }}
            ayuda="Se llena con el tipo; agregue detalle si hace falta."
          />
        </Grid>
      </Grid>

      {campos.length > 0 && (
        <Box mt={2} p={2} sx={{ bgcolor: "action.hover", borderRadius: 1 }}>
          <Typography variant="body2" fontWeight={600} mb={1.5}>
            Datos técnicos de {configActiva?.tipo_equipo}
          </Typography>
          <Grid container spacing={2}>
            {campos.map((campo) => {
              const nombre = `especificaciones.${campo.name}` as const;
              const reglas = campo.required
                ? { validate: (v: unknown) => !!String(v ?? "").trim() || `Falta: ${campo.label}.` }
                : undefined;
              return (
                <Grid key={campo.name} size={{ xs: 12, sm: 6, md: 4 }}>
                  {campo.type === "select" ? (
                    <CampoSelect
                      nombre={nombre}
                      label={campo.label}
                      reglas={reglas}
                      opciones={(campo.options ?? []).map((o) => ({ valor: o, etiqueta: o }))}
                    />
                  ) : campo.type === "boolean" ? (
                    <CampoSelect
                      nombre={nombre}
                      label={campo.label}
                      reglas={reglas}
                      opciones={[
                        { valor: "true", etiqueta: "Sí" },
                        { valor: "false", etiqueta: "No" },
                      ]}
                    />
                  ) : (
                    <CampoTexto
                      nombre={nombre}
                      label={campo.label}
                      reglas={reglas}
                      size="small"
                      slotProps={campo.type === "number" ? { htmlInput: { inputMode: "decimal" } } : undefined}
                    />
                  )}
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
