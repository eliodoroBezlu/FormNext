// src/components/form-sistemas-emergencia/presentation/components/sections/InspeccionExtintores.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Paper,
  IconButton,
  TextField,
  FormControl,
  FormLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { type Control, Controller, useFieldArray, type FieldErrors } from "react-hook-form";
import type {
  ExtintorBackend,
  FormularioInspeccion,
  Mes,
  InspeccionExtintor,
} from "@/types/formTypes";
import EstadoInspeccionSelect from "./EstadoInspeccionSelect";
import { emergencyAdapter } from "@/components/form-sistemas-emergencia/infrastructure/adapters/emergencyAdapter";

interface InspeccionExtintoresProps {
  control: Control<FormularioInspeccion>;
  currentMes: Mes;
  extintores: ExtintorBackend[] | { extintores: ExtintorBackend[] };
  disabled?: boolean;
  errors: FieldErrors<FormularioInspeccion>;
}

const inputProps = {
  readOnly: true,
};

export const InspeccionExtintores = ({
  control,
  currentMes,
  extintores,
  disabled = false,
  errors,
}: InspeccionExtintoresProps) => {
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: `meses.${currentMes}.inspeccionesExtintor`,
  });

  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [extintorAEliminar, setExtintorAEliminar] = useState<{
    index: number;
    codigo: string;
  }>({ index: -1, codigo: "" });
  const [notificacion, setNotificacion] = useState({
    open: false,
    mensaje: "",
    type: "success" as "success" | "error",
  });

  const extintoresArray = useMemo(() => {
    if (!extintores) {
      return [];
    }

    if (
      typeof extintores === "object" &&
      !Array.isArray(extintores) &&
      "extintores" in extintores
    ) {
      return extintores.extintores || [];
    }

    if (Array.isArray(extintores)) {
      return extintores;
    }

    return [];
  }, [extintores]);

  const iniciarEliminacion = (index: number, codigo: string) => {
    setExtintorAEliminar({ index, codigo });
    setConfirmarEliminar(true);
  };

  const confirmarEliminacionExtintor = async () => {
    try {
      if (extintorAEliminar.codigo) {
        const resultado = await emergencyAdapter.deactivateExtintor(extintorAEliminar.codigo);

        if (resultado.exito) {
          remove(extintorAEliminar.index);
          setNotificacion({
            open: true,
            mensaje: "Extintor desactivado correctamente",
            type: "success",
          });
        } else {
          setNotificacion({
            open: true,
            mensaje: resultado.mensaje || "Error al desactivar el extintor",
            type: "error",
          });
        }
      } else {
        remove(extintorAEliminar.index);
      }
    } catch (error) {
      setNotificacion({
        open: true,
        mensaje: "Error al desactivar el extintor",
        type: "error",
      });
      console.error("Error al desactivar extintor:", error);
    } finally {
      setConfirmarEliminar(false);
    }
  };

  const agregarExtintor = () => {
    const nuevoExtintor: InspeccionExtintor = {
      fechaInspeccion: new Date().toISOString().split("T")[0],
      codigo: "",
      ubicacion: "",
      inspeccionMensual: "✓",
      manguera: "✓",
      cilindro: "✓",
      indicadorPresion: "✓",
      gatilloChavetaPrecinto: "✓",
      senalizacionSoporte: "✓",
      observaciones: "",
    };
    append(nuevoExtintor);
  };

  const nuevosExtintores = useMemo(() => {
    if (!extintoresArray || extintoresArray.length === 0) {
      return [];
    }

    return extintoresArray.map((extintor) => {
      const nuevoExtintor: InspeccionExtintor = {
        fechaInspeccion: new Date().toISOString().split("T")[0],
        codigo: extintor.CodigoExtintor || "",
        ubicacion: extintor.Ubicacion || "",
        inspeccionMensual: "✓",
        manguera: "✓",
        cilindro: "✓",
        indicadorPresion: "✓",
        gatilloChavetaPrecinto: "✓",
        senalizacionSoporte: "✓",
        observaciones: "",
      };
      return nuevoExtintor;
    });
  }, [extintoresArray]);

  useEffect(() => {
    if (nuevosExtintores.length > 0 && fields.length === 0) {
      replace(nuevosExtintores);
    }
  }, [nuevosExtintores, fields.length, replace]);

  return (
    <>
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Inspección de Extintores</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {fields.map((field, index) => (
            <Paper key={field.id} elevation={2} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 10 }}>
                  <Typography variant="subtitle1">
                    Extintor #{index + 1}
                  </Typography>
                </Grid>

                {!disabled && (
                  <Grid size={{ xs: 2 }} sx={{ textAlign: "right" }}>
                    <IconButton
                      onClick={() => iniciarEliminacion(index, field.codigo)}
                      color="error"
                      title="Desactivar extintor"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                )}

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name={`meses.${currentMes}.inspeccionesExtintor.${index}.fechaInspeccion`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="date"
                        label="Fecha Inspección"
                        fullWidth
                        InputProps={inputProps}
                        disabled={disabled}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name={`meses.${currentMes}.inspeccionesExtintor.${index}.codigo`}
                    control={control}
                    rules={{ required: "El código es obligatorio" }}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        label="Código" 
                        fullWidth 
                        disabled={disabled} 
                        error={!!errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.codigo}
                        helperText={errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.codigo?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Controller
                    name={`meses.${currentMes}.inspeccionesExtintor.${index}.ubicacion`}
                    control={control}
                    rules={{ required: "La ubicación es obligatoria" }}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        label="Ubicación" 
                        fullWidth 
                        disabled={disabled} 
                        error={!!errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.ubicacion}
                        helperText={errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.ubicacion?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Estado de los Componentes
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth size="small" error={!!errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.inspeccionMensual}>
                        <FormLabel component="legend">Inspección Mensual</FormLabel>
                        <Controller
                          name={`meses.${currentMes}.inspeccionesExtintor.${index}.inspeccionMensual`}
                          control={control}
                          rules={{ required: "Campo obligatorio" }}
                          render={({ field }) => (
                            <EstadoInspeccionSelect
                              value={field.value}
                              onChange={field.onChange}
                              disabled={disabled}
                              error={!!errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.inspeccionMensual}
                              helperText={errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.inspeccionMensual?.message}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth size="small" error={!!errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.manguera}>
                        <FormLabel component="legend">Manguera</FormLabel>
                        <Controller
                          name={`meses.${currentMes}.inspeccionesExtintor.${index}.manguera`}
                          control={control}
                          rules={{ required: "Campo obligatorio" }}
                          render={({ field }) => (
                            <EstadoInspeccionSelect
                              value={field.value}
                              onChange={field.onChange}
                              disabled={disabled}
                              error={!!errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.manguera}
                              helperText={errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.manguera?.message}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth size="small" error={!!errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.cilindro}>
                        <FormLabel component="legend">Cilindro</FormLabel>
                        <Controller
                          name={`meses.${currentMes}.inspeccionesExtintor.${index}.cilindro`}
                          control={control}
                          rules={{ required: "Campo obligatorio" }}
                          render={({ field }) => (
                            <EstadoInspeccionSelect
                              value={field.value}
                              onChange={field.onChange}
                              disabled={disabled}
                              error={!!errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.cilindro}
                              helperText={errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.cilindro?.message}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth size="small" error={!!errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.indicadorPresion}>
                        <FormLabel component="legend">Indicador Presión</FormLabel>
                        <Controller
                          name={`meses.${currentMes}.inspeccionesExtintor.${index}.indicadorPresion`}
                          control={control}
                          rules={{ required: "Campo obligatorio" }}
                          render={({ field }) => (
                            <EstadoInspeccionSelect
                              value={field.value}
                              onChange={field.onChange}
                              disabled={disabled}
                              error={!!errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.indicadorPresion}
                              helperText={errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.indicadorPresion?.message}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth size="small" error={!!errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.gatilloChavetaPrecinto}>
                        <FormLabel component="legend">Gatillo/Chaveta/Precinto</FormLabel>
                        <Controller
                          name={`meses.${currentMes}.inspeccionesExtintor.${index}.gatilloChavetaPrecinto`}
                          control={control}
                          rules={{ required: "Campo obligatorio" }}
                          render={({ field }) => (
                            <EstadoInspeccionSelect
                              value={field.value}
                              onChange={field.onChange}
                              disabled={disabled}
                              error={!!errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.gatilloChavetaPrecinto}
                              helperText={errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.gatilloChavetaPrecinto?.message}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth size="small" error={!!errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.senalizacionSoporte}>
                        <FormLabel component="legend">Señalización/Soporte</FormLabel>
                        <Controller
                          name={`meses.${currentMes}.inspeccionesExtintor.${index}.senalizacionSoporte`}
                          control={control}
                          rules={{ required: "Campo obligatorio" }}
                          render={({ field }) => (
                            <EstadoInspeccionSelect
                              value={field.value}
                              onChange={field.onChange}
                              disabled={disabled}
                              error={!!errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.senalizacionSoporte}
                              helperText={errors?.meses?.[currentMes]?.inspeccionesExtintor?.[index]?.senalizacionSoporte?.message}
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Controller
                    name={`meses.${currentMes}.inspeccionesExtintor.${index}.observaciones`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Observaciones"
                        fullWidth
                        multiline
                        rows={2}
                        disabled={disabled}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}

          {!disabled && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={agregarExtintor}
              sx={{ mb: 2 }}
            >
              Agregar Extintor
            </Button>
          )}

          {fields.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 2 }}>
              No hay extintores registrados.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      <Dialog open={confirmarEliminar} onClose={() => setConfirmarEliminar(false)}>
        <DialogTitle>Confirmar desactivación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea desactivar este extintor? El extintor se marcará como inactivo en el sistema.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmarEliminar(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmarEliminacionExtintor} color="error" autoFocus>
            Desactivar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notificacion.open}
        autoHideDuration={6000}
        onClose={() => setNotificacion({ ...notificacion, open: false })}
      >
        <Alert
          onClose={() => setNotificacion({ ...notificacion, open: false })}
          severity={notificacion.type}
          sx={{ width: "100%" }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </>
  );
};

export default InspeccionExtintores;
