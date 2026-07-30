"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Autocomplete,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  Lock as LockIcon,
  AutoAwesome as AIIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import {
  TareaObservacion,
  AddTareaDTO,
  UpdateTareaDTO,
  EvidenciaDto,
  FormTareaData,
  PlanDeAccion,
} from "../../domain/models/IProps";
import { FAMILIAS_PELIGRO } from "@/lib/constants";
import { getRecommendedActions } from "../../infrastructure/adapters/mlRecommendationsAdapter";
import { uploadFile } from "../../infrastructure/adapters/uploadAdapter";
import {
  obtenerSupervisoresDisponibles,
  SupervisorOption,
} from "../../infrastructure/adapters/trabajadoresAdapter";
import { useUserRole } from "@/hooks/useUserRole";
import { Role } from "@/lib/routePermissions";

interface TareaFormModalProps {
  open: boolean;
  isLoading: boolean;
  tarea?: TareaObservacion | null;
  plan?: PlanDeAccion | null;
  onClose: () => void;
  onSubmit: (data: AddTareaDTO | UpdateTareaDTO) => Promise<void>;
}

export function TareaFormModal({
  open,
  isLoading,
  tarea,
  plan,
  onClose,
  onSubmit,
}: TareaFormModalProps) {
  const [mlRecommendations, setMlRecommendations] = useState<string[]>([]);
  const [loadingML, setLoadingML] = useState(false);
  const [mlError, setMlError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [evidencias, setEvidencias] = useState<EvidenciaDto[]>([]);
  const [selectedRecommendationIndex, setSelectedRecommendationIndex] =
    useState<number | null>(null);
  const [supervisores, setSupervisores] = useState<SupervisorOption[]>([]);
  const [loadingSupervisores, setLoadingSupervisores] = useState(false);

  const toDateInputValue = (date: Date | string | undefined): string => {
    if (!date) return dayjs().format("YYYY-MM-DD");

    try {
      const parsedDate = dayjs(date);
      if (!parsedDate.isValid()) {
        return dayjs().format("YYYY-MM-DD");
      }
      return parsedDate.format("YYYY-MM-DD");
    } catch {
      return dayjs().format("YYYY-MM-DD");
    }
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormTareaData>({
    defaultValues: {
      fechaHallazgo: toDateInputValue(undefined),
      responsableObservacion: "",
      empresa: "",
      lugarFisico: "",
      actividad: "",
      familiaPeligro: "",
      descripcionObservacion: "",
      accionPropuesta: "",
      responsableAreaCierre: "",
      responsableAreaCierreUsername: "",
      fechaCumplimientoAcordada: toDateInputValue(undefined),
      fechaCumplimientoEfectiva: "",
      estado: "abierto",
    },
  });

  const fetchMLRecommendations = useCallback(async (questionText: string) => {
    if (!questionText || questionText.trim().length < 10) {
      setMlRecommendations([]);
      return;
    }

    setLoadingML(true);
    setMlError(null);

    try {
      const result = await getRecommendedActions(questionText);

      if (result.success && result.actions && result.actions.length > 0) {
        setMlRecommendations(result.actions);
        setMlError(null);
      } else {
        setMlRecommendations([]);
        setMlError(result.error || "No se encontraron recomendaciones");
      }
    } catch (error) {
      console.error("Error en fetchMLRecommendations:", error);
      setMlError("Error al cargar recomendaciones");
      setMlRecommendations([]);
    } finally {
      setLoadingML(false);
    }
  }, []);

  useEffect(() => {
    if (open && tarea) {
      reset({
        fechaHallazgo: toDateInputValue(tarea.fechaHallazgo),
        responsableObservacion: tarea.responsableObservacion ?? "",
        empresa: tarea.empresa ?? "",
        lugarFisico: tarea.lugarFisico ?? "",
        actividad: tarea.actividad ?? "",
        familiaPeligro: tarea.familiaPeligro ?? "",
        descripcionObservacion: tarea.descripcionObservacion ?? "",
        accionPropuesta: tarea.accionPropuesta ?? "",
        responsableAreaCierre: tarea.responsableAreaCierre ?? "",
        responsableAreaCierreUsername:
          tarea.responsableAreaCierreUsername ?? "",
        fechaCumplimientoAcordada: toDateInputValue(
          tarea.fechaCumplimientoAcordada,
        ),
        fechaCumplimientoEfectiva: tarea.fechaCumplimientoEfectiva
          ? toDateInputValue(tarea.fechaCumplimientoEfectiva)
          : "",
        estado: tarea.estado ?? "abierto",
      });

      if (tarea.evidencias && Array.isArray(tarea.evidencias)) {
        setEvidencias(tarea.evidencias);
      } else {
        setEvidencias([]);
      }

      if (
        tarea.descripcionObservacion &&
        tarea.descripcionObservacion.trim().length >= 10
      ) {
        fetchMLRecommendations(tarea.descripcionObservacion);
      }
    } else if (open && !tarea) {
      reset({
        fechaHallazgo: toDateInputValue(undefined),
        responsableObservacion: "",
        empresa: "",
        lugarFisico: "",
        actividad: "",
        familiaPeligro: "",
        descripcionObservacion: "",
        accionPropuesta: "",
        responsableAreaCierre: "",
        responsableAreaCierreUsername: "",
        fechaCumplimientoAcordada: toDateInputValue(undefined),
        fechaCumplimientoEfectiva: "",
        estado: "abierto",
      });
      setMlRecommendations([]);
      setMlError(null);
      setEvidencias([]);
    }
  }, [open, tarea, reset, fetchMLRecommendations]);

  useEffect(() => {
    if (!open) return;
    setLoadingSupervisores(true);
    obtenerSupervisoresDisponibles()
      .then(setSupervisores)
      .catch(() => setSupervisores([]))
      .finally(() => setLoadingSupervisores(false));
  }, [open]);

  const { hasRole } = useUserRole();
  const isAdmin = hasRole(Role.ADMIN);

  const esGeneradaDesdeInspeccion = plan?.instanceId !== undefined;
  const estaAprobada = tarea?.aprobado === true;
  const estadoActual =
    useWatch({ control, name: "estado" }) || tarea?.estado || "abierto";

  const esEstadoAbierto = estadoActual === "abierto";
  const esEstadoEnProgreso = estadoActual === "en-progreso";
  const esEstadoCerrado = estadoActual === "cerrado";

  const descripcionObservacion = useWatch({
    control,
    name: "descripcionObservacion",
  });

  useEffect(() => {
    if (esGeneradaDesdeInspeccion) {
      return;
    }

    const timer = setTimeout(() => {
      if (
        descripcionObservacion &&
        descripcionObservacion.trim().length >= 10
      ) {
        fetchMLRecommendations(descripcionObservacion);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [
    descripcionObservacion,
    esGeneradaDesdeInspeccion,
    fetchMLRecommendations,
  ]);

  const fechaAcordada = useWatch({
    control,
    name: "fechaCumplimientoAcordada",
  });
  const fechaEfectiva = useWatch({
    control,
    name: "fechaCumplimientoEfectiva",
  });

  // Izado al scope del componente: no se puede llamar un hook dentro del
  // render prop de <Controller>.
  const responsableUsernameActual = useWatch({
    control,
    name: "responsableAreaCierreUsername",
  });

  const calcularDiasRetraso = (): number => {
    if (!fechaAcordada || !fechaEfectiva || fechaEfectiva === "") return 0;

    try {
      const acordada = dayjs(fechaAcordada);
      const efectiva = dayjs(fechaEfectiva);

      if (!acordada.isValid() || !efectiva.isValid()) return 0;

      const diffDays = efectiva.diff(acordada, "day");
      return Math.max(0, diffDays);
    } catch {
      return 0;
    }
  };

  const diasRetraso = calcularDiasRetraso();

  const handleFormClose = () => {
    reset();
    setMlRecommendations([]);
    setMlError(null);
    setEvidencias([]);
    onClose();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "evidencias-tareas");

      const data = await uploadFile(formData);

      setEvidencias((prev) => [
        ...prev,
        {
          nombre: file.name,
          url: data.url || data.path,
        },
      ]);
    } catch (error) {
      console.error("Error subiendo archivo:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al subir el archivo";
      alert(errorMessage);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteEvidencia = (index: number) => {
    setEvidencias((prev) => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: FormTareaData) => {
    try {
      if (esGeneradaDesdeInspeccion) {
        const camposEditables: UpdateTareaDTO = {
          familiaPeligro: data.familiaPeligro,
          accionPropuesta: data.accionPropuesta,
          responsableAreaCierre: data.responsableAreaCierre,
          responsableAreaCierreUsername: data.responsableAreaCierreUsername,
          fechaCumplimientoAcordada: data.fechaCumplimientoAcordada,
          fechaCumplimientoEfectiva: data.fechaCumplimientoEfectiva,
          evidencias: evidencias.length > 0 ? evidencias : undefined,

          mlMetadata: {
            fue_recomendacion_ml: selectedRecommendationIndex !== null,
            indice_recomendacion: selectedRecommendationIndex ?? undefined,
            recomendaciones_originales:
              mlRecommendations.length > 0 ? mlRecommendations : undefined,
          },
        };
        if (estadoActual === "abierto") {
          if (
            data.familiaPeligro &&
            data.accionPropuesta &&
            data.responsableAreaCierre &&
            data.fechaCumplimientoAcordada
          ) {
            camposEditables.estado = "en-progreso";
          }
        } else if (estadoActual === "en-progreso") {
          if (data.fechaCumplimientoEfectiva) {
            camposEditables.estado = "cerrado";
          }
        }

        await onSubmit(camposEditables);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { estado: _estado, ...tareaData } = data;
        await onSubmit(tareaData);
      }

      handleFormClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog open={open} onClose={handleFormClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {tarea
          ? isAdmin
            ? "Editar Tarea"
            : "Continuar Tarea"
          : "Agregar Nueva Tarea"}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {esGeneradaDesdeInspeccion && (
            <Alert severity="info" icon={<LockIcon />}>
              Esta tarea fue generada automáticamente desde una inspección. Los
              campos base están bloqueados, pero puedes editar según el estado.
              {mlRecommendations.length > 0 && (
                <>
                  <br />
                  <br />✨{" "}
                  <strong>
                    {mlRecommendations.length} recomendaciones de IA disponibles
                  </strong>{" "}
                  para la acción propuesta.
                </>
              )}
            </Alert>
          )}

          {tarea?.questionText && (
            <Alert severity="info" variant="outlined">
              {tarea.sectionTitle && (
                <>
                  <strong>Sección:</strong> {tarea.sectionTitle}
                  <br />
                </>
              )}
              <strong>Pregunta original:</strong> {tarea.questionText}
            </Alert>
          )}

          {estaAprobada && (
            <Alert severity="warning">
              Esta tarea está aprobada. No se pueden realizar modificaciones.
            </Alert>
          )}

          {!estaAprobada && esEstadoAbierto && (
            <Alert severity="info">
              <strong>Estado: Abierto</strong> - Completa los campos de
              programación para pasar a &quot;En Progreso&quot;
            </Alert>
          )}

          {!estaAprobada && esEstadoEnProgreso && (
            <Alert severity="warning">
              <strong>Estado: En Progreso</strong> - Completa la Fecha de
              Cumplimiento Efectiva y adjunta evidencia para cerrar
            </Alert>
          )}

          {!estaAprobada && esEstadoCerrado && (
            <Alert severity="success">
              <strong>Estado: Cerrado</strong> - La tarea está lista para
              aprobación
            </Alert>
          )}

          <Controller
            name="fechaHallazgo"
            control={control}
            rules={{ required: "Campo requerido" }}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                label="Fecha del Hallazgo"
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  readOnly: esGeneradaDesdeInspeccion,
                  endAdornment: esGeneradaDesdeInspeccion && (
                    <LockIcon fontSize="small" color="disabled" />
                  ),
                }}
                disabled={esGeneradaDesdeInspeccion}
                error={!!errors.fechaHallazgo}
                helperText={errors.fechaHallazgo?.message}
                sx={esGeneradaDesdeInspeccion ? { bgcolor: "#f5f5f5" } : {}}
              />
            )}
          />

          <Controller
            name="responsableObservacion"
            control={control}
            rules={{ required: "Campo requerido" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Responsable de la Observación"
                fullWidth
                InputProps={{
                  readOnly: esGeneradaDesdeInspeccion,
                  endAdornment: esGeneradaDesdeInspeccion && (
                    <LockIcon fontSize="small" color="disabled" />
                  ),
                }}
                disabled={esGeneradaDesdeInspeccion}
                error={!!errors.responsableObservacion}
                helperText={errors.responsableObservacion?.message}
                sx={esGeneradaDesdeInspeccion ? { bgcolor: "#f5f5f5" } : {}}
              />
            )}
          />

          <Controller
            name="empresa"
            control={control}
            rules={{ required: "Campo requerido" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Empresa"
                fullWidth
                InputProps={{
                  readOnly: esGeneradaDesdeInspeccion,
                  endAdornment: esGeneradaDesdeInspeccion && (
                    <LockIcon fontSize="small" color="disabled" />
                  ),
                }}
                disabled={esGeneradaDesdeInspeccion}
                error={!!errors.empresa}
                helperText={errors.empresa?.message}
                sx={esGeneradaDesdeInspeccion ? { bgcolor: "#f5f5f5" } : {}}
              />
            )}
          />

          <Controller
            name="lugarFisico"
            control={control}
            rules={{ required: "Campo requerido" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Lugar Físico"
                fullWidth
                InputProps={{
                  readOnly: esGeneradaDesdeInspeccion,
                  endAdornment: esGeneradaDesdeInspeccion && (
                    <LockIcon fontSize="small" color="disabled" />
                  ),
                }}
                disabled={esGeneradaDesdeInspeccion}
                error={!!errors.lugarFisico}
                helperText={errors.lugarFisico?.message}
                sx={esGeneradaDesdeInspeccion ? { bgcolor: "#f5f5f5" } : {}}
              />
            )}
          />

          <Controller
            name="actividad"
            control={control}
            rules={{ required: "Campo requerido" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Actividad"
                fullWidth
                InputProps={{
                  readOnly: esGeneradaDesdeInspeccion,
                  endAdornment: esGeneradaDesdeInspeccion && (
                    <LockIcon fontSize="small" color="disabled" />
                  ),
                }}
                disabled={esGeneradaDesdeInspeccion}
                error={!!errors.actividad}
                helperText={errors.actividad?.message}
                sx={esGeneradaDesdeInspeccion ? { bgcolor: "#f5f5f5" } : {}}
              />
            )}
          />

          <Controller
            name="descripcionObservacion"
            control={control}
            rules={{ required: "Campo requerido" }}
            render={({ field }) => (
              <Box>
                <TextField
                  {...field}
                  label="Descripción de la Observación"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Ej: Escalera sin barandal de seguridad en área de producción"
                  InputProps={{
                    readOnly: esGeneradaDesdeInspeccion,
                    endAdornment: esGeneradaDesdeInspeccion && (
                      <LockIcon fontSize="small" color="disabled" />
                    ),
                  }}
                  disabled={esGeneradaDesdeInspeccion}
                  error={!!errors.descripcionObservacion}
                  helperText={
                    errors.descripcionObservacion?.message ||
                    (!esGeneradaDesdeInspeccion
                      ? "Escriba al menos 10 caracteres para ver recomendaciones de IA"
                      : "")
                  }
                  sx={esGeneradaDesdeInspeccion ? { bgcolor: "#f5f5f5" } : {}}
                />
                {loadingML && (
                  <Alert
                    severity="info"
                    icon={<CircularProgress size={20} />}
                    sx={{ mt: 1 }}
                  >
                    Generando recomendaciones con IA...
                  </Alert>
                )}
                {!loadingML && mlRecommendations.length > 0 && (
                  <Alert severity="success" icon={<AIIcon />} sx={{ mt: 1 }}>
                    ✅ {mlRecommendations.length} recomendaciones disponibles
                  </Alert>
                )}
                {!loadingML && mlError && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    {mlError}
                  </Alert>
                )}
              </Box>
            )}
          />

          <Controller
            name="familiaPeligro"
            control={control}
            rules={{ required: "Campo requerido" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Autocomplete
                freeSolo
                options={FAMILIAS_PELIGRO}
                value={value || null}
                onChange={(_event, newValue) => onChange(newValue)}
                onBlur={onBlur}
                disabled={estaAprobada || !esEstadoAbierto}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Familia de Peligro"
                    placeholder="Seleccione o escriba"
                    error={!!errors.familiaPeligro}
                    helperText={
                      errors.familiaPeligro?.message ||
                      (estaAprobada
                        ? "No se puede editar (tarea aprobada)"
                        : !esEstadoAbierto
                          ? "Solo editable en estado Abierto"
                          : "")
                    }
                    required
                  />
                )}
              />
            )}
          />

          <Controller
            name="accionPropuesta"
            control={control}
            rules={{ required: "Campo requerido" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Box>
                <Autocomplete
                  freeSolo
                  options={mlRecommendations}
                  value={value || ""}
                  onChange={(_event, newValue) => {
                    onChange(newValue || "");

                    const index = mlRecommendations.indexOf(newValue as string);
                    setSelectedRecommendationIndex(index >= 0 ? index : null);
                  }}
                  onInputChange={(_event, newInputValue, reason) => {
                    if (reason === "input") {
                      onChange(newInputValue);
                      setSelectedRecommendationIndex(null);
                    } else if (reason === "clear") {
                      onChange("");
                      setSelectedRecommendationIndex(null);
                    }
                  }}
                  onBlur={onBlur}
                  disabled={estaAprobada}
                  loading={loadingML}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Acción Propuesta"
                      placeholder="Escriba o seleccione una acción recomendada por IA"
                      multiline
                      rows={3}
                      error={!!errors.accionPropuesta}
                      helperText={
                        errors.accionPropuesta?.message ||
                        (loadingML
                          ? "Generando recomendaciones..."
                          : mlRecommendations.length > 0
                            ? `✨ ${mlRecommendations.length} opciones de IA disponibles - También puede escribir su propia acción`
                            : "Escriba una descripción de 10+ caracteres para ver recomendaciones de IA")
                      }
                      required
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: loadingML ? (
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                        ) : mlRecommendations.length > 0 ? (
                          <AIIcon color="primary" sx={{ mr: 1 }} />
                        ) : null,
                      }}
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } =
                      props as React.HTMLAttributes<HTMLLIElement> & {
                        key: string;
                      };
                    return (
                      <li key={key} {...otherProps}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            width: "100%",
                          }}
                        >
                          <AIIcon fontSize="small" color="primary" />
                          <span style={{ flex: 1 }}>{option}</span>
                        </Box>
                      </li>
                    );
                  }}
                />

                {selectedRecommendationIndex !== null && (
                  <Alert severity="info" icon={<AIIcon />} sx={{ mt: 1 }}>
                    ✨ Usando recomendación de IA (opción{" "}
                    {selectedRecommendationIndex + 1})
                  </Alert>
                )}

                {value &&
                  selectedRecommendationIndex === null &&
                  mlRecommendations.length > 0 && (
                    <Alert severity="success" sx={{ mt: 1 }}>
                      ✍️ Acción escrita manualmente
                    </Alert>
                  )}

                {mlError && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    {mlError}
                  </Alert>
                )}
              </Box>
            )}
          />

          <Controller
            name="responsableAreaCierre"
            control={control}
            rules={{ required: "Campo requerido" }}
            render={({ field: { onBlur } }) => {
              const seleccionado =
                supervisores.find(
                  (s) => s.username === responsableUsernameActual,
                ) ?? null;

              return (
                <Autocomplete
                  options={supervisores}
                  loading={loadingSupervisores}
                  value={seleccionado}
                  getOptionLabel={(s) => `${s.nomina} - ${s.puesto}`}
                  isOptionEqualToValue={(a, b) => a.username === b.username}
                  onChange={(_event, newValue) => {
                    setValue("responsableAreaCierre", newValue?.nomina ?? "", {
                      shouldValidate: true,
                    });
                    setValue(
                      "responsableAreaCierreUsername",
                      newValue?.username ?? "",
                    );
                  }}
                  onBlur={onBlur}
                  disabled={estaAprobada || !esEstadoAbierto}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Responsable de Área para Cierre"
                      placeholder="Seleccione un supervisor"
                      error={!!errors.responsableAreaCierre}
                      helperText={
                        errors.responsableAreaCierre?.message ||
                        (estaAprobada
                          ? "No se puede editar (tarea aprobada)"
                          : !esEstadoAbierto
                            ? "Solo editable en estado Abierto"
                            : "Solo supervisores con acceso al sistema")
                      }
                      required
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingSupervisores ? (
                              <CircularProgress size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              );
            }}
          />

          <Controller
            name="fechaCumplimientoAcordada"
            control={control}
            rules={{ required: "Campo requerido" }}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                label="Fecha Cumplimiento Acordada"
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={estaAprobada || !esEstadoAbierto}
                error={!!errors.fechaCumplimientoAcordada}
                helperText={
                  errors.fechaCumplimientoAcordada?.message ||
                  (estaAprobada
                    ? "No se puede editar (tarea aprobada)"
                    : !esEstadoAbierto
                      ? "Solo editable en estado Abierto"
                      : "")
                }
                sx={
                  estaAprobada || !esEstadoAbierto ? { bgcolor: "#f5f5f5" } : {}
                }
              />
            )}
          />

          <Controller
            name="fechaCumplimientoEfectiva"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <TextField
                {...field}
                value={value || ""}
                onChange={onChange}
                type="date"
                label="Fecha Cumplimiento Efectiva"
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={estaAprobada || !esEstadoEnProgreso}
                helperText={
                  estaAprobada
                    ? "No se puede editar (tarea aprobada)"
                    : !esEstadoEnProgreso
                      ? "Solo editable en estado En Progreso"
                      : "Completa esta fecha para cerrar la tarea"
                }
                sx={
                  estaAprobada || !esEstadoEnProgreso
                    ? { bgcolor: "#f5f5f5" }
                    : {}
                }
              />
            )}
          />

          {esEstadoEnProgreso && !estaAprobada && (
            <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                📎 Evidencias (Archivos e Imágenes)
              </Typography>

              <Button
                variant="outlined"
                component="label"
                startIcon={
                  uploadingFile ? (
                    <CircularProgress size={20} />
                  ) : (
                    <UploadIcon />
                  )
                }
                disabled={uploadingFile}
                fullWidth
                sx={{ mb: 2 }}
              >
                {uploadingFile ? "Subiendo..." : "Subir Archivo"}
                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                />
              </Button>

              {evidencias.length > 0 && (
                <List dense>
                  {evidencias.map((evidencia, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        bgcolor: "#f5f5f5",
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <AttachFileIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "primary.main" }}
                      />
                      <ListItemText
                        primary={evidencia.nombre}
                        secondary={
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}${evidencia.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: "0.75rem", color: "#1976d2" }}
                          >
                            Ver archivo
                          </a>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleDeleteEvidencia(index)}
                          title="Eliminar"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}

              {evidencias.length === 0 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  No hay evidencias adjuntas. Sube imágenes o archivos que
                  documenten el cierre de la tarea.
                </Alert>
              )}
            </Box>
          )}

          {diasRetraso > 0 && (
            <Alert severity={diasRetraso > 7 ? "error" : "warning"}>
              <strong>Días de retraso:</strong> {diasRetraso}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleFormClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onFormSubmit)}
          variant="contained"
          disabled={isLoading || estaAprobada}
        >
          {isLoading ? <CircularProgress size={20} /> : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
