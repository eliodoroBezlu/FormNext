'use client';
import React from 'react';
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Tooltip,
  IconButton,
  TablePagination,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { InspectionResponse } from '@/lib/actions/inspection-herra-equipos';

interface InspectionTableProps {
  inspections: InspectionResponse[];
  loading: boolean;
  error: string | null;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onView: (inspection: InspectionResponse) => void;
  onEdit: (inspection: InspectionResponse) => void;
  onDuplicate: (inspection: InspectionResponse) => void;
  onDelete: (id: string) => void;
}

export function InspectionTable({
  inspections,
  loading,
  error,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: InspectionTableProps) {
  const paginated = inspections.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Paper elevation={2} sx={{ borderRadius: '8px' }}>
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">Inspecciones ({inspections.length})</Typography>
      </Box>

      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100px"
        >
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {!loading && !error && (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Código Template</TableCell>
                  <TableCell>Nombre Template</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell>Proyecto</TableCell>
                  <TableCell align="center">Fecha Envío</TableCell>
                  <TableCell align="center">Usuario</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        No se encontraron inspecciones con los filtros aplicados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((inspection) => (
                    <TableRow
                      key={inspection._id}
                      sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {inspection.templateCode || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>{inspection.templateCode || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            inspection.status === 'completed' ? 'Completado' : 'Borrador'
                          }
                          color={
                            inspection.status === 'completed' ? 'success' : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{inspection.location || 'N/A'}</TableCell>
                      <TableCell>{inspection.project || 'N/A'}</TableCell>
                      <TableCell align="center">
                        {inspection.submittedAt
                          ? new Date(inspection.submittedAt).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        {inspection.submittedBy || 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver detalle">
                          <IconButton
                            onClick={() => onView(inspection)}
                            color="info"
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            onClick={() => onEdit(inspection)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicar">
                          <IconButton
                            onClick={() => onDuplicate(inspection)}
                            color="secondary"
                            size="small"
                          >
                            <CopyIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Exportar PDF">
                          <IconButton color="success" size="small">
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            onClick={() => onDelete(inspection._id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={inspections.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </>
      )}
    </Paper>
  );
}
