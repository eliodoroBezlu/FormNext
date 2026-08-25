"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState, Suspense } from "react";
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
  descargarZipIroIsopCliente,
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
import { BulkDownloadButton } from "@/components/features/reports/presentation/components/BulkDownloadButton";
import { ReportStateHandler } from "@/components/features/reports/presentation/components/ReportStateHandler";

const ESTADOS_FORMULARIO = [
  { value: "borrador", label: "Borrador", color: "default" as const },
  { value: "completado", label: "Completado", color: "primary" as const },
  { value: "revisado", label: "Revisado", color: "warning" as const },
  { value: "aprobado", label: "Aprobado", color: "success" as const },
];

/** Los filtros del informe, tal y como viajan en la barra de direcciones. */
interface FiltrosIroIsop {
  templateId: string;
  status: string;
  createdBy: string;
  dateFrom: string;
  dateTo: string;
  minCompliance: string;
  maxCompliance: string;
  area: string;
  superintendencia: string;
  search: string;
}

/** Lee los filtros de la URL. Puro: mismo `params`, mismo resultado. */
const leerFiltrosDeUrl = (
  params: Pick<URLSearchParams, "get">,
): FiltrosIroIsop => ({
  templateId: params.get("templateId") || "",
  status: params.get("status") || "",
  createdBy: params.get("createdBy") || "",
  dateFrom: params.get("dateFrom") || "",
  dateTo: params.get("dateTo") || "",
  minCompliance: params.get("minCompliance") || "",
  maxCompliance: params.get("maxCompliance") || "",
  area: params.get("area") || "",
  superintendencia: params.get("superintendencia") || "",
  search: params.get("search") || "",
});

const hayAlgunFiltro = (f: FiltrosIroIsop): boolean =>
  Object.values(f).some((valor) => valor !== "");

/** Serializa los filtros omitiendo los vacíos, para escribirlos en la URL. */
const aQueryString = (f: FiltrosIroIsop): string => {
  const query = new URLSearchParams();
  for (const [clave, valor] of Object.entries(f)) {
    if (valor) query.set(clave, valor);
  }
  return query.toString();
};

/**
 * Filtrado que el backend no hace: los campos de `verificationList` no tienen
 * una clave estable, así que hay que mirarlos aquí. Función pura y a nivel de
 * módulo — no toca estado ni depende del render.
 */
