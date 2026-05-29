// src/components/form-sistemas-emergencia/presentation/components/forms/EmergencyInspectionForm.tsx

import React, { useCallback } from "react";
import { Box, Button, Grid, Alert, AlertTitle } from "@mui/material";
import { DeleteSweep, Restore } from "@mui/icons-material";
import type { Control, FieldErrors, UseFormSetValue, UseFormHandleSubmit, UseFormReset } from "react-hook-form";
import type { ExtintorBackend, FormularioInspeccion, Mes } from "@/types/formTypes";

// Secciones del Formulario
import InformacionGeneral from "../sections/InformacionGeneral";
import SistemasPasivos from "../sections/SistemasPasivos";
import SistemasActivos from "../sections/SistemasActivos";
import InspeccionExtintores from "../sections/InspeccionExtintores";
import InformacionInspector from "../sections/InformacionInspector";

interface EmergencyInspectionFormProps {
  control: Control<FormularioInspeccion>;
  handleSubmit: UseFormHandleSubmit<FormularioInspeccion>;
  setValue: UseFormSetValue<FormularioInspeccion>;
  reset: UseFormReset<FormularioInspeccion>;
  errors: FieldErrors<FormularioInspeccion>;
  isDirty: boolean;
  
  currentMes: Mes;
  readonly: boolean;
  isEditMode: boolean;
  loading: boolean;
  submitting: boolean;
  onCancel: () => void;
  
  areaOptions: string[];
  extintores: ExtintorBackend[];
  extintoresSeleccionados: ExtintorBackend[];
  soloExtintores: boolean;
  esFormularioExistente: boolean;
  
  onSubmit: (data: FormularioInspeccion) => Promise<void>;
  hasRestoredDraft?: boolean;
  clearDraft?: () => void;
}

export const EmergencyInspectionForm = ({
  control,
  handleSubmit,
  setValue,
  reset,
  errors,
  currentMes,
  readonly,
  isEditMode,
  loading,
  submitting,
  onCancel,
  areaOptions,
  extintores,
  extintoresSeleccionados,
  soloExtintores,
  esFormularioExistente,
  onSubmit,
  hasRestoredDraft = false,
  clearDraft,
}: EmergencyInspectionFormProps) => {

  // --- SCROLL INTERACTIVO SUAVE A ERRORES (MÉTODO OFICIAL BASELINE) ---
  const handleInvalidSubmit = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const errorElement = document.querySelector<HTMLElement>(
          '[data-question-error="true"], [aria-invalid="true"], .Mui-error'
        );
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          const focusable = errorElement.querySelector<HTMLElement>(
            "input, textarea, button[aria-pressed]"
          );
          (focusable ?? errorElement).focus?.();
        }
      });
    });
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)} noValidate>
      {/* Aviso de borrador restaurado */}
      {hasRestoredDraft && (
        <Alert
          severity="info"
          icon={<Restore />}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<DeleteSweep />}
              onClick={clearDraft}
              sx={{ fontWeight: "bold" }}
            >
              Descartar Borrador
            </Button>
          }
          sx={{ mb: 3 }}
        >
          <AlertTitle sx={{ fontWeight: "bold" }}>Borrador restaurado automáticamente</AlertTitle>
          Se cargaron los datos que ingresaste anteriormente antes de la última recarga.
        </Alert>
      )}

      {/* 1. Información General */}
      <InformacionGeneral
        control={control}
        errors={errors}
        soloLectura={esFormularioExistente || readonly}
        areaOptions={areaOptions}
      />

      {/* 2. Sistemas Pasivos y Activos (solo si no es vista parcial de extintores) */}
      {!soloExtintores && (
        <>
          <SistemasPasivos 
            control={control} 
            setValue={setValue} 
            currentMes={currentMes} 
            disabled={readonly} 
            errors={errors} 
          />
          <SistemasActivos 
            control={control} 
            setValue={setValue} 
            currentMes={currentMes} 
            disabled={readonly} 
            errors={errors} 
          />
        </>
      )}

      {/* 3. Inspección de Extintores */}
      <InspeccionExtintores
        control={control}
        currentMes={currentMes}
        extintores={extintoresSeleccionados.length > 0 ? extintoresSeleccionados : extintores}
        disabled={readonly}
        errors={errors}
      />

      {/* 4. Información de Inspector (Firma y Datos) */}
      {!soloExtintores && (
        <InformacionInspector
          control={control}
          currentMes={currentMes}
          setValue={setValue}
          errors={errors}
          disabled={readonly}
        />
      )}

      {/* 5. Botones de Acción */}
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={2} justifyContent="space-between">
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              fullWidth
              onClick={() => {
                if (isEditMode) onCancel();
                else reset();
              }}
              disabled={loading || submitting}
            >
              Cancelar
            </Button>
          </Grid>

          {!readonly && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading || submitting}
              >
                {submitting ? "Guardando..." : isEditMode ? "Actualizar Inspección" : "Guardar Inspección"}
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>
    </form>
  );
};

export default EmergencyInspectionForm;
