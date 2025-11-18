"use client";

import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { Add, Construction } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { InProgressInspectionsList } from './InProgressInspectionsList';

export function ScaffoldInspectionsManager() {
  const router = useRouter();
  const [showInProgress, setShowInProgress] = useState(true);

  return (
    <Box>
      {/* Botón para crear nueva */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push('/dashboard/form-med-amb/1.02.P06.F30')}
        >
          Nueva Inspección de Andamio
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Construction />}
          onClick={() => setShowInProgress(!showInProgress)}
        >
          {showInProgress ? 'Ocultar' : 'Ver'} Andamios en Progreso
        </Button>
      </Box>

      {/* Lista de andamios en progreso */}
      {showInProgress && (
        <InProgressInspectionsList
          filterByTemplateCode="1.02.P06.F30"
        />
      )}
    </Box>
  );
}