"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, Typography, Card, CardContent, Button, 
  CircularProgress, Alert, Grid, Chip, CardActions
} from '@mui/material';
import { getTemplatesHerraEquipos } from '@/lib/actions/template-herra-equipos';
import { Assignment, Science } from '@mui/icons-material';
import {  FormTemplateHerraEquipos } from '@/components/herra_equipos/types/IProps';

export default function LlenarFormulariosPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<FormTemplateHerraEquipos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Códigos de formularios especializados
  const SPECIAL_FORMS = ['ARN-001', 'ESC-001', 'EXT-001'];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    
    const result = await getTemplatesHerraEquipos();
    
    if (result.success) {
      const templatesWithDates = result.data.map((template) => ({
        ...template,
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt),
      }));
      setTemplates(templatesWithDates);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleSelectTemplate = (template: FormTemplateHerraEquipos) => {
    // ÚNICA RUTA - Usa CODE en vez de ID
    router.push(`/dashboard/form-med-amb/${template.code}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Formularios de Inspección
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Selecciona un template para comenzar una nueva inspección
        </Typography>
      </Box>

      {templates.length === 0 ? (
        <Alert severity="info">
          No hay templates disponibles. Primero debes crear templates en la gestión de templates.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid size={{ xs: 12, md: 4 }} key={template._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  border: SPECIAL_FORMS.includes(template.code)
                    ? '2px solid #1976d2' 
                    : 'none'
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    {SPECIAL_FORMS.includes(template.code) ? (
                      <Science color="primary" />
                    ) : (
                      <Assignment />
                    )}
                    <Typography variant="h6">
                      {template.name}
                    </Typography>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Código:</strong> {template.code}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Revisión:</strong> {template.revision}
                    </Typography>
                  </Box>

                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip 
                      label={template.type === 'interna' ? 'Interna' : 'Externa'}
                      size="small"
                      color={template.type === 'interna' ? 'primary' : 'secondary'}
                    />
                    {SPECIAL_FORMS.includes(template.code) && (
                      <Chip 
                        label="Especializado"
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    )}
                    <Chip 
                      label={`${template.sections.length} secciones`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleSelectTemplate(template)}
                  >
                    Llenar Formulario
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}