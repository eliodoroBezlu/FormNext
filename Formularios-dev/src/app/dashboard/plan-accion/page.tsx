"use client";

import { useEffect, useState, useMemo } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  AutoAwesome as AutoIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { PlanTabs } from "@/components/features/planes-de-accion/presentation/components/PlanTabs";
import { PlanCardList } from "@/components/features/planes-de-accion/presentation/components/PlanCardList";
import { PlanDetailView } from "@/components/features/planes-de-accion/presentation/components/PlanDetailView";
import { PlanSummary } from "@/components/features/planes-de-accion/presentation/components/PlanSummary";
import {
  usePlanesAccion,
  PopulatedFormInstance,
} from "@/components/features/planes-de-accion/application/hooks/use-planes-accion";
import {
  CreatePlanDeAccionDTO,
  PlanDeAccion,
} from "@/components/features/planes-de-accion/domain/models/IProps";
import { QuestionResponse, SectionResponse } from "@/types/formTypes";

export default function PlanesDeAccionPage() {
  const [localError, setLocalError] = useState<string | null>(null);

  const [openGenerarModal, setOpenGenerarModal] = useState(false);
  const [openCreatePlanModal, setOpenCreatePlanModal] = useState(false);
  const [openEditHeaderModal, setOpenEditHeaderModal] = useState(false);

  const [planBeingEdited, setPlanBeingEdited] = useState<PlanDeAccion | null>(
    null,
  );

  const [selectedInstancia, setSelectedInstancia] =
    useState<PopulatedFormInstance | null>(null);
  const [incluirPuntaje3, setIncluirPuntaje3] = useState(false);
  const [incluirSoloConComentario, setIncluirSoloConComentario] =
    useState(true);
  const [filtroAreaGenerar, setFiltroAreaGenerar] = useState<string>("");
  const [filtroAnioGenerar, setFiltroAnioGenerar] = useState<string>("");

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

  const {
    planesVisibles,
    isPending,
    error,
    activeTab,
    setActiveTab,
    selectedPlan,
    handleViewPlan,
    handleBackToList,
    loadingInspecciones,
    instanceIdsUsadas,
    inspeccionesDisponibles,
    summary,
    filteredPlanes,
    snackbar,
    closeSnackbar,
    loadPlanes,
    cargarInspecciones,
    cargarAreas,
    crearPlan,
    actualizarPlanHeader,
    eliminarPlan,
    generarPlan,
    agregarTarea,
    actualizarTarea,
    eliminarTarea,
    aprobarTarea,
    aprobarPlanGlobal,
    isAdmin,
    puedeAprobarPlan,
    areasParaFiltro,
    añosDisponibles,
    filtroArea,
    setFiltroArea,
    filtroAnio,
    setFiltroAnio,
  } = usePlanesAccion();

  useEffect(() => {
    loadPlanes();
    cargarInspecciones();
    cargarAreas();
  }, [loadPlanes, cargarInspecciones, cargarAreas]);

  const SIN_AREA = "Sin área";

  const getAreaInspeccion = (option: PopulatedFormInstance): string =>
    option.verificationList?.["Área"] ||
    option.verificationList?.["Lugar"] ||
    SIN_AREA;

  // ✅ Opciones y filtro de Área/Año para el modal "Generar desde Inspección"
  const areasInspeccionOptions = useMemo(
    () => [...new Set(inspeccionesDisponibles.map(getAreaInspeccion))].sort(),
    [inspeccionesDisponibles],
  );

  const añosInspeccionOptions = useMemo(
    () =>
      [
        ...new Set(
          inspeccionesDisponibles.map((i) =>
            new Date(i.createdAt).getFullYear().toString(),
          ),
        ),
      ].sort((a, b) => Number(b) - Number(a)),
    [inspeccionesDisponibles],
  );

  const inspeccionesFiltradasParaGenerar = useMemo(() => {
    return inspeccionesDisponibles.filter((i) => {
      if (filtroAreaGenerar && getAreaInspeccion(i) !== filtroAreaGenerar) {
        return false;
      }
      if (
        filtroAnioGenerar &&
        new Date(i.createdAt).getFullYear().toString() !== filtroAnioGenerar
      ) {
        return false;
      }
      return true;
    });
  }, [inspeccionesDisponibles, filtroAreaGenerar, filtroAnioGenerar]);

  // ✅ Preview de preguntas que se generarán
  const previewPreguntas = useMemo(() => {
    if (!selectedInstancia || !selectedInstancia.sections)
      return { included: [], excludedByComment: [] };

    const included: { text: string; puntaje: number; comment?: string }[] = [];
    const excludedByComment: {
      text: string;
      puntaje: number;
      comment?: string;
    }[] = [];

    selectedInstancia.sections.forEach((section: SectionResponse) => {
      if (!section.questions) return;
      section.questions.forEach((q: QuestionResponse) => {
        const resp = q.response;
        if (resp === "N/A" || resp === "" || resp == null) return;

        const puntaje = typeof resp === "number" ? resp : Number(resp);
        if (isNaN(puntaje)) return;

        const hasComment = !!q.comment && q.comment.trim().length > 0;

        let isCandidate = false;

        if (puntaje < 3) {
          isCandidate = true;
        } else if (puntaje === 3 && incluirPuntaje3) {
          isCandidate = true;
        }

        if (isCandidate) {
          if (incluirSoloConComentario && !hasComment) {
            excludedByComment.push({
              text: q.questionText || "Pregunta sin texto",
              puntaje,
              comment: q.comment,
            });
          } else {
            included.push({
              text: q.questionText || "Pregunta sin texto",
              puntaje,
              comment: q.comment,
            });
          }
        }
      });
    });

    return { included, excludedByComment };
  }, [selectedInstancia, incluirPuntaje3, incluirSoloConComentario]);

  const handleOpenCreatePlanModal = () => {
    setNewPlanData({
      vicepresidencia: "",
      superintendenciaSenior: "",
      superintendencia: "",
      areaFisica: "",
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
      setLocalError("Todos los campos son obligatorios");
      return;
    }
    setLocalError(null);
    const result = await crearPlan(newPlanData);
    if (result.success) {
      setOpenCreatePlanModal(false);
    } else {
      setLocalError(result.error || "Error al crear plan");
    }
  };

  const handleOpenEditHeaderModal = (plan: PlanDeAccion) => {
    setEditHeaderData({
      vicepresidencia: plan.vicepresidencia,
      superintendenciaSenior: plan.superintendenciaSenior,
      superintendencia: plan.superintendencia,
      areaFisica: plan.areaFisica,
    });
    setPlanBeingEdited(plan);
    setOpenEditHeaderModal(true);
  };

  const handleUpdatePlanHeader = async () => {
    if (!planBeingEdited) return;
    setLocalError(null);
    const result = await actualizarPlanHeader(
      planBeingEdited._id,
      editHeaderData,
    );
    if (result.success) {
      setOpenEditHeaderModal(false);
    } else {
      setLocalError(result.error || "Error al actualizar");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (
      !confirm(
        "¿Está seguro de dar de baja este plan? Dejará de aparecer en los listados junto con sus tareas.",
      )
    )
      return;
    setLocalError(null);
    const result = await eliminarPlan(planId);
    if (!result.success) {
      setLocalError(result.error || "Error al eliminar");
    }
  };

  const handleOpenGenerarModal = () => setOpenGenerarModal(true);

  const handleCloseGenerarModal = () => {
    setOpenGenerarModal(false);
    setSelectedInstancia(null);
    setIncluirPuntaje3(false);
    setIncluirSoloConComentario(false);
    setFiltroAreaGenerar("");
    setFiltroAnioGenerar("");
  };

  const handleGenerarPlan = async () => {
    if (!selectedInstancia) {
      setLocalError("Debe seleccionar una inspección");
      return;
    }
    setLocalError(null);
    const result = await generarPlan(selectedInstancia._id, {
      incluirPuntaje3,
      incluirSoloConComentario,
    });
    if (result.success) {
      handleCloseGenerarModal();
    } else {
      setLocalError(result.error || "Error al generar plan");
    }
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
          onAddTarea={agregarTarea}
          onUpdateTarea={actualizarTarea}
          onDeleteTarea={eliminarTarea}
          onApproveTarea={aprobarTarea}
          onApprovePlan={aprobarPlanGlobal}
          puedeAprobarPlan={puedeAprobarPlan}
        />

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
          onClose={closeSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={closeSnackbar}
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
        {isAdmin && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AutoIcon />}
            onClick={handleOpenGenerarModal}
            disabled={isPending}
          >
            Generar desde Inspección
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreatePlanModal}
          disabled={isPending}
        >
          Crear Plan Manualmente
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="filtro-area-label">Área</InputLabel>
          <Select
            labelId="filtro-area-label"
            label="Área"
            value={filtroArea}
            onChange={(e) => setFiltroArea(e.target.value)}
          >
            <MenuItem value="">Todas las áreas</MenuItem>
            {areasParaFiltro.map((area) => (
              <MenuItem key={area} value={area}>
                {area}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="filtro-anio-label">Año</InputLabel>
          <Select
            labelId="filtro-anio-label"
            label="Año"
            value={filtroAnio}
            onChange={(e) => setFiltroAnio(e.target.value)}
          >
            <MenuItem value="">Todos los años</MenuItem>
            {añosDisponibles.map((anio) => (
              <MenuItem key={anio} value={anio}>
                {anio}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <PlanTabs
        activeTab={activeTab}
        planes={planesVisibles}
        onChange={setActiveTab}
      />

      <PlanCardList
        planes={filteredPlanes}
        isLoading={isPending}
        onView={handleViewPlan}
        onEdit={handleOpenEditHeaderModal}
        onDelete={handleDeletePlan}
      />

      {/* MODAL: CREAR PLAN MANUALMENTE */}
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

      {/* MODAL: GENERAR DESDE INSPECCIÓN */}
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

            {/* ✅ Indicador de inspecciones disponibles */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`${inspeccionesDisponibles.length} inspección${inspeccionesDisponibles.length !== 1 ? "es" : ""} disponible${inspeccionesDisponibles.length !== 1 ? "s" : ""}`}
                color={
                  inspeccionesDisponibles.length > 0 ? "success" : "warning"
                }
                size="small"
              />
              {instanceIdsUsadas.size > 0 && (
                <Chip
                  label={`${instanceIdsUsadas.size} ya usada${instanceIdsUsadas.size !== 1 ? "s" : ""}`}
                  color="default"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>

            {/* ✅ Filtros para acotar la lista de inspecciones */}
            {inspeccionesDisponibles.length > 0 && (
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel id="filtro-area-generar-label">Área</InputLabel>
                  <Select
                    labelId="filtro-area-generar-label"
                    label="Área"
                    value={filtroAreaGenerar}
                    onChange={(e) => {
                      setFiltroAreaGenerar(e.target.value);
                      setSelectedInstancia(null);
                    }}
                  >
                    <MenuItem value="">Todas las áreas</MenuItem>
                    {areasInspeccionOptions.map((area) => (
                      <MenuItem key={area} value={area}>
                        {area}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="filtro-anio-generar-label">Año</InputLabel>
                  <Select
                    labelId="filtro-anio-generar-label"
                    label="Año"
                    value={filtroAnioGenerar}
                    onChange={(e) => {
                      setFiltroAnioGenerar(e.target.value);
                      setSelectedInstancia(null);
                    }}
                  >
                    <MenuItem value="">Todos los años</MenuItem>
                    {añosInspeccionOptions.map((anio) => (
                      <MenuItem key={anio} value={anio}>
                        {anio}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {inspeccionesDisponibles.length === 0 && !loadingInspecciones ? (
              <Alert severity="warning">
                Todas las inspecciones disponibles ya tienen un plan de acción
                generado.
              </Alert>
            ) : inspeccionesFiltradasParaGenerar.length === 0 ? (
              <Alert severity="warning">
                Ninguna inspección coincide con los filtros seleccionados.
              </Alert>
            ) : (
              <Autocomplete
                options={inspeccionesFiltradasParaGenerar} // ✅ Solo las disponibles y filtradas
                loading={loadingInspecciones}
                getOptionKey={(option) => option._id}
                getOptionLabel={(option) => {
                  const fecha = new Date(option.createdAt).toLocaleDateString(
                    "es-ES",
                  );
                  const area =
                    option.verificationList?.["Área"] ||
                    option.verificationList?.["Lugar"] ||
                    "Sin área";
                  const compliance = option.overallCompliancePercentage || 0;
                  const template = option.templateId?.name || "Sin template";
                  return `${fecha} - ${template} - ${area} (${compliance.toFixed(1)}%)`;
                }}
                value={selectedInstancia}
                onChange={(_, newValue) => setSelectedInstancia(newValue)}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props as typeof props & {
                    key: string;
                  };
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
                    option.verificationList?.["Área"] ||
                    option.verificationList?.["Lugar"] ||
                    "Sin área";
                  const compliance = option.overallCompliancePercentage || 0;
                  const template = option.templateId?.name || "Sin template";
                  const empresa = option.verificationList?.["Empresa"] || "";

                  return (
                    <li {...otherProps} key={key}>
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
                    helperText="Solo se muestran inspecciones sin plan de acción generado"
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
            )}

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
                  {selectedInstancia.verificationList?.["Área"] ||
                    selectedInstancia.verificationList?.["Lugar"] ||
                    "No especificada"}
                  <br />
                  Empresa:{" "}
                  {selectedInstancia.verificationList?.["Empresa"] ||
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

                {/* ✅ VISUALIZACION PREVIA DE PREGUNTAS */}
                {previewPreguntas.included.length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      📋 Observaciones que generarán tareas (
                      {previewPreguntas.included.length}):
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 250,
                        overflowY: "auto",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        p: 1.5,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        bgcolor: "background.paper",
                      }}
                    >
                      {previewPreguntas.included.map((q, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 1.5,
                            bgcolor: "action.hover",
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, mb: 1 }}
                          >
                            {q.text}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            <Chip
                              label={`Puntaje: ${q.puntaje}`}
                              size="small"
                              color={q.puntaje < 3 ? "error" : "warning"}
                              sx={{ fontWeight: 600 }}
                            />
                            {q.comment ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontStyle: "italic" }}
                              >
                                💬 &rdquo;{q.comment}&rdquo;
                              </Typography>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                🚫 Sin comentario
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    No hay observaciones que cumplan con los criterios actuales.
                    No se generará ninguna tarea.
                    {previewPreguntas.excludedByComment.length > 0 && (
                      <Box sx={{ display: "block", mt: 1, fontWeight: 600 }}>
                        ⚠️ Hay {previewPreguntas.excludedByComment.length}{" "}
                        observaciones candidatas pero fueron ignoradas por NO
                        TENER COMENTARIO. Desmarca la opción &rdquo;Solo generar
                        si la observación tiene comentario&rdquo; para
                        incluirlas.
                      </Box>
                    )}
                  </Alert>
                )}

                {previewPreguntas.included.length > 0 &&
                  previewPreguntas.excludedByComment.length > 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Se han ignorado{" "}
                      {previewPreguntas.excludedByComment.length} observaciones
                      candidatas porque no tienen comentario.
                    </Alert>
                  )}
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
            disabled={
              isPending ||
              !selectedInstancia ||
              inspeccionesDisponibles.length === 0
            }
          >
            {isPending ? <CircularProgress size={20} /> : "Generar Plan"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeSnackbar}
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
