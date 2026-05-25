"use client";

import React, { useState, useEffect, use } from "react";
import { pgrService } from "@/services/pgrService";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  TextField,
  CircularProgress,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import { uploadImageToCloudinary } from "@/lib/actions/cloudinary";
import dayjs from "dayjs";
import { Pgr, ActividadPgr } from "@/types/pgr";

export default function PgrSeguimiento({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [pgrMock, setPgrMock] = useState<Pgr | null>(null);
  const [loading, setLoading] = useState(true);

  // States per activity: {"actId": {semaforo, fechaEjecucion, observaciones, evidencias[]}}
  const [seguimientoData, setSeguimientoData] = useState<Record<string, Partial<ActividadPgr>>>(
    {},
  );
  const [pendingFiles, setPendingFiles] = useState<
    Record<string, { file: File; previewUrl: string; isImage: boolean; name: string }[]>
  >({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPgr = async () => {
      try {
        const data: Pgr = await pgrService.obtenerPorId(id);
        const initialData: Record<string, Partial<ActividadPgr>> = {};
        if (data.actividades) {
          data.actividades.forEach((act: ActividadPgr) => {
            initialData[act._id] = {
              semaforoTiempo: act.semaforoTiempo || "En el Mes",
              fechaEjecucion: act.fechaEjecucion || undefined,
              observaciones: act.observaciones || "",
              evidencias: act.evidencias || [],
            };
          });
        }
        setSeguimientoData(initialData);
        setPgrMock(data);
      } catch (err) {
        console.error("Error al cargar plan", err);
      } finally {
        setLoading(false);
      }
    };
    loadPgr();
  }, [id]);

  const handleChange = (actId: string, field: keyof ActividadPgr, value: string | dayjs.Dayjs | null) => {
    setSeguimientoData((prev) => ({
      ...prev,
      [actId]: { ...prev[actId], [field]: value },
    }));
  };

  const handleFileUpload = (actId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newPendingFiles: { file: File; previewUrl: string; isImage: boolean; name: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        alert(`El archivo ${file.name} es demasiado grande (máximo 10MB)`);
        continue;
      }
      const isImage = file.type.startsWith("image/");
      const previewUrl = URL.createObjectURL(file);
      newPendingFiles.push({ file, previewUrl, isImage, name: file.name });
    }

    setPendingFiles((prev) => ({
      ...prev,
      [actId]: [
        ...(prev[actId] || []),
        ...newPendingFiles
      ],
    }));

    event.target.value = "";
  };

  const removePendingFile = (actId: string, index: number) => {
    setPendingFiles((prev) => {
      const newFiles = [...(prev[actId] || [])];
      URL.revokeObjectURL(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return { ...prev, [actId]: newFiles };
    });
  };

  const removeSavedFile = (actId: string, index: number) => {
    setSeguimientoData((prev) => {
      const newEvidencias = [...(prev[actId]?.evidencias || [])];
      newEvidencias.splice(index, 1);
      return {
        ...prev,
        [actId]: { ...prev[actId], evidencias: newEvidencias }
      };
    });
  };

  const onGuardarSeguimiento = async () => {
    try {
      setSaving(true);
      const dataToSave = { ...seguimientoData };

      for (const actId of Object.keys(pendingFiles)) {
        const filesToUpload = pendingFiles[actId] || [];
        if (filesToUpload.length > 0) {
          const uploadedUrls: string[] = [];
          for (const item of filesToUpload) {
            const formData = new FormData();
            formData.append("file", item.file);
            const { url } = await uploadImageToCloudinary(formData);
            uploadedUrls.push(url);
          }
          
          dataToSave[actId] = {
            ...dataToSave[actId],
            evidencias: [
              ...(dataToSave[actId]?.evidencias || []),
              ...uploadedUrls
            ]
          };
        }
      }

      for (const actId of Object.keys(dataToSave)) {
        const payload = { ...dataToSave[actId] };
        
        if (payload.fechaEjecucion) {
          const parsedDate = dayjs(payload.fechaEjecucion);
          if (parsedDate.isValid()) {
            payload.fechaEjecucion = parsedDate.toISOString();
          } else {
            delete payload.fechaEjecucion;
          }
        } else {
          delete payload.fechaEjecucion;
        }

        await pgrService.addSeguimiento(id, actId, payload);
      }
      
      setSeguimientoData(dataToSave);
      setPendingFiles({});
      alert("Seguimiento guardado correctamente");
    } catch (err: unknown) {
      console.error("Error al guardar seguimiento", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`Error al guardar seguimiento: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  if (!pgrMock)
    return (
      <Typography p={4} color="error">
        Plan no encontrado
      </Typography>
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 4, maxWidth: "1200px", margin: "0 auto" }}>
        <Typography variant="h4" gutterBottom>
          Seguimiento y Ejecución
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          gutterBottom
          sx={{ mb: 4 }}
        >
          Tablero de Control de Actividades
        </Typography>

        {/* Cabecera del plan */}
        <Card
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 2,
            backgroundColor: "#F4FFF8",
            border: "1px solid #C3EED1",
          }}
        >
          <CardContent>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Código del Plan
                </Typography>
                <Typography variant="h6">
                  {pgrMock.codigoAutogenerado}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Aprobado por
                </Typography>
                <Typography variant="body1">{pgrMock.aprobadoPor}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Fecha de Aprobación
                </Typography>
                <Typography variant="body1">
                  {pgrMock.fechaAprobacion}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Gestión
                </Typography>
                <Typography variant="body1">{pgrMock.gestion}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Ejecución de Tarea */}
        <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            {pgrMock.actividades.map((act: ActividadPgr) => (
              <Box key={act._id} sx={{ mb: 3 }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        backgroundColor: "#000",
                        color: "#fff",
                        display: "inline-block",
                        px: 1,
                        borderRadius: 2,
                        mr: 1,
                      }}
                    >
                      Actividad {act._id.slice(-4)}
                    </Typography>
                    <Typography variant="h6" display="inline" fontWeight="bold">
                      {act.descripcion}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Responsable:{" "}
                      <span style={{ color: "#000" }}>{act.responsable}</span>
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Entregable:{" "}
                      <span style={{ color: "#000" }}>{act.entregable}</span>
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Frecuencia:{" "}
                      <span style={{ color: "#000" }}>{act.frecuencia}</span>
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Programado:{" "}
                      <span style={{ color: "#000" }}>
                        {act.mesesProgramados.join(", ")}
                      </span>
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box mb={3}>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        fontWeight="bold"
                      >
                        Semáforo de Tiempo
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={
                            seguimientoData[act._id]?.semaforoTiempo ||
                            "Pendiente"
                          }
                          onChange={(e) =>
                            handleChange(
                              act._id,
                              "semaforoTiempo",
                              e.target.value,
                            )
                          }
                          sx={{
                            // Lógica dinámica para cambiar el fondo según el valor seleccionado
                            backgroundColor:
                              seguimientoData[act._id]?.semaforoTiempo ===
                              "Antes del Mes"
                                ? "#E8F5E9" // Fondo verde claro
                                : seguimientoData[act._id]?.semaforoTiempo ===
                                    "En el Mes"
                                  ? "#E3F2FD" // Fondo azul claro
                                  : seguimientoData[act._id]?.semaforoTiempo ===
                                      "Atrasado"
                                    ? "#FFEBEE" // Fondo rojo claro
                                    : "#FFF8E1", // Fondo amarillo claro por defecto (Pendiente)
                            "& .MuiSelect-select": {
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            },
                          }}
                        >
                          <MenuItem value="Antes del Mes">
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                backgroundColor: "#19d276ff",
                              }}
                            />
                            Antes del Mes
                          </MenuItem>
                          <MenuItem value="En el Mes">
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                backgroundColor: "#1976D2",
                              }}
                            />
                            En el Mes
                          </MenuItem>
                          <MenuItem value="Atrasado">
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                backgroundColor: "#D32F2F",
                              }}
                            />
                            Atrasado
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box mb={3}>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        fontWeight="bold"
                      >
                        Fecha de Ejecución
                      </Typography>
                      <DatePicker
                        value={
                          seguimientoData[act._id]?.fechaEjecucion
                            ? dayjs(seguimientoData[act._id]?.fechaEjecucion)
                            : null
                        }
                        onChange={(newValue) =>
                          handleChange(act._id, "fechaEjecucion", newValue)
                        }
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            sx: { backgroundColor: "#F5F5F5" },
                          },
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        fontWeight="bold"
                      >
                        Evidencias Anexadas
                      </Typography>

                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        size="small"
                        disabled={saving}
                        sx={{ mb: 2, borderRadius: 2 }}
                      >
                        Seleccionar Archivo
                        <input
                          type="file"
                          multiple
                          hidden
                          onChange={(e) => handleFileUpload(act._id, e)}
                        />
                      </Button>

                      {/* Archivos Pendientes (Previsualización) */}
                      {pendingFiles[act._id] && pendingFiles[act._id].length > 0 && (
                        <Box mb={2}>
                          <Typography variant="caption" color="primary" fontWeight="bold" display="block" gutterBottom>
                            Nuevos (sin guardar):
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={1.5}>
                            {pendingFiles[act._id].map((pf, idx) => (
                              <Box key={idx} position="relative" display="inline-block" sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 0.5, backgroundColor: '#fff', textAlign: 'center' }}>
                                <IconButton
                                  size="small"
                                  onClick={() => removePendingFile(act._id, idx)}
                                  sx={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', color: '#d32f2f', border: '1px solid #d32f2f', width: 20, height: 20, '&:hover': { backgroundColor: '#ffebee' }, zIndex: 1 }}
                                >
                                  <CloseIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                                {pf.isImage ? (
                                  <img src={pf.previewUrl} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                                ) : (
                                  <Box width={60} height={60} display="flex" alignItems="center" justifyContent="center" bgcolor="#f5f5f5" borderRadius={1} flexDirection="column">
                                    <InsertDriveFileIcon color="action" />
                                  </Box>
                                )}
                                <Typography variant="caption" display="block" sx={{ width: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.65rem', mt: 0.5 }} title={pf.name}>
                                  {pf.name}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Evidencias ya guardadas */}
                      {!seguimientoData[act._id]?.evidencias ||
                      seguimientoData[act._id]?.evidencias?.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          Sin evidencias guardadas
                        </Typography>
                      ) : (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" gutterBottom>
                            Ya guardados:
                          </Typography>
                          <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {seguimientoData[act._id]?.evidencias?.map(
                              (url: string, i: number) => (
                                <li key={i} style={{ marginBottom: '4px' }}>
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: "#1976D2", marginRight: '8px' }}
                                  >
                                    Evidencia {i + 1}
                                  </a>
                                  <IconButton size="small" onClick={() => removeSavedFile(act._id, i)} sx={{ padding: 0.2 }}>
                                    <CloseIcon sx={{ fontSize: 14, color: '#d32f2f' }} />
                                  </IconButton>
                                </li>
                              ),
                            )}
                          </ul>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      fontWeight="bold"
                    >
                      Observaciones de Ejecución
                    </Typography>
                    <TextField
                      multiline
                      rows={6}
                      fullWidth
                      placeholder="Describa el estado de la ejecución, desafíos, resultados..."
                      value={seguimientoData[act._id]?.observaciones || ""}
                      onChange={(e) =>
                        handleChange(act._id, "observaciones", e.target.value)
                      }
                      sx={{
                        backgroundColor: "#F5F5F5",
                        "& fieldset": { border: "none" },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="contained"
            startIcon={<DashboardIcon />}
            onClick={() => router.push("/dashboard/pgr")}
            sx={{
              borderRadius: 4,
              textTransform: "none",
              px: 4,
              backgroundColor: "#0A1929",
            }}
          >
            Ver Dashboard
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={onGuardarSeguimiento}
            disabled={saving}
            sx={{
              borderRadius: 4,
              textTransform: "none",
              px: 4,
              backgroundColor: "#0A1929",
            }}
          >
            {saving ? "Guardando..." : "Guardar Seguimiento"}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
