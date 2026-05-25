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
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { Pgr, ActividadPgr } from "@/types/pgr";

export default function PgrAprobacion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [pgrMock, setPgrMock] = useState<Pgr | null>(null);
  const [loading, setLoading] = useState(true);

  const [aprobadoPor, setAprobadoPor] = useState("Gerente General");
  const [fechaAprobacion, setFechaAprobacion] = useState<Dayjs | null>(dayjs());

  const [respuestas, setRespuestas] = useState<
    Record<string, { estado: string; motivo?: string }>
  >({});

  useEffect(() => {
    const loadPgr = async () => {
      try {
        const data = await pgrService.obtenerPorId(id);
        setPgrMock(data);

        // Init state based on loaded data
        const initialResp: Record<string, { estado: string; motivo?: string }> =
          {};
        if (data.actividades) {
          data.actividades.forEach((act: ActividadPgr) => {
            initialResp[act._id] = {
              estado: act.estadoAprobacion || "APROBADO",
              motivo: act.motivoRechazo || "",
            };
          });
        }
        setRespuestas(initialResp);
      } catch (err) {
        console.error("Error al cargar plan", err);
      } finally {
        setLoading(false);
      }
    };
    loadPgr();
  }, [id]);

  const handleEstadoChange = (id: string, value: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [id]: { ...prev[id], estado: value },
    }));
  };

  const handleMotivoChange = (id: string, value: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [id]: { ...prev[id], motivo: value },
    }));
  };

  const isAllApproved = Object.values(respuestas).every(
    (r) => r.estado === "APROBADO",
  );

  const handleAprobar = async () => {
    try {
      const payload = {
        aprobadoPor,
        actividadesAprobacion: Object.keys(respuestas).map((key) => ({
          _id: key,
          estadoAprobacion: respuestas[key].estado,
          motivoRechazo: respuestas[key].motivo,
        })),
      };
      await pgrService.aprobar(id, payload);
      alert("Respuesta enviada exitosamente");
      router.push("/dashboard/pgr");
    } catch (err) {
      console.error("Error enviando aprobación", err);
      alert("Ocurrió un error");
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
          Flujo de Aprobación
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          gutterBottom
          sx={{ mb: 4 }}
        >
          Revisión del Plan de Actividades
        </Typography>

        {/* Datos de Aprobación cabecera */}
        <Card
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 2,
            backgroundColor: "#F0F7FF",
            border: "1px solid #D6E8FD",
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              fontWeight="bold"
              color="text.primary"
            >
              Datos de Aprobación
            </Typography>
            <Grid container spacing={4} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Código Autogenerado
                </Typography>
                <Typography variant="h6">
                  {pgrMock.codigoAutogenerado}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Empresa
                </Typography>
                <Typography variant="body1">{pgrMock.empresa}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Gerencia
                </Typography>
                <Typography variant="body1">{pgrMock.gerencia}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Gestión
                </Typography>
                <Typography variant="body1">{pgrMock.gestion}</Typography>
              </Grid>
            </Grid>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Aprobado por"
                  fullWidth
                  size="small"
                  value={aprobadoPor}
                  onChange={(e) => setAprobadoPor(e.target.value)}
                  sx={{ backgroundColor: "#fff" }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Fecha"
                  value={fechaAprobacion}
                  onChange={(newValue) => setFechaAprobacion(newValue)}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: { backgroundColor: "#fff" },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Lista de Tareas para Aprobación */}
        <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Criterios de Aprobación por Tarea
            </Typography>

            {pgrMock.actividades.map((act: ActividadPgr) => (
              <Paper
                key={act._id}
                variant="outlined"
                sx={{ p: 3, mb: 3, borderRadius: 2 }}
              >
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        backgroundColor: "#F5F5F5",
                        display: "inline-block",
                        px: 1,
                        borderRadius: 1,
                        mr: 1,
                      }}
                    >
                      Actividad {act._id.slice(-4)}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      display="inline"
                    >
                      {act.descripcion}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Responsable:
                    </Typography>
                    <Typography variant="body2">{act.responsable}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Verificador:
                    </Typography>
                    <Typography variant="body2">{act.verificador}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Frecuencia:
                    </Typography>
                    <Typography variant="body2">{act.frecuencia}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Meses:
                    </Typography>
                    <Typography variant="body2">
                      {act.mesesProgramados.join(", ")}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 2 }} />

                <Grid container alignItems="flex-start" spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <RadioGroup
                      row
                      value={respuestas[act._id]?.estado || "APROBADO"}
                      onChange={(e) =>
                        handleEstadoChange(act._id, e.target.value)
                      }
                    >
                      <FormControlLabel
                        value="APROBADO"
                        control={<Radio color="success" />}
                        label={
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={0.5}
                            color="success.main"
                          >
                            <CheckCircleOutlineIcon fontSize="small" /> Aprobar
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="RECHAZADO"
                        control={<Radio color="error" />}
                        label={
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={0.5}
                            color="error.main"
                          >
                            <CancelIcon fontSize="small" /> Rechazar
                          </Box>
                        }
                      />
                    </RadioGroup>
                  </Grid>
                  {respuestas[act._id]?.estado === "RECHAZADO" && (
                    <Grid size={{ xs: 12, md: 8 }}>
                      <Typography
                        variant="body2"
                        color="error.main"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Motivo del rechazo (obligatorio)
                      </Typography>
                      <TextField
                        multiline
                        rows={2}
                        fullWidth
                        placeholder="Especifique las correcciones necesarias..."
                        color="error"
                        value={respuestas[act._id]?.motivo || ""}
                        onChange={(e) =>
                          handleMotivoChange(act._id, e.target.value)
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#fffafb",
                          },
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </Paper>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box display="flex" justifyContent="flex-end">
          {isAllApproved ? (
            <Button
              variant="contained"
              color="success"
              onClick={handleAprobar}
              startIcon={<CheckCircleOutlineIcon />}
              sx={{ borderRadius: 4, textTransform: "none", px: 4 }}
            >
              Aprobar Plan Completo
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              onClick={handleAprobar}
              startIcon={<CancelIcon />}
              sx={{ borderRadius: 4, textTransform: "none", px: 4 }}
            >
              Corregir y Volver a Mandar
            </Button>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
