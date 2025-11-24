'use client';

import { useState } from 'react';
import {
  Container,
  Button,
  Box,
  Alert,
  Typography,
} from '@mui/material';
import { ArrowBack, Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { PlanDeAccion, TareaObservacion, AddTareaDTO, UpdateTareaDTO } from '../types/IProps';
import { TareasTable } from './TareasTable';
import { TareaFormModal } from './TareaFormModal';
import { HeaderInfo } from '../header-info';
import { TaskSummary } from '../task-summary';

interface PlanDetailViewProps {
  plan: PlanDeAccion;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  onEditHeader: () => void;
  onAddTarea: (data: AddTareaDTO) => Promise<void>;
  onUpdateTarea: (tareaId: string, data: UpdateTareaDTO) => Promise<void>;
  onDeleteTarea: (tareaId: string) => Promise<void>;
  onApproveTarea: (tareaId: string) => Promise<void>;
}

export function PlanDetailView({
  plan,
  isLoading,
  error,
  onBack,
  onEditHeader,
  onAddTarea,
  onUpdateTarea,
  onDeleteTarea,
  onApproveTarea,
}: PlanDetailViewProps) {
  const [openTareaModal, setOpenTareaModal] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<TareaObservacion | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleOpenAddTarea = () => {
    setSelectedTarea(null);
    setOpenTareaModal(true);
  };

  const handleEditTarea = (tarea: TareaObservacion) => {
    setSelectedTarea(tarea);
    setOpenTareaModal(true);
  };

  const handleCloseTareaModal = () => {
    setOpenTareaModal(false);
    setSelectedTarea(null);
  };

 const handleSubmitTarea = async (data: AddTareaDTO | UpdateTareaDTO) => {
  try {
    setLocalError(null);
    if (selectedTarea) {
      // Editar tarea existente - usar UpdateTareaDTO
      await onUpdateTarea(selectedTarea._id!, data as UpdateTareaDTO);
    } else {
      // Agregar nueva tarea - usar AddTareaDTO
      await onAddTarea(data as AddTareaDTO);
    }
    handleCloseTareaModal();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error al guardar tarea';
    setLocalError(errorMessage);
    throw err;
  }
};

  const handleDeleteTarea = async (tareaId: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta tarea?')) {
      try {
        setLocalError(null);
        await onDeleteTarea(tareaId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar tarea';
        setLocalError(errorMessage);
      }
    }
  };

  const handleApproveTarea = async (tareaId: string) => {
    try {
      setLocalError(null);
      await onApproveTarea(tareaId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aprobar tarea';
      setLocalError(errorMessage);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Botón de volver */}
      <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 3 }}>
        Volver a la lista de planes
      </Button>

      {/* Header con datos organizacionales */}
      <HeaderInfo
        info={{
          vicepresidencia: plan.vicepresidencia,
          superintendenciaSenior: plan.superintendenciaSenior,
          superintendencia: plan.superintendencia,
          areaFisica: plan.areaFisica,
        }}
        isEditable={true}
      />

      {/* Resumen de tareas del plan */}
      <TaskSummary
        summary={{
          tareasAbiertas: plan.tareasAbiertas,
          tareasCerradas: plan.tareasCerradas,
          tareasEnProgreso: plan.tareasEnProgreso,
          totalTareas: plan.totalTareas,
          porcentajeCierre: plan.porcentajeCierre,
        }}
      />

      {/* Errores */}
      {(error || localError) && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setLocalError(null)}>
          {error || localError}
        </Alert>
      )}

      {/* Metadatos del plan */}
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>ID del Plan:</strong> {plan._id}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Fecha de Creación:</strong>{' '}
          {new Date(plan.fechaCreacion).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Última Actualización:</strong>{' '}
          {new Date(plan.fechaUltimaActualizacion).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Estado General:</strong>{' '}
          <Box
            component="span"
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor:
                plan.estado === 'cerrado'
                  ? '#4caf50'
                  : plan.estado === 'en-progreso'
                  ? '#ff9800'
                  : '#f44336',
              color: 'white',
              fontWeight: 600,
            }}
          >
            {plan.estado.toUpperCase()}
          </Box>
        </Typography>
      </Box>

      {/* Botones de acción */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={onEditHeader}
          disabled={isLoading}
        >
          Editar Datos Organizacionales
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddTarea}
          disabled={isLoading}
        >
          Agregar Tarea
        </Button>
      </Box>

      {/* Tabla de tareas */}
      <TareasTable
        tareas={plan.tareas}
        onEdit={handleEditTarea}
        onDelete={handleDeleteTarea}
        onApprove={handleApproveTarea}
      />

      {/* Modal para agregar/editar tarea */}
      <TareaFormModal
        open={openTareaModal}
        isLoading={isLoading}
        tarea={selectedTarea}
        onClose={handleCloseTareaModal}
        onSubmit={handleSubmitTarea}
      />
    </Container>
  );
}