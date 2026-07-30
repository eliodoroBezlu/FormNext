"use client";

import { useMemo } from "react";
import { useFieldArray, useWatch, UseFormReturn } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import SaveIcon from "@mui/icons-material/Save";
import type { AreaBackend } from "@/lib/actions/area-actions";
import type { SuperintendenciaBackend } from "@/lib/actions/superintendecia-actions";
import { PgrConfiguracionFormData } from "../../domain/schemas/pgrConfiguracionSchema";
import { PgrEstado } from "../../domain/models/IProps";
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
  estadoPlan: PgrEstado.BORRADOR | PgrEstado.CORREGIR;
  comentariosRechazo: string;
  areasList: AreaBackend[];
  superintendenciasList: SuperintendenciaBackend[];
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
  estadoPlan,
  comentariosRechazo,
  areasList,
  superintendenciasList,
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

  // Se observan para atenuar los meses fuera de periodo en la matriz y para
  // mostrar el total programado de cada actividad.
  const mesCorte = useWatch({ control, name: "mesCorte" });
  const actividadesObservadas = useWatch({ control, name: "actividades" });

  const totalesPorActividad = useMemo(
    () =>
      (actividadesObservadas ?? []).map((a) =>
        (a?.programacion ?? []).reduce(
          (sum, m) => sum + (Number(m?.programado) || 0),
          0,
        ),
      ),
    [actividadesObservadas],
  );

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
        Configuración Inicial
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Matriz de Planificación de Actividades
      </Typography>

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

        {/* Actividades Planificadas */}
        <Card elevation={2} sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                Actividades Planificadas
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

            {errors.actividades?.message && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.actividades.message}
              </Alert>
            )}

            {fields.map((item, index) => (
              <ActividadFormFields
                key={item.id}
                control={control}
                index={index}
                errors={errors.actividades}
                onRemove={removeActividad}
                mesCorte={mesCorte}
                totalProgramado={totalesPorActividad[index]}
              />
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            type="button"
            startIcon={<SaveIcon />}
            onClick={onGuardarBorrador}
            disabled={isPending}
            sx={{ borderRadius: 4, textTransform: "none", px: 4 }}
          >
            {isPending ? "Guardando..." : "Guardar Borrador"}
          </Button>
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
