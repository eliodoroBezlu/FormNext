import React from "react";
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
  useTheme,
  useMediaQuery,
} from "@mui/material";

import { FormularioInspeccion, Extintor } from "../types/IProps";
import { chartColors } from "@/styles/chartTheme";

interface LiveCommandCenterProps {
  inspeccionesFiltradas: FormularioInspeccion[];
  extintores: Extintor[];
}

export const LiveCommandCenter = ({
  inspeccionesFiltradas,
  extintores,
}: LiveCommandCenterProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardContent sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" } }}
            >
              Seguimiento en Tiempo Real
            </Typography>
          </Box>

          <TableContainer
            sx={{
              maxHeight: 400,
              "& .MuiTableCell-root": {
                py: { xs: 1, sm: 1.5 },
                px: { xs: 0.5, sm: 1, md: 2 },
              },
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      minWidth: { xs: 80, sm: 120 },
                    }}
                  >
                    ÁREA
                  </TableCell>

                  {!isMobile && (
                    <>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          minWidth: 120,
                        }}
                      >
                        SUPERINTENDENCIA
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          minWidth: 100,
                        }}
                      >
                        INSPECTOR
                      </TableCell>
                    </>
                  )}

                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    FECHA
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    EXT.
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    EXT. INSP.
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    CUMPLIMIENTO
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {inspeccionesFiltradas.slice(0, 50).map((ins) => {
                  const mesData = ins.meses[ins.mesActual];
                  const inspector =
                    mesData?.inspector?.nombre || "Sin registrar";
                  const fecha = `${ins.mesActual} ${ins.año}`;
                  const extintoresInspeccionados =
                    mesData?.inspeccionesExtintor?.length || 0;

                  // Calculate active extinguishers for this tag
                  const extintoresActivos = extintores.filter(
                    (e) => e.tag === ins.tag && e.activo === true,
                  ).length;

                  // Calculate compliance based on inspected vs active extinguishers
                  const cumplimiento =
                    extintoresActivos > 0
                      ? Math.min(
                          Math.round(
                            (extintoresInspeccionados / extintoresActivos) *
                              100,
                          ),
                          100,
                        )
                      : 0;

                  return (
                    <TableRow key={ins._id} hover>
                      <TableCell>
                        <Box>
                          <Typography
                            fontWeight="bold"
                            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                          >
                            {ins.area}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                          >
                            {ins.tag}
                          </Typography>
                        </Box>
                      </TableCell>

                      {!isMobile && (
                        <>
                          <TableCell
                            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                          >
                            {ins.superintendencia.length > 30
                              ? ins.superintendencia.substring(0, 30) + "..."
                              : ins.superintendencia}
                          </TableCell>

                          <TableCell
                            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                          >
                            {inspector}
                          </TableCell>
                        </>
                      )}

                      <TableCell
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                      >
                        {fecha}
                      </TableCell>

                      <TableCell
                        sx={{
                          fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          textAlign: "center",
                        }}
                      >
                        {extintoresActivos}
                      </TableCell>

                      <TableCell
                        sx={{
                          fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          textAlign: "center",
                        }}
                      >
                        {extintoresInspeccionados}
                      </TableCell>

                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={cumplimiento}
                            sx={{
                              width: { xs: 35, sm: 50 },
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: "rgba(85, 68, 68, 0.3)",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor:
                                  cumplimiento >= 90
                                    ? chartColors.colorExito
                                    : cumplimiento >= 70
                                      ? chartColors.estadoWarning
                                      : chartColors.estadoError,
                              },
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: "0.75rem", sm: "0.85rem" },
                              minWidth: { xs: 25, sm: 35 },
                            }}
                          >
                            {cumplimiento}%
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
