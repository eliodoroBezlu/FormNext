"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
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
} from "@mui/material";
import {
  Add as AddIcon,
  AutoAwesome as AutoIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { PlanTabs } from "@/components/planes-de-accion/tabs/PlanTabs";
import { PlanCardList } from "@/components/planes-de-accion/plan-cards/PlanCardList";
import { PlanDetailView } from "@/components/planes-de-accion/plan-detail/PlanDetailView";
import { PlanSummary } from "@/components/planes-de-accion/plan-detail/PlanSummary";

// ✅ Server Actions

import {
  actualizarPlan,
  actualizarTarea,
  agregarTarea,
  aprobarTarea,
  crearPlan,
  eliminarPlan,
  eliminarTarea,
  generarPlanDesdeInstancia,
  obtenerInspecciones,
  obtenerPlanes,
} from "@/components/planes-de-accion/hooks/use-planes-accion";
import {
  UpdateTareaDTO,
  AddTareaDTO,
  CreatePlanDeAccionDTO,
  PlanDeAccion,
  PlanSummary as PlanSummaryType,
} from "@/components/planes-de-accion/types/IProps";

type TabValue = "abierto" | "en-progreso" | "cerrado" | "aprobado";

export default function PlanesDeAccionPage() {
  // Estado
  const [planes, setPlanes] = useState<PlanDeAccion[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabValue>("abierto");
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanDeAccion | null>(null);

  // Modales
  const [openGenerarModal, setOpenGenerarModal] = useState(false);
  const [openCreatePlanModal, setOpenCreatePlanModal] = useState(false);
  const [openEditHeaderModal, setOpenEditHeaderModal] = useState(false);

  // Inspecciones
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [inspecciones, setInspecciones] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedInstancia, setSelectedInstancia] = useState<any>(null);
  const [incluirPuntaje3, setIncluirPuntaje3] = useState(false);
  const [incluirSoloConComentario, setIncluirSoloConComentario] =
    useState(true);
  const [loadingInspecciones, setLoadingInspecciones] = useState(false);

  // Forms
  const [newPlanData, setNewPlanData] = useState<CreatePlanDeAccionDTO>({
    vicepresidencia: "",
    superintendenciaSenior: "",
    superintendencia: "",
    areaFisica: "",
  });

  const [editHeaderData, setEditHeaderData] = useState({
    vicepresidencia: "",
    superintendenciaSenior: "",
    superintendencia: "",
    areaFisica: "",
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // ✅ Calcular summary
  const calculateGlobalSummary = useCallback((): PlanSummaryType => {
    const totalPlanes = planes.length;
    const planesAbiertos = planes.filter((p) => p.estado === "abierto").length;
    const planesEnProgreso = planes.filter(
      (p) => p.estado === "en-progreso",
    ).length;
    const planesCerrados = planes.filter((p) => p.estado === "cerrado").length;
    const porcentajeCierre =
      totalPlanes > 0 ? (planesCerrados / totalPlanes) * 100 : 0;

    return {
      totalPlanes,
      planesAbiertos,
      planesEnProgreso,
      planesCerrados,
      porcentajeCierre,
    };
  }, [planes]);

  const summary = calculateGlobalSummary();

  // Filtrar planes
  const filteredPlanes = planes.filter((plan) => {
    if (activeTab === "aprobado") {
      return (
        plan.tareas.length > 0 && plan.tareas.every((t) => t.aprobado === true)
      );
    }
    return plan.estado === activeTab;
  });

  // ✅ Cargar planes
  const loadPlanes = useCallback(async () => {
    startTransition(async () => {
      setError(null);
      try {
        const result = await obtenerPlanes();
        setPlanes(result);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al cargar planes";
        setError(errorMessage);
        console.error("Error cargando planes:", err);
      }
    });
  }, []);

  // ✅ Cargar inspecciones
  const cargarListaInspecciones = useCallback(async () => {
    setLoadingInspecciones(true);
    try {
      const inspectionesData = await obtenerInspecciones();
      setInspecciones(inspectionesData);
    } catch (err) {
      console.error("Error cargando inspecciones:", err);
      setInspecciones([]);
      setLocalError("No se pudieron cargar las inspecciones");
    } finally {
      setLoadingInspecciones(false);
    }
  }, []);

  useEffect(() => {
    loadPlanes();
    cargarListaInspecciones();
  }, [loadPlanes, cargarListaInspecciones]);

  const handleViewPlan = (plan: PlanDeAccion) => {
    setSelectedPlan(plan);
  };

  const handleBackToList = () => {
    setSelectedPlan(null);
  };

  const handleOpenCreatePlanModal = () => {
    setNewPlanData({
      vicepresidencia: "",
      superintendenciaSenior: "",
      superintendencia: "",
      areaFisica: "",
    });
    setOpenCreatePlanModal(true);
  };

  const handleCreatePlan = () => {
    if (
      !newPlanData.vicepresidencia ||
      !newPlanData.superintendenciaSenior ||
      !newPlanData.superintendencia ||
      !newPlanData.areaFisica
    ) {
      setLocalError("Todos los campos son obligatorios");
      return;
    }

    startTransition(async () => {
      setLocalError(null);

      const result = await crearPlan(newPlanData);

      if (result.success && result.data) {
        setOpenCreatePlanModal(false);
        showSnackbar("✅ Plan creado exitosamente", "success");
        setSelectedPlan(result.data);
        await loadPlanes();
      } else {
        setLocalError(result.error || "Error al crear plan");
        showSnackbar(`❌ ${result.error}`, "error");
      }
    });
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

  const handleUpdatePlanHeader = () => {
    if (!selectedPlan) return;

    startTransition(async () => {
      setLocalError(null);

      const result = await actualizarPlan(selectedPlan._id, editHeaderData);

      if (result.success && result.data) {
        setSelectedPlan(result.data);
        setOpenEditHeaderModal(false);
        showSnackbar("✅ Datos organizacionales actualizados", "success");
        await loadPlanes();
      } else {
        setLocalError(result.error || "Error al actualizar");
        showSnackbar(`❌ ${result.error}`, "error");
      }
    });
  };

  const handleDeletePlan = (planId: string) => {
    if (
      confirm(
        "¿Está seguro de eliminar este plan? Se eliminarán todas sus tareas.",
      )
    ) {
      startTransition(async () => {
        setLocalError(null);

        const result = await eliminarPlan(planId);

        if (result.success) {
          if (selectedPlan?._id === planId) {
            setSelectedPlan(null);
          }
          showSnackbar("✅ Plan eliminado exitosamente", "success");
          await loadPlanes();
        } else {
          setLocalError(result.error || "Error al eliminar");
          showSnackbar(`❌ ${result.error}`, "error");
        }
      });
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

  const handleGenerarPlan = () => {
    if (!selectedInstancia) {
      setLocalError("Debe seleccionar una inspección");
      return;
    }

    startTransition(async () => {
      setLocalError(null);

      const result = await generarPlanDesdeInstancia(selectedInstancia._id, {
        incluirPuntaje3,
        incluirSoloConComentario,
      });

      if (result.success && result.data) {
        if (result.data.tareas.length === 0) {
          showSnackbar(
            "⚠️ No se encontraron observaciones que cumplan los criterios. Intenta ajustar los filtros.",
            "warning",
          );
        } else {
          showSnackbar(
            `✅ Plan generado con ${result.data.tareas.length} tarea${result.data.tareas.length !== 1 ? "s" : ""}`,
            "success",
          );
          setSelectedPlan(result.data);
        }

        handleCloseGenerarModal();
        await loadPlanes();
      } else {
        const errorMessage = result.error || "Error al generar plan";

        if (errorMessage.includes("no se encontraron observaciones")) {
          showSnackbar(
            "⚠️ No se encontraron observaciones que cumplan los criterios.",
            "warning",
          );
        } else if (errorMessage.includes("not found")) {
          showSnackbar("❌ La inspección seleccionada no existe", "error");
        } else {
          showSnackbar(`❌ ${errorMessage}`, "error");
        }

        setLocalError(errorMessage);
      }
    });
  };

  const handleAddTarea = async (data: AddTareaDTO) => {
    if (!selectedPlan) return;

    startTransition(async () => {
      const result = await agregarTarea(selectedPlan._id, data);

      if (result.success && result.data) {
        setSelectedPlan(result.data);
        showSnackbar("✅ Tarea agregada exitosamente", "success");
      } else {
        showSnackbar(`❌ ${result.error}`, "error");
        throw new Error(result.error);
      }
    });
  };

  const handleUpdateTarea = async (tareaId: string, data: UpdateTareaDTO) => {
    if (!selectedPlan) return;

    startTransition(async () => {
      const result = await actualizarTarea(selectedPlan._id, tareaId, data);

      if (result.success && result.data) {
        setSelectedPlan(result.data);
        showSnackbar("✅ Tarea actualizada exitosamente", "success");
      } else {
        showSnackbar(`❌ ${result.error}`, "error");
        throw new Error(result.error);
      }
    });
  };

  const handleDeleteTarea = async (tareaId: string) => {
    if (!selectedPlan) return;

    startTransition(async () => {
      const result = await eliminarTarea(selectedPlan._id, tareaId);

      if (result.success && result.data) {
        setSelectedPlan(result.data);
        showSnackbar("✅ Tarea eliminada exitosamente", "success");
      } else {
        showSnackbar(`❌ ${result.error}`, "error");
        throw new Error(result.error);
      }
    });
  };

  const handleApproveTarea = async (tareaId: string) => {
    if (!selectedPlan) return;

    startTransition(async () => {
      const result = await aprobarTarea(selectedPlan._id, tareaId);

      if (result.success && result.data) {
        setSelectedPlan(result.data);
        showSnackbar("✅ Tarea aprobada exitosamente", "success");
      } else {
        showSnackbar(`❌ ${result.error}`, "error");
        throw new Error(result.error);
      }
    });
  };

  // ==========================================
  // RENDER: DETALLE DEL PLAN
  // ==========================================
  if (selectedPlan) {
    return (
      <>
        <PlanDetailView
          plan={selectedPlan}
          isLoading={isPending}
          error={error}
          onBack={handleBackToList}
          onEditHeader={() => handleOpenEditHeaderModal(selectedPlan)}
          onAddTarea={handleAddTarea}
          onUpdateTarea={handleUpdateTarea}
          onDeleteTarea={handleDeleteTarea}
          onApproveTarea={handleApproveTarea}
        />

        {/* MODAL: EDITAR HEADER */}
        <Dialog
          open={openEditHeaderModal}
          onClose={() => setOpenEditHeaderModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            Editar Datos Organizacionales
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
            <Button
              onClick={() => setOpenEditHeaderModal(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdatePlanHeader}
              disabled={isPending}
            >
              {isPending ? <CircularProgress size={20} /> : "Guardar Cambios"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // ==========================================
  // RENDER: LISTA DE PLANES
  // ==========================================
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Gestión de Planes de Acción
      </Typography>

      <PlanSummary summary={summary} />

      {(error || localError) && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setLocalError(null)}
        >
          {error || localError}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AutoIcon />}
          onClick={handleOpenGenerarModal}
          disabled={isPending}
        >
          Generar desde Inspección
        </Button>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreatePlanModal}
          disabled={isPending}
        >
          Crear Plan Manualmente
        </Button>
      </Box>

      <PlanTabs activeTab={activeTab} planes={planes} onChange={setActiveTab} />

      <PlanCardList
        planes={filteredPlanes}
        isLoading={isPending}
        onView={handleViewPlan}
        onEdit={handleOpenEditHeaderModal}
        onDelete={handleDeletePlan}
      />

      {/* ========================================== */}
      {/* MODAL: CREAR PLAN MANUALMENTE */}
      {/* ========================================== */}
      <Dialog
        open={openCreatePlanModal}
        onClose={() => setOpenCreatePlanModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Crear Nuevo Plan de Acción
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Vicepresidencia / Gerencia"
              value={newPlanData.vicepresidencia}
              onChange={(e) =>
                setNewPlanData({
                  ...newPlanData,
                  vicepresidencia: e.target.value,
                })
              }
              fullWidth
              required
            />
            <TextField
              label="Superintendencia Sénior"
              value={newPlanData.superintendenciaSenior}
              onChange={(e) =>
                setNewPlanData({
                  ...newPlanData,
                  superintendenciaSenior: e.target.value,
                })
              }
              fullWidth
              required
            />
            <TextField
              label="Superintendencia"
              value={newPlanData.superintendencia}
              onChange={(e) =>
                setNewPlanData({
                  ...newPlanData,
                  superintendencia: e.target.value,
                })
              }
              fullWidth
              required
            />
            <TextField
              label="Área Física"
              value={newPlanData.areaFisica}
              onChange={(e) =>
                setNewPlanData({ ...newPlanData, areaFisica: e.target.value })
              }
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenCreatePlanModal(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreatePlan}
            disabled={isPending}
          >
            {isPending ? <CircularProgress size={20} /> : "Crear Plan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================== */}
      {/* MODAL: GENERAR DESDE INSPECCIÓN */}
      {/* ========================================== */}
      <Dialog
        open={openGenerarModal}
        onClose={handleCloseGenerarModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          🤖 Generar Plan desde Inspección
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Alert severity="info">
              Los datos organizacionales se extraerán automáticamente de la
              inspección seleccionada.
              <br />
              <br />
              Se generarán tareas para observaciones con:
              <ul style={{ marginBottom: 0 }}>
                <li>
                  <strong>Puntaje {"<"} 3</strong>: Obligatorio
                </li>
                <li>
                  <strong>Puntaje = 3</strong>: Solo si tiene comentario
                  (opcional)
                </li>
              </ul>
            </Alert>

            <Autocomplete
              options={inspecciones}
              loading={loadingInspecciones}
              getOptionKey={(option) => option._id}
              getOptionLabel={(option) => {
                const fecha = new Date(option.createdAt).toLocaleDateString(
                  "es-ES",
                );
                const area =
                  option.verificationList?.Área ||
                  option.verificationList?.Lugar ||
                  "Sin área";
                const compliance = option.overallCompliancePercentage || 0;
                const template = option.templateId?.name || "Sin template";

                return `${fecha} - ${template} - ${area} (${compliance.toFixed(1)}%)`;
              }}
              value={selectedInstancia}
              onChange={(_, newValue) => setSelectedInstancia(newValue)}
              renderOption={(props, option) => {
                const { ...otherProps } = props;
                const fecha = new Date(option.createdAt).toLocaleDateString(
                  "es-ES",
                );
                const hora = new Date(option.createdAt).toLocaleTimeString(
                  "es-ES",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                );
                const area =
                  option.verificationList?.Área ||
                  option.verificationList?.Lugar ||
                  "Sin área";
                const compliance = option.overallCompliancePercentage || 0;
                const template = option.templateId?.name || "Sin template";
                const empresa = option.verificationList?.Empresa || "";

                return (
                  <li {...otherProps} key={option._id}>
                    <Box sx={{ width: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <strong>
                            {fecha} {hora}
                          </strong>
                          <Box
                            sx={{
                              fontSize: "0.875rem",
                              color: "text.secondary",
                            }}
                          >
                            {template}
                          </Box>
                          <Box
                            sx={{
                              fontSize: "0.875rem",
                              color: "text.secondary",
                            }}
                          >
                            {empresa} - {area}
                          </Box>
                        </Box>
                        <Chip
                          label={`${compliance.toFixed(1)}%`}
                          size="small"
                          color={
                            compliance >= 75
                              ? "success"
                              : compliance >= 50
                                ? "warning"
                                : "error"
                          }
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
                        {loadingInspecciones ? (
                          <CircularProgress size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={incluirPuntaje3}
                    onChange={(e) => setIncluirPuntaje3(e.target.checked)}
                  />
                }
                label="Incluir observaciones con puntaje 3 (que tengan comentario)"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={incluirSoloConComentario}
                    onChange={(e) =>
                      setIncluirSoloConComentario(e.target.checked)
                    }
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
                  Área:{" "}
                  {selectedInstancia.verificationList?.Área ||
                    selectedInstancia.verificationList?.Lugar ||
                    "No especificada"}
                  <br />
                  Empresa:{" "}
                  {selectedInstancia.verificationList?.Empresa ||
                    "No especificada"}
                  <br />
                  Cumplimiento:{" "}
                  {selectedInstancia.overallCompliancePercentage?.toFixed(1)}%
                  <br />
                  Secciones: {selectedInstancia.sections?.length || 0}
                </Alert>

                <Alert severity="info" icon={<InfoIcon />}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    📊 Configuración de generación:
                  </Typography>
                  <Typography variant="body2">
                    • Con puntaje {"<"} 3: Se generarán tareas automáticamente
                    {incluirPuntaje3 && (
                      <>
                        <br />• Con puntaje = 3 y comentario: Se incluirán como
                        tareas
                      </>
                    )}
                    {!incluirSoloConComentario && (
                      <>
                        <br />• Se incluirán todas las observaciones (con o sin
                        comentario)
                      </>
                    )}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1 }}
                  >
                    💡 Si no se generan tareas, ajusta los filtros o verifica
                    que la inspección tenga observaciones.
                  </Typography>
                </Alert>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseGenerarModal} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerarPlan}
            disabled={isPending || !selectedInstancia}
          >
            {isPending ? <CircularProgress size={20} /> : "Generar Plan"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
