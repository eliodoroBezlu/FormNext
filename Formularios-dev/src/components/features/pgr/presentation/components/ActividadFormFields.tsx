"use client";

import { useState } from "react";
import { Control, Controller, FieldErrors, useWatch } from "react-hook-form";
import {
  Autocomplete,
  Box,
  Chip,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { PgrConfiguracionFormData } from "../../domain/schemas/pgrConfiguracionSchema";
import type {
  EntregableSugerido,
  GrupoResponsable,
  UnidadRecurso,
} from "../../infrastructure/adapters/pgrCatalogoAdapter";
import { ProgramacionMatriz } from "./ProgramacionMatriz";
import { RecursosFieldArray } from "./RecursosFieldArray";

export interface ActividadFormFieldsProps {
  control: Control<PgrConfiguracionFormData>;
  index: number;
  errors: FieldErrors<PgrConfiguracionFormData>["actividades"];
  onRemove: (index: number) => void;
  /** Mes de corte del PGR, para atenuar los meses fuera de periodo. */
  mesCorte?: number;
  /**
   * Desplegarla aunque esté cerrada. Lo usa el padre **solo con la primera**
   * actividad con errores: al enviar a aprobación pueden fallar las 198 a la
   * vez, y abrirlas todas volvería a colgar la página.
   */
  abrirPorError?: boolean;
  /** Áreas de la superintendencia del PGR — el universo del selector. */
  areasDelPgr: string[];
  /** Catálogos configurables; vienen de la base, no de constantes. */
  unidades: UnidadRecurso[];
  entregablesSugeridos: EntregableSugerido[];
  gruposResponsables: GrupoResponsable[];
}

/**
 * Una actividad del PGR: cabecera siempre visible, campos al desplegarla.
 *
 * ── Por qué arranca colapsada ──────────────────────────────────────────────
 *
 * Cada actividad desplegada son 5 campos de texto más la matriz de 12 meses,
 * que a su vez son 12 campos y 12 tooltips: 17 `TextField` y 12 `Tooltip` de
 * MUI. Un PGR consolidado desde las matrices de riesgo de una superintendencia
 * llega a 198 actividades — el `PLAN-2026-0015` las tiene—, o sea **3.366
 * campos y 2.376 tooltips en un solo render síncrono**. El navegador se
 * quedaba clavado en el spinner y la página nunca llegaba a pintarse.
 *
 * Con `unmountOnExit` solo se monta lo que está abierto. Los valores no se
 * pierden al desmontar: RHF los guarda en el estado del formulario
 * (`shouldUnregister` es `false` por defecto).
 */
export function ActividadFormFields({
  control,
  index,
  errors,
  onRemove,
  mesCorte,
  abrirPorError = false,
  areasDelPgr,
  unidades,
  entregablesSugeridos,
  gruposResponsables,
}: ActividadFormFieldsProps) {
  const theme = useTheme();
  const [abierto, setAbierto] = useState(false);

  const actividadErrors = errors?.[index];
  const hasAnyError = !!actividadErrors;
  // La primera con errores se despliega sola: si no, el scroll al primer error
  // (Patrón 2) llevaría a una fila cerrada y el usuario no vería qué corregir.
  const desplegada = abierto || abrirPorError;

  // Acotado a esta actividad. Antes el total lo calculaba el padre observando
  // `actividades` entero, así que una tecla en un mes re-renderizaba las 198.
  const [
    descripcion,
    verificador,
    areas,
    responsables,
    recursos,
    entregables,
    programacion,
  ] = useWatch({
    control,
    name: [
      `actividades.${index}.descripcion`,
      `actividades.${index}.verificador`,
      `actividades.${index}.areas`,
      `actividades.${index}.responsables`,
      `actividades.${index}.recursos`,
      `actividades.${index}.entregables`,
      `actividades.${index}.programacion`,
    ],
  });

  const totalProgramado = (programacion ?? []).reduce(
    (suma, mes) => suma + (Number(mes?.programado) || 0),
    0,
  );

  // Responsables, recursos y entregables no salen de la matriz: una actividad
  // recién consolidada nace sin ellos y hay que completarlos antes de aprobar.
  const incompleta =
    (responsables ?? []).length === 0 ||
    (recursos ?? []).length === 0 ||
    (entregables ?? []).length === 0;

  /** Vacío = todas. Es el caso habitual; acotar es la excepción. */
  const alcanceTodas = (areas ?? []).length === 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        backgroundColor: theme.palette.action.hover,
      }}
      data-question-error={hasAnyError ? "true" : undefined}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <IconButton
          size="small"
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={desplegada}
          aria-label={
            desplegada
              ? `Ocultar los campos de la actividad ${index + 1}`
              : `Editar la actividad ${index + 1}`
          }
        >
          {desplegada ? (
            <KeyboardArrowDownIcon fontSize="small" />
          ) : (
            <KeyboardArrowRightIcon fontSize="small" />
          )}
        </IconButton>

        <Box flex={1} minWidth={0}>
          <Typography variant="body2" fontWeight={600} noWrap title={descripcion}>
            {index + 1}. {descripcion || "(sin descripción)"}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {verificador || "(sin verificador)"}
          </Typography>
        </Box>

        <Chip
          size="small"
          variant="outlined"
          label={
            alcanceTodas
              ? `Todas las áreas (${areasDelPgr.length})`
              : `${(areas ?? []).length} área(s)`
          }
          color={alcanceTodas ? "default" : "info"}
        />
        <Chip
          size="small"
          variant="outlined"
          label={`Total: ${totalProgramado}`}
          color={totalProgramado > 0 ? "primary" : "default"}
        />
        {incompleta && (
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            label="Faltan datos"
          />
        )}

        <IconButton color="error" type="button" onClick={() => onRemove(index)}>
          <DeleteIcon />
        </IconButton>
      </Stack>

      <Collapse in={desplegada} timeout="auto" unmountOnExit>
        <Grid container spacing={2} alignItems="center" mt={0.5}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Controller
              name={`actividades.${index}.verificador`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Verificador"
                  fullWidth
                  size="small"
                  error={!!actividadErrors?.verificador}
                  helperText={actividadErrors?.verificador?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Controller
              name={`actividades.${index}.descripcion`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Actividad"
                  placeholder="Descripción de la actividad"
                  fullWidth
                  size="small"
                  error={!!actividadErrors?.descripcion}
                  helperText={actividadErrors?.descripcion?.message}
                />
              )}
            />
          </Grid>
          <Grid size={12}>
            <Controller
              name={`actividades.${index}.areas`}
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  size="small"
                  options={areasDelPgr}
                  value={field.value ?? []}
                  onChange={(_, v) => field.onChange(v)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Áreas"
                      placeholder={alcanceTodas ? "Todas las áreas" : ""}
                      helperText={
                        alcanceTodas
                          ? `Sin selección la actividad aplica a las ${areasDelPgr.length} áreas de la superintendencia. Elegí solo si corresponde acotarla.`
                          : "Esta actividad aplica únicamente a las áreas elegidas."
                      }
                    />
                  )}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={`actividades.${index}.responsables`}
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  size="small"
                  // Grupos primero: asignar el grupo alcanza a sus miembros y
                  // se mantiene solo con el sync del roster.
                  options={gruposResponsables.map((g) => ({
                    tipo: "grupo" as const,
                    referencia: g._id,
                    nombre: g.nombre,
                  }))}
                  value={field.value ?? []}
                  onChange={(_, v) => field.onChange(v)}
                  getOptionLabel={(o) =>
                    typeof o === "string" ? o : o.nombre
                  }
                  isOptionEqualToValue={(o, v) =>
                    o.tipo === v.tipo && o.referencia === v.referencia
                  }
                  freeSolo
                  // Escribir a mano da un responsable suelto: pasa cuando no
                  // existe un grupo que cubra el caso.
                  onInputChange={() => undefined}
                  renderTags={(valores, getTagProps) =>
                    valores.map((v, i) => {
                      const { key, ...props } = getTagProps({ index: i });
                      return (
                        <Chip
                          key={key}
                          {...props}
                          size="small"
                          label={v.nombre}
                          color={v.tipo === "grupo" ? "primary" : "default"}
                          variant="outlined"
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Responsables"
                      error={!!actividadErrors?.responsables}
                      helperText={
                        actividadErrors?.responsables?.message ??
                        "Grupos en color; también podés escribir un nombre suelto."
                      }
                    />
                  )}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name={`actividades.${index}.entregables`}
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  freeSolo
                  size="small"
                  options={entregablesSugeridos.map((e) => e.nombre)}
                  value={field.value ?? []}
                  onChange={(_, v) => field.onChange(v)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Entregables"
                      error={!!actividadErrors?.entregables}
                      helperText={
                        (actividadErrors?.entregables as
                          | { message?: string }
                          | undefined)?.message ??
                        "Normalmente uno; se admiten varios."
                      }
                    />
                  )}
                />
              )}
            />
          </Grid>

          <Grid size={12}>
            <RecursosFieldArray
              control={control}
              actividadIndex={index}
              unidades={unidades}
              error={
                (actividadErrors?.recursos as { message?: string } | undefined)
                  ?.message
              }
            />
          </Grid>

          <Grid size={12}>
            <ProgramacionMatriz
              control={control}
              actividadIndex={index}
              mesCorte={mesCorte}
              totalProgramado={totalProgramado}
              error={
                // El refine del schema cuelga del array, no de un mes concreto
                (actividadErrors?.programacion as { message?: string } | undefined)
                  ?.message
              }
            />
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
}
