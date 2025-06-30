import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import { FireExtinguisher, CheckCircle } from '@mui/icons-material';
import { ExtintorBackend } from '../../types/formTypes';

interface ExtintoresVisualizacionProps {
  tag: string;
  extintores: ExtintorBackend[] | { extintores: ExtintorBackend[] };
  totalExtintoresActivos?: number;
}

const ExtintoresVisualizacion = ({ tag, extintores,}:ExtintoresVisualizacionProps) => {
  // Usar useMemo para procesar los extintores igual que en InspeccionExtintores
  const extintoresArray = useMemo(() => {
    if (!extintores) {
      return [];
    }

    // Si es un objeto con propiedad extintores
    if (
      typeof extintores === "object" &&
      !Array.isArray(extintores) &&
      "extintores" in extintores
    ) {
      return extintores.extintores || [];
    }

    // Si ya es un array
    if (Array.isArray(extintores)) {
      return extintores;
    }

    return [];
  }, [extintores]);

  // Filtrar extintores activos
  const extintoresActivos = extintoresArray.filter(ext => ext.activo === true);

  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%', minHeight: '25px' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <FireExtinguisher sx={{ mr: 1, color: 'primary.main' }} />
          Extintores en TAG &quot;{tag}&quot;
        </Typography>
        
      </Box>

      {extintoresArray.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No se encontraron extintores para este TAG.
        </Alert>
      ) : (
        <Box sx={{ maxHeight: '150px', overflowY: 'auto' }}>
          {/* Extintores Activos */}
          {extintoresActivos.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>
                Extintores Activos
              </Typography>
              <List dense>
                {extintoresActivos.map((extintor, index) => (
                  <ListItem key={`activo-${index}`} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={extintor.CodigoExtintor || `Extintor ${index + 1}`}
                      secondary={
                        <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                            {extintor.Ubicacion || 'Ubicación no especificada'}
                          </span>
                          {extintor.inspeccionado && (
                            <Chip
                              label="Inspeccionado"
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{ height: 16, fontSize: '0.6rem' }}
                            />
                          )}
                        </span>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

        </Box>
      )}
    </Paper>
  );
};

export default ExtintoresVisualizacion;

