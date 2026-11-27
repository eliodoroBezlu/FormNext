"use client";

import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Skeleton,
  Button,
} from "@mui/material";
import { ExpandMore, PlayArrow } from "@mui/icons-material";
import { useRouter } from "next/navigation";

import { FormInstance, InspeccionServiceExport } from "@/types/formTypes";
import { getArea, getEquipmentIds } from "@/lib/utils/herra-equipos-fields";

import type { ReportColumn } from "@/components/features/reports/presentation/components/ReportTable";
import { ReportActionButtons } from "@/components/features/reports/presentation/components/ReportActionButtons";

import { useMisInspecciones } from "../../application/hooks/useMisInspecciones";
import type { InspectionResponse } from "../../infrastructure/adapters/dashboardAdapter";
import type { MisInspeccionesViewProps } from "../../domain/models/dashboardModels";
import type { FilaEmergencia } from "../../domain/models/carpetaVirtual";
import { CarpetaFiltros } from "./CarpetaFiltros";
import { CarpetaTable, ChipsDeCodigo, EmptyFolders, KpiCard, ModuloSection } from "./CarpetaPiezas";
import { MARCA } from "@/styles/marca";

const VIEW_ONLY_ACTIONS = { view: true, pdf: true, edit: false, excel: false, duplicate: false, delete: false };

export function MisInspeccionesView({ usuario, area: areaDelPerfil }: MisInspeccionesViewProps) {
  const router = useRouter();

  /*
   * El área arranca en la del perfil pero se puede cambiar (sin área en el perfil, o con una mal
   * asignada, la vista quedaba vacía y sin salida). El técnico arranca en quien mira y se puede
   * elegir cualquier otro.
   */
  const {
    vista,
    setVista,
    tecnico,
    setTecnico,
    tecnicos,
    nombreTecnico,
    area,
    setArea,
    periodo,
    setPeriodo,
    totalHerra,
    loadingHerra,
    errorHerra,
    carpetasHerra,
    totalIso,
    loadingIso,
    errorIso,
    carpetasIso,
    filasDeEmergencia,
    loadingEmergencia,
    errorEmergencia,
    totalActivo,
    cargandoAlgo,
    downloadHerraEquipoPdf,
    downloadIroIsopPdf,
    downloadEmergenciaPdf,
  } = useMisInspecciones(usuario, areaDelPerfil);

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
      // Un chip por código: una inspección de SPCC cubre hasta cuatro
      // elementos y cada uno tiene el suyo. `flexWrap` los baja de línea en
      // vez de ensanchar la columna.
      render: (row) => <ChipsDeCodigo codigos={getEquipmentIds(row)} />,
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
      key: "estado",
      label: "Estado",
      render: (row) =>
        row.status === "borrador" || !row.status ? (
          <Chip label="En avance" size="small" color="warning" variant="outlined" />
        ) : (
          <Chip label="Terminada" size="small" color="success" variant="outlined" />
        ),
    },
    {
      key: "acciones",
      label: "Acciones",
      align: "center",
      render: (row) => (
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          {/* «Guardar avance» la dejó en borrador: aquí se sigue hasta terminarla. */}
          {(row.status === "borrador" || !row.status) && (
            <Button
              size="small"
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={() => router.push(`/dashboard/reports/report-iro-isop/editar/${row._id}`)}
            >
              Seguir
            </Button>
          )}
        <ReportActionButtons
          onView={() => router.push(`/dashboard/reports/report-iro-isop/editar/${row._id}?mode=view`)}
          onDownloadPdf={() => downloadIroIsopPdf(row._id)}
          show={VIEW_ONLY_ACTIONS}
        />
        </Box>
      ),
    },
  ];

  // ── Columnas Sistemas de Emergencia (sin carpetas, lista única) ─────────
  // Una fila por formulario (tag y semestre), con los meses del periodo que tienen inspección.
  const columnasEmergencia: ReportColumn<FilaEmergencia<InspeccionServiceExport>>[] = [
    { key: "area", label: "Área", render: ({ formulario }) => formulario.area },
    { key: "tag", label: "TAG", render: ({ formulario }) => formulario.tag },
    {
      key: "meses",
      label: "Meses inspeccionados",
      render: ({ meses }) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {meses.map((m) => (
            <Chip key={m} label={m.charAt(0) + m.slice(1).toLowerCase()} size="small" variant="outlined" />
          ))}
        </Box>
      ),
    },
    { key: "inspector", label: "Inspector anotado", render: ({ inspectores }) => inspectores.join(", ") || "—" },
    {
      key: "acciones",
      label: "Acciones",
      align: "center",
      render: ({ formulario }) => (
        <ReportActionButtons
          onView={() =>
            router.push(`/dashboard/reports/sistemas-de-emergencia/editar/${formulario._id}?mode=view`)
          }
          onDownloadPdf={() => downloadEmergenciaPdf(formulario._id)}
          show={VIEW_ONLY_ACTIONS}
        />
      ),
    },
  ];

  return (
    <Box>
      <CarpetaFiltros
        usuario={usuario}
        areaDelPerfil={areaDelPerfil}
        vista={vista}
        onVista={setVista}
        tecnico={tecnico}
        tecnicos={tecnicos}
        onTecnico={setTecnico}
        area={area}
        onArea={setArea}
        periodo={periodo}
        onPeriodo={setPeriodo}
      />

      {/* KPI Row: lo del periodo elegido */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {cargandoAlgo ? (
          [1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={80} sx={{ flex: 1, minWidth: 90, borderRadius: 2.5 }} />
          ))
        ) : (
          <>
            <KpiCard value={totalActivo} label="Total en esta vista" color={MARCA.acero} />
            <KpiCard value={totalHerra} label="Herramientas y Equipos" color="#2563eb" />
            <KpiCard value={totalIso} label="IRO-ISOP" color={MARCA.petroleo} />
            <KpiCard value={filasDeEmergencia.length} label="Sistemas de Emergencia" color="#d97706" />
          </>
        )}
      </Box>

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

      {/* Sistemas de Emergencia — en las dos vistas, sin carpetas. */}
      {(vista === "tecnico" || area) && (
        <ModuloSection
          titulo="Sistemas de Emergencia"
          loading={loadingEmergencia}
          error={errorEmergencia}
          folders={
            <>
              {vista === "tecnico" && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                  Este formulario no guarda el usuario, solo el nombre que anota el inspector: se muestran
                  los meses en que ese nombre coincide con {nombreTecnico || tecnico.username}.
                </Typography>
              )}
              <CarpetaTable
                rows={filasDeEmergencia}
                columns={columnasEmergencia}
                rowKey={(fila) => fila.formulario._id}
                getSearchText={(fila) => `${fila.formulario.area} ${fila.formulario.tag} ${fila.inspectores.join(" ")}`}
                emptyMessage="Sin inspecciones de sistemas de emergencia en este periodo"
              />
            </>
          }
        />
      )}
    </Box>
  );
}
