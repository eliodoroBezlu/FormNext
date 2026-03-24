"use client";

import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Typography, Box,
} from "@mui/material";
import { useState } from "react";

export interface ReportColumn<T> {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
}

interface ReportTableBaseProps<T> {
  title?: string;
  titleExtra?: React.ReactNode;
  columns: ReportColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  size?: "small" | "medium";
}

// ── Paginación interna (frontend)
interface InternalPaginationProps {
  paginationMode?: "internal";
  defaultRowsPerPage?: number;
}

// ── Paginación externa (server-side)
interface ExternalPaginationProps {
  paginationMode: "external";
  totalItems: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
}

type ReportTableProps<T> = ReportTableBaseProps<T> &
  (InternalPaginationProps | ExternalPaginationProps);

export function ReportTable<T>({
  title,
  titleExtra,
  columns,
  rows,
  rowKey,
  emptyMessage = "No se encontraron resultados",
  size = "medium",
  ...paginationProps
}: ReportTableProps<T>) {
  // Estado interno solo para modo "internal"
  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(
    paginationProps.paginationMode !== "external"
      ? (paginationProps as InternalPaginationProps).defaultRowsPerPage ?? 10
      : 10
  );

  const isExternal = paginationProps.paginationMode === "external";
  const external = isExternal ? (paginationProps as ExternalPaginationProps) : null;

  const page = isExternal ? external!.page : internalPage;
  const rowsPerPage = isExternal ? external!.rowsPerPage : internalRowsPerPage;
  const totalItems = isExternal ? external!.totalItems : rows.length;

  // En modo interno paginamos aquí, en externo el backend ya trae la página
  const paginated = isExternal
    ? rows
    : rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handlePageChange = (_: unknown, newPage: number) => {
    if (isExternal) {
      external!.onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isExternal) {
      external!.onRowsPerPageChange(value);
    } else {
      setInternalRowsPerPage(value);
      setInternalPage(0);
    }
  };

  return (
    <Paper elevation={2} sx={{ borderRadius: "8px", overflow: "hidden" }}>
      {(title || titleExtra) && (
        <Box sx={{
          p: 2,
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          {title && (
            <Typography variant="h6">
              {title} ({totalItems})
            </Typography>
          )}
          {titleExtra}
        </Box>
      )}

      <TableContainer>
        <Table size={size}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align ?? "left"}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align ?? "left"}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        labelRowsPerPage="Filas por página"
      />
    </Paper>
  );
}