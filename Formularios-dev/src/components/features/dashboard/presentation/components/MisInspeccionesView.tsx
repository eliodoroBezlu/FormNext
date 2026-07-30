"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
  Paper,
  Skeleton,
  Alert,
} from "@mui/material";
import { ExpandMore, Assignment } from "@mui/icons-material";
import { useRouter } from "next/navigation";

import { FormInstance, InspeccionServiceExport } from "@/types/formTypes";
import { getArea, getEquipmentId } from "@/lib/utils/herra-equipos-fields";

import {
  ReportTable,
  ReportColumn,
} from "@/components/features/reports/presentation/components/ReportTable";
import { ReportActionButtons } from "@/components/features/reports/presentation/components/ReportActionButtons";

import { useMisInspecciones } from "../../application/hooks/useMisInspecciones";
import type { InspectionResponse } from "../../infrastructure/adapters/dashboardAdapter";
import {
  FOLDER_FILTER_THRESHOLD,
  MisInspeccionesViewProps,
  Vista,
} from "../../domain/models/dashboardModels";

const VIEW_ONLY_ACTIONS = { view: true, pdf: true, edit: false, excel: false, duplicate: false, delete: false };

function KpiCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 90,
        p: 2,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: color + "30",
        bgcolor: color + "08",
        textAlign: "center",
      }}
    >
      <Typography sx={{ fontSize: "28px", fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontSize: "11px", color: "text.secondary", mt: 0.5, fontWeight: 600 }}>
        {label}
      </Typography>
    </Paper>
  );
}

/** Tabla de una carpeta — agrega buscador solo si hay suficientes filas. */
function CarpetaTable<T>({
  rows,
  columns,
  rowKey,
  getSearchText,
  emptyMessage,
}: {
  rows: T[];
  columns: ReportColumn<T>[];
  rowKey: (row: T) => string;
  getSearchText: (row: T) => string;
  emptyMessage: string;
}) {
  const [busqueda, setBusqueda] = useState("");
  const necesitaFiltro = rows.length > FOLDER_FILTER_THRESHOLD;

  const filtradas = useMemo(() => {
    if (!necesitaFiltro || !busqueda.trim()) return rows;
    const q = busqueda.toLowerCase().trim();
    return rows.filter((r) => getSearchText(r).toLowerCase().includes(q));
  }, [rows, busqueda, necesitaFiltro, getSearchText]);

  return (
    <Box>
      {necesitaFiltro && (
        <TextField
          size="small"
          fullWidth
          placeholder="Buscar en esta carpeta..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{ mb: 2 }}
        />
      )}
      <ReportTable
        columns={columns}
        rows={filtradas}
        rowKey={rowKey}
        emptyMessage={emptyMessage}
        size="small"
        defaultRowsPerPage={10}
      />
    </Box>
  );
}

function ModuloSection({
  titulo,
  loading,
  error,
  folders,
}: {
  titulo: string;
  loading: boolean;
  error: string | null;
  folders: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "#1e3e66", mb: 1.5 }}>
        {titulo}
      </Typography>
      {loading ? (
        <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2 }} />
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      ) : (
        folders
      )}
    </Box>
  );
}

export function MisInspeccionesView({ username, area }: MisInspeccionesViewProps) {
  const router = useRouter();
  const {
    vista,
    setVista,
    herraEquipos,
    loadingHerra,
    errorHerra,
    carpetasHerra,
    isoInstances,
    loadingIso,
    errorIso,
    carpetasIso,
    emergencia,
    loadingEmergencia,
    errorEmergencia,
    totalActivo,
    cargandoAlgo,
    downloadHerraEquipoPdf,
    downloadIroIsopPdf,
    downloadEmergenciaPdf,
  } = useMisInspecciones(username, area);

  const columnasHerra: ReportColumn<InspectionResponse>[] = [
    {
      key: "fecha",
      label: "Fecha",
      render: (row) => new Date(row.submittedAt).toLocaleDateString("es-BO"),
    },
    { key: "area", label: "Área", render: (row) => getArea(row) },
    {
      key: "equipmentId",
      label: "TAG/Placa/Código",
      render: (row) => (
        <Chip label={getEquipmentId(row)} size="small" variant="outlined" />
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      align: "center",
      render: (row) => (
        <ReportActionButtons
          onView={() =>
            router.push(`/dashboard/form-herra-equipos/${row.templateCode}?id=${row._id}&mode=view`)
          }
          onDownloadPdf={() => downloadHerraEquipoPdf(row._id)}
          show={VIEW_ONLY_ACTIONS}
        />
      ),
    },
  ];

  const columnasIso: ReportColumn<FormInstance>[] = [
    {
      key: "fecha",
      label: "Fecha",
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString("es-BO") : "N/A"),
    },
    {
      key: "cumplimiento",
      label: "Cumplimiento",
      render: (row) => `${Math.round(row.overallCompliancePercentage ?? 0)}%`,
    },
    {
      key: "acciones",
      label: "Acciones",
      align: "center",
      render: (row) => (
        <ReportActionButtons
          onView={() => router.push(`/dashboard/reports/report-iro-isop/editar/${row._id}?mode=view`)}
          onDownloadPdf={() => downloadIroIsopPdf(row._id)}
          show={VIEW_ONLY_ACTIONS}
        />
      ),
    },
  ];

  // ── Columnas Sistemas de Emergencia (sin carpetas, lista única) ─────────
  const columnasEmergencia: ReportColumn<InspeccionServiceExport>[] = [
    { key: "area", label: "Área", render: (row) => row.area },
    { key: "tag", label: "TAG", render: (row) => row.tag },
    { key: "mes", label: "Mes actual", render: (row) => row.mesActual },
    {
      key: "fecha",
      label: "Última modificación",
      render: (row) =>
        row.fechaUltimaModificacion
          ? new Date(row.fechaUltimaModificacion).toLocaleDateString("es-BO")
          : "N/A",
    },
    {
      key: "acciones",
      label: "Acciones",
      align: "center",
      render: (row) => (
        <ReportActionButtons
          onView={() =>
            router.push(`/dashboard/reports/sistemas-de-emergencia/editar/${row._id}?mode=view`)
          }
          onDownloadPdf={() => downloadEmergenciaPdf(row._id)}
          show={VIEW_ONLY_ACTIONS}
        />
      ),
    },
  ];

  return (
    <Box>
      {/* KPI Row */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {cargandoAlgo ? (
          [1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={80} sx={{ flex: 1, minWidth: 90, borderRadius: 2.5 }} />
          ))
        ) : (
          <>
            <KpiCard value={totalActivo} label="Total en esta vista" color="#6366f1" />
            <KpiCard value={herraEquipos.length} label="Herramientas y Equipos" color="#2563eb" />
            <KpiCard value={isoInstances.length} label="IRO-ISOP" color="#7c3aed" />
            {vista === "area" && (
              <KpiCard value={emergencia.length} label="Sistemas de Emergencia" color="#d97706" />
            )}
          </>
        )}
      </Box>

      {/* Tabs de vista */}
      <Tabs
        value={vista}
        onChange={(_, v: Vista) => setVista(v)}
        sx={{ mb: 3, borderBottom: "1px solid rgba(0,0,0,0.08)" }}
      >
        <Tab value="mias" label="Realizadas por mí" />
        <Tab value="area" label="De mi área" disabled={!area} />
      </Tabs>

      {vista === "area" && !area && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          No tenés un área asignada — no se puede mostrar esta vista.
        </Alert>
      )}

      {/* Herramientas y Equipos */}
      <ModuloSection
        titulo="Herramientas y Equipos"
        loading={loadingHerra}
        error={errorHerra}
        folders={
          carpetasHerra.length === 0 ? (
            <EmptyFolders />
          ) : (
            carpetasHerra.map((folder) => (
              <Accordion key={folder.key} disableGutters>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography sx={{ fontWeight: 700, fontSize: "13px" }}>{folder.label}</Typography>
                  <Chip label={folder.rows.length} size="small" sx={{ ml: 1.5, height: 20 }} />
                </AccordionSummary>
                <AccordionDetails>
                  <CarpetaTable
                    rows={folder.rows}
                    columns={columnasHerra}
                    rowKey={(row) => row._id}
                    getSearchText={(row) => `${getArea(row)} ${row.status}`}
                    emptyMessage="Sin inspecciones en esta carpeta"
                  />
                </AccordionDetails>
              </Accordion>
            ))
          )
        }
      />

      {/* IRO-ISOP */}
      <ModuloSection
        titulo="IRO-ISOP"
        loading={loadingIso}
        error={errorIso}
        folders={
          carpetasIso.length === 0 ? (
            <EmptyFolders />
          ) : (
            carpetasIso.map((folder) => (
              <Accordion key={folder.key} disableGutters>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography sx={{ fontWeight: 700, fontSize: "13px" }}>{folder.label}</Typography>
                  <Chip label={folder.rows.length} size="small" sx={{ ml: 1.5, height: 20 }} />
                </AccordionSummary>
                <AccordionDetails>
                  <CarpetaTable
                    rows={folder.rows}
                    columns={columnasIso}
                    rowKey={(row) => row._id}
                    getSearchText={(row) => `${row.status || ""}`}
                    emptyMessage="Sin inspecciones en esta carpeta"
                  />
                </AccordionDetails>
              </Accordion>
            ))
          )
        }
      />

      {/* Sistemas de Emergencia — solo "de mi área", sin carpetas */}
      {vista === "area" && area && (
        <ModuloSection
          titulo="Sistemas de Emergencia"
          loading={loadingEmergencia}
          error={errorEmergencia}
          folders={
            <CarpetaTable
              rows={emergencia}
              columns={columnasEmergencia}
              rowKey={(row) => row._id}
              getSearchText={(row) => `${row.area} ${row.tag}`}
              emptyMessage="Sin inspecciones de sistemas de emergencia en tu área"
            />
          }
        />
      )}
    </Box>
  );
}

function EmptyFolders() {
  return (
    <Box
      sx={{
        py: 4,
        textAlign: "center",
        bgcolor: "rgba(99,102,241,0.03)",
        borderRadius: 3,
        border: "1px dashed rgba(99,102,241,0.2)",
      }}
    >
      <Assignment sx={{ fontSize: 36, color: "#c7d2fe", mb: 1 }} />
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        No hay inspecciones en esta vista.
      </Typography>
    </Box>
  );
}
