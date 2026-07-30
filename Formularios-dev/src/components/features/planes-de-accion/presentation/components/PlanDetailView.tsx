'use client';

import { useState } from 'react';
import {
  Container,
  Button,
  Box,
  Alert,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  Add as AddIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { PlanDeAccion, TareaObservacion, AddTareaDTO, UpdateTareaDTO } from '../../domain/models/IProps';
import { TareasTable } from './TareasTable';
import { TareaFormModal } from './TareaFormModal';
import { HeaderInfo } from './HeaderInfo';
import { TaskSummary } from './TaskSummary';
import { useUserRole } from '@/hooks/useUserRole';
import { Role } from '@/lib/routePermissions';
import { downloadAdapter } from '../../infrastructure/adapters/downloadAdapter';

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
  onApprovePlan: (planId: string, observaciones?: string) => Promise<unknown>;
  puedeAprobarPlan: boolean;
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
  onApprovePlan,
  puedeAprobarPlan,
}: PlanDetailViewProps) {
  const [openTareaModal, setOpenTareaModal] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<TareaObservacion | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [openAprobarPlanModal, setOpenAprobarPlanModal] = useState(false);
  const [observacionesAprobacion, setObservacionesAprobacion] = useState('');
  const [isAprobandoPlan, setIsAprobandoPlan] = useState(false);

  const planAprobado = plan.estadoAprobacion === 'aprobado';

  const { hasRole } = useUserRole();
  const isAdmin = hasRole(Role.ADMIN);

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
      await onUpdateTarea(selectedTarea._id!, data as UpdateTareaDTO);
    } else {
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
    if (confirm('¿Está seguro de que desea dar de baja esta tarea?')) {
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

  const handleAprobarPlan = async () => {
    try {
      setLocalError(null);
      setIsAprobandoPlan(true);
      await onApprovePlan(plan._id, observacionesAprobacion || undefined);
      setOpenAprobarPlanModal(false);
      setObservacionesAprobacion('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aprobar el plan';
      setLocalError(errorMessage);
    } finally {
      setIsAprobandoPlan(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setLocalError(null);
      setIsDownloading(true);
      await downloadAdapter.downloadPlanExcel(plan._id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al descargar el Excel';
      setLocalError(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 3 }}>
        Volver a la lista de planes
      </Button>

      <HeaderInfo
        info={{
          vicepresidencia: plan.vicepresidencia,
          superintendenciaSenior: plan.superintendenciaSenior,
          superintendencia: plan.superintendencia,
          areaFisica: plan.areaFisica,
        }}
      />

      <TaskSummary
        summary={{
          tareasAbiertas: plan.tareasAbiertas,
          tareasCerradas: plan.tareasCerradas,
          tareasEnProgreso: plan.tareasEnProgreso,
          totalTareas: plan.totalTareas,
          porcentajeCierre: plan.porcentajeCierre,
        }}
      />

      {(error || localError) && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setLocalError(null)}>
          {error || localError}
        </Alert>
      )}

      {puedeAprobarPlan && (
        <Alert
          severity={planAprobado ? 'success' : 'warning'}
          sx={{ mb: 3 }}
          action={
            !planAprobado && (
              <Button
                type="button"
                color="inherit"
                size="small"
                startIcon={<CheckCircleIcon />}
                onClick={() => setOpenAprobarPlanModal(true)}
                disabled={isLoading}
              >
                Aprobar Plan
              </Button>
            )
          }
        >
          {planAprobado
            ? `Aprobado por ${plan.aprobadoPor} el ${
                plan.fechaAprobacion
                  ? new Date(plan.fechaAprobacion).toLocaleDateString('es-ES')
                  : ''
              }${plan.observacionesAprobacion ? ` — "${plan.observacionesAprobacion}"` : ''}`
            : 'Pendiente de aprobación global del Superintendente. El Supervisor no podrá ver este plan hasta que sea aprobado.'}
        </Alert>
      )}

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
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          <strong>Aprobación Superintendente:</strong>{' '}
          <Chip
            size="small"
            color={planAprobado ? 'success' : 'warning'}
            label={planAprobado ? 'Aprobado' : 'Pendiente'}
          />
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 3 }}>
        <Button
          type="button"
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadExcel}
          disabled={isDownloading}
        >
          {isDownloading ? 'Generando...' : 'Descargar Excel'}
        </Button>
        {isAdmin && (
          <Button
            type="button"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={onEditHeader}
            disabled={isLoading}
          >
            Editar Datos Organizacionales
          </Button>
        )}
        <Button
          type="button"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddTarea}
          disabled={isLoading}
        >
          Agregar Tarea
        </Button>
      </Box>

      <TareasTable
        tareas={plan.tareas}
        esGeneradaDesdeInspeccion={plan.instanceId !== undefined}
        onEdit={handleEditTarea}
        onDelete={handleDeleteTarea}
        onApprove={handleApproveTarea}
      />

      <TareaFormModal
        open={openTareaModal}
        isLoading={isLoading}
        tarea={selectedTarea}
        plan={plan}
        onClose={handleCloseTareaModal}
        onSubmit={handleSubmitTarea}
      />

      <Dialog
        open={openAprobarPlanModal}
        onClose={() => setOpenAprobarPlanModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Aprobar Plan de Acción</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Al aprobar, este plan quedará disponible para que el Supervisor
            correspondiente lo visualice y gestione. Esta acción no se puede
            deshacer.
          </Typography>
          <TextField
            label="Observaciones (opcional)"
            fullWidth
            multiline
            minRows={3}
            value={observacionesAprobacion}
            onChange={(e) => setObservacionesAprobacion(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            onClick={() => setOpenAprobarPlanModal(false)}
            disabled={isAprobandoPlan}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="contained"
            color="success"
            onClick={handleAprobarPlan}
            disabled={isAprobandoPlan}
          >
            {isAprobandoPlan ? 'Aprobando...' : 'Confirmar Aprobación'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
