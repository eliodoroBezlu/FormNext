"use client";

import type React from "react";
import { useEffect, useState } from "react";
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
import { useRouter } from "next/navigation";
import {
  descargarExcelInspeccionesEmergenciaCliente,
  descargarPdfInspeccionesEmergenciaCliente,
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
} from "@/components/reports/common/ReportTable";
import { ReportActionButtons } from "@/components/reports/common/ReportActionButtons";
import { ReportStateHandler } from "@/components/reports/common/ReportStateHandler";

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

export default function ListaInspecciones() {
  const router = useRouter();

  const [inspecciones, setInspecciones] = useState<InspeccionServiceExport[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingExtintores, setLoadingExtintores] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [mostrarExtintores, setMostrarExtintores] = useState(false);

  const [areaFilter, setAreaFilter] = useState("");
  const [superintendenciaFilter, setSuperintendenciaFilter] = useState("");
  const [mesFilter, setMesFilter] = useState("");
  const [documentCodeFilter, setDocumentCodeFilter] = useState("");

  const [extintores, setExtintores] = useState<ExtintorBackend[]>([]);
  const [areas, setAreas] = useState<string[]>([]);

  // ── Permisos ──────────────────────────────────────────────────────────────
  // (Migrados al sistema granular de permisos)

  useEffect(() => {
    const cargarAreas = async () => {
      try {
        setLoadingAreas(true);
        const areasData = await buscarAreas("");
        setAreas(areasData);
      } catch (err) {
        console.error("Error al cargar áreas:", err);
      } finally {
        setLoadingAreas(false);
      }
    };
    cargarAreas();
  }, []);

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
  const filtrarInspecciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const filtros: FiltrosInspeccion = {};
      if (areaFilter) filtros.area = areaFilter;
      if (superintendenciaFilter)
        filtros.superintendencia = superintendenciaFilter;
      if (mesFilter) filtros.mesActual = mesFilter;
      if (documentCodeFilter) filtros.documentCode = documentCodeFilter;

      const data = await obtenerSistemasEmergenciaReport(filtros);
      setInspecciones(data);
      setMostrarResultados(true);
      setMostrarExtintores(false);
    } catch (err) {
      console.error(err);
      setError(
        "No se pudieron cargar las inspecciones con los filtros seleccionados",
      );
    } finally {
      setLoading(false);
    }
  };

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
    setInspecciones([]);
    setExtintores([]);
    setMostrarResultados(false);
    setMostrarExtintores(false);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") filtrarInspecciones();
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
          <Grid size={{ xs: 12, md: 3 }}>
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

          <Grid size={{ xs: 12, md: 3 }}>
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
            columns={columnasInspecciones}
            rows={inspecciones}
            rowKey={(row) => row._id}
            emptyMessage="No se encontraron inspecciones con los criterios de búsqueda"
          />
        )}
      </ReportStateHandler>
    </Container>
  );
}
