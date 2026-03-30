"use client";

import type React from "react";
import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Container,
  Chip,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Assignment as FormIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  deleteInspection,
  getInspectionById,
  getInspectionsHerraEquipos,
  InspectionResponse,
} from "@/lib/actions/inspection-herra-equipos";
import {
  descargarExcelHerraEquipoCliente,
  descargarPdfHerraEquipoCliente,
} from "@/lib/actions/client";

// ✅ Componentes comunes
import {
  ReportTable,
  ReportColumn,
} from "@/components/reports/common/ReportTable";
import { ReportActionButtons } from "@/components/reports/common/ReportActionButtons";
import { ReportStateHandler } from "@/components/reports/common/ReportStateHandler";
import {
  ReportSnackbar,
  useReportNotification,
} from "@/components/reports/common/ReportSnackbar";

const TEMPLATE_NAMES: Record<string, string> = {
  "1.02.P06.F20": "Inspección de Cilindros",
  "1.02.P06.F39": "Inspección de Amoladora",
  "1.02.P06.F40": "Inspección de Esmeril",
  "1.02.P06.F42": "Inspección de Equipos de Soldar",
  "2.03.P10.F05": "Inspección de Taladro",
  "3.04.P04.F23": "Verificación Puente Grúa con Cabina",
  "3.04.P04.F35": "Inspección Puente Grúa Control Remoto",
  "3.04.P37.F19": "Inspección Pre-Uso Elementos de Izaje",
  "3.04.P37.F24": "Inspección Pre-Uso Tecles",
  "3.04.P37.F25": "Inspección Frecuente Tecles",
  "3.04.P48.F03": "Lista Verificación Vehículos",
  "1.02.P06.F33": "Inspección de Escaleras",
  "1.02.P06.F30": "Inspección de Andamios",
  "1.02.P06.F37": "Inspección Man Lift",
  "1.02.P06.F19":
    "LISTA DE CHEQUEO SISTEMAS DE PROTECCIÓN CONTRA CAÍDAS (SPCC)",
};

const VERIFICATION_FIELD_NAMES: Record<string, string> = {
  "3.04.P48.F03": "PLACA",
  "1.02.P06.F37": "PLACA/N° INTERNO",
  "3.04.P37.F24": "TAG",
  "3.04.P37.F25": "TAG",
  "3.04.P04.F23": "TAG del Puente Grúa",
  "3.04.P04.F35": "Tag del puente grúa",
  "1.02.P06.F33": "CÓDIGO DE LA ESCALERA",
  "1.02.P06.F39": "IDENTIFICACIÓN INTERNA DEL EQUIPO",
  "1.02.P06.F40": "UBICACIÓN FÍSICA EL EQUIPO",
  "1.02.P06.F42": "IDENTIFICACIÓN INTERNA DEL EQUIPO",
  "2.03.P10.F05": "CÓDIGO TALADRO",
  "1.02.P06.F20": "Lugar exacto del trabajo/depósito (lugar físico)",
  "1.02.P06.F30": "PROYECTO/Nº DE ORDEN DE TRABAJO",
};

// ── Helpers de extracción de campos dinámicos ─────────────────────────────
const getEquipmentId = (i: InspectionResponse): string => {
  const field = VERIFICATION_FIELD_NAMES[i.templateCode];
  if (!field || !i.verification) return "N/A";
  return i.verification[field]?.toString() || "N/A";
};

const getSuperintendenciaOGerencia = (i: InspectionResponse): string => {
  if (!i.verification) return "N/A";
  const v = i.verification;
  return (
    v["SUPERINTENDENCIA"] ||
    v["DIRECCIÓN/GERENCIA"] ||
    v["Gerencia"] ||
    v["DIRECCIÓN/GERENCIA y/o SUPERINTENDENCIA"] ||
    v["Vicepresidencia/Gerencia"] ||
    v["Dirección/Gerencia"] ||
    v["EMPRESA"] ||
    "N/A"
  ).toString();
};

const getArea = (i: InspectionResponse): string => {
  if (!i.verification) return "N/A";
  const v = i.verification;
  return (
    v["ÁREA"] ||
    v["Área"] ||
    v["Area"] ||
    v["AREA"] ||
    v["AREA FÍSICA DE UBICACIÓN DE LA ESCALERA"] ||
    v["UBICACIÓN FÍSICA DEL EQUIPO"] ||
    "N/A"
  ).toString();
};

