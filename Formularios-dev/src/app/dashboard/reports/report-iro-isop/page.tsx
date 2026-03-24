"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
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
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Assignment as FormIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { FormInstance, FormTemplate } from "@/types/formTypes";
import { getTemplates } from "@/lib/actions/template-actions";
import {
  getInstances,
  GetInstancesFilters,
} from "@/lib/actions/instance-actions";
import {
  descargarExcelIroIsopCliente,
  descargarPdfIroIsopCliente,
} from "@/lib/actions/client";
import AutocompleteCustom from "@/components/molecules/autocomplete-custom/AutocompleteCustom";
import { useUserRole } from "@/hooks/useUserRole";

// ✅ Componentes comunes
import {
  ReportTable,
  ReportColumn,
} from "@/components/reports/common/ReportTable";
import { ReportActionButtons } from "@/components/reports/common/ReportActionButtons";
import { ReportStateHandler } from "@/components/reports/common/ReportStateHandler";

const ESTADOS_FORMULARIO = [
  { value: "borrador", label: "Borrador", color: "default" as const },
  { value: "completado", label: "Completado", color: "primary" as const },
  { value: "revisado", label: "Revisado", color: "warning" as const },
  { value: "aprobado", label: "Aprobado", color: "success" as const },
];

export default function ListarInspeccionesIroIsop() {
  const { user, isLoading: authLoading } = useUserRole();
  const router = useRouter();

  const [instancias, setInstancias] = useState<FormInstance[]>([]);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Paginación server-side
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Filtros
  const [templateIdFilter, setTemplateIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [createdByFilter, setCreatedByFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [minComplianceFilter, setMinComplianceFilter] = useState("");
  const [maxComplianceFilter, setMaxComplianceFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [superintendenciaFilter, setSuperintendenciaFilter] = useState("");

  // ── Permisos ──────────────────────────────────────────────────────────────
  const tienePermisos = (() => {
    if (!user || authLoading) return false;
    const rolesPermitidos = ["admin", "supervisor", "superintendente"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roles = (user as any).roles ?? (user as any).user?.roles ?? [];
    return Array.isArray(roles)
      ? roles.some((r: string) => rolesPermitidos.includes(r))
      : rolesPermitidos.includes(roles as string);
  })();

  useEffect(() => {
    const cargarTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const res = await getTemplates();
        if (res.success && res.data) {
          setTemplates(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTemplates(false);
      }
    };
    cargarTemplates();
  }, []);

  // ── Búsqueda ──────────────────────────────────────────────────────────────
  const buscarInstancias = async (
    overridePage?: number,
    overrideRowsPerPage?: number,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = overridePage ?? page;
      const currentRows = overrideRowsPerPage ?? rowsPerPage;

      const filters: GetInstancesFilters = {};
      if (templateIdFilter) filters.templateId = templateIdFilter;
      if (statusFilter) filters.status = statusFilter;
      if (createdByFilter) filters.createdBy = createdByFilter;
      if (dateFromFilter) filters.dateFrom = new Date(dateFromFilter);
      if (dateToFilter) filters.dateTo = new Date(dateToFilter);
      if (minComplianceFilter)
        filters.minCompliance = parseFloat(minComplianceFilter);
      if (maxComplianceFilter)
        filters.maxCompliance = parseFloat(maxComplianceFilter);
      if (areaFilter) filters.area = areaFilter;
      if (superintendenciaFilter)
        filters.superintendencia = superintendenciaFilter;
      filters.page = currentPage + 1;
      filters.limit = currentRows;

      const response = await getInstances(filters);

      if (response.success && response.data) {
        if (Array.isArray(response.data.data)) {
          setInstancias(response.data.data);
          setTotalItems(response.data.total ?? response.data.data.length);
          if (response.data.page) setPage(response.data.page - 1);
        } else if (Array.isArray(response.data)) {
          setInstancias(response.data);
          setTotalItems(response.data.length);
        } else {
          setInstancias([]);
        }
        setMostrarResultados(true);
      } else {
        setInstancias([]);
        setError(response.error || "Error al obtener datos");
        setMostrarResultados(false);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las instancias. Intente nuevamente.");
      setInstancias([]);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setTemplateIdFilter("");
    setStatusFilter("");
    setCreatedByFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setMinComplianceFilter("");
    setMaxComplianceFilter("");
    setAreaFilter("");
    setSuperintendenciaFilter("");
    setInstancias([]);
    setMostrarResultados(false);
    setError(null);
    setPage(0);
    setTotalItems(0);
  };

  // Paginación server-side — relanza búsqueda con nueva página
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    buscarInstancias(newPage, rowsPerPage);
  };

  const handleRowsPerPageChange = (newRows: number) => {
    setRowsPerPage(newRows);
    setPage(0);
    buscarInstancias(0, newRows);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") buscarInstancias();
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const obtenerTemplateNombre = (
    templateId: string | { _id: string; name: string; code: string },
  ): string => {
    if (typeof templateId === "object" && templateId._id) {
      return `${templateId.name} (${templateId.code})`;
    }
    const t = templates.find((t) => t._id === templateId);
    return t ? `${t.name} (${t.code})` : "Template desconocido";
  };

  const obtenerEstadoConfig = (status: string) =>
    ESTADOS_FORMULARIO.find((e) => e.value === status) ?? ESTADOS_FORMULARIO[0];

  const obtenerColorCumplimiento = (
    pct: number,
  ): "error" | "warning" | "success" => {
    if (pct < 70) return "error";
    if (pct < 90) return "warning";
    return "success";
  };

  // ── Columnas ──────────────────────────────────────────────────────────────
  const columnas: ReportColumn<FormInstance>[] = [
    {
      key: "templateId",
      label: "Template",
      render: (row) => (
        <Typography variant="body2" fontWeight="medium">
          {obtenerTemplateNombre(row.templateId)}
        </Typography>
      ),
    },
    {
      key: "area",
      label: "Área",
      render: (row) => {
        const vl = row.verificationList || {};
        return String(vl["Área"] || vl["area"] || vl["Area Física"] || "-");
      },
    },
    {
      key: "superintendencia",
      label: "Superintendencia",
      render: (row) => {
        const vl = row.verificationList || {};
        return String(vl["Superintendencia"] || vl["superintendencia"] || "-");
      },
    },
    {
      key: "status",
      label: "Estado",
      render: (row) => {
        const estado = obtenerEstadoConfig(row.status || "borrador");
        return <Chip label={estado.label} color={estado.color} size="small" />;
      },
    },
    {
      key: "createdBy",
      label: "Creado por",
      render: (row) => row.createdBy || "Sistema",
    },
    {
      key: "createdAt",
      label: "Fecha",
      render: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("es-ES")
          : "-",
    },
    {
      key: "cumplimiento",
      label: "% Cumpl.",
      align: "center",
      render: (row) => (
        <Chip
          label={`${(row.overallCompliancePercentage || 0).toFixed(0)}%`}
          color={obtenerColorCumplimiento(row.overallCompliancePercentage || 0)}
          size="small"
          icon={<TrendingUpIcon />}
        />
      ),
    },
    {
      key: "puntos",
      label: "Pts.",
      align: "center",
      render: (row) =>
        `${row.totalObtainedPoints ?? 0}/${row.totalApplicablePoints ?? 0}`,
    },
    {
      key: "acciones",
      label: "Acciones",
      align: "center",
      render: (row) => (
        <ReportActionButtons
          hasPermission={tienePermisos}
          onView={() =>
            router.push(
              `/dashboard/reports/report-iro-isop/editar/${row._id}?mode=view`,
            )
          }
          onEdit={() =>
            router.push(`/dashboard/reports/report-iro-isop/editar/${row._id}`)
          }
          onDownloadPdf={async () => {
            try {
              await descargarPdfIroIsopCliente(row._id);
            } catch (err) {
              console.error(err);
            }
          }}
          onDownloadExcel={async () => {
            try {
              await descargarExcelIroIsopCliente(row._id);
            } catch (err) {
              console.error(err);
            }
          }}
        />
      ),
    },
  ];

  // ── Estadísticas ──────────────────────────────────────────────────────────
  const promedioCumplimiento = instancias.length
    ? Math.round(
        instancias.reduce(
          (acc, i) => acc + (i.overallCompliancePercentage || 0),
          0,
        ) / instancias.length,
      )
    : 0;

  return (
    <Container maxWidth="xl">
      <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 3 }}>
        Gestión de Instancias IRO - ISOP
      </Typography>

      {/* ── Panel de filtros ── */}
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: "8px" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filtros de búsqueda
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Template de Formulario</InputLabel>
              <Select
                value={templateIdFilter}
                onChange={(e) => setTemplateIdFilter(e.target.value)}
                label="Template de Formulario"
                disabled={loadingTemplates}
              >
                <MenuItem value="">Todos</MenuItem>
                {templates.map((t) => (
                  <MenuItem key={t._id} value={t._id}>
                    {t.name} ({t.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                {ESTADOS_FORMULARIO.map((e) => (
                  <MenuItem key={e.value} value={e.value}>
                    {e.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Creado por"
              variant="outlined"
              size="small"
              value={createdByFilter}
              onChange={(e) => setCreatedByFilter(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Fecha desde"
              type="date"
              size="small"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Fecha hasta"
              type="date"
              size="small"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              fullWidth
              label="Min %"
              type="number"
              size="small"
              value={minComplianceFilter}
              onChange={(e) => setMinComplianceFilter(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              fullWidth
              label="Max %"
              type="number"
              size="small"
              value={maxComplianceFilter}
              onChange={(e) => setMaxComplianceFilter(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <AutocompleteCustom
              dataSource="area"
              label="Área"
              placeholder="Seleccione área"
              value={areaFilter}
              onChange={(val) => setAreaFilter(val || "")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <AutocompleteCustom
              dataSource="superintendencia"
              label="Superintendencia"
              placeholder="Seleccione..."
              value={superintendenciaFilter}
              onChange={(val) => setSuperintendenciaFilter(val || "")}
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
              onClick={() => buscarInstancias()}
              disabled={loading}
            >
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Estados loading / error ── */}
      <ReportStateHandler loading={loading} error={error}>
        {/* ── Tarjetas de estadísticas ── */}
        {mostrarResultados && instancias.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              {
                label: "Total Instancias",
                value: totalItems,
                color: "text.primary",
              },
              {
                label: "Promedio Cumplimiento",
                value: `${promedioCumplimiento}%`,
                color: "primary.main",
              },
              {
                label: "Aprobados",
                value: instancias.filter((i) => i.status === "aprobado").length,
                color: "success.main",
              },
              {
                label: "En Borrador",
                value: instancias.filter((i) => i.status === "borrador").length,
                color: "warning.main",
              },
            ].map((stat) => (
              <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ textAlign: "center", py: 2 }}>
                    <Typography color="textSecondary" variant="body2">
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color={stat.color}
                    >
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
              tienePermisos ? (
                <Button
                  variant="contained"
                  startIcon={<FormIcon />}
                  onClick={() =>
                    router.push("/dashboard/report-iro-isop/nuevo")
                  }
                >
                  Nueva Instancia
                </Button>
              ) : undefined
            }
            columns={columnas}
            rows={instancias}
            rowKey={(row) => row._id}
            size="small"
            emptyMessage="No se encontraron resultados."
            paginationMode="external"
            totalItems={totalItems}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        )}
      </ReportStateHandler>
    </Container>
  );
}
