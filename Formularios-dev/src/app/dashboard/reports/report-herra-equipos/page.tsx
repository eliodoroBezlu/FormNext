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
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  deleteInspection,
  getInspectionById,
  getInspectionsHerraEquipos,
  InspectionResponse,
} from "@/lib/actions/inspection-herra-equipos";
import { getTemplatesHerraEquipos, TemplateHerraEquipo } from "@/lib/actions/template-herra-equipos";
import {
  coincideArea,
  getArea,
  getEquipmentIds,
} from "@/lib/utils/herra-equipos-fields";
import AutocompleteCustom from "@/components/ui/autocomplete/AutocompleteCustom";
import { InspectionStatusChip } from "@/components/features/herra-equipos/common/InspectionStatusChip";
import { InspectionStatus } from "@/components/features/herra-equipos/types/IProps";

/** Orden en que se muestran los estados en el resumen: el ciclo de vida real. */
const ESTADOS_INSPECCION = [
  InspectionStatus.DRAFT,
  InspectionStatus.IN_PROGRESS,
  InspectionStatus.PENDING_APPROVAL,
  InspectionStatus.APPROVED,
  InspectionStatus.REJECTED,
  InspectionStatus.COMPLETED,
];
import {
  descargarExcelHerraEquipoCliente,
  descargarPdfHerraEquipoCliente,
  descargarZipHerraEquipoCliente,
} from "@/lib/actions/client";

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
import {
  ReportSnackbar,
  useReportNotification,
} from "@/components/features/reports/presentation/components/ReportSnackbar";



// ── Helpers de extracción de campos dinámicos ─────────────────────────────
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

/** Los filtros del informe, tal y como viajan en la barra de direcciones. */
interface FiltrosHerraEquipos {
  templateName: string;
  area: string;
  equipmentId: string;
  startDate: string;
  endDate: string;
}

/** Lee los filtros de la URL. Puro: mismo `params`, mismo resultado. */
const leerFiltrosDeUrl = (
  params: Pick<URLSearchParams, "get">,
): FiltrosHerraEquipos => ({
  templateName: params.get("templateName") || "",
  area: params.get("area") || "",
  equipmentId: params.get("equipmentId") || "",
  startDate: params.get("startDate") || "",
  endDate: params.get("endDate") || "",
});

const hayAlgunFiltro = (f: FiltrosHerraEquipos): boolean =>
  Object.values(f).some((valor) => valor !== "");

/** Serializa los filtros omitiendo los vacíos, para escribirlos en la URL. */
const aQueryString = (f: FiltrosHerraEquipos): string => {
  const query = new URLSearchParams();
  for (const [clave, valor] of Object.entries(f)) {
    if (valor) query.set(clave, valor);
  }
  return query.toString();
};

/**
 * Filtrado que el backend no hace: los campos de `verification` no tienen una
 * clave estable, así que hay que mirarlos aquí. Función pura y a nivel de
 * módulo — no toca estado ni depende del render.
 */
const filtrarEnCliente = (
  datos: InspectionResponse[],
  f: FiltrosHerraEquipos,
): InspectionResponse[] => {
  let resultado = datos;

  if (f.templateName.trim()) {
    const nombre = f.templateName.toLowerCase().trim();
    resultado = resultado.filter((i) =>
      i.templateName?.toLowerCase().includes(nombre),
    );
  }

  if (f.area.trim()) {
    resultado = resultado.filter((i) => coincideArea(i, f.area));
  }

  if (f.equipmentId.trim()) {
    const searchLower = f.equipmentId.toLowerCase().trim();
    resultado = resultado.filter((i) => {
      const haystack = [
        // Busca dinámicamente en TODOS los campos de verification
        ...Object.keys(i.verification || {}),
        ...Object.values(i.verification || {}).map((v) => String(v)),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(searchLower);
    });
  }

  return resultado;
};

function ListarInspeccionHerraEquiposComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { notification, mostrar, cerrar } = useReportNotification();

  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [templates, setTemplates] = useState<TemplateHerraEquipo[]>([]);
  // Si la URL ya trae filtros, la página está buscando desde el primer render.
  const [loading, setLoading] = useState(() =>
    hayAlgunFiltro(leerFiltrosDeUrl(searchParams)),
  );
  // Arranca en `true`: los templates se piden nada mas montar.
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtros
  /**
   * Los filtros nacen de la URL y luego el usuario los edita libremente, asi
   * que hay que copiarlos una vez —no derivarlos—. Se hace con el inicializador
   * de `useState` en vez de un efecto: asi ya estan puestos en el primer
   * render, sin el parpadeo de campos vacios que habia antes.
   */
  const [templateNameFilter, setTemplateNameFilter] = useState(
    () => searchParams.get("templateName") || "",
  );
  const [areaFilter, setAreaFilter] = useState(
    () => searchParams.get("area") || "",
  );
  const [equipmentIdFilter, setEquipmentIdFilter] = useState(
    () => searchParams.get("equipmentId") || "",
  );
  const [startDateFilter, setStartDateFilter] = useState(
    () => searchParams.get("startDate") || "",
  );
  const [endDateFilter, setEndDateFilter] = useState(
    () => searchParams.get("endDate") || "",
  );

  // Modal de detalle
  /**
   * Última búsqueda que ya lanzamos nosotros. Al pulsar «Buscar» escribimos la
   * URL, y eso despierta al efecto de más abajo; sin esta marca la consulta se
   * haría **dos veces** por cada clic.
   */
  const ultimaBusqueda = useRef<string | null>(null);

  // Modal de detalle
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedInspection, setSelectedInspection] =
    useState<InspectionResponse | null>(null);

  // ── Búsqueda ──────────────────────────────────────────────────────────────

  /**
   * Solo consulta y devuelve; **no toca el estado**. Al estar libre de
   * setState puede encadenarse desde el efecto sin que el analizador la vea
   * como una cascada de renders.
   *
   * Depende de `templates` a propósito: de ahí sale el `templateCode` que
   * permite filtrar en el backend en vez de traerse 2.000 inspecciones. Antes
   * `templates` faltaba en las dependencias, así que la búsqueda lanzada desde
   * la URL leía siempre la lista vacía y ese atajo nunca se aplicaba.
   */
  const consultar = useCallback(
    async (f: FiltrosHerraEquipos): Promise<InspectionResponse[]> => {
      const filters: {
        templateCode?: string;
        startDate?: string;
        endDate?: string;
      } = {};

      if (f.templateName.trim()) {
        const conEseNombre = templates.filter((t) => t.name === f.templateName);
        if (conEseNombre.length === 1) {
          filters.templateCode = conEseNombre[0].code;
        }
      }
      if (f.startDate) filters.startDate = f.startDate;
      if (f.endDate) filters.endDate = f.endDate;

      const response = await getInspectionsHerraEquipos(filters);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Error desconocido");
      }

      return filtrarEnCliente(response.data, f);
    },
    [templates],
  );

  const aplicar = useCallback((datos: InspectionResponse[]) => {
    setInspections(datos);
    setTotalItems(datos.length);
    setMostrarResultados(true);
    setError(null);
  }, []);

  const avisarFallo = useCallback((err: unknown) => {
    console.error(err);
    setError(
      err instanceof Error ? err.message : "No se pudieron cargar las inspecciones",
    );
    setInspections([]);
    setMostrarResultados(false);
  }, []);

  /**
   * Las tres funciones se leen desde una ref para que **su identidad no
   * dispare** el efecto de búsqueda por URL, que solo debe reaccionar a la URL.
   *
   * `consultar` depende de `templates`, y los templates llegan por red unos
   * milisegundos después del montaje. Teniéndolo en las dependencias, ese
   * cambio de identidad reejecutaba el efecto con estas consecuencias:
   *
   *   1. la limpieza de la ejecución anterior ponía `vigente = false`, así que
   *      la búsqueda que ya venía en camino —y era válida— se descartaba al
   *      llegar;
   *   2. la nueva ejecución salía por el guardia `ultimaBusqueda`, sin llegar
   *      nunca al `finally` que apaga `loading`.
   *
   * Resultado: la petición se hacía, respondía 200, los datos se tiraban y la
   * pantalla se quedaba en «Buscando…» para siempre. Se veía al entrar por un
   * enlace ya filtrado y después de borrar una inspección, porque ambas cosas
   * reejecutan el efecto mientras hay una búsqueda viva.
   */
  const acciones = useRef({ consultar, aplicar, avisarFallo });
  useEffect(() => {
    acciones.current = { consultar, aplicar, avisarFallo };
  }, [consultar, aplicar, avisarFallo]);

  /** La URL como cadena: estable mientras la URL no cambie de verdad. */
  const queryDeUrl = searchParams.toString();

  /** Búsqueda a petición: botón «Buscar» o Enter en un campo. */
  const buscarInspecciones = useCallback(async () => {
    const f: FiltrosHerraEquipos = {
      templateName: templateNameFilter,
      area: areaFilter,
      equipmentId: equipmentIdFilter,
      startDate: startDateFilter,
      endDate: endDateFilter,
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
    templateNameFilter,
    areaFilter,
    equipmentIdFilter,
    startDateFilter,
    endDateFilter,
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
    const f = leerFiltrosDeUrl(new URLSearchParams(queryDeUrl));
    const query = aQueryString(f);

    if (!hayAlgunFiltro(f)) return;
    if (ultimaBusqueda.current === query) return; // ya la lanzó el botón

    ultimaBusqueda.current = query;
    let vigente = true;
    let terminada = false;

    const {
      consultar: consultarActual,
      aplicar: aplicarActual,
      avisarFallo: avisarFalloActual,
    } = acciones.current;

    consultarActual(f)
      .then((datos) => {
        if (vigente) aplicarActual(datos);
      })
      .catch((err: unknown) => {
        if (vigente) avisarFalloActual(err);
      })
      .finally(() => {
        terminada = true;
        // `loading` NO se apaga bajo `vigente`. Los datos sí se descartan si
        // esta ejecución quedó obsoleta, pero el interruptor de «cargando» es
        // de la pantalla, no de la ejecución: dejarlo encendido porque el
        // efecto se reejecutó es justo lo que dejaba «Buscando…» para siempre.
        //
        // El guardia correcto es si la pantalla sigue esperando **esta**
        // búsqueda; si ya lanzó otra, apagarlo es cosa de la nueva.
        if (ultimaBusqueda.current === query) setLoading(false);
      });

    return () => {
      vigente = false;
      // Si la búsqueda no llegó a terminar, se borra la marca.
      //
      // Sin esto, la siguiente ejecución del efecto la da por hecha y sale por
      // el guardia de arriba sin buscar nada. Pasa siempre en desarrollo:
      // `reactStrictMode` monta, limpia y vuelve a montar, así que la segunda
      // pasada encontraba la marca que había puesto la primera —cuyo resultado
      // acababa de quedar descartado por esta misma limpieza—.
      if (!terminada) ultimaBusqueda.current = null;
    };
    // Una sola dependencia, y **de tipo cadena a propósito**: se compara por
    // valor. `searchParams` es un objeto nuevo en cada render del router —y el
    // router re-renderiza por su cuenta, por ejemplo cada vez que el aviso de
    // actividad reciente consulta al servidor—, así que tenerlo aquí
    // reejecutaba el efecto sin que la URL hubiera cambiado.
  }, [queryDeUrl]);

  useEffect(() => {
    // La promesa se encadena aqui: llamar a una funcion `async` haria que el
    // analizador viera su `setLoadingTemplates(true)` como setState sincrono.
    let vigente = true;

    getTemplatesHerraEquipos()
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

  const limpiarFiltros = () => {
    setTemplateNameFilter("");
    setAreaFilter("");
    setEquipmentIdFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setInspections([]);
    setMostrarResultados(false);
    setError(null);
    setTotalItems(0);
    router.push(pathname);
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
      mostrar("Generando archivo Excel...", "info");
      await descargarExcelHerraEquipoCliente(id);
    } catch (err) {
      console.error(err);
      mostrar(
        err instanceof Error ? err.message : "Error al descargar el Excel",
        "error",
      );
    }
  };

  const handleDescargarZip = async (format: "pdf" | "excel") => {
    try {
      mostrar(`Generando ZIP en ${format === "pdf" ? "PDF" : "Excel"}...`, "info");
      await descargarZipHerraEquipoCliente(Array.from(selectedIds), format);
    } catch (err) {
      console.error(err);
      mostrar(
        err instanceof Error ? err.message : "Error al descargar el ZIP",
        "error",
      );
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
          {templates.find((t) => t.code === row.templateCode)?.name || row.templateName || "N/A"}
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
      // Un chip por código: una inspección de SPCC cubre hasta cuatro
      // elementos y cada uno tiene el suyo. `flexWrap` los baja de línea en
      // vez de ensanchar la columna.
      render: (row) => {
        const codigos = getEquipmentIds(row);
        if (codigos.length === 0) {
          // `N/A` y no una celda vacía: en blanco se lee como «no cargó», y
          // esto es «no se registró».
          return (
            <Chip label="N/A" size="small" color="primary" variant="outlined" />
          );
        }
        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {codigos.map((codigo) => (
              <Chip
                key={codigo}
                label={codigo}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        );
      },
    },
    {
      key: "status",
      label: "Estado",
      render: (row) => <InspectionStatusChip status={row.status} />,
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
                disabled={loadingTemplates}
              >
                <MenuItem value="">Todos</MenuItem>
                {templates.map((t) => (
                  <MenuItem key={t._id} value={t.name}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            {/* El área la escribe el inspector en su formulario, no sale de un
                catálogo: por eso es un autocompletado abierto y no un select.
                Las opciones del maestro son sugerencias y la coincidencia es
                por «contiene» y sin tildes. */}
            <AutocompleteCustom
              dataSource="area"
              label="Área"
              placeholder="Todas"
              value={areaFilter || null}
              onChange={(v) => setAreaFilter(v ?? "")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Búsqueda (TAG, Placa, Valores)"
              size="small"
              value={equipmentIdFilter}
              onChange={(e) => setEquipmentIdFilter(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Buscar en verificación..."
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
              onClick={() => buscarInspecciones()}
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
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography color="textSecondary" gutterBottom>
                    Total Inspecciones
                  </Typography>
                  <Typography variant="h4">{totalItems}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 9 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Por estado
                  </Typography>
                  {/* Antes solo se contaban `completed` y `draft`, y quedaban
                      fuera del resumen las aprobadas, las pendientes de
                      aprobación y las rechazadas: más de la mitad del total. */}
                  <Box display="flex" flexWrap="wrap" gap={1.5}>
                    {ESTADOS_INSPECCION.map((estado) => {
                      const n = inspections.filter(
                        (i) => i.status === estado,
                      ).length;
                      if (n === 0) return null;
                      return (
                        <Box
                          key={estado}
                          display="flex"
                          alignItems="center"
                          gap={0.75}
                        >
                          <InspectionStatusChip status={estado} />
                          <Typography variant="h6">{n}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
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
                    onClick={() => router.push("/dashboard/form-herra-equipos")}
                  >
                    Nueva Inspección
                  </Button>
                </Can>
              </Box>
            }
            columns={columnas}
            rows={inspections}
            rowKey={(row) => row._id}
            emptyMessage="No se encontraron inspecciones con los criterios de búsqueda"
            selectable
            selectedKeys={selectedIds}
            onSelectionChange={setSelectedIds}
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

export default function ListarInspeccionHerraEquipos() {
  return (
    <Suspense fallback={null}>
      <ListarInspeccionHerraEquiposComponent />
    </Suspense>
  );
}
