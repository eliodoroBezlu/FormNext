// src/components/form-sistemas-emergencia/InspeccionSistemasEmergencia.tsx

"use client";

import React from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  Alert,
  Chip,
  CircularProgress,
} from "@mui/material";
import { ArrowBack, Visibility, Edit } from "@mui/icons-material";

// Sub-componentes Refactorizados
import { AreaTagSelector } from "./presentation/components/selectors/AreaTagSelector";
import { EmergencyInspectionForm } from "./presentation/components/forms/EmergencyInspectionForm";
import { SuccessScreen } from "@/components/SucessScreen";

// Custom Hook de Lógica y Estado
import { useEmergencyForm } from "./application/hooks/useEmergencyForm";
import { type InspectionFormProps } from "./types/IProps";

export const InspeccionSistemasEmergencia = ({
  onCancel,
  initialData,
  isEditMode = false,
  readonly = false,
  idInstancia,
  onSaveUpdate,
  onTagSelected,
  preselectedTag,
  preselectedArea,
}: InspectionFormProps) => {
  
  // Consumimos toda la lógica desacoplada a través del Custom Hook
  const {
    currentMes,
    dentroPeriodoValido,
    showSuccessScreen,
    formState,
    areaData,
    handleAreaChange,
    handleTagChange,
    handleTagSubmit,
    determinarEstadoTag,
    handleExtintoresSeleccionados,
    onSubmit,
    // React Hook Form
    control,
    handleSubmit,
    setValue,
    reset,
    errors,
    hasRestoredDraft,
    clearDraft,
  } = useEmergencyForm({
    onCancel,
    initialData,
    isEditMode,
    readonly,
    idInstancia,
    onSaveUpdate,
    onTagSelected,
    preselectedTag,
    preselectedArea,
  });

  const { loading, showForm, error, successMessage, esFormularioExistente, soloExtintores, submitting } = formState;
  const { tag, area, areaOptions, extintores, tagOptions, extintoresSeleccionados, totalExtintoresActivos, tagUbicaciones } = areaData;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {showSuccessScreen ? (
        <SuccessScreen
          title="¡Inspección Guardada Exitosamente!"
          message="Operación realizada correctamente."
          subtitle={`TAG: ${tag} - Área: ${area}`}
          autoRedirect={true}
          redirectDelay={3000}
          redirectPath="/dashboard/formularios-de-inspeccion"
        />
      ) : (
        <>
          {/* Cabecera superior de navegación */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" gap={2} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={onCancel}
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  padding: { xs: "6px 12px", sm: "8px 16px" },
                }}
              >
                Volver
              </Button>
              {readonly && <Chip label="Solo Lectura" icon={<Visibility />} color="default" />}
              {isEditMode && <Chip label="Editando" icon={<Edit />} color="primary" />}
            </Box>
          </Box>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Formulario de Inspección de Seguridad
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Código: 3.02.P01.F17 - Rev. 2
            </Typography>

            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* ERROR DE FECHA (Si aplica) */}
            {!dentroPeriodoValido && !isEditMode && !readonly && (
              <Box sx={{ mb: 4 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Las inspecciones solo están habilitadas hasta el día 10 de cada mes.
                </Alert>
                <Button variant="contained" onClick={onCancel}>Volver al Panel</Button>
              </Box>
            )}

            {/* PANTALLA DE CARGA TRANSICIONAL PREMIUM */}
            {loading && !showForm && dentroPeriodoValido && (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="350px"
                sx={{
                  background: "rgba(0, 0, 0, 0.02)",
                  borderRadius: "16px",
                  border: "1px dashed",
                  borderColor: "divider",
                  p: 4,
                  textAlign: "center",
                }}
              >
                <CircularProgress size={50} thickness={4} sx={{ mb: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  Cargando Inspección de Seguridad
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450 }}>
                  {preselectedTag 
                    ? `Verificando datos y recuperando configuración para el TAG: ${preselectedTag}...`
                    : `Estableciendo conexión y recuperando información del TAG seleccionado...`}
                </Typography>
              </Box>
            )}

            {/* SELECCIÓN INICIAL DE ÁREA Y TAG (Solo en creación y si no se ha cargado el form ni está cargando) */}
            {!initialData && !showForm && dentroPeriodoValido && !loading && (
              <AreaTagSelector
                area={area}
                tag={tag}
                areaOptions={areaOptions}
                tagOptions={tagOptions}
                tagUbicaciones={tagUbicaciones}
                extintores={extintores}
                totalExtintoresActivos={totalExtintoresActivos}
                extintoresSeleccionados={extintoresSeleccionados}
                loading={loading}
                onAreaChange={handleAreaChange}
                onTagChange={handleTagChange}
                determinarEstadoTag={determinarEstadoTag}
                onExtintoresSeleccionados={handleExtintoresSeleccionados}
                onSubmit={handleTagSubmit}
              />
            )}

            {/* FORMULARIO PRINCIPAL REFACTORIZADO Y DESACOPLADO */}
            {showForm && dentroPeriodoValido && (
              <EmergencyInspectionForm
                control={control}
                handleSubmit={handleSubmit}
                setValue={setValue}
                reset={reset}
                errors={errors}
                isDirty={formState.submitting}
                currentMes={currentMes}
                readonly={readonly}
                isEditMode={isEditMode}
                loading={loading}
                submitting={submitting}
                onCancel={onCancel}
                areaOptions={areaOptions}
                extintores={extintores}
                extintoresSeleccionados={extintoresSeleccionados}
                soloExtintores={soloExtintores}
                esFormularioExistente={esFormularioExistente}
                onSubmit={onSubmit}
                hasRestoredDraft={hasRestoredDraft}
                clearDraft={clearDraft}
              />
            )}
          </Paper>
        </>
      )}
    </Container>
  );
};