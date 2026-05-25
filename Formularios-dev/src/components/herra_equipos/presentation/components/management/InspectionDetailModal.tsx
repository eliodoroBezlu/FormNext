'use client';
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
} from '@mui/material';
import { InspectionResponse } from '@/lib/actions/inspection-herra-equipos';

interface InspectionDetailModalProps {
  open: boolean;
  inspection: InspectionResponse | null;
  onClose: () => void;
}

export function InspectionDetailModal({
  open,
  inspection,
  onClose,
}: InspectionDetailModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalle de Inspección</DialogTitle>
      <DialogContent>
        {inspection && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Información General
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="textSecondary">
                  Código Template:
                </Typography>
                <Typography variant="body1">
                  {inspection.templateCode || 'N/A'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="textSecondary">
                  Estado:
                </Typography>
                <Chip
                  label={
                    inspection.status === 'completed' ? 'Completado' : 'Borrador'
                  }
                  color={inspection.status === 'completed' ? 'success' : 'warning'}
                  size="small"
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Datos de Verificación
            </Typography>
            <Box
              sx={{
                bgcolor: '#f5f5f5',
                p: 2,
                borderRadius: 1,
                maxHeight: 300,
                overflow: 'auto',
              }}
            >
              <pre>{JSON.stringify(inspection.verification, null, 2)}</pre>
            </Box>

            {inspection.generalObservations && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Observaciones Generales
                </Typography>
                <Typography variant="body1">
                  {inspection.generalObservations}
                </Typography>
              </>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