const filtrarEnCliente = (
  datos: FormInstance[],
  f: FiltrosIroIsop,
): FormInstance[] => {
  let resultado = datos;

  if (f.area) {
    const areaLower = f.area.toLowerCase();
    resultado = resultado.filter((i) => {
      const vl = i.verificationList || {};
      const val = String(vl["Área"] || vl["area"] || vl["Area Física"] || "");
      return val.toLowerCase() === areaLower;
    });
  }

  if (f.superintendencia) {
    const supLower = f.superintendencia.toLowerCase();
    resultado = resultado.filter((i) => {
      const vl = i.verificationList || {};
      const val = String(vl["Superintendencia"] || vl["superintendencia"] || "");
      return val.toLowerCase() === supLower;
    });
  }

  const min = parseFloat(f.minCompliance);
  if (!isNaN(min)) {
    resultado = resultado.filter(
      (i) => (i.overallCompliancePercentage ?? 0) >= min,
    );
  }

  const max = parseFloat(f.maxCompliance);
  if (!isNaN(max)) {
    resultado = resultado.filter(
      (i) => (i.overallCompliancePercentage ?? 0) <= max,
    );
  }

  if (f.search.trim()) {
    const searchLower = f.search.toLowerCase().trim();
    resultado = resultado.filter((i) => {
      const haystack = [
        ...Object.keys(i.verificationList || {}),
        ...Object.values(i.verificationList || {}).map((v) => String(v)),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(searchLower);
    });
  }

  return resultado;
};

function ListarInspeccionesIroIsopComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [instancias, setInstancias] = useState<FormInstance[]>([]);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  // Si la URL ya trae filtros, la página está buscando desde el primer render.
  const [loading, setLoading] = useState(() =>
    hayAlgunFiltro(leerFiltrosDeUrl(searchParams)),
  );
  // Arranca en `true`: los templates se piden nada más montar.
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Paginación client-side
  const [totalItems, setTotalItems] = useState(0);

  /**
   * Los filtros nacen de la URL y a partir de ahí el usuario los edita, así
   * que hay que copiarlos **una vez** — no derivarlos en cada render. Se hace
   * con el inicializador de `useState`, no con un efecto: así ya están puestos
   * en el primer pintado, sin el parpadeo de campos vacíos que había antes.
   */
  const filtrosDeLaUrl = leerFiltrosDeUrl(searchParams);
  const [templateIdFilter, setTemplateIdFilter] = useState(
    () => filtrosDeLaUrl.templateId,
  );
  const [statusFilter, setStatusFilter] = useState(() => filtrosDeLaUrl.status);
  const [createdByFilter, setCreatedByFilter] = useState(
    () => filtrosDeLaUrl.createdBy,
  );
  const [dateFromFilter, setDateFromFilter] = useState(
    () => filtrosDeLaUrl.dateFrom,
  );
  const [dateToFilter, setDateToFilter] = useState(() => filtrosDeLaUrl.dateTo);
  const [minComplianceFilter, setMinComplianceFilter] = useState(
    () => filtrosDeLaUrl.minCompliance,
  );
  const [maxComplianceFilter, setMaxComplianceFilter] = useState(
    () => filtrosDeLaUrl.maxCompliance,
  );
  const [areaFilter, setAreaFilter] = useState(() => filtrosDeLaUrl.area);
  const [superintendenciaFilter, setSuperintendenciaFilter] = useState(
    () => filtrosDeLaUrl.superintendencia,
  );
  const [searchFilter, setSearchFilter] = useState(() => filtrosDeLaUrl.search);

  /**
   * Última búsqueda que ya lanzamos nosotros. Al pulsar «Buscar» escribimos la
   * URL, y eso despierta al efecto de abajo; sin esta marca la consulta se
   * haría **dos veces** por cada clic.
   */
  const ultimaBusqueda = useRef<string | null>(null);

  useEffect(() => {
    // La promesa se encadena aquí en vez de llamar a una función `async`: el
    // analizador rastrea dentro de ella y vería su `setLoadingTemplates(true)`
    // como un setState síncrono del efecto.
    let vigente = true;

    getTemplates()
      .then((res) => {
        if (!vigente) return;
        if (res.success && res.data) {
          setTemplates(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch((err: unknown) => {
        console.error("Error al cargar templates:", err);
      })
      .finally(() => {
        if (vigente) setLoadingTemplates(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  // ── Búsqueda ──────────────────────────────────────────────────────────────

  /**
   * Solo consulta y devuelve; **no toca el estado**. Al estar libre de
   * setState puede encadenarse desde el efecto sin que el analizador la vea
   * como una cascada de renders.
   */
  const consultar = useCallback(
    async (f: FiltrosIroIsop): Promise<FormInstance[]> => {
      const filters: GetInstancesFilters = { limit: 10000 };
      if (f.templateId) filters.templateId = f.templateId;
      if (f.status) filters.status = f.status;
      if (f.createdBy) filters.createdBy = f.createdBy;
      if (f.dateFrom) filters.dateFrom = new Date(f.dateFrom);
      if (f.dateTo) filters.dateTo = new Date(f.dateTo);

      const response = await getInstances(filters);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Error al obtener datos");
      }

      const recibidas = Array.isArray(response.data.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : [];

      return filtrarEnCliente(recibidas, f);
    },
    [],
  );

  const aplicar = useCallback((datos: FormInstance[]) => {
    setInstancias(datos);
    setTotalItems(datos.length);
    setMostrarResultados(true);
    setError(null);
  }, []);

  const avisarFallo = useCallback((err: unknown) => {
    console.error(err);
    setError("No se pudieron cargar las instancias. Intente nuevamente.");
    setInstancias([]);
    setMostrarResultados(false);
  }, []);

  /** Búsqueda a petición: botón «Buscar» o Enter en un campo. */
  const buscarInstancias = useCallback(async () => {
    const f: FiltrosIroIsop = {
      templateId: templateIdFilter,
      status: statusFilter,
      createdBy: createdByFilter,
      dateFrom: dateFromFilter,
      dateTo: dateToFilter,
      minCompliance: minComplianceFilter,
      maxCompliance: maxComplianceFilter,
      area: areaFilter,
      superintendencia: superintendenciaFilter,
      search: searchFilter,
    };

    // Se refleja la búsqueda en la URL (para poder compartirla) y se marca
    // como ya lanzada, de modo que el efecto de abajo no la repita.
    const query = aQueryString(f);
    ultimaBusqueda.current = query;
    router.push(query ? `${pathname}?${query}` : pathname);

    setLoading(true);
    try {
      aplicar(await consultar(f));
    } catch (err) {
      avisarFallo(err);
    } finally {
      setLoading(false);
    }
  }, [
    templateIdFilter,
    statusFilter,
    createdByFilter,
    dateFromFilter,
    dateToFilter,
    minComplianceFilter,
    maxComplianceFilter,
    areaFilter,
    superintendenciaFilter,
    searchFilter,
    router,
    pathname,
    consultar,
    aplicar,
    avisarFallo,
  ]);

  /**
   * Búsqueda dirigida por la URL: al entrar con un enlace ya filtrado, o al
   * navegar con atrás/adelante. Los valores de los campos ya los recogió el
   * inicializador de `useState`; aquí solo se lanza la consulta.
   */
  useEffect(() => {
    const f = leerFiltrosDeUrl(searchParams);
    const query = aQueryString(f);

    if (!hayAlgunFiltro(f)) return;
    if (ultimaBusqueda.current === query) return; // ya la lanzó el botón

    ultimaBusqueda.current = query;
    let vigente = true;
    let terminada = false;

    consultar(f)
      .then((datos) => {
        if (vigente) aplicar(datos);
      })
      .catch((err: unknown) => {
        if (vigente) avisarFallo(err);
      })
      .finally(() => {
        terminada = true;
        // `loading` NO se apaga bajo `vigente`: los datos se descartan si esta
        // ejecución quedó obsoleta, pero el interruptor de «cargando» es de la
        // pantalla, no de la ejecución. El guardia correcto es si la pantalla
        // sigue esperando **esta** búsqueda.
        if (ultimaBusqueda.current === query) setLoading(false);
      });

    return () => {
      vigente = false;
      // Si no llegó a terminar, se borra la marca para que la siguiente
      // ejecución no la dé por hecha y salga por el guardia sin buscar.
      // `reactStrictMode` monta, limpia y vuelve a montar en desarrollo, así
      // que esto ocurre en cada carga con filtros en la URL.
      if (!terminada) ultimaBusqueda.current = null;
    };
  }, [searchParams, consultar, aplicar, avisarFallo]);

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

  const handleDescargarZip = async (format: "pdf" | "excel") => {
    try {
      await descargarZipIroIsopCliente(Array.from(selectedIds), format);
    } catch (err) {
      console.error(err);
    }
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
              <Box display="flex" gap={2} alignItems="center">
                <BulkDownloadButton count={selectedIds.size} onDownload={handleDescargarZip} />
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
              </Box>
            }
            columns={columnas}
            rows={instancias}
            rowKey={(row) => row._id}
            size="small"
            emptyMessage="No se encontraron resultados."
            paginationMode="internal"
            selectable
            selectedKeys={selectedIds}
            onSelectionChange={setSelectedIds}
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
