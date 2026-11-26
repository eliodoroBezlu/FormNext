"use client";

import { Alert, Button, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useMemo } from "react";
import { get, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { TAREA_VACIA, type ValoresReporte } from "../../domain/formularioReporte";
import type { Catalogos, Coordinador } from "../../domain/models/Monitoreo";
import { etiquetaDeSemana, opcionesDeSemana, semanaISO } from "../../domain/semanasDelAnio";
import { CampoCatalogo, CampoLista, CampoTexto } from "./CamposReporte";

const GRUPO: Record<Coordinador["rol"], string> = {
  superintendente: "Superintendentes",
  supervisor: "Supervisores",
};

/** El formato trae cinco columnas de tareas. */
const MAX_TAREAS = 5;

/**
 * Las tareas que salen de las recomendaciones.
 *
 * Los campos con `*` siguen la regla impresa en el formato: «deben ser
 * llenadas obligatoriamente si existen recomendaciones».
 *
 * «Comunicado / coordinado con» ofrece a los supervisores y superintendentes
 * (se puede escribir otro nombre), y la semana recomendada, las semanas del
 * año del reporte.
 */
export function SeccionTareas({
  catalogos,
  coordinadores,
  soloLectura,
}: {
  catalogos: Catalogos;
  coordinadores: Coordinador[];
  soloLectura: boolean;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext<ValoresReporte>();
  const { fields, append, remove } = useFieldArray({ control, name: "tareas" });
  const errorGeneral = get(errors, "tareas") as { message?: string } | undefined;
  const fecha = useWatch({ control, name: "fecha" });
  const semanas = useMemo(() => opcionesDeSemana(fecha), [fecha]);
  const actual = semanaISO(fecha);
  const ayudaSemana = actual
    ? `La fecha del reporte cae en la ${etiquetaDeSemana(
        actual.semana,
        actual.anio === Number(fecha.slice(0, 4)) ? undefined : actual.anio,
      ).toLowerCase()}`
    : undefined;

  // Ordenados por grupo (lo pide `groupBy`): superintendentes primero.
  const { nombres, grupoDe } = useMemo(() => {
    const orden = [...coordinadores].sort(
      (a, b) => a.rol.localeCompare(b.rol, "es") || a.nombre.localeCompare(b.nombre, "es"),
    );
    const grupos = new Map(orden.map((c) => [c.nombre, GRUPO[c.rol]]));
    return {
      nombres: [...new Set(orden.map((c) => c.nombre))],
      grupoDe: (nombre: string) => grupos.get(nombre) ?? "Otro",
    };
  }, [coordinadores]);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={700}>
          Tareas
        </Typography>
        {!soloLectura && (
          <Button
            type="button"
            size="small"
            startIcon={<Add />}
            disabled={fields.length >= MAX_TAREAS}
            onClick={() => append({ ...TAREA_VACIA })}
          >
            Agregar tarea
          </Button>
        )}
      </Stack>

      {errorGeneral?.message && (
        <Alert severity="error" sx={{ mb: 2 }} data-question-error="true">
          {errorGeneral.message}
        </Alert>
      )}
      {fields.length === 0 && !errorGeneral?.message && (
        <Typography variant="body2" color="text.secondary">
          Sin tareas.
        </Typography>
      )}

      <Stack gap={2}>
        {fields.map((f, i) => (
          <Paper key={f.id} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight={600}>
                Tarea {i + 1}
              </Typography>
              {!soloLectura && (
                <IconButton type="button" size="small" onClick={() => remove(i)} aria-label="Quitar tarea">
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Stack>
            <Grid container spacing={2}>
              <Grid size={12}>
                <CampoTexto
                  nombre={`tareas.${i}.descripcion`}
                  label="* Descripción de la tarea"
                  soloLectura={soloLectura}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CampoCatalogo
                  nombre={`tareas.${i}.grupo_trabajo`}
                  etiqueta="Grupo de trabajo"
                  opciones={catalogos.grupo_trabajo}
                  soloLectura={soloLectura}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CampoCatalogo
                  nombre={`tareas.${i}.prioridad`}
                  etiqueta="Prioridad (JDE)"
                  opciones={catalogos.prioridad_jde}
                  soloLectura={soloLectura}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CampoTexto nombre={`tareas.${i}.ot`} label="N° de OT" soloLectura={soloLectura} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CampoLista
                  nombre={`tareas.${i}.comunicado_con`}
                  etiqueta="* Comunicado / coordinado con"
                  opciones={nombres}
                  agrupar={grupoDe}
                  libre
                  helperText={
                    coordinadores.length === 0 ? "Sin lista del IAM: escriba el nombre" : undefined
                  }
                  soloLectura={soloLectura}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CampoLista
                  nombre={`tareas.${i}.semana`}
                  etiqueta="Semana recomendada de ejecución"
                  opciones={semanas}
                  helperText={ayudaSemana}
                  soloLectura={soloLectura}
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary" display="block" mt={2}>
        Los campos con (*) son obligatorios si hay recomendaciones.
      </Typography>
    </Paper>
  );
}
