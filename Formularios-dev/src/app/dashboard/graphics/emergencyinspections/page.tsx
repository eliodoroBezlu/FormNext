"use client";

import React, { useState, useMemo } from "react";
import {
  Paper,
  Grid,
  Box,
  Typography,
  Snackbar,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useDashboardData } from "./hooks/useDashboardData";
import { calcularCoberturaMes, EstadoExtintor, ETIQUETA_ESTADO } from "./utils/coberturaMensual";
import { DashboardHeader } from "./emergencycharts/emergencychartsheader";
import { DashboardFilters } from "./emergencycharts/emergencychartsfilters";
import { DashboardCharts } from "./emergencycharts/emergencychartsCharts";
import { LiveCommandCenter } from "./emergencycharts/emergencychartsLiveCenter";
import { TagDetailModal } from "./emergencycharts/emergencychartsTagDetailModal";
import { ListaExtintoresModal, ListaExtintores } from "./emergencycharts/ListaExtintoresModal";
import { Refresh } from "@mui/icons-material";

// Lista fija de meses (siempre los 12, en orden cronológico) — no se deriva
// de los datos, para que el filtro no dependa de qué meses ya tienen inspecciones.
const MESES_DEL_AÑO = [
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

/**
 * Mes en curso, en el formato de `MESES_DEL_AÑO`. Si el nombre no encaja
 * (otra configuración regional), se cae al primero de la lista.
 */
const mesActualODefecto = (): string => {
  const mesActual = new Date()
    .toLocaleString("es-CL", { month: "long" })
    .toUpperCase();
  return MESES_DEL_AÑO.includes(mesActual) ? mesActual : MESES_DEL_AÑO[0];
};

const DashboardEmergencyInspections: React.FC = () => {
  const [filtroSuperintendencia, setFiltroSuperintendencia] =
    useState<string>("");
  const [filtroAreas, setFiltroAreas] = useState<string[]>([]);
  const [filtroTags, setFiltroTags] = useState<string[]>([]);
  // El mes en curso es el valor **inicial**, no algo que haya que sincronizar:
  // se calcula en el inicializador de `useState`, no en un efecto.
  const [filtroMes, setFiltroMes] = useState<string>(mesActualODefecto);
  // Año en curso por defecto: sin año, un mes mezclaba semestres de años distintos.
  const [filtroAño, setFiltroAño] = useState<string>(() => String(new Date().getFullYear()));
  const [areaDetalle, setAreaDetalle] = useState<string | null>(null);
  const [lista, setLista] = useState<ListaExtintores | null>(null);

  const {
    tags,
    inspecciones,
    extintores,
    areas,
    loading,
    error,
    lastUpdated,
    refreshing,
    fetchData,
  } = useDashboardData();

  // 1. Calcular opciones dinámicas para los filtros (Cascada)
  // Fuente canónica: colección Área (con su Superintendencia poblada), NO el
  // texto libre guardado en cada inspección — así el filtro solo muestra las
  // superintendencias/áreas que realmente existen en la BD, sin duplicados
  // ni valores sueltos de registros viejos o mal cargados.
  const areasActivas = useMemo(() => areas.filter((a) => a.activo), [areas]);

  const todasSuperintendencias = useMemo(
    () =>
      [...new Set(areasActivas.map((a) => a.superintendencia?.nombre).filter(Boolean))].sort() as string[],
    [areasActivas],
  );

  // Superintendencia -> Áreas
  const areasDisponibles = useMemo(() => {
    const filtradas = filtroSuperintendencia
      ? areasActivas.filter((a) => a.superintendencia?.nombre === filtroSuperintendencia)
      : areasActivas;
    return [...new Set(filtradas.map((a) => a.nombre))].sort();
  }, [areasActivas, filtroSuperintendencia]);

  // Áreas -> Tags
  // Nota: `Tag.superintendencia` NO existe en el schema del backend (el
  // documento solo guarda tag/area/activo), así que nunca hay que filtrar
  // tags comparando ese campo — siempre da `undefined`. En su lugar se
  // reutiliza `areasDisponibles`, que ya resuelve correctamente qué áreas
  // pertenecen a la superintendencia seleccionada (o todas si no hay ninguna).
  const tagsDisponibles = useMemo(() => {
    let filteredTags = tags;
    if (filtroSuperintendencia) {
      filteredTags = filteredTags.filter((t) => areasDisponibles.includes(t.area));
    }
    if (filtroAreas.length > 0) {
      filteredTags = filteredTags.filter((t) => filtroAreas.includes(t.area));
    }
    return [...new Set(filteredTags.map((t) => t.tag))].sort();
  }, [tags, filtroSuperintendencia, filtroAreas, areasDisponibles]);

  const mesesDisponibles = MESES_DEL_AÑO;

  const añosDisponibles = useMemo(
    () =>
      [...new Set([...inspecciones.map((ins) => ins.año.toString()), String(new Date().getFullYear())])].sort(
        (a, b) => Number(b) - Number(a),
      ),
    [inspecciones],
  );

  const superintendenciaDeArea = useMemo(
    () => new Map(areasActivas.map((a) => [a.nombre, a.superintendencia?.nombre ?? ""])),
    [areasActivas],
  );

  // Manejadores de cambios para limpiar cascadas dependientes
  const handleSuperintendenciaChange = (val: string) => {
    setFiltroSuperintendencia(val);
    setFiltroAreas([]);
    setFiltroTags([]);
  };

  const handleAreasChange = (val: string[]) => {
    setFiltroAreas(val);
    setFiltroTags([]);
  };

  // 2. Cobertura del mes: cada extintor activo del catálogo cruzado con lo inspeccionado ese mes
  //    (ver utils/coberturaMensual.ts). El alcance sale del catálogo de áreas, no del texto
  //    guardado en cada formulario.
  const cobertura = useMemo(() => {
    const areasAlcance = filtroAreas.length > 0 ? filtroAreas : filtroSuperintendencia ? areasDisponibles : undefined;
    return calcularCoberturaMes(inspecciones, extintores, tags, filtroMes, Number(filtroAño) || null, {
      areas: areasAlcance,
      tags: filtroTags.length > 0 ? filtroTags : undefined,
    });
  }, [inspecciones, extintores, tags, filtroMes, filtroAño, filtroAreas, filtroTags, filtroSuperintendencia, areasDisponibles]);

  const periodo = `${filtroMes} ${filtroAño}`;

  // 3. Detalle del área clickeada (gráfico de barras o tabla de seguimiento)
  const tagsDelArea = useMemo(
    () => (areaDetalle ? cobertura.tags.filter((t) => t.area === areaDetalle) : []),
    [areaDetalle, cobertura.tags],
  );
  const fueraDelArea = useMemo(() => {
    const nombres = new Set(tagsDelArea.map((t) => t.tag));
    return cobertura.fueraDeCatalogo.filter((f) => nombres.has(f.tag));
  }, [tagsDelArea, cobertura.fueraDeCatalogo]);

  const verEstado = (estado: EstadoExtintor) =>
    setLista({
      titulo: ETIQUETA_ESTADO[estado],
      periodo,
      extintores: cobertura.extintores.filter((x) => x.estado === estado),
    });

  const verFueraDeCatalogo = () =>
    setLista({
      titulo: "Inspeccionados que no cuentan",
      periodo,
      extintores: [],
      fueraDeCatalogo: cobertura.fueraDeCatalogo,
    });

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Cargando dashboard de sistemas de emergencia...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <Alert severity="error" sx={{ mb: 2, maxWidth: 500 }}>
          Error cargando datos: {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => fetchData(true)}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: "100vh",
      }}
    >
      <DashboardHeader
        tagsCount={tags.length}
        refreshing={refreshing}
        onRefresh={() => fetchData(true)}
      />

      <DashboardFilters
        filtroSuperintendencia={filtroSuperintendencia}
        filtroAreas={filtroAreas}
        filtroTags={filtroTags}
        filtroMes={filtroMes}
        filtroAño={filtroAño}
        onSuperintendenciaChange={handleSuperintendenciaChange}
        onAreasChange={handleAreasChange}
        onTagsChange={setFiltroTags}
        onMesChange={setFiltroMes}
        onAñoChange={setFiltroAño}
        superintendencias={todasSuperintendencias}
        areas={areasDisponibles}
        tags={tagsDisponibles}
        meses={mesesDisponibles}
        años={añosDisponibles}
      />

      <Grid container spacing={3}>
        <DashboardCharts
          cobertura={cobertura}
          onEstadoClick={verEstado}
          onAreaClick={setAreaDetalle}
          onFueraDeCatalogoClick={verFueraDeCatalogo}
        />

        <LiveCommandCenter
          tags={cobertura.tags}
          periodo={periodo}
          superintendenciaDe={(area) => superintendenciaDeArea.get(area) ?? ""}
          onAreaClick={setAreaDetalle}
        />
      </Grid>

      <Box textAlign="center" mt={3}>
        <Typography variant="body2">
          {refreshing
            ? "🔄 Actualizando..."
            : `🔄 Actualizado hace ${Math.round(
                (new Date().getTime() - lastUpdated.getTime()) / 1000,
              )} segundos - ${lastUpdated.toLocaleTimeString()}`}
        </Typography>
      </Box>

      <Snackbar
        open={refreshing}
        message="Actualizando datos..."
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />

      <TagDetailModal
        area={areaDetalle}
        periodo={periodo}
        tags={tagsDelArea}
        fueraDeCatalogo={fueraDelArea}
        onClose={() => setAreaDetalle(null)}
      />

      <ListaExtintoresModal lista={lista} onClose={() => setLista(null)} />
    </Paper>
  );
};

export default DashboardEmergencyInspections;
