'use client';
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  useInspections,
  InspectionFilters as ApiFilters,
} from './application/hooks/useInspections';
import {
  InspectionFilters,
  InspectionFiltersValue,
} from './presentation/components/management/InspectionFilters';
import { InspectionTable } from './presentation/components/management/InspectionTable';
import { InspectionDetailModal } from './presentation/components/management/InspectionDetailModal';

export default function GestionInspecciones() {
  const {
    loading,
    error,
    page,
    rowsPerPage,
    openDetailModal,
    selectedInspection,
    notification,
    setPage,
    setRowsPerPage,
    closeDetailModal,
    closeNotification,
    loadInspections,
    deleteInspection,
    viewDetail,
    editInspection,
    duplicateInspection,
    filterByLocation,
  } = useInspections();

  const [filters, setFilters] = useState<InspectionFiltersValue>({
    templateCode: '',
    status: '',
    location: '',
    submittedBy: '',
    startDate: '',
    endDate: '',
  });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleFilterChange = (
    field: keyof InspectionFiltersValue,
    value: string,
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    setPage(0);
    const apiFilters: ApiFilters = {};
    if (filters.templateCode) apiFilters.templateCode = filters.templateCode;
    if (filters.status) apiFilters.status = filters.status;
    if (filters.submittedBy) apiFilters.submittedBy = filters.submittedBy;
    if (filters.startDate) apiFilters.startDate = filters.startDate;
    if (filters.endDate) apiFilters.endDate = filters.endDate;
    await loadInspections(apiFilters);
  };

  const handleClear = async () => {
    setFilters({
      templateCode: '',
      status: '',
      location: '',
      submittedBy: '',
      startDate: '',
      endDate: '',
    });
    setPage(0);
    await loadInspections();
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteInspection(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const shownInspections = filterByLocation(filters.location);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 3 }}>
        Gestión de Inspecciones
      </Typography>

      <InspectionFilters
        filters={filters}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      <InspectionTable
        inspections={shownInspections}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(Number.parseInt(e.target.value, 10));
          setPage(0);
        }}
        onView={viewDetail}
        onEdit={editInspection}
        onDuplicate={duplicateInspection}
        onDelete={(id) => setDeleteTarget(id)}
      />

      <InspectionDetailModal
        open={openDetailModal}
        inspection={selectedInspection}
        onClose={closeDetailModal}
      />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar esta inspección? Esta acción no
            se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
