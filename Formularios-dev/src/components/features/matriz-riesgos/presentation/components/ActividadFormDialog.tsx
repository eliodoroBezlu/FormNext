"use client";

import { useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import {
  ActividadDto,
  ActividadRiesgo,
  CATEGORIAS,
  CONDICIONES,
} from "../../domain/models/IProps";

const VACIA: ActividadDto = {
  areaProcesoAlcance: "",
  actividadTarea: "",
  condicion: "Normal",
  categoria: "Seguridad",
};

interface Props {
  abierto: boolean;
  /** La actividad a editar; ausente para dar de alta una nueva. */
  actividad?: ActividadRiesgo;
  guardando: boolean;
  onGuardar: (dto: ActividadDto) => void;
  onCerrar: () => void;
}

/**
 * Alta y edición del encabezado de una actividad.
 *
 * Editar acá renombra la actividad **en todos sus riesgos de una vez**: es lo
 * que permite unificar las que quedaron partidas por un tipeo, como "Trabajo
 * en Taller" contra "Trabajos en Taller".
 */
export function ActividadFormDialog({
  abierto,
  actividad,
  guardando,
  onGuardar,
  onCerrar,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ActividadDto>({
    defaultValues: actividad ?? VACIA,
    mode: "onTouched",
  });

  useEffect(() => {
    reset(
      actividad
        ? {
            areaProcesoAlcance: actividad.areaProcesoAlcance,
            actividadTarea: actividad.actividadTarea,
            condicion: actividad.condicion,
            categoria: actividad.categoria,
          }
        : VACIA,
    );
  }, [actividad, reset]);

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="sm" fullWidth>
      <Box component="form" noValidate onSubmit={handleSubmit(onGuardar)}>
        <DialogTitle>
          {actividad
            ? `Editar la actividad N°${actividad.numero}`
            : "Nueva actividad"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack gap={2.5}>
            {actividad && actividad.riesgos.length > 0 && (
              <Alert severity="info">
                Los cambios se aplican a los {actividad.riesgos.length} riesgo(s)
                de esta actividad. Sus evaluaciones no se tocan.
              </Alert>
            )}

            <TextField
              {...register("areaProcesoAlcance", {
                required: "Indicá el área, proceso o alcance",
              })}
              label="Área / Proceso / Alcance"
              size="small"
              fullWidth
              error={!!errors.areaProcesoAlcance}
              helperText={errors.areaProcesoAlcance?.message}
            />

            <TextField
              {...register("actividadTarea", {
                required: "Indicá la actividad o tarea",
              })}
              label="Actividad / Tarea"
              size="small"
              fullWidth
              multiline
              minRows={2}
              error={!!errors.actividadTarea}
              helperText={errors.actividadTarea?.message}
            />

            <TextField
              {...register("condicion", { required: true })}
              select
              label="Condición"
              size="small"
              fullWidth
            >
              {CONDICIONES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              {...register("categoria", { required: true })}
              select
              label="Categoría"
              size="small"
              fullWidth
              helperText="Define qué catálogos y qué jerarquía se ofrecen a todos sus riesgos"
            >
              {CATEGORIAS.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button type="button" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
