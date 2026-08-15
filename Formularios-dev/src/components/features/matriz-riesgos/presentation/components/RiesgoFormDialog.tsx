"use client";

import { useEffect } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import {
  ActividadRiesgo,
  OpcionesDeCategoria,
  PreviaRiesgo,
  RiesgoDto,
  RiesgoIdentificado,
} from "../../domain/models/IProps";
import { NivelRiesgoChip } from "./NivelRiesgoChip";
import { ControlesFieldArray } from "./ControlesFieldArray";

const RIESGO_VACIO: RiesgoDto = {
  familiaPeligro: "",
  descripcionPeligro: "",
  familiaRiesgo: "",
  descripcionRiesgo: "",
  exposicion: 3,
  posibilidad: 3,
  severidad: 3,
  controles: [],
};

const deRiesgo = (r: RiesgoIdentificado): RiesgoDto => ({
  familiaPeligro: r.familiaPeligro,
  descripcionPeligro: r.descripcionPeligro,
  familiaRiesgo: r.familiaRiesgo,
  descripcionRiesgo: r.descripcionRiesgo,
  exposicion: r.exposicion,
  posibilidad: r.posibilidad,
  severidad: r.severidad,
  incidentesOcurridos: r.incidentesOcurridos,
  trazabilidad: r.trazabilidad,
  controles: r.controles.map((c) => ({
    familiaControl: c.familiaControl,
    medida: c.medida,
    familiaVerificador: c.familiaVerificador,
    verificador: c.verificador,
    calidadControl: c.calidadControl,
    jerarquiaControl: c.jerarquiaControl,
  })),
});

interface Props {
  abierto: boolean;
  /** La actividad dueña del riesgo. Su encabezado no se edita desde acá. */
  actividad: ActividadRiesgo;
  /** El riesgo a editar; ausente para dar de alta uno nuevo. */
  riesgo?: RiesgoIdentificado;
  opciones: OpcionesDeCategoria | null;
  previa: PreviaRiesgo | null;
  guardando: boolean;
  /**
   * Pide la vista previa al servidor. Devuelve la función de limpieza que
   * cancela el pedido pendiente: el efecto que la llama tiene que devolverla,
   * o los temporizadores se acumulan y una respuesta vieja puede pisar a la
   * actual.
   */
  onValoresChange: (
    datos: Pick<
      RiesgoDto,
      "exposicion" | "posibilidad" | "severidad" | "controles"
    >,
  ) => () => void;
  onGuardar: (dto: RiesgoDto) => void;
  onCerrar: () => void;
}

/**
 * Alta y edición de un riesgo con sus controles.
 *
 * El nivel que se ve mientras se escribe lo calcula el servidor con el mismo
 * motor que usa al guardar, así que la vista previa y lo persistido no pueden
 * discrepar.
 */
