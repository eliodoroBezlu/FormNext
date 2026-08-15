"use client";

import { useMemo, useState } from "react";
import { useFieldArray, useWatch, UseFormReturn } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import SaveIcon from "@mui/icons-material/Save";
import type { AreaBackend } from "@/lib/actions/area-actions";
import type { SuperintendenciaBackend } from "@/lib/actions/superintendecia-actions";
import { PgrConfiguracionFormData } from "../../domain/schemas/pgrConfiguracionSchema";
import { PgrEstado } from "../../domain/models/IProps";
import type {
  EntregableSugerido,
  GrupoResponsable,
  UnidadRecurso,
} from "../../infrastructure/adapters/pgrCatalogoAdapter";
import { ActividadFormFields } from "./ActividadFormFields";
import { PgrEncabezadoFields } from "./PgrEncabezadoFields";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export interface PgrConfiguracionViewProps {
  form: UseFormReturn<PgrConfiguracionFormData>;
  fields: ReturnType<typeof useFieldArray<PgrConfiguracionFormData, "actividades">>["fields"];
  removeActividad: (index: number) => void;
  onAgregarActividad: () => void;
  /** Alta de un PGR nuevo: es el paso 1, sin actividades todavía. */
  esCreacion: boolean;
  estadoPlan: PgrEstado.BORRADOR | PgrEstado.CORREGIR;
  comentariosRechazo: string;
  areasList: AreaBackend[];
  superintendenciasList: SuperintendenciaBackend[];
  /** Catálogos configurables del PGR; se pasan a cada actividad. */
  unidades: UnidadRecurso[];
  entregablesSugeridos: EntregableSugerido[];
  gruposResponsables: GrupoResponsable[];
  isLoadingPlan: boolean;
  isPending: boolean;
  onGuardarBorrador: () => void;
  onEnviarAAprobacion: () => void;
  snackbar: SnackbarState;
  onCloseSnackbar: () => void;
}

