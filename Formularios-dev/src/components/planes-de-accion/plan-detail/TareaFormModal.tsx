"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
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
} from "../types/IProps";
import { FAMILIAS_PELIGRO } from "@/lib/constants";
import AutocompleteCustom from "@/components/molecules/autocomplete-custom/AutocompleteCustom";
import { getRecommendedActions } from "../hooks/mlRecommendations";
import { uploadFile } from "../hooks/uploadActions";

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
    watch,
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
      fechaCumplimientoAcordada: toDateInputValue(undefined),
      fechaCumplimientoEfectiva: "",
      estado: "abierto",
    },
  });

  // 🔥 Función para obtener recomendaciones usando Server Action
  const fetchMLRecommendations = useCallback(async (questionText: string) => {
    if (!questionText || questionText.trim().length < 10) {
      console.log("⏭️ Texto muy corto, saltando recomendaciones");
      setMlRecommendations([]);
      return;
    }

    console.log("🚀 Iniciando fetchMLRecommendations");
    console.log("📝 Texto de pregunta:", questionText);

    setLoadingML(true);
    setMlError(null);

    try {
      console.log("🔄 Llamando a getRecommendedActions...");

      const result = await getRecommendedActions(questionText);

      console.log("📦 Resultado completo:", JSON.stringify(result, null, 2));

      if (result.success && result.actions && result.actions.length > 0) {
        console.log("✅ Recomendaciones recibidas:", result.actions);
        setMlRecommendations(result.actions);
        setMlError(null);
      } else {
        console.warn("⚠️ No se encontraron recomendaciones");
        console.warn("Error:", result.error);
        setMlRecommendations([]);
        setMlError(result.error || "No se encontraron recomendaciones");
      }
    } catch (error) {
      console.error("❌ Error en fetchMLRecommendations:", error);
      setMlError("Error al cargar recomendaciones");
      setMlRecommendations([]);
    } finally {
      setLoadingML(false);
      console.log("🏁 fetchMLRecommendations terminado");
    }
  }, []);

  // 🔥 Efecto para cargar datos cuando se abre el modal con una tarea
  useEffect(() => {
    if (open && tarea) {
      console.log("📂 Cargando datos de tarea en el formulario:", tarea);
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
        fechaCumplimientoAcordada: toDateInputValue(
          tarea.fechaCumplimientoAcordada,
        ),
        fechaCumplimientoEfectiva: tarea.fechaCumplimientoEfectiva
          ? toDateInputValue(tarea.fechaCumplimientoEfectiva)
          : "",
        estado: tarea.estado ?? "abierto",
      });

      // 🔥 Cargar evidencias si existen
      if (tarea.evidencias && Array.isArray(tarea.evidencias)) {
        setEvidencias(tarea.evidencias);
      } else {
        setEvidencias([]);
      }

      // 🔥 Cargar recomendaciones si hay descripción
      if (
        tarea.descripcionObservacion &&
        tarea.descripcionObservacion.trim().length >= 10
      ) {
        console.log(
          "🤖 Cargando recomendaciones para descripción existente:",
          tarea.descripcionObservacion,
        );
        fetchMLRecommendations(tarea.descripcionObservacion);
      }
    } else if (open && !tarea) {
      // 🔥 Resetear formulario para nueva tarea
      console.log("🆕 Abriendo modal para nueva tarea");
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
        fechaCumplimientoAcordada: toDateInputValue(undefined),
        fechaCumplimientoEfectiva: "",
        estado: "abierto",
      });
      setMlRecommendations([]);
      setMlError(null);
      setEvidencias([]);
    }
  }, [open, tarea, reset, fetchMLRecommendations]);

  const esGeneradaDesdeInspeccion = plan?.instanceId !== undefined;
  const estaAprobada = tarea?.aprobado === true;
  const estadoActual = watch("estado") || tarea?.estado || "abierto";

  // 🔥 Determinar qué campos están editables según el estado
  const esEstadoAbierto = estadoActual === "abierto";
  const esEstadoEnProgreso = estadoActual === "en-progreso";
  const esEstadoCerrado = estadoActual === "cerrado";

  const descripcionObservacion = watch("descripcionObservacion");

  // 🔥 Efecto para cargar recomendaciones cuando se escribe (tarea nueva)
  useEffect(() => {
    console.log(
      "🔄 useEffect disparado - descripcion:",
      descripcionObservacion,
    );

    // Solo ejecutar si NO es una tarea generada desde inspección
    if (esGeneradaDesdeInspeccion) {
      console.log("⏭️ Tarea generada desde inspección, campo bloqueado");
      return;
    }

    const timer = setTimeout(() => {
      if (
        descripcionObservacion &&
        descripcionObservacion.trim().length >= 10
      ) {
        console.log("✅ Descripción válida, obteniendo recomendaciones...");
        fetchMLRecommendations(descripcionObservacion);
      } else {
        console.log("⏭️ Descripción insuficiente:", descripcionObservacion);
      }
    }, 1000);

    return () => {
      console.log("🧹 Limpiando timer");
      clearTimeout(timer);
    };
  }, [
    descripcionObservacion,
    esGeneradaDesdeInspeccion,
    fetchMLRecommendations,
  ]);

  const fechaAcordada = watch("fechaCumplimientoAcordada");
  const fechaEfectiva = watch("fechaCumplimientoEfectiva");

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

  // 🔥 Función para subir archivo al backend
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

      // 🔥 Usar la server action con autenticación automática
      const data = await uploadFile(formData);

      // Agregar a la lista de evidencias
      setEvidencias((prev) => [
        ...prev,
        {
          nombre: file.name,
          url: data.url || data.path,
        },
      ]);

      console.log("✅ Archivo subido:", data);
    } catch (error) {
      console.error("❌ Error subiendo archivo:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al subir el archivo";
      alert(errorMessage);
    } finally {
      setUploadingFile(false);
    }
  };

  // 🔥 Función para eliminar evidencia
  const handleDeleteEvidencia = (index: number) => {
    setEvidencias((prev) => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: FormTareaData) => {
    try {
      console.log("📤 Datos del formulario:", data);

      // 🔥 Si es una tarea generada desde inspección, solo enviar campos editables (UpdateTareaDTO)
      if (esGeneradaDesdeInspeccion) {
        const camposEditables: UpdateTareaDTO = {
          familiaPeligro: data.familiaPeligro,
          accionPropuesta: data.accionPropuesta,
          responsableAreaCierre: data.responsableAreaCierre,
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
        console.log(
          "📦 Campos editables a enviar:",
          JSON.stringify(camposEditables, null, 2),
        );
        // 🔥 Lógica automática de cambio de estado
        if (estadoActual === "abierto") {
          // Si todos los campos de programación están completos, pasar a "en-progreso"
          if (
            data.familiaPeligro &&
            data.accionPropuesta &&
            data.responsableAreaCierre &&
            data.fechaCumplimientoAcordada
          ) {
            camposEditables.estado = "en-progreso";
            console.log("✅ Cambio automático: Abierto → En Progreso");
          }
        } else if (estadoActual === "en-progreso") {
          // Si se completa la fecha efectiva, pasar a "cerrado"
          if (data.fechaCumplimientoEfectiva) {
            camposEditables.estado = "cerrado";
            console.log("✅ Cambio automático: En Progreso → Cerrado");
          }
        }

        console.log(
          "✅ Enviando solo campos editables (UpdateTareaDTO):",
          camposEditables,
        );
        await onSubmit(camposEditables);
      } else {
        // 🔥 Si es tarea manual, enviar todos los campos (AddTareaDTO)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { estado: _estado, ...tareaData } = data;
        console.log("✅ Enviando todos los campos (AddTareaDTO)");
        await onSubmit(tareaData);
      }

      handleFormClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // 🔥 Log del estado actual para debugging
  useEffect(() => {
    console.log("📊 Estado actual:");
    console.log("  - loadingML:", loadingML);
    console.log("  - mlRecommendations:", mlRecommendations);
    console.log("  - mlError:", mlError);
  }, [loadingML, mlRecommendations, mlError]);

  return (
    <Dialog open={open} onClose={handleFormClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {tarea ? "Editar Tarea" : "Agregar Nueva Tarea"}
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

          {estaAprobada && (
            <Alert severity="warning">
              Esta tarea está aprobada. No se pueden realizar modificaciones.
            </Alert>
          )}

          {/* 🔥 Alertas según el estado actual */}
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

          {/* 🔥 CAMPO DESCRIPCIÓN */}
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

          {/* 🔥 Familia de Peligro */}
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

          {/* 🔥 CAMPO DE ACCIÓN PROPUESTA CON RECOMENDACIONES ML */}
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
                    console.log("🎯 onChange - Acción seleccionada:", newValue);
                    onChange(newValue || "");

                    const index = mlRecommendations.indexOf(newValue as string);
                    setSelectedRecommendationIndex(index >= 0 ? index : null);
                    console.log(
                      "📊 Índice de recomendación:",
                      index >= 0 ? index : "manual",
                    );
                  }}
                  onInputChange={(_event, newInputValue, reason) => {
                    console.log(
                      "⌨️ onInputChange - Valor:",
                      newInputValue,
                      "Razón:",
                      reason,
                    );

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

          {/* 🔥 Responsable */}
          <Controller
            name="responsableAreaCierre"
            control={control}
            rules={{ required: "Campo requerido" }}
            render={({ field: { onChange, onBlur, value } }) => {
              const handleSupervisorChange = (newValue: string | null) => {
                if (newValue && newValue.includes(" - ")) {
                  const nombre = newValue.split(" - ")[0].trim();
                  onChange(nombre);
                } else {
                  onChange(newValue);
                }
              };

              return (
                <AutocompleteCustom
                  dataSource={"supervisor"}
                  value={value || null}
                  onChange={handleSupervisorChange}
                  onBlur={onBlur}
                  label="Responsable de Área para Cierre"
                  placeholder="Seleccione un supervisor"
                  error={!!errors.responsableAreaCierre}
                  helperText={
                    errors.responsableAreaCierre?.message ||
                    (estaAprobada
                      ? "No se puede editar (tarea aprobada)"
                      : !esEstadoAbierto
                        ? "Solo editable en estado Abierto"
                        : "")
                  }
                  disabled={estaAprobada || !esEstadoAbierto}
                  required
                />
              );
            }}
          />

          {/* 🔥 Fecha Acordada */}
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

          {/* 🔥 Fecha Efectiva */}
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

          {/* 🔥 EVIDENCIAS */}
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
                            href={evidencia.url}
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
