"use client";

import React, { useEffect, useState, use } from "react";
import { pgrService } from "@/services/pgrService";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Pgr, ActividadPgr } from "@/types/pgr";

export default function PgrDetalleEdit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { id } = use(params);
  const { mode } = use(searchParams);
  const router = useRouter();

  const isViewMode = mode === "view";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pgrMock, setPgrMock] = useState<Pgr | null>(null);

  const [formData, setFormData] = useState<Partial<Pgr>>({
    empresa: "",
    vicepresidencia: "",
    gerencia: "",
    superintendencia: "",
    gestion: "",
    estado: "",
    codigoAutogenerado: "",
  });

  useEffect(() => {
    const loadPgr = async () => {
      try {
        const data = await pgrService.obtenerPorId(id);
        setPgrMock(data);
        setFormData({
          empresa: data.empresa || "",
          vicepresidencia: data.vicepresidencia || "",
          gerencia: data.gerencia || "",
          superintendencia: data.superintendencia || "",
          gestion: data.gestion || "",
          estado: data.estado || "",
          codigoAutogenerado: data.codigoAutogenerado || "",
        });
      } catch (err) {
        console.error("Error al cargar plan", err);
      } finally {
        setLoading(false);
      }
    };
    loadPgr();
  }, [id]);

  const handleChange = (field: keyof Pgr, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await pgrService.actualizar(id, formData);
      alert("PGR actualizado correctamente");
      router.push("/dashboard/pgr");
    } catch (err) {
      console.error("Error al guardar", err);
      alert("Error al actualizar");
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
    <Box p={4} maxWidth="1200px" mx="auto">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" fontWeight="bold">
            {isViewMode ? "Detalles Generales del PGR" : "Editar PGR"}
          </Typography>
        </Box>
        {!isViewMode && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom color="text.secondary">
          Información Básica
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Código Autogenerado"
              value={formData.codigoAutogenerado}
              disabled
              InputProps={{
                readOnly: true,
              }}
              sx={{ backgroundColor: "#f5f5f5" }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={isViewMode}>
              <InputLabel>Estado Flujo</InputLabel>
              <Select
                value={formData.estado}
                onChange={(e) => handleChange("estado", e.target.value)}
                label="Estado Flujo"
              >
                <MenuItem value="BORRADOR">Borrador</MenuItem>
                <MenuItem value="EN_REVISION">En Revisión</MenuItem>
                <MenuItem value="CORREGIR">Corregir</MenuItem>
                <MenuItem value="APROBADO">Aprobado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Empresa"
              value={formData.empresa}
              onChange={(e) => handleChange("empresa", e.target.value)}
              disabled={isViewMode}
              InputProps={{
                readOnly: isViewMode,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Vicepresidencia"
              value={formData.vicepresidencia}
              onChange={(e) => handleChange("vicepresidencia", e.target.value)}
              disabled={isViewMode}
              InputProps={{
                readOnly: isViewMode,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Gerencia"
              value={formData.gerencia}
              onChange={(e) => handleChange("gerencia", e.target.value)}
              disabled={isViewMode}
              InputProps={{
                readOnly: isViewMode,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Superintendencia"
              value={formData.superintendencia}
              onChange={(e) => handleChange("superintendencia", e.target.value)}
              disabled={isViewMode}
              InputProps={{
                readOnly: isViewMode,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Gestión"
              value={formData.gestion}
              onChange={(e) => handleChange("gestion", e.target.value)}
              disabled={isViewMode}
              InputProps={{
                readOnly: isViewMode,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Estatus"
              value={pgrMock.activo !== false ? "Activo" : "Inactivo"}
              disabled
              InputProps={{
                readOnly: true,
              }}
              sx={{ backgroundColor: "#f5f5f5" }}
            />
          </Grid>
        </Grid>

        <Box mt={6}>
          <Typography variant="h6" gutterBottom color="text.secondary">
            Actividades Planificadas y Seguimiento
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Descripción</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Responsable</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Meses</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Estado Aprobación
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Fecha Ejecución
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Semáforo</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Evidencias</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!pgrMock.actividades || pgrMock.actividades.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 3, color: "text.secondary" }}
                    >
                      No hay actividades registradas en este PGR
                    </TableCell>
                  </TableRow>
                ) : (
                  pgrMock.actividades.map((act: ActividadPgr) => (
                    <TableRow key={act._id} hover>
                      <TableCell>{act.descripcion}</TableCell>
                      <TableCell>{act.responsable}</TableCell>
                      <TableCell>{act.mesesProgramados?.join(", ")}</TableCell>
                      <TableCell>
                        <Chip
                          label={act.estadoAprobacion || "PENDIENTE"}
                          color={
                            act.estadoAprobacion === "APROBADO"
                              ? "success"
                              : act.estadoAprobacion === "RECHAZADO"
                                ? "error"
                                : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {act.fechaEjecucion ? (
                          new Date(act.fechaEjecucion).toLocaleDateString()
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Sin registrar
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {act.semaforoTiempo ? (
                          <Chip
                            label={act.semaforoTiempo}
                            color={
                              act.semaforoTiempo === "Atrasado"
                                ? "error"
                                : "info"
                            }
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {!act.evidencias || act.evidencias.length === 0 ? (
                          <Typography variant="caption" color="text.secondary">
                            Sin evidencias
                          </Typography>
                        ) : (
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            {act.evidencias.map((url: string, i: number) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  color: "#1976D2",
                                  fontSize: "0.75rem",
                                  textDecoration: "none",
                                }}
                              >
                                Ver Evidencia {i + 1}
                              </a>
                            ))}
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Box>
  );
}
