"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  LinearProgress,
  Grid,
  Link,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { TagDelMes, nivelCobertura, fechaCorta } from "../utils/coberturaMensual";

interface LiveCommandCenterProps {
  tags: TagDelMes[];
  periodo: string;
  /** Superintendencia de un área según el catálogo (no el texto guardado en el formulario). */
  superintendenciaDe: (area: string) => string;
  onAreaClick: (area: string) => void;
}

const cabecera = { fontWeight: "bold", fontSize: { xs: "0.75rem", sm: "0.875rem" } } as const;
const celda = { fontSize: { xs: "0.8rem", sm: "0.875rem" } } as const;

/** Seguimiento por tag del mes elegido, de menor a mayor cumplimiento. */
export const LiveCommandCenter = ({ tags, periodo, superintendenciaDe, onAreaClick }: LiveCommandCenterProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const ordenados = useMemo(
    () => [...tags].sort((a, b) => a.pct - b.pct || a.area.localeCompare(b.area) || a.tag.localeCompare(b.tag)),
    [tags],
  );

  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardContent sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" } }}>
            Seguimiento por tag
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            {periodo} · de menor a mayor cumplimiento. Clic en el área para ver sus extintores.
          </Typography>

          <TableContainer
            sx={{
              maxHeight: 480,
              "& .MuiTableCell-root": { py: { xs: 1, sm: 1.25 }, px: { xs: 0.5, sm: 1, md: 2 } },
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...cabecera, minWidth: { xs: 80, sm: 120 } }}>ÁREA / TAG</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell sx={{ ...cabecera, minWidth: 120 }}>SUPERINTENDENCIA</TableCell>
                      <TableCell sx={{ ...cabecera, minWidth: 100 }}>INSPECTOR</TableCell>
                    </>
                  )}
                  <TableCell sx={cabecera}>FECHA</TableCell>
                  <TableCell sx={{ ...cabecera, textAlign: "center" }}>CANTIDAD</TableCell>
                  <TableCell sx={{ ...cabecera, textAlign: "center" }}>INSPECC.</TableCell>
                  <TableCell sx={cabecera}>CUMPLIMIENTO</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {ordenados.map((t) => {
                  const color = theme.palette[nivelCobertura(t.pct)].main;
                  return (
                    <TableRow key={t.tag} hover>
                      <TableCell>
                        <Link
                          component="button"
                          type="button"
                          underline="hover"
                          onClick={() => onAreaClick(t.area)}
                          sx={{ fontWeight: "bold", textAlign: "left", ...celda }}
                        >
                          {t.area}
                        </Link>
                        <Typography variant="caption" display="block" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
                          {t.tag}
                        </Typography>
                      </TableCell>

                      {!isMobile && (
                        <>
                          <TableCell sx={celda}>{superintendenciaDe(t.area) || "—"}</TableCell>
                          <TableCell sx={celda}>
                            {t.inspeccionado ? (t.inspector ?? "Sin registrar") : "Sin inspección"}
                          </TableCell>
                        </>
                      )}

                      <TableCell sx={{ ...celda, whiteSpace: "nowrap" }}>{fechaCorta(t.fecha) || "—"}</TableCell>
                      <TableCell sx={{ ...celda, textAlign: "center" }}>{t.cantidad}</TableCell>
                      <TableCell sx={{ ...celda, textAlign: "center" }}>{t.inspeccionados}</TableCell>

                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={t.pct}
                            aria-label={`Cumplimiento ${t.tag}`}
                            sx={{
                              width: { xs: 35, sm: 50 },
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: "action.selected",
                              "& .MuiLinearProgress-bar": { backgroundColor: color },
                            }}
                          />
                          <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", sm: "0.85rem" }, minWidth: 40 }}>
                            {t.pct} %
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Grid>
  );
};