export default function ListarInspeccionHerraEquipos() {
  const router = useRouter();
  const { notification, mostrar, cerrar } = useReportNotification();

  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Filtros
  const [templateNameFilter, setTemplateNameFilter] = useState("");
  const [templateCodeFilter, setTemplateCodeFilter] = useState("");
  const [equipmentIdFilter, setEquipmentIdFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // Modal de detalle
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedInspection, setSelectedInspection] =
    useState<InspectionResponse | null>(null);

  // ── Búsqueda ──────────────────────────────────────────────────────────────
  const buscarInspecciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: {
        templateCode?: string;
        startDate?: string;
        endDate?: string;
      } = {};
      if (templateCodeFilter) filters.templateCode = templateCodeFilter;
      if (startDateFilter) filters.startDate = startDateFilter;
      if (endDateFilter) filters.endDate = endDateFilter;

      const response = await getInspectionsHerraEquipos(filters);

      if (response.success && response.data) {
        let filtradas = response.data;

        if (templateNameFilter.trim()) {
          filtradas = filtradas.filter((i) =>
            i.templateName
              ?.toLowerCase()
              .includes(templateNameFilter.toLowerCase().trim()),
          );
        }
        if (equipmentIdFilter.trim()) {
          filtradas = filtradas.filter((i) => {
            const field = VERIFICATION_FIELD_NAMES[i.templateCode];
            if (!field || !i.verification) return false;
            return i.verification[field]
              ?.toString()
              .toLowerCase()
              .includes(equipmentIdFilter.toLowerCase().trim());
          });
        }

        setInspections(filtradas);
        setTotalItems(filtradas.length);
        setMostrarResultados(true);
      } else {
        setInspections([]);
        setError(response.error || "Error desconocido");
        setMostrarResultados(false);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las inspecciones");
      setInspections([]);
      setMostrarResultados(false);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setTemplateNameFilter("");
    setTemplateCodeFilter("");
    setEquipmentIdFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setInspections([]);
    setMostrarResultados(false);
    setError(null);
    setTotalItems(0);
  };

  // ── Acciones ──────────────────────────────────────────────────────────────
  const handleVerDetalle = async (inspection: InspectionResponse) => {
    try {
      setLoading(true);
      const result = await getInspectionById(inspection._id);
      if (result.success && result.data) {
        setSelectedInspection(result.data);
        setOpenDetailModal(true);
      } else throw new Error(result.error || "Error al cargar detalle");
    } catch (err) {
      console.error(err);
      mostrar("Error al cargar el detalle de la inspección", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicar = async (inspection: InspectionResponse) => {
    try {
      setLoading(true);
      const result = await getInspectionById(inspection._id);
      if (result.success && result.data) {
        localStorage.setItem(
          `draft_duplicate_${inspection.templateCode}`,
          JSON.stringify({
            ...result.data,
            status: "draft",
            submittedAt: new Date().toISOString(),
          }),
        );
        mostrar("Inspección duplicada, redirigiendo...", "info");
        setTimeout(
          () =>
            router.push(
              `/dashboard/form-herra-equipos/${inspection.templateCode}`,
            ),
          1000,
        );
      }
    } catch (err) {
      console.error(err);
      mostrar("Error al duplicar la inspección", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta inspección?"))
      return;
    try {
      setLoading(true);
      const result = await deleteInspection(id);
      if (result.success) {
        mostrar("Inspección eliminada correctamente", "success");
        await buscarInspecciones();
      } else throw new Error(result.error || "Error al eliminar");
    } catch (err) {
      console.error(err);
      mostrar(
        err instanceof Error ? err.message : "Error al eliminar",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPdf = async (id: string) => {
    try {
      await descargarPdfHerraEquipoCliente(id);
      mostrar("Descargando PDF...", "info");
    } catch (err) {
      console.error(err);
      mostrar("Error al descargar el PDF", "error");
    }
  };

  const handleDescargarExcel = async (id: string) => {
    try {
      setLoading(true);
      mostrar("Generando archivo Excel...", "info");
      await descargarExcelHerraEquipoCliente(id);
    } catch (err) {
      console.error(err);
      mostrar(
        err instanceof Error ? err.message : "Error al descargar el Excel",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") buscarInspecciones();
  };

  // ── Columnas ──────────────────────────────────────────────────────────────
  const columnas: ReportColumn<InspectionResponse>[] = [
    {
      key: "submittedAt",
      label: "Fecha Inspección",
      render: (row) =>
        row.submittedAt
          ? new Date(row.submittedAt).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "N/A",
    },
    {
      key: "superintendencia",
      label: "Superintendencia/Gerencia",
      render: (row) => getSuperintendenciaOGerencia(row),
    },
    { key: "area", label: "Área", render: (row) => getArea(row) },
    {
      key: "templateName",
      label: "Tipo de Inspección",
      render: (row) => (
        <Typography variant="body2" fontWeight="medium">
          {TEMPLATE_NAMES[row.templateCode] || row.templateName || "N/A"}
        </Typography>
      ),
    },
    {
      key: "templateCode",
      label: "Código + Revisión",
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {row.templateCode}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            Rev. {(row.templateId as any)?.revision || "N/A"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "equipmentId",
      label: "TAG/Placa/Código",
      render: (row) => (
        <Chip
          label={getEquipmentId(row)}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      align: "center",
      render: (row) => (
        <ReportActionButtons
          onView={() => handleVerDetalle(row)}
          onEdit={() =>
            router.push(`/dashboard/config/inspecciones/editar/${row._id}`)
          }
          onDuplicate={() => handleDuplicar(row)}
          onDownloadPdf={() => handleDescargarPdf(row._id)}
          onDownloadExcel={() => handleDescargarExcel(row._id)}
          onDelete={() => handleEliminar(row._id)}
          show={{ duplicate: true, delete: true }}
        />
      ),
    },
  ];

  return (
    <Container maxWidth="xl">
      <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 3 }}>
        Gestión de Inspecciones - Herramientas y Equipos
      </Typography>

      {/* ── Filtros ── */}
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: "8px" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filtros de búsqueda
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Nombre del Formulario</InputLabel>
              <Select
                value={templateNameFilter}
                onChange={(e) => setTemplateNameFilter(e.target.value)}
                label="Nombre del Formulario"
              >
                <MenuItem value="">Todos</MenuItem>
                {Object.entries(TEMPLATE_NAMES).map(([code, name]) => (
                  <MenuItem key={code} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Código</InputLabel>
              <Select
                value={templateCodeFilter}
                onChange={(e) => setTemplateCodeFilter(e.target.value)}
                label="Código"
              >
                <MenuItem value="">Todos</MenuItem>
                {Object.keys(TEMPLATE_NAMES).map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="TAG / Placa / Código"
              size="small"
              value={equipmentIdFilter}
              onChange={(e) => setEquipmentIdFilter(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ej: TAG-123, ABC-001"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              label="Fecha desde"
              type="date"
              size="small"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              label="Fecha hasta"
              type="date"
              size="small"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid
            size={{ xs: 12 }}
            display="flex"
            justifyContent="flex-end"
            gap={1}
          >
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={limpiarFiltros}
            >
              Limpiar
            </Button>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={buscarInspecciones}
              disabled={loading}
            >
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Loading / Error ── */}
      <ReportStateHandler loading={loading} error={error}>
        {/* ── Estadísticas ── */}
        {mostrarResultados && inspections.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              {
                label: "Total Inspecciones",
                value: totalItems,
                color: "text.primary",
              },
              {
                label: "Completadas",
                value: inspections.filter((i) => i.status === "completed")
                  .length,
                color: "success.main",
              },
              {
                label: "En Borrador",
                value: inspections.filter((i) => i.status === "draft").length,
                color: "warning.main",
              },
            ].map((stat) => (
              <Grid key={stat.label} size={{ xs: 12, md: 4 }}>
                <Card>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" color={stat.color}>
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* ── Tabla ── */}
        {mostrarResultados && (
          <ReportTable
            title="Resultados"
            titleExtra={
              <Button
                variant="contained"
                startIcon={<FormIcon />}
                onClick={() => router.push("/dashboard/form-herra-equipos")}
              >
                Nueva Inspección
              </Button>
            }
            columns={columnas}
            rows={inspections}
            rowKey={(row) => row._id}
            emptyMessage="No se encontraron inspecciones con los criterios de búsqueda"
          />
        )}
      </ReportStateHandler>

      {/* ── Modal de Detalle ── */}
      <Dialog
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalle de Inspección</DialogTitle>
        <DialogContent>
          {selectedInspection && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Información General
              </Typography>
              <Grid container spacing={2}>
                {[
                  {
                    label: "Código Template",
                    value: selectedInspection.templateCode || "N/A",
                  },
                  {
                    label: "Superintendencia/Gerencia",
                    value: getSuperintendenciaOGerencia(selectedInspection),
                  },
                  { label: "Área", value: getArea(selectedInspection) },
                ].map(({ label, value }) => (
                  <Grid key={label} size={{ xs: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      {label}:
                    </Typography>
                    <Typography variant="body1">{value}</Typography>
                  </Grid>
                ))}
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    Estado:
                  </Typography>
                  <Chip
                    label={
                      selectedInspection.status === "completed"
                        ? "Completado"
                        : "Borrador"
                    }
                    color={
                      selectedInspection.status === "completed"
                        ? "success"
                        : "warning"
                    }
                    size="small"
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Datos de Verificación
              </Typography>
              <Box
                sx={{
                  bgcolor: "#f5f5f5",
                  p: 2,
                  borderRadius: 1,
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                <pre>
                  {JSON.stringify(selectedInspection.verification, null, 2)}
                </pre>
              </Box>

              {selectedInspection.generalObservations && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Observaciones Generales
                  </Typography>
                  <Typography variant="body1">
                    {selectedInspection.generalObservations}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailModal(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* ── Notificaciones ── */}
      <ReportSnackbar notification={notification} onClose={cerrar} />
    </Container>
  );
}