export function PgrConfiguracionView({
  form,
  fields,
  removeActividad,
  onAgregarActividad,
  esCreacion,
  estadoPlan,
  comentariosRechazo,
  areasList,
  superintendenciasList,
  unidades,
  entregablesSugeridos,
  gruposResponsables,
  isLoadingPlan,
  isPending,
  onGuardarBorrador,
  onEnviarAAprobacion,
  snackbar,
  onCloseSnackbar,
}: PgrConfiguracionViewProps) {
  const {
    control,
    watch,
    formState: { errors },
  } = form;

  // Solo el mes de corte: atenúa los meses fuera de periodo en la matriz.
  // El total programado lo calcula cada actividad con un `useWatch` acotado a
  // sí misma; observar `actividades` entero desde acá hacía que una tecla en
  // un mes re-renderizara las 198 actividades de un PGR consolidado.
  const mesCorte = useWatch({ control, name: "mesCorte" });
  // Universo del selector de áreas de cada actividad: las del propio PGR.
  const areasDelPgr = useWatch({ control, name: "areas" }) ?? [];

  const [filtro, setFiltro] = useState("");

  /**
   * Actividades que pasan el filtro, **con su índice original**: las rutas de
   * RHF (`actividades.3.responsable`) son posicionales, así que reindexar al
   * filtrar escribiría en la actividad equivocada.
   *
   * Se filtra sobre los valores que trae `fields` —los cargados por `reset`—.
   * Alcanza porque descripción y verificador vienen de la matriz y casi nunca
   * se editan a mano; es lo que se usa para buscar.
   */
  const visibles = useMemo(() => {
    const conIndice = fields.map((item, index) => ({ item, index }));
    const busqueda = filtro.trim().toLowerCase();
    if (!busqueda) return conIndice;

    return conIndice.filter(({ item }) =>
      `${item.descripcion ?? ""} ${item.verificador ?? ""} ${(item.responsables ?? []).map((r) => r.nombre).join(" ")}`
        .toLowerCase()
        .includes(busqueda),
    );
  }, [fields, filtro]);

  /**
   * Solo la primera actividad con errores se abre sola. Al enviar a aprobación
   * un PGR consolidado pueden fallar las 198 a la vez; abrirlas todas monta
   * ~3.400 campos de golpe y vuelve a colgar la página.
   */
  const primerIndiceConError = useMemo(() => {
    const conError = visibles.find(({ index }) => !!errors.actividades?.[index]);
    return conError?.index;
  }, [visibles, errors.actividades]);

  // En estado CORREGIR el encabezado general queda bloqueado; solo las
  // actividades (donde están las correcciones solicitadas) son editables.
  const disabled = estadoPlan === PgrEstado.CORREGIR;

  if (isLoadingPlan) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: "1200px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        {esCreacion ? "Nuevo PGR — paso 1 de 2" : "Configuración Inicial"}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        {esCreacion
          ? "Datos generales del programa"
          : "Matriz de Planificación de Actividades"}
      </Typography>

      {esCreacion && (
        <Alert severity="info" sx={{ mb: 4 }}>
          Al guardar se pasa al <strong>paso 2</strong>: consolidar las matrices
          de riesgo aprobadas de la superintendencia. De ahí salen las
          actividades del programa —una por cada verificador con riesgos
          SUSTANCIAL o INACEPTABLE—, y después se les completa responsable,
          recurso y entregable, que la matriz no aporta.
        </Alert>
      )}

      {estadoPlan === PgrEstado.CORREGIR && comentariosRechazo && (
        <Alert severity="error" sx={{ mb: 4, whiteSpace: "pre-wrap" }}>
          <strong>El plan requiere correcciones en las siguientes actividades:</strong>
          <br />
          {comentariosRechazo}
        </Alert>
      )}

      <Box component="form" noValidate>
        <PgrEncabezadoFields
          control={control}
          watch={watch}
          errors={errors}
          areasList={areasList}
          superintendenciasList={superintendenciasList}
          disabled={disabled}
        />

        {/* Actividades Planificadas — en el alta todavía no hay ninguna. */}
        {!esCreacion && (
        <Card elevation={2} sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Actividades Planificadas ({fields.length})
              </Typography>
              <Button
                variant="contained"
                color="primary"
                type="button"
                startIcon={<AddIcon />}
                onClick={onAgregarActividad}
                sx={{ borderRadius: 4, textTransform: "none" }}
              >
                Agregar Actividad
              </Button>
            </Box>

            <TextField
              label="Buscar actividad"
              placeholder="Por descripción, verificador o responsable"
              size="small"
              fullWidth
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              helperText={
                filtro.trim()
                  ? `${visibles.length} de ${fields.length} actividad(es)`
                  : "Cada actividad se despliega para editarla. Las que tienen errores se abren solas."
              }
              sx={{ mb: 2 }}
            />

            {errors.actividades?.message && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.actividades.message}
              </Alert>
            )}

            {visibles.map(({ item, index }) => (
              <ActividadFormFields
                key={item.id}
                control={control}
                index={index}
                errors={errors.actividades}
                onRemove={removeActividad}
                mesCorte={mesCorte}
                abrirPorError={index === primerIndiceConError}
                areasDelPgr={areasDelPgr}
                unidades={unidades}
                entregablesSugeridos={entregablesSugeridos}
                gruposResponsables={gruposResponsables}
              />
            ))}
          </CardContent>
        </Card>
        )}

        {/* Action Buttons */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant={esCreacion ? "contained" : "outlined"}
            color="primary"
            type="button"
            startIcon={esCreacion ? <AccountTreeIcon /> : <SaveIcon />}
            onClick={onGuardarBorrador}
            disabled={isPending}
            sx={{ borderRadius: 4, textTransform: "none", px: 4 }}
          >
            {isPending
              ? "Guardando..."
              : esCreacion
                ? "Crear y consolidar matrices"
                : "Guardar Borrador"}
          </Button>
          {/* Un PGR recién creado no tiene actividades: no hay nada que aprobar. */}
          {!esCreacion && (
            <Button
              variant="contained"
              color="primary"
              type="button"
              startIcon={<SendIcon />}
              onClick={onEnviarAAprobacion}
              disabled={isPending}
              sx={{ borderRadius: 4, textTransform: "none", px: 4 }}
            >
              {isPending ? "Enviando..." : "Enviar a Aprobación"}
            </Button>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={onCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={onCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
