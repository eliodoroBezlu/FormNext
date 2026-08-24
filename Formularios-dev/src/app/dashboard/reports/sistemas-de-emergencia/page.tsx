"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Container,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FireExtinguisher as ExtintorIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  descargarExcelInspeccionesEmergenciaCliente,
  descargarPdfInspeccionesEmergenciaCliente,
  descargarZipInspeccionesEmergenciaCliente,
} from "@/lib/actions/client";
import {
  buscarAreas,
  obtenerExtintoresPorArea,
  obtenerSistemasEmergenciaReport,
} from "@/app/actions/inspeccion";
import type {
  ExtintorBackend,
  FiltrosInspeccion,
  InspeccionServiceExport,
} from "@/types/formTypes";

// ✅ Componentes comunes
import {
  ReportTable,
  ReportColumn,
} from "@/components/features/reports/presentation/components/ReportTable";
import { ReportActionButtons } from "@/components/features/reports/presentation/components/ReportActionButtons";
import { BulkDownloadButton } from "@/components/features/reports/presentation/components/BulkDownloadButton";
import { ReportStateHandler } from "@/components/features/reports/presentation/components/ReportStateHandler";

const MESES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

const SUPERINTENDENCIAS = [
  "Superintendencia de Mantenimiento - Eléctrico e Instrumentación Planta",
  "Superintendencia de Mantenimiento - Ingeniería de Confiabilidad",
  "Superintendencia de Mantenimiento - Mec. Plta. Chancado, Molienda y Lubricación",
  "Superintendencia de Mantenimiento - Mec. Plta. Flot., Filtros, Taller Gral. y RH",
  "Superintendencia de Mantenimiento - Planificación",
];

const ORDEN_MESES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

const GESTIONES = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

/** Los filtros del informe, tal y como viajan en la barra de direcciones. */
interface FiltrosSistemasEmergencia {
  area: string;
  superintendencia: string;
  mes: string;
  docCode: string;
  gestion: string;
}

/** Lee los filtros de la URL. Puro: mismo `params`, mismo resultado. */
const leerFiltrosDeUrl = (
  params: Pick<URLSearchParams, "get">,
): FiltrosSistemasEmergencia => ({
  area: params.get("area") || "",
  superintendencia: params.get("superintendencia") || "",
  mes: params.get("mes") || "",
  docCode: params.get("docCode") || "",
  gestion: params.get("gestion") || "",
});

const hayAlgunFiltro = (f: FiltrosSistemasEmergencia): boolean =>
  Object.values(f).some((valor) => valor !== "");

/** Serializa los filtros omitiendo los vacíos, para escribirlos en la URL. */
const aQueryString = (f: FiltrosSistemasEmergencia): string => {
  const query = new URLSearchParams();
  for (const [clave, valor] of Object.entries(f)) {
    if (valor) query.set(clave, valor);
  }
  return query.toString();
};

function ListaInspeccionesComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [inspecciones, setInspecciones] = useState<InspeccionServiceExport[]>(
    [],
  );
  // Si la URL ya trae filtros, la página está buscando desde el primer render.
  const [loading, setLoading] = useState(() =>
    hayAlgunFiltro(leerFiltrosDeUrl(searchParams)),
  );
  // Arranca en `true`: las áreas se piden nada más montar.
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [loadingExtintores, setLoadingExtintores] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [mostrarExtintores, setMostrarExtintores] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /**
   * Los filtros nacen de la URL y a partir de ahí el usuario los edita, así
   * que hay que copiarlos **una vez** — no derivarlos en cada render. Con el
   * inicializador de `useState` ya están puestos en el primer pintado, sin el
   * parpadeo de campos vacíos que había cuando los copiaba un efecto.
   */
  const filtrosDeLaUrl = leerFiltrosDeUrl(searchParams);
  const [areaFilter, setAreaFilter] = useState(() => filtrosDeLaUrl.area);
  const [superintendenciaFilter, setSuperintendenciaFilter] = useState(
    () => filtrosDeLaUrl.superintendencia,
  );
  const [mesFilter, setMesFilter] = useState(() => filtrosDeLaUrl.mes);
  const [documentCodeFilter, setDocumentCodeFilter] = useState(
    () => filtrosDeLaUrl.docCode,
  );
  const [gestionFilter, setGestionFilter] = useState(
    () => filtrosDeLaUrl.gestion,
  );

  /**
   * Última búsqueda que ya lanzamos nosotros. Al pulsar «Filtrar» escribimos
   * la URL, y eso despierta al efecto de abajo; sin esta marca la consulta se
   * haría **dos veces** por cada clic.
   */
  const ultimaBusqueda = useRef<string | null>(null);

  const [extintores, setExtintores] = useState<ExtintorBackend[]>([]);
  const [areas, setAreas] = useState<string[]>([]);

  // ── Permisos ──────────────────────────────────────────────────────────────
  // (Migrados al sistema granular de permisos)

  useEffect(() => {
    // La promesa se encadena aquí en vez de llamar a una función `async`: el
    // analizador rastrea dentro de ella y vería su `setLoadingAreas(true)`
    // como un setState síncrono del efecto.
    let vigente = true;

    buscarAreas("")
      .then((areasData) => {
        if (vigente) setAreas(areasData);
      })
      .catch((err: unknown) => {
        console.error("Error al cargar áreas:", err);
      })
      .finally(() => {
        if (vigente) setLoadingAreas(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  // ── Búsqueda ──────────────────────────────────────────────────────────────

  /**
   * Solo consulta y devuelve; **no toca el estado**. Al estar libre de
   * setState puede encadenarse desde el efecto sin que el analizador la vea
   * como una cascada de renders. Antes esta misma lógica estaba escrita dos
   * veces: una dentro del efecto de la URL y otra en `filtrarInspecciones`.
   */
  const consultar = useCallback(
    async (f: FiltrosSistemasEmergencia): Promise<InspeccionServiceExport[]> => {
      const filtros: FiltrosInspeccion = {};
      if (f.area) filtros.area = f.area;
      if (f.superintendencia) filtros.superintendencia = f.superintendencia;
      if (f.mes) filtros.mesActual = f.mes;
      if (f.docCode) filtros.documentCode = f.docCode;

      const data = await obtenerSistemasEmergenciaReport(filtros);

      // La gestión (año) no la filtra el backend.
      const anio = parseInt(f.gestion, 10);
      return isNaN(anio) ? data : data.filter((i) => i.año === anio);
    },
    [],
  );

  const aplicar = useCallback((datos: InspeccionServiceExport[]) => {
    setInspecciones(datos);
    setMostrarResultados(true);
    setMostrarExtintores(false);
    setError(null);
  }, []);

  const avisarFallo = useCallback((err: unknown) => {
    console.error(err);
    setError(
      "No se pudieron cargar las inspecciones con los filtros seleccionados",
    );
  }, []);

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

    consultar(f)
      .then((datos) => {
        if (vigente) aplicar(datos);
      })
      .catch((err: unknown) => {
        if (vigente) avisarFallo(err);
      })
      .finally(() => {
        if (vigente) setLoading(false);
      });

    return () => {
      vigente = false;
    };
  }, [searchParams, consultar, aplicar, avisarFallo]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const obtenerMesesInspeccionados = (
    inspeccion: InspeccionServiceExport,
    mesFiltrando?: string,
  ): string => {
    if (!inspeccion.meses || Object.keys(inspeccion.meses).length === 0) {
      return "Sin inspecciones";
    }
    if (mesFiltrando && inspeccion.meses[mesFiltrando]) return mesFiltrando;

    const mesesConInspeccion = Object.keys(inspeccion.meses);
    let ultimoMes = mesesConInspeccion[0];
    let ultimoIndice = ORDEN_MESES.indexOf(ultimoMes);

    for (const mes of mesesConInspeccion) {
      const idx = ORDEN_MESES.indexOf(mes);
      if (idx > ultimoIndice) {
        ultimoMes = mes;
        ultimoIndice = idx;
      }
    }
    return ultimoMes;
  };

  // ── Acciones ──────────────────────────────────────────────────────────────
  /** Búsqueda a petición: botón «Filtrar» o Enter en un campo. */
  const filtrarInspecciones = useCallback(async () => {
    const f: FiltrosSistemasEmergencia = {
      area: areaFilter,
      superintendencia: superintendenciaFilter,
      mes: mesFilter,
      docCode: documentCodeFilter,
      gestion: gestionFilter,
    };

    // Se refleja la búsqueda en la URL (para poder compartirla) y se marca
    // como ya lanzada, de modo que el efecto de arriba no la repita.
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
    areaFilter,
    superintendenciaFilter,
    mesFilter,
    documentCodeFilter,
    gestionFilter,
    router,
    pathname,
    consultar,
    aplicar,
    avisarFallo,
  ]);

  const mostrarExtintoresPorArea = async () => {
    if (!areaFilter) {
      setError("Por favor selecciona un área para ver los extintores");
      return;
    }
    try {
      setLoadingExtintores(true);
      setError(null);
      const response = await obtenerExtintoresPorArea(areaFilter);
      if (response?.extintores && Array.isArray(response.extintores)) {
        setExtintores(response.extintores);
      } else {
        setExtintores([]);
        setError("La respuesta del servidor no tiene el formato esperado");
      }
      setMostrarExtintores(true);
      setMostrarResultados(false);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los extintores del área seleccionada");
    } finally {
      setLoadingExtintores(false);
    }
  };

  const limpiarTodo = () => {
    setAreaFilter("");
    setSuperintendenciaFilter("");
    setMesFilter("");
    setDocumentCodeFilter("");
    setGestionFilter("");
    setInspecciones([]);
    setExtintores([]);
    setMostrarResultados(false);
    setMostrarExtintores(false);
    setError(null);
    router.push(pathname);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") filtrarInspecciones();
  };

  const handleDescargarZip = async (format: "pdf" | "excel") => {
    try {
      await descargarZipInspeccionesEmergenciaCliente(Array.from(selectedIds), format);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Columnas de inspecciones ──────────────────────────────────────────────
  const columnasInspecciones: ReportColumn<InspeccionServiceExport>[] = [
    {
      key: "fechaCreacion",
      label: "Fecha de Inspección",
      render: (row) => new Date(row.fechaCreacion).toLocaleDateString(),
    },
    { key: "superintendencia", label: "Superintendencia" },
    { key: "area", label: "Área" },
    { key: "tag", label: "Tag" },
    { key: "responsableEdificio", label: "Responsable Edificio" },
    { key: "documentCode", label: "Código Documento" },
    {
      key: "mesActual",
      label: "Mes Actual",
      render: (row) => obtenerMesesInspeccionados(row, mesFilter),
    },
    {
      key: "año",
      label: "Gestión",
      align: "center",
      render: (row) => row.año || "N/A",
    },
    {
      key: "acciones",
      label: "Acciones",
      align: "center",
      render: (row) => (
        <ReportActionButtons
          onView={() =>
            router.push(
              `/dashboard/reports/sistemas-de-emergencia/editar/${row._id}?mode=view`,
            )
          }
          onEdit={() =>
            router.push(
              `/dashboard/reports/sistemas-de-emergencia/editar/${row._id}`,
            )
          }
          onDownloadPdf={async () => {
            try {
              await descargarPdfInspeccionesEmergenciaCliente(row._id);
            } catch (err) {
              console.error(err);
            }
          }}
          onDownloadExcel={async () => {
            try {
              await descargarExcelInspeccionesEmergenciaCliente(row._id);
            } catch (err) {
              console.error(err);
            }
          }}
        />
      ),
    },
  ];

  // ── Columnas de extintores ────────────────────────────────────────────────
  const columnasExtintores: ReportColumn<ExtintorBackend>[] = [
    { key: "area", label: "Área" },
    { key: "tag", label: "Tag" },
    { key: "CodigoExtintor", label: "Código Extintor" },
    { key: "Ubicacion", label: "Ubicación" },
    {
      key: "inspeccionado",
      label: "Estado Inspección",
      align: "center",
      render: (row) => (
        <Chip
          label={row.inspeccionado ? "Inspeccionado" : "No Inspeccionado"}
          color={row.inspeccionado ? "success" : "error"}
          size="small"
        />
      ),
    },
    {
      key: "activo",
      label: "Estado Activo",
      align: "center",
      render: (row) => (
        <Chip
          label={row.activo ? "Activo" : "Inactivo"}
          color={row.activo ? "primary" : "default"}
          size="small"
        />
      ),
    },
  ];

  return (
    <Container maxWidth="lg">
      <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 3 }}>
        Lista de Inspecciones
      </Typography>

      {/* ── Panel de Filtros ── */}
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: "8px" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Filtros de búsqueda
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Área</InputLabel>
              <Select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                label="Área"
                disabled={loadingAreas}
              >
                <MenuItem value="">Todas</MenuItem>
                {areas.map((area) => (
                  <MenuItem key={area} value={area}>
                    {area}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Superintendencia</InputLabel>
              <Select
                value={superintendenciaFilter}
                onChange={(e) => setSuperintendenciaFilter(e.target.value)}
                label="Superintendencia"
              >
                <MenuItem value="">Todas</MenuItem>
                {SUPERINTENDENCIAS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Mes de inspección</InputLabel>
              <Select
                value={mesFilter}
                onChange={(e) => setMesFilter(e.target.value)}
                label="Mes de inspección"
              >
                <MenuItem value="">Todas</MenuItem>
                {MESES.map((mes) => (
                  <MenuItem key={mes} value={mes}>
                    {mes}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Gestión</InputLabel>
              <Select
                value={gestionFilter}
                onChange={(e) => setGestionFilter(e.target.value)}
                label="Gestión"
              >
                <MenuItem value="">Todas</MenuItem>
                {GESTIONES.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Código de documento"
              variant="outlined"
              size="small"
              value={documentCodeFilter}
              onChange={(e) => setDocumentCodeFilter(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </Grid>

          <Grid
            size={{ xs: 12 }}
            display="flex"
            justifyContent="flex-end"
            sx={{ mt: 1 }}
          >
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={limpiarTodo}
              sx={{ mr: 1 }}
            >
              Limpiar Todo
            </Button>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={filtrarInspecciones}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              {loading ? "Buscando..." : "Buscar Inspecciones"}
            </Button>
            <Button
              variant="contained"
              startIcon={<ExtintorIcon />}
              onClick={mostrarExtintoresPorArea}
              color="secondary"
              disabled={loadingExtintores || !areaFilter}
            >
              {loadingExtintores ? "Cargando..." : "Mostrar Extintores"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Estados de carga / error ── */}
      <ReportStateHandler loading={loading || loadingExtintores} error={error}>
        {/* ── Tabla Extintores ── */}
        {mostrarExtintores && (
          <Box sx={{ mb: 4 }}>
            <ReportTable
              title={`Extintores del Área: ${areaFilter}`}
              titleExtra={
                mostrarResultados ? (
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => {
                      setMostrarExtintores(false);
                      setMostrarResultados(true);
                    }}
                    size="small"
                  >
                    Volver a Inspecciones
                  </Button>
                ) : undefined
              }
              columns={columnasExtintores}
              rows={extintores}
              rowKey={(row) => row._id}
              emptyMessage="No se encontraron extintores en el área seleccionada"
            />
          </Box>
        )}

        {/* ── Tabla Inspecciones ── */}
        {mostrarResultados && (
          <ReportTable
            title="Resultados"
            titleExtra={
              <BulkDownloadButton count={selectedIds.size} onDownload={handleDescargarZip} />
            }
            columns={columnasInspecciones}
            rows={inspecciones}
            rowKey={(row) => row._id}
            emptyMessage="No se encontraron inspecciones con los criterios de búsqueda"
            selectable
            selectedKeys={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        )}
      </ReportStateHandler>
    </Container>
  );
}

export default function ListaInspecciones() {
  return (
    <Suspense fallback={null}>
      <ListaInspeccionesComponent />
    </Suspense>
  );
}
