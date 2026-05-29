"use client";

import type React from "react";
import { useEffect, useState, Suspense } from "react";
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
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
import AutocompleteCustom from "@/components/ui/autocomplete/AutocompleteCustom";

// ✅ Componentes comunes
import { Can } from "@/components/layout/wrappers/Can";
import { Permission } from "@/lib/permissions";
import {
  ReportTable,
  ReportColumn,
} from "@/components/features/reports/presentation/components/ReportTable";
import { ReportActionButtons } from "@/components/features/reports/presentation/components/ReportActionButtons";
import { ReportStateHandler } from "@/components/features/reports/presentation/components/ReportStateHandler";

const ESTADOS_FORMULARIO = [
  { value: "borrador", label: "Borrador", color: "default" as const },
  { value: "completado", label: "Completado", color: "primary" as const },
  { value: "revisado", label: "Revisado", color: "warning" as const },
  { value: "aprobado", label: "Aprobado", color: "success" as const },
];

function ListarInspeccionesIroIsopComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [instancias, setInstancias] = useState<FormInstance[]>([]);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Paginación client-side
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
  const [searchFilter, setSearchFilter] = useState("");

  // ── Permisos ──────────────────────────────────────────────────────────────
  // (Migrados al sistema granular de permisos)

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

  // ── Búsqueda y Filtros de URL ─────────────────────────────────────────────
  const buscarInstancias = async (paramsFromUrl?: {
    templateId?: string;
    status?: string;
    createdBy?: string;
    dateFrom?: string;
    dateTo?: string;
    minCompliance?: string;
    maxCompliance?: string;
    area?: string;
    superintendencia?: string;
    search?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Usar parámetros de la URL o el estado actual
      const tId = paramsFromUrl ? (paramsFromUrl.templateId ?? "") : templateIdFilter;
      const status = paramsFromUrl ? (paramsFromUrl.status ?? "") : statusFilter;
      const createdBy = paramsFromUrl ? (paramsFromUrl.createdBy ?? "") : createdByFilter;
      const dateFrom = paramsFromUrl ? (paramsFromUrl.dateFrom ?? "") : dateFromFilter;
      const dateTo = paramsFromUrl ? (paramsFromUrl.dateTo ?? "") : dateToFilter;
      const minComp = paramsFromUrl ? (paramsFromUrl.minCompliance ?? "") : minComplianceFilter;
      const maxComp = paramsFromUrl ? (paramsFromUrl.maxCompliance ?? "") : maxComplianceFilter;
      const area = paramsFromUrl ? (paramsFromUrl.area ?? "") : areaFilter;
      const sup = paramsFromUrl ? (paramsFromUrl.superintendencia ?? "") : superintendenciaFilter;
      const search = paramsFromUrl ? (paramsFromUrl.search ?? "") : searchFilter;

      // 2. Si no es invocación desde useEffect de la URL, actualizar los query params de la barra
      if (!paramsFromUrl) {
        const queryParams = new URLSearchParams();
        if (tId) queryParams.set("templateId", tId);
        if (status) queryParams.set("status", status);
        if (createdBy) queryParams.set("createdBy", createdBy);
        if (dateFrom) queryParams.set("dateFrom", dateFrom);
        if (dateTo) queryParams.set("dateTo", dateTo);
        if (minComp) queryParams.set("minCompliance", minComp);
        if (maxComp) queryParams.set("maxCompliance", maxComp);
        if (area) queryParams.set("area", area);
        if (sup) queryParams.set("superintendencia", sup);
        if (search) queryParams.set("search", search);

        router.push(`${pathname}?${queryParams.toString()}`);
      }

      // 3. Preparar filtros estables para el backend (con un límite alto)
      const filters: GetInstancesFilters = { limit: 10000 };
      if (tId) filters.templateId = tId;
      if (status) filters.status = status;
      if (createdBy) filters.createdBy = createdBy;
      if (dateFrom) filters.dateFrom = new Date(dateFrom);
      if (dateTo) filters.dateTo = new Date(dateTo);

      const response = await getInstances(filters);

      if (response.success && response.data) {
        let fetchedData = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];

        // 4. Filtrado en el cliente para resolver discrepancias de claves
        // Área
        if (area) {
          const areaLower = area.toLowerCase();
          fetchedData = fetchedData.filter((i) => {
            const vl = i.verificationList || {};
            const val = String(vl["Área"] || vl["area"] || vl["Area Física"] || "");
            return val.toLowerCase() === areaLower;
          });
        }

        // Superintendencia
        if (sup) {
          const supLower = sup.toLowerCase();
          fetchedData = fetchedData.filter((i) => {
            const vl = i.verificationList || {};
            const val = String(vl["Superintendencia"] || vl["superintendencia"] || "");
            return val.toLowerCase() === supLower;
          });
        }

        // Cumplimiento
        if (minComp) {
          const min = parseFloat(minComp);
          if (!isNaN(min)) {
            fetchedData = fetchedData.filter((i) => (i.overallCompliancePercentage ?? 0) >= min);
          }
        }
        if (maxComp) {
          const max = parseFloat(maxComp);
          if (!isNaN(max)) {
            fetchedData = fetchedData.filter((i) => (i.overallCompliancePercentage ?? 0) <= max);
          }
        }

        // Búsqueda por texto (en todos los campos de verificationList)
        if (search.trim()) {
          const searchLower = search.toLowerCase().trim();
          fetchedData = fetchedData.filter((i) => {
            const haystack = [
              ...Object.keys(i.verificationList || {}),
              ...Object.values(i.verificationList || {}).map((v) => String(v)),
            ]
              .join(" ")
              .toLowerCase();
            return haystack.includes(searchLower);
          });
        }

        setInstancias(fetchedData);
        setTotalItems(fetchedData.length);
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

  // Inicializar filtros desde la URL al montar o cambiar params
  useEffect(() => {
    const templateId = searchParams.get("templateId") || "";
    const status = searchParams.get("status") || "";
    const createdBy = searchParams.get("createdBy") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const minCompliance = searchParams.get("minCompliance") || "";
    const maxCompliance = searchParams.get("maxCompliance") || "";
    const area = searchParams.get("area") || "";
    const superintendencia = searchParams.get("superintendencia") || "";
    const search = searchParams.get("search") || "";

    setTemplateIdFilter(templateId);
    setStatusFilter(status);
    setCreatedByFilter(createdBy);
    setDateFromFilter(dateFrom);
    setDateToFilter(dateTo);
    setMinComplianceFilter(minCompliance);
    setMaxComplianceFilter(maxCompliance);
    setAreaFilter(area);
    setSuperintendenciaFilter(superintendencia);
    setSearchFilter(search);

    if (
      templateId ||
      status ||
      createdBy ||
      dateFrom ||
      dateTo ||
      minCompliance ||
      maxCompliance ||
      area ||
      superintendencia ||
      search
    ) {
      buscarInstancias({
        templateId,
        status,
        createdBy,
        dateFrom,
        dateTo,
        minCompliance,
        maxCompliance,
        area,
        superintendencia,
        search,
      });
    }
  }, [searchParams]);

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
    setSearchFilter("");
    setInstancias([]);
    setMostrarResultados(false);
    setError(null);
    setTotalItems(0);
    router.push(pathname);
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

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Búsqueda (valores de verificación)"
              variant="outlined"
              size="small"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Buscar..."
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
              <Can perform={Permission.CREATE_FORM}>
                <Button
                  variant="contained"
                  startIcon={<FormIcon />}
                  onClick={() =>
                    router.push("/dashboard/report-iro-isop/nuevo")
                  }
                >
                  Nueva Instancia
                </Button>
              </Can>
            }
            columns={columnas}
            rows={instancias}
            rowKey={(row) => row._id}
            size="small"
            emptyMessage="No se encontraron resultados."
            paginationMode="internal"
          />
        )}
      </ReportStateHandler>
    </Container>
  );
}

export default function ListarInspeccionesIroIsop() {
  return (
    <Suspense fallback={null}>
      <ListarInspeccionesIroIsopComponent />
    </Suspense>
  );
}
