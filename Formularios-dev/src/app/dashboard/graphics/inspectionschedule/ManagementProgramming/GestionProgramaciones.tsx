"use client";
import { useEffect } from "react";
import { Box, Typography, Button, Tooltip } from "@mui/material";
import { Add } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/es";
import { GestionProgramacionesProps } from "./types/IProps";
import { useProgramaciones } from "./hooks/useProgramaciones";
import { useProgramacionForm } from "./hooks/useProgramacionForm";
import { ProgramacionTable } from "./components/ProgramacionTable";
import { ProgramacionForm } from "./components/ProgramacionForm";
import { EmptyState } from "./components/EmptyState";

export default function GestionProgramaciones({
  templateId,
  templateName,
  año,
  programaciones,
  onProgramacionesChange,
}: GestionProgramacionesProps) {
  const {
    programaciones: programacionesList,
    areasDisponibles,
    loading,
    extraerAreasUnicas,
    crearProgramacion,
    actualizarProgramacion,
    eliminarProgramacion,
  } = useProgramaciones(programaciones);

  const {
    formData,
    programacionEditando,
    modalAbierto,
    error: formError,
    setFormData,
    setError: setFormError,
    abrirModalNuevo,
    abrirModalEditar,
    cerrarModal,
    validarFechas,
  } = useProgramacionForm();

  useEffect(() => {
    extraerAreasUnicas(programaciones);
  }, [programaciones, extraerAreasUnicas]);

  const handleGuardarProgramacion = async () => {
    if (!validarFechas(año) || !formData.area) {
      if (!formData.area) setFormError("El área es requerida");
      return;
    }

    if (!templateId) {
      setFormError("Error: Template ID no disponible");
      return;
    }

    try {
      if (programacionEditando) {
        await actualizarProgramacion(
          programacionEditando._id!,
          templateId,
          templateName,
          año,
          formData
        );
      } else {
        await crearProgramacion(templateId, templateName, año, formData);
      }

      cerrarModal();
      onProgramacionesChange();
    } catch (error) {
      console.error("Error en guardar programación:", error);
    }
  };

  const handleEliminarProgramacion = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta programación?")) return;

    try {
      await eliminarProgramacion(id);
      onProgramacionesChange();
    } catch (error) {
      console.error("Error al eliminar programación:", error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Typography>
              Año: {año} 
            </Typography>
          </Box>
          
          <Tooltip 
            title={areasDisponibles.length === 0 ? "Para que pueda programara una inspeccion debe crear la primera vez desde el Dashboard" : "Crear nueva programación"}
            arrow
          >
            <span>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={abrirModalNuevo}
                disabled={areasDisponibles.length === 0}
              >
                Nueva inspección
                {areasDisponibles.length === 0 && " (No hay áreas)"}
              </Button>
            </span>
          </Tooltip>
        </Box>

        {programacionesList.length > 0 ? (
          <ProgramacionTable
            programaciones={programacionesList}
            onEditar={abrirModalEditar}
            onEliminar={handleEliminarProgramacion}
          />
        ) : (
          <EmptyState año={año} />
        )}

        <ProgramacionForm
          open={modalAbierto}
          editando={!!programacionEditando}
          formData={formData}
          areasDisponibles={areasDisponibles}
          loading={loading}
          error={formError}
          onClose={cerrarModal}
          onSave={handleGuardarProgramacion}
          onFormDataChange={setFormData}
        />
      </Box>
    </LocalizationProvider>
  );
}