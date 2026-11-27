"use client";

// Piezas de la Carpeta virtual de inspecciones (las usa MisInspeccionesView).

import React, { useMemo, useState } from "react";
import { Alert, Box, Chip, Paper, Skeleton, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Assignment } from "@mui/icons-material";
import {
  ReportTable,
  ReportColumn,
} from "@/components/features/reports/presentation/components/ReportTable";
import { FOLDER_FILTER_THRESHOLD } from "../../domain/models/dashboardModels";

/**
 * Los identificadores del equipo, uno por etiqueta.
 *
 * Sin códigos se pinta `N/A` en vez de una celda vacía: una celda en blanco se
 * lee como «no cargó», y esto es «no se registró».
 */
export function ChipsDeCodigo({ codigos }: { codigos: string[] }) {
  if (codigos.length === 0) {
    return <Chip label="N/A" size="small" variant="outlined" />;
  }
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {codigos.map((codigo) => (
        <Chip key={codigo} label={codigo} size="small" variant="outlined" />
      ))}
    </Box>
  );
}

export function KpiCard({ value, label, color }: { value: number; label: string; color: string }) {
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
export function CarpetaTable<T>({
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

export function ModuloSection({
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
      <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "primary.main", mb: 1.5 }}>
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

export function EmptyFolders() {
  return (
    <Box
      sx={{
        py: 4,
        textAlign: "center",
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
        borderRadius: 3,
        border: (theme) => `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
    >
      <Assignment sx={{ fontSize: 36, color: (theme) => alpha(theme.palette.primary.main, 0.3), mb: 1 }} />
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        No hay inspecciones en esta vista.
      </Typography>
    </Box>
  );
}
