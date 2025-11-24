'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Button,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  TextField,
  Autocomplete,
  CircularProgress,
  Typography,
  Chip,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon, AutoAwesome as AutoIcon, Info as InfoIcon } from '@mui/icons-material';

import { PlanTabs } from '@/components/planes-de-accion/tabs/PlanTabs';
import { PlanCardList } from '@/components/planes-de-accion/plan-cards/PlanCardList';
import { PlanDetailView } from '@/components/planes-de-accion/plan-detail/PlanDetailView';
import { PlanSummary } from '@/components/planes-de-accion/plan-detail/PlanSummary';
import { usePlanesAccion } from '@/components/planes-de-accion/hooks/use-planes-accion';
import { AddTareaDTO, CreatePlanDeAccionDTO, PlanDeAccion, UpdateTareaDTO } from '@/components/planes-de-accion/types/IProps';

type TabValue = 'abierto' | 'en-progreso' | 'cerrado' | 'aprobado';

export default function PlanesDeAccionPage() {
  const {
    planes,
    isLoading,
    error,
    loadPlanes,
    createPlan,
    updatePlan,
    deletePlan,
    addTarea,
    updateTarea,
    deleteTarea,
    approveTarea,
    calculateGlobalSummary,
    generarPlanDesdeInstancia,
    loadInspecciones,
  } = usePlanesAccion();

  const [activeTab, setActiveTab] = useState<TabValue>('abierto');
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanDeAccion | null>(null);

  const [openGenerarModal, setOpenGenerarModal] = useState(false);
  const [openCreatePlanModal, setOpenCreatePlanModal] = useState(false);
  const [openEditHeaderModal, setOpenEditHeaderModal] = useState(false);

  /* eslint-disable @typescript-eslint/no-explicit-any */
const [inspecciones, setInspecciones] = useState<any[]>([]);
const [selectedInstancia, setSelectedInstancia] = useState<any>(null);
/* eslint-enable @typescript-eslint/no-explicit-any */
  const [incluirPuntaje3, setIncluirPuntaje3] = useState(false);
  const [incluirSoloConComentario, setIncluirSoloConComentario] = useState(true);
  const [loadingInspecciones, setLoadingInspecciones] = useState(false);

  const [newPlanData, setNewPlanData] = useState<CreatePlanDeAccionDTO>({
    vicepresidencia: '',
    superintendenciaSenior: '',
    superintendencia: '',
    areaFisica: '',
  });

  const [editHeaderData, setEditHeaderData] = useState({
    vicepresidencia: '',
    superintendenciaSenior: '',
    superintendencia: '',
    areaFisica: '',
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const summary = calculateGlobalSummary();
  
  // 🔥 Filtrar planes según la pestaña activa
  const filteredPlanes = planes.filter((plan) => {
    if (activeTab === 'aprobado') {
      // Mostrar planes donde TODAS las tareas están aprobadas
      return plan.tareas.length > 0 && plan.tareas.every((t) => t.aprobado === true);
    }
    return plan.estado === activeTab;
  });

  useEffect(() => {
    loadPlanes();
    cargarListaInspecciones();
  }, []);

  const cargarListaInspecciones = useCallback(async () => {
  setLoadingInspecciones(true);
  try {
    const inspectionesData = await loadInspecciones();
    setInspecciones(inspectionesData);
  } catch (err) {
    console.error('Error cargando inspecciones:', err);
    setInspecciones([]);
    setLocalError('No se pudieron cargar las inspecciones');
  } finally {
    setLoadingInspecciones(false);
  }
}, [loadInspecciones]);

  const handleViewPlan = (plan: PlanDeAccion) => {
    setSelectedPlan(plan);
  };

  const handleBackToList = () => {
    setSelectedPlan(null);
  };

  const handleOpenCreatePlanModal = () => {
    setNewPlanData({
      vicepresidencia: '',
      superintendenciaSenior: '',
      superintendencia: '',
      areaFisica: '',
    });
    setOpenCreatePlanModal(true);
  };

  const handleCreatePlan = async () => {
    if (
      !newPlanData.vicepresidencia ||
      !newPlanData.superintendenciaSenior ||
      !newPlanData.superintendencia ||
      !newPlanData.areaFisica
    ) {
      setLocalError('Todos los campos son obligatorios');
      return;
    }

    try {
      setLocalError(null);
      const createdPlan = await createPlan(newPlanData);
      setOpenCreatePlanModal(false);
      showSnackbar('✅ Plan creado exitosamente', 'success');
      setSelectedPlan(createdPlan);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear plan';
      setLocalError(errorMessage);
      showSnackbar(`❌ ${errorMessage}`, 'error');
    }
  };

  const handleOpenEditHeaderModal = (plan: PlanDeAccion) => {
    setEditHeaderData({
      vicepresidencia: plan.vicepresidencia,
      superintendenciaSenior: plan.superintendenciaSenior,
      superintendencia: plan.superintendencia,
      areaFisica: plan.areaFisica,
    });
    setOpenEditHeaderModal(true);
  };

  const handleUpdatePlanHeader = async () => {
    if (!selectedPlan) return;

    try {
      setLocalError(null);
      await updatePlan(selectedPlan._id, editHeaderData);
      
      setSelectedPlan((prev) => prev ? { ...prev, ...editHeaderData } : null);
      
      setOpenEditHeaderModal(false);
      showSnackbar('✅ Datos organizacionales actualizados', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar';
      setLocalError(errorMessage);
      showSnackbar(`❌ ${errorMessage}`, 'error');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm('¿Está seguro de eliminar este plan? Se eliminarán todas sus tareas.')) {
      try {
        setLocalError(null);
        await deletePlan(planId);
        if (selectedPlan?._id === planId) {
          setSelectedPlan(null);
        }
        showSnackbar('✅ Plan eliminado exitosamente', 'success');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar';
        setLocalError(errorMessage);
        showSnackbar(`❌ ${errorMessage}`, 'error');
      }
    }
  };

  const handleOpenGenerarModal = () => {
    setOpenGenerarModal(true);
  };

  const handleCloseGenerarModal = () => {
    setOpenGenerarModal(false);
    setSelectedInstancia(null);
    setIncluirPuntaje3(false);
    setIncluirSoloConComentario(true);
  };

  const handleGenerarPlan = async () => {
    if (!selectedInstancia) {
      setLocalError('Debe seleccionar una inspección');
      return;
    }

    try {
      setLocalError(null);
      const planGenerado = await generarPlanDesdeInstancia(selectedInstancia._id, {
        incluirPuntaje3,
        incluirSoloConComentario,
      });

      if (planGenerado.tareas.length === 0) {
        showSnackbar(
          '⚠️ No se encontraron observaciones que cumplan los criterios seleccionados. Intenta ajustar los filtros.',
          'warning'
        );
      } else {
        showSnackbar(
          `✅ Plan generado exitosamente con ${planGenerado.tareas.length} ${
            planGenerado.tareas.length === 1 ? 'tarea' : 'tareas'
          }`,
          'success'
        );
        setSelectedPlan(planGenerado);
      }
      
      handleCloseGenerarModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al generar plan';
      
      if (errorMessage.includes('no se encontraron observaciones') || errorMessage.includes('No se encontraron')) {
        showSnackbar(
          '⚠️ No se encontraron observaciones que cumplan los criterios. Intenta ajustar los filtros.',
          'warning'
        );
      } else if (errorMessage.includes('not found') || errorMessage.includes('no encontrad')) {
        showSnackbar('❌ La inspección seleccionada no existe', 'error');
      } else {
        showSnackbar(`❌ ${errorMessage}`, 'error');
      }
      
      setLocalError(errorMessage);
    }
  };

  const handleAddTarea = async (data: AddTareaDTO) => {
    if (!selectedPlan) return;

    try {
      const updatedPlan = await addTarea(selectedPlan._id, data);
      if (updatedPlan) {
        setSelectedPlan(updatedPlan);
        showSnackbar('✅ Tarea agregada exitosamente', 'success');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar tarea';
      showSnackbar(`❌ ${errorMessage}`, 'error');
      throw err;
    }
  };

  const handleUpdateTarea = async (tareaId: string, data: UpdateTareaDTO) => {
  if (!selectedPlan) return;

  console.log('🎯 [PAGE] handleUpdateTarea llamado');
  console.log('  - tareaId:', tareaId);
  console.log('  - data:', data);
  console.log('  - evidencias:', data.evidencias);

  try {
    const updatedPlan = await updateTarea(selectedPlan._id, tareaId, data);
    if (updatedPlan) {
      setSelectedPlan(updatedPlan);
      showSnackbar('✅ Tarea actualizada exitosamente', 'success');
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error al actualizar tarea';
    console.error('  ❌ Error:', errorMessage);
    showSnackbar(`❌ ${errorMessage}`, 'error');
    throw err;
  }
};
  const handleDeleteTarea = async (tareaId: string) => {
    if (!selectedPlan) return;

    try {
      const updatedPlan = await deleteTarea(selectedPlan._id, tareaId);
      if (updatedPlan) {
        setSelectedPlan(updatedPlan);
        showSnackbar('✅ Tarea eliminada exitosamente', 'success');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar tarea';
      showSnackbar(`❌ ${errorMessage}`, 'error');
      throw err;
    }
  };

  const handleApproveTarea = async (tareaId: string) => {
    if (!selectedPlan) return;

    try {
      const updatedPlan = await approveTarea(selectedPlan._id, tareaId);
      if (updatedPlan) {
        setSelectedPlan(updatedPlan);
        showSnackbar('✅ Tarea aprobada exitosamente', 'success');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aprobar tarea';
      showSnackbar(`❌ ${errorMessage}`, 'error');
      throw err;
    }
  };

  if (selectedPlan) {
    return (
      <>
        <PlanDetailView
          plan={selectedPlan}
          isLoading={isLoading}
          error={error}
          onBack={handleBackToList}
          onEditHeader={() => handleOpenEditHeaderModal(selectedPlan)}
          onAddTarea={handleAddTarea}
          onUpdateTarea={handleUpdateTarea}
          onDeleteTarea={handleDeleteTarea}
          onApproveTarea={handleApproveTarea}
        />

        <Dialog open={openEditHeaderModal} onClose={() => setOpenEditHeaderModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Editar Datos Organizacionales</DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Vicepresidencia / Gerencia"
                value={editHeaderData.vicepresidencia}
                onChange={(e) =>
                  setEditHeaderData({
                    ...editHeaderData,
                    vicepresidencia: e.target.value,
                  })
                }
                fullWidth
              />
              <TextField
                label="Superintendencia Sénior"
                value={editHeaderData.superintendenciaSenior}
                onChange={(e) =>
                  setEditHeaderData({
                    ...editHeaderData,
                    superintendenciaSenior: e.target.value,
                  })
                }
                fullWidth
              />
              <TextField
                label="Superintendencia"
                value={editHeaderData.superintendencia}
                onChange={(e) =>
                  setEditHeaderData({
                    ...editHeaderData,
                    superintendencia: e.target.value,
                  })
                }
                fullWidth
              />
              <TextField
                label="Área Física"
                value={editHeaderData.areaFisica}
                onChange={(e) =>
                  setEditHeaderData({
                    ...editHeaderData,
                    areaFisica: e.target.value,
                  })
                }
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenEditHeaderModal(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleUpdatePlanHeader} disabled={isLoading}>
              {isLoading ? <CircularProgress size={20} /> : 'Guardar Cambios'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Gestión de Planes de Acción
      </Typography>

      <PlanSummary summary={summary} />

      {(error || localError) && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setLocalError(null)}>
          {error || localError}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AutoIcon />}
          onClick={handleOpenGenerarModal}
          disabled={isLoading}
        >
          Generar desde Inspección
        </Button>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreatePlanModal}
          disabled={isLoading}
        >
          Crear Plan Manualmente
        </Button>
      </Box>

      <PlanTabs activeTab={activeTab} planes={planes} onChange={setActiveTab} />

      <PlanCardList
        planes={filteredPlanes}
        isLoading={isLoading}
        onView={handleViewPlan}
        onEdit={handleOpenEditHeaderModal}
        onDelete={handleDeletePlan}
      />

      {/* MODAL: CREAR PLAN MANUALMENTE */}
      <Dialog open={openCreatePlanModal} onClose={() => setOpenCreatePlanModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Crear Nuevo Plan de Acción</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Vicepresidencia / Gerencia"
              value={newPlanData.vicepresidencia}
              onChange={(e) => setNewPlanData({ ...newPlanData, vicepresidencia: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Superintendencia Sénior"
              value={newPlanData.superintendenciaSenior}
              onChange={(e) => setNewPlanData({ ...newPlanData, superintendenciaSenior: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Superintendencia"
              value={newPlanData.superintendencia}
              onChange={(e) => setNewPlanData({ ...newPlanData, superintendencia: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Área Física"
              value={newPlanData.areaFisica}
              onChange={(e) => setNewPlanData({ ...newPlanData, areaFisica: e.target.value })}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCreatePlanModal(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleCreatePlan} disabled={isLoading}>
            {isLoading ? <CircularProgress size={20} /> : 'Crear Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: GENERAR DESDE INSPECCIÓN */}
      <Dialog open={openGenerarModal} onClose={handleCloseGenerarModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>🤖 Generar Plan desde Inspección</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Alert severity="info">
              Los datos organizacionales se extraerán automáticamente de la inspección seleccionada.
              <br /><br />
              Se generarán tareas para observaciones con:
              <ul style={{ marginBottom: 0 }}>
                <li><strong>Puntaje {'<'} 3</strong>: Obligatorio</li>
                <li><strong>Puntaje = 3</strong>: Solo si tiene comentario (opcional)</li>
              </ul>
            </Alert>

            <Autocomplete
              options={inspecciones}
              loading={loadingInspecciones}
              getOptionKey={(option) => option._id}
              getOptionLabel={(option) => {
                const fecha = new Date(option.createdAt).toLocaleDateString('es-ES');
                const area = option.verificationList?.Área || option.verificationList?.Lugar || 'Sin área';
                const compliance = option.overallCompliancePercentage || 0;
                const template = option.templateId?.name || 'Sin template';

                return `${fecha} - ${template} - ${area} (${compliance.toFixed(1)}%)`;
              }}
              value={selectedInstancia}
              onChange={(_, newValue) => setSelectedInstancia(newValue)}
              renderOption={(props, option) => {
                const {  ...otherProps } = props;
                const fecha = new Date(option.createdAt).toLocaleDateString('es-ES');
                const hora = new Date(option.createdAt).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const area = option.verificationList?.Área || option.verificationList?.Lugar || 'Sin área';
                const compliance = option.overallCompliancePercentage || 0;
                const template = option.templateId?.name || 'Sin template';
                const empresa = option.verificationList?.Empresa || '';

                return (
                  <li {...otherProps} key={option._id}>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <strong>
                            {fecha} {hora}
                          </strong>
                          <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{template}</Box>
                          <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                            {empresa} - {area}
                          </Box>
                        </Box>
                        <Chip
                          label={`${compliance.toFixed(1)}%`}
                          size="small"
                          color={compliance >= 75 ? 'success' : compliance >= 50 ? 'warning' : 'error'}
                        />
                      </Box>
                    </Box>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Seleccionar Inspección"
                  required
                  helperText="Los datos organizacionales se extraerán automáticamente"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingInspecciones ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={<Checkbox checked={incluirPuntaje3} onChange={(e) => setIncluirPuntaje3(e.target.checked)} />}
                label="Incluir observaciones con puntaje 3 (que tengan comentario)"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={incluirSoloConComentario}
                    onChange={(e) => setIncluirSoloConComentario(e.target.checked)}
                  />
                }
                label="Solo generar si la observación tiene comentario"
              />
            </Box>

            {selectedInstancia && (
              <>
                <Alert severity="success">
                  <strong>Inspección seleccionada:</strong>
                  <br />
                  Área: {selectedInstancia.verificationList?.Área || selectedInstancia.verificationList?.Lugar || 'No especificada'}
                  <br />
                  Empresa: {selectedInstancia.verificationList?.Empresa || 'No especificada'}
                  <br />
                  Cumplimiento: {selectedInstancia.overallCompliancePercentage?.toFixed(1)}%
                  <br />
                  Secciones: {selectedInstancia.sections?.length || 0}
                </Alert>

                <Alert severity="info" icon={<InfoIcon />}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    📊 Configuración de generación:
                  </Typography>
                  <Typography variant="body2">
                    • Con puntaje {'<'} 3: Se generarán tareas automáticamente
                    {incluirPuntaje3 && (
                      <>
                        <br />• Con puntaje = 3 y comentario: Se incluirán como tareas
                      </>
                    )}
                    {!incluirSoloConComentario && (
                      <>
                        <br />• Se incluirán todas las observaciones (con o sin comentario)
                      </>
                    )}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    💡 Si no se generan tareas, ajusta los filtros o verifica que la inspección tenga observaciones.
                  </Typography>
                </Alert>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseGenerarModal} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleGenerarPlan} disabled={isLoading || !selectedInstancia}>
            {isLoading ? <CircularProgress size={20} /> : 'Generar Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}