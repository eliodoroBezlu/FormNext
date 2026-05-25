// src/components/form-sistemas-emergencia/presentation/components/sections/InformacionGeneral.tsx

import React, { useState } from "react";
import {
  Grid,
  TextField,
  Box,
  Typography,
  FormControl,
  Autocomplete,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { buscarTrabajadores } from "@/app/actions/inspeccion";
import {
  SUPERINTENDENCIAS,
  obtenerMesActual,
  getPeriodoActual,
  getAñoActual,
} from "@/components/form-sistemas-emergencia/domain/models/EmergenciaDomain";
import { type InformacionGeneralProps } from "@/components/form-sistemas-emergencia/types/IProps";

const inputProps = {
  readOnly: true,
};

export const InformacionGeneral = ({
  control,
  errors,
  soloLectura,
  areaOptions = [],
}: InformacionGeneralProps) => {
  const mesActual = obtenerMesActual();
  const periodoActual = getPeriodoActual();
  const añoActual = getAñoActual();

  const [opciones, setOpciones] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const buscarOpciones = async (query: string): Promise<void> => {
    if (query.length < 3) {
      setOpciones([]);
      return;
    }
    setLoading(true);
    try {
      const response = await buscarTrabajadores(query);
      setOpciones(response.map((item: { nomina: string }) => item.nomina));
    } catch (error) {
      console.error("Error al buscar responsables:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Información General {soloLectura && "(Solo lectura)"}
      </Typography>
      <Grid container spacing={2}>
        {/* Campo Superintendencia */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="superintendencia"
            control={control}
            rules={{ required: !soloLectura && "Este campo es obligatorio" }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.superintendencia}>
                {soloLectura ? (
                  <TextField
                    label="Superintendencia"
                    value={field.value || ""}
                    slotProps={{
                      input: inputProps,
                    }}
                    variant="filled"
                  />
                ) : (
                  <Autocomplete
                    {...field}
                    options={SUPERINTENDENCIAS}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        id="superintendencia"
                        label="Seleccionar Superintendencia"
                        error={!!errors.superintendencia}
                        helperText={errors.superintendencia?.message}
                      />
                    )}
                    onChange={(_, data) => field.onChange(data)}
                  />
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Campo Área */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="area"
            control={control}
            rules={{ required: !soloLectura && "Este campo es obligatorio" }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.area}>
                {soloLectura ? (
                  <TextField
                    label="Área"
                    value={field.value || ""}
                    slotProps={{
                      input: inputProps,
                    }}
                    variant="filled"
                  />
                ) : (
                  <Autocomplete
                    {...field}
                    options={areaOptions}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        id="area"
                        label="Seleccionar Área"
                        error={!!errors.area}
                        helperText={errors.area?.message}
                      />
                    )}
                    onChange={(_, data) => field.onChange(data)}
                  />
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Campo TAG */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="tag"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="TAG"
                fullWidth
                slotProps={{
                  input: inputProps,
                }}
                variant={soloLectura ? "filled" : "outlined"}
              />
            )}
          />
        </Grid>

        {/* Campo Edificio */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="edificio"
            control={control}
            rules={{ required: !soloLectura && "Este campo es obligatorio" }}
            render={({ field }) => (
              <TextField
                {...field}
                id="edificio"
                label="Edificio"
                fullWidth
                error={!soloLectura && !!errors.edificio}
                helperText={!soloLectura && errors.edificio?.message}
                InputProps={{ readOnly: soloLectura }}
                variant={soloLectura ? "filled" : "outlined"}
              />
            )}
          />
        </Grid>

        {/* Campo Responsable del Edificio */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Controller
            name="responsableEdificio"
            control={control}
            rules={{ required: !soloLectura && "Este campo es obligatorio" }}
            render={({ field }) =>
              soloLectura ? (
                <TextField
                  label="Responsable del Edificio"
                  value={field.value || ""}
                  fullWidth
                  slotProps={{
                    input: inputProps,
                  }}
                  variant="filled"
                />
              ) : (
                <Autocomplete
                  options={opciones}
                  onInputChange={(_, value) => buscarOpciones(value)}
                  onBlur={() => setOpciones([])}
                  loading={loading}
                  onChange={(_, data) => field.onChange(data)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      id="responsable"
                      label="Buscar Responsable del Edificio"
                      fullWidth
                      error={!!errors.responsableEdificio}
                      helperText={errors.responsableEdificio?.message}
                    />
                  )}
                  value={field.value || null}
                />
              )
            }
          />
        </Grid>

        {/* Mes Actual (Estático) */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box>
            <Typography variant="subtitle1">
              Mes: <strong>{mesActual}</strong>
            </Typography>
          </Box>
        </Grid>

        {/* Período Actual (Estático) */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box>
            <Typography variant="subtitle1">
              Período: <strong>{periodoActual}</strong>
            </Typography>
          </Box>
        </Grid>

        {/* Año Actual (Estático) */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box>
            <Typography variant="subtitle1">
              Año: <strong>{añoActual}</strong>
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InformacionGeneral;
