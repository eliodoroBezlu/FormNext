"use client";

import { useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
  TrackChanges as TrackChangesIcon,
  RateReview as RateReviewIcon,
} from "@mui/icons-material";
import { Pgr, PgrEstado } from "../../domain/models/IProps";
import { getPgrEstadoColor } from "../../domain/pgrHelpers";

export interface PgrTableProps {
  planes: Pgr[];
  isLoading: boolean;
  error: string | null;
  onView: (plan: Pgr) => void;
  onEdit: (plan: Pgr) => void;
  onToggleActivo: (plan: Pgr) => void;
  onSeguimiento: (plan: Pgr) => void;
  onAprobar: (plan: Pgr) => void;
  onCorregir: (plan: Pgr) => void;
}

export function PgrTable({
  planes,
  isLoading,
  error,
  onView,
  onEdit,
  onToggleActivo,
  onSeguimiento,
  onAprobar,
  onCorregir,
}: PgrTableProps) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper elevation={2} sx={{ borderRadius: "8px" }}>
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          Planes de Gestión y Actividades ({planes.length})
        </Typography>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                  <TableCell>Código</TableCell>
                  <TableCell>Empresa</TableCell>
                  <TableCell>Gerencia</TableCell>
                  <TableCell align="center">Estado Flujo</TableCell>
                  <TableCell align="center">Estatus</TableCell>
                  <TableCell align="center">Acciones Básicas</TableCell>
                  <TableCell align="center">Flujo Operativo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {planes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        No se encontraron PGRs con los filtros aplicados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  planes
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((plan) => (
                      <TableRow key={plan._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {plan.codigoAutogenerado}
                          </Typography>
                        </TableCell>
                        <TableCell>{plan.empresa}</TableCell>
                        <TableCell>{plan.gerencia}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={plan.estado}
                            color={getPgrEstadoColor(plan.estado)}
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={plan.activo !== false ? "Activo" : "Inactivo"}
                            color={plan.activo !== false ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>

                        {/* ACCIONES BÁSICAS: Ver, Editar General, Activar/Desactivar */}
                        <TableCell align="center">
                          <Tooltip title="Ver Detalles Generales">
                            <IconButton color="info" size="small" onClick={() => onView(plan)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar General">
                            <IconButton color="primary" size="small" onClick={() => onEdit(plan)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={plan.activo !== false ? "Desactivar PGR" : "Activar PGR"}
                          >
                            <IconButton
                              color={plan.activo !== false ? "error" : "success"}
                              size="small"
                              onClick={() => onToggleActivo(plan)}
                            >
                              {plan.activo !== false ? <ToggleOffIcon /> : <ToggleOnIcon />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>

                        {/* FLUJO OPERATIVO: Corregir, Seguimiento y Aprobar */}
                        <TableCell align="center">
                          {plan.estado === PgrEstado.CORREGIR && (
                            <Tooltip title="Corregir Plan">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => onCorregir(plan)}
                              >
                                <RateReviewIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Seguimiento">
                            <IconButton
                              color="secondary"
                              size="small"
                              onClick={() => onSeguimiento(plan)}
                            >
                              <TrackChangesIcon />
                            </IconButton>
                          </Tooltip>

                          {plan.estado !== PgrEstado.APROBADO && (
                            <Tooltip title="Aprobar Plan">
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => onAprobar(plan)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={planes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página"
          />
        </>
      )}
    </Paper>
  );
}