export function RiesgoFormDialog({
  abierto,
  actividad,
  riesgo,
  opciones,
  previa,
  guardando,
  onValoresChange,
  onGuardar,
  onCerrar,
}: Props) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RiesgoDto>({
    defaultValues: riesgo ? deRiesgo(riesgo) : RIESGO_VACIO,
    mode: "onTouched",
  });

  useEffect(() => {
    reset(riesgo ? deRiesgo(riesgo) : RIESGO_VACIO);
  }, [riesgo, reset]);

  const exposicion = useWatch({ control, name: "exposicion" });
  const posibilidad = useWatch({ control, name: "posibilidad" });
  const severidad = useWatch({ control, name: "severidad" });
  const controles = useWatch({ control, name: "controles" });

  /**
   * Lo único de los controles que cambia el nivel es jerarquía × calidad. Se
   * depende de su serialización y no del array: `useWatch` devuelve una
   * referencia nueva en cada render, y usarla dispararía el efecto en bucle.
   */
  const claveControles = JSON.stringify(
    (controles ?? []).map((c) => [c.jerarquiaControl, c.calidadControl]),
  );

  useEffect(() => {
    return onValoresChange({
      exposicion: Number(exposicion),
      posibilidad: Number(posibilidad),
      severidad: Number(severidad),
      controles: (JSON.parse(claveControles) as [string, string][]).map(
        ([jerarquiaControl, calidadControl]) => ({
          familiaControl: "",
          medida: "",
          verificador: "",
          jerarquiaControl,
          calidadControl,
        }),
      ),
    });
  }, [exposicion, posibilidad, severidad, claveControles, onValoresChange]);

  /** Lleva el foco al primer campo con error (patrón de doble frame). */
  const alFallar = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(
          '[data-question-error="true"], [aria-invalid="true"]',
        );
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.querySelector<HTMLElement>("input, textarea")?.focus();
      });
    });
  };

  const escala = (max: number) =>
    Array.from({ length: max }, (_, i) => i + 1).map((n) => (
      <MenuItem key={n} value={n}>
        {n}
      </MenuItem>
    ));

  const conCatalogo = (lista?: string[]) => lista ?? [];

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="md" fullWidth>
      <Box component="form" noValidate onSubmit={handleSubmit(onGuardar, alFallar)}>
        <DialogTitle>
          {riesgo ? `Editar riesgo N°${riesgo.numero}` : "Nuevo riesgo"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack gap={2.5}>
            {opciones?.sinCatalogo && (
              <Alert severity="info">
                «{opciones.categoria}» no tiene catálogo cargado en el
                formulario oficial. Escribí los valores a mano.
              </Alert>
            )}

            {/* El encabezado es de la actividad: acá solo se muestra, para
                que quien carga sepa a qué tarea le está sumando el riesgo. */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: "action.hover",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Actividad N°{actividad.numero} · {actividad.areaProcesoAlcance}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {actividad.actividadTarea}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {actividad.condicion} · {actividad.categoria}
              </Typography>
            </Box>

            <Divider textAlign="left">
              <Typography variant="caption">Peligro y riesgo</Typography>
            </Divider>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  freeSolo
                  options={conCatalogo(opciones?.peligros)}
                  onInputChange={(_, v) =>
                    register("familiaPeligro").onChange({
                      target: { name: "familiaPeligro", value: v },
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      {...register("familiaPeligro", {
                        required: "Indicá la familia de peligro",
                      })}
                      label="Familia de peligro"
                      size="small"
                      error={!!errors.familiaPeligro}
                      helperText={errors.familiaPeligro?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  freeSolo
                  options={conCatalogo(opciones?.riesgos)}
                  onInputChange={(_, v) =>
                    register("familiaRiesgo").onChange({
                      target: { name: "familiaRiesgo", value: v },
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      {...register("familiaRiesgo", {
                        required: "Indicá la familia de riesgo",
                      })}
                      label="Familia de riesgo"
                      size="small"
                      error={!!errors.familiaRiesgo}
                      helperText={errors.familiaRiesgo?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  {...register("descripcionPeligro", {
                    required: "Describí el peligro",
                  })}
                  fullWidth
                  size="small"
                  label="Descripción del peligro"
                  error={!!errors.descripcionPeligro}
                  helperText={errors.descripcionPeligro?.message}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  {...register("descripcionRiesgo", {
                    required: "Describí el riesgo",
                  })}
                  fullWidth
                  size="small"
                  label="Descripción del riesgo"
                  error={!!errors.descripcionRiesgo}
                  helperText={errors.descripcionRiesgo?.message}
                />
              </Grid>
            </Grid>

            <Divider textAlign="left">
              <Typography variant="caption">Evaluación</Typography>
            </Divider>

            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 4, sm: 2 }}>
                <TextField
                  {...register("exposicion", { valueAsNumber: true })}
                  select
                  fullWidth
                  size="small"
                  label="Exposición"
                >
                  {escala(6)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 4, sm: 2 }}>
                <TextField
                  {...register("posibilidad", { valueAsNumber: true })}
                  select
                  fullWidth
                  size="small"
                  label="Posibilidad"
                >
                  {escala(6)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 4, sm: 2 }}>
                <TextField
                  {...register("severidad", { valueAsNumber: true })}
                  select
                  fullWidth
                  size="small"
                  label="Severidad"
                >
                  {escala(5)}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack
                  direction="row"
                  gap={1}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Typography variant="caption" color="text.secondary">
                    Prob. {previa?.probabilidad ?? "—"} · Result.{" "}
                    {previa?.resultado ?? "—"}
                  </Typography>
                  <NivelRiesgoChip nivel={previa?.nivelInicial} />
                  <Typography variant="caption">→</Typography>
                  <NivelRiesgoChip nivel={previa?.nivelActual} marcarPgr />
                </Stack>
              </Grid>
            </Grid>

            {previa?.requierePgr && (
              <Alert severity="warning">
                Con este nivel residual el riesgo obliga a programar actividades
                en el PGR de la superintendencia.
              </Alert>
            )}

            <Divider />

            <ControlesFieldArray
              control={control}
              register={register}
              errors={errors}
              opciones={opciones}
              eficacias={previa?.eficacias ?? []}
            />

            <Divider textAlign="left">
              <Typography variant="caption">Opcional</Typography>
            </Divider>

            <TextField
              {...register("incidentesOcurridos")}
              fullWidth
              size="small"
              label="Incidentes ocurridos"
            />
            <TextField
              {...register("trazabilidad")}
              fullWidth
              size="small"
              label="Trazabilidad / observaciones"
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button type="button" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar riesgo"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
