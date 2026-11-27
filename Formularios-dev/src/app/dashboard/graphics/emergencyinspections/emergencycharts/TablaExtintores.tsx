"use client";

import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";
import { EstadoChip } from "@/components/ui/feedback/EstadoChip";
import {
  ExtintorDelMes,
  FueraDeCatalogo,
  ETIQUETA_ESTADO,
  COLOR_ESTADO,
  fechaCorta,
  extintoresACsv,
} from "../utils/coberturaMensual";

/** Descarga la lista como CSV (se abre en Excel). */
export function descargarCsv(nombreArchivo: string, extintores: ExtintorDelMes[]) {
  const url = URL.createObjectURL(new Blob([extintoresACsv(extintores)], { type: "text/csv;charset=utf-8" }));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}

const cabecera = { fontWeight: 700, whiteSpace: "nowrap" } as const;

interface TablaExtintoresProps {
  extintores: ExtintorDelMes[];
  /** Muestra área, tag e inspector (lista general); dentro de un tag sobran. */
  conTag?: boolean;
  maxHeight?: number;
}

export function TablaExtintores({ extintores, conTag = false, maxHeight }: TablaExtintoresProps) {
  if (extintores.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" py={2} textAlign="center">
        Este tag no tiene extintores activos en el catálogo.
      </Typography>
    );
  }
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight }}>
      <Table size="small" stickyHeader={!!maxHeight}>
        <TableHead>
          <TableRow>
            {conTag && <TableCell sx={cabecera}>Área</TableCell>}
            {conTag && <TableCell sx={cabecera}>Tag</TableCell>}
            <TableCell sx={cabecera}>Código</TableCell>
            <TableCell sx={cabecera}>Ubicación</TableCell>
            <TableCell sx={cabecera}>Estado</TableCell>
            <TableCell sx={cabecera}>Observaciones</TableCell>
            <TableCell sx={cabecera}>Fecha</TableCell>
            {conTag && <TableCell sx={cabecera}>Inspector</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {extintores.map((x) => (
            <TableRow key={`${x.tag}-${x.codigo}`} hover>
              {conTag && <TableCell>{x.area}</TableCell>}
              {conTag && <TableCell sx={{ whiteSpace: "nowrap" }}>{x.tag}</TableCell>}
              <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{x.codigo}</TableCell>
              <TableCell>{x.ubicacion}</TableCell>
              <TableCell>
                <EstadoChip etiqueta={ETIQUETA_ESTADO[x.estado]} color={COLOR_ESTADO[x.estado]} />
              </TableCell>
              <TableCell>{x.observaciones.join(", ") || "—"}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{fechaCorta(x.fechaInspeccion) || "—"}</TableCell>
              {conTag && <TableCell>{x.inspector ?? "—"}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const MOTIVO: Record<FueraDeCatalogo["motivo"], string> = {
  "dado-de-baja": "Dado de baja en el catálogo",
  "sin-registro": "No existe en el catálogo",
};

/** Códigos inspeccionados que no cuentan en la cobertura. */
export function TablaFueraDeCatalogo({ fuera }: { fuera: FueraDeCatalogo[] }) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={cabecera}>Tag</TableCell>
            <TableCell sx={cabecera}>Código</TableCell>
            <TableCell sx={cabecera}>Ubicación anotada</TableCell>
            <TableCell sx={cabecera}>Motivo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fuera.map((f) => (
            <TableRow key={`${f.tag}-${f.codigo}`} hover>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{f.tag}</TableCell>
              <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{f.codigo}</TableCell>
              <TableCell>{f.ubicacion || "—"}</TableCell>
              <TableCell>
                <EstadoChip etiqueta={MOTIVO[f.motivo]} color={f.motivo === "dado-de-baja" ? "warning" : "error"} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
