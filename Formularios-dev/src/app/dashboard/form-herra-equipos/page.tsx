// app/dashboard/form-med-amb/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Box, Typography, Card, CardContent, Button, 
  CircularProgress, Alert, Grid, Chip, CardActions,
  Tabs, Tab, Badge
} from '@mui/material';
import { getTemplatesHerraEquipos } from '@/lib/actions/template-herra-equipos';
import { getInProgressInspections } from '@/lib/actions/inspection-herra-equipos';
import { Assignment, Science, Construction, Add } from '@mui/icons-material';
import { FormTemplateHerraEquipos } from '@/components/herra_equipos/types/IProps';
import { InProgressInspectionsList } from '@/components/herra_equipos/InProgressInspectionsList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

// Componente interno que usa useSearchParams
function LlenarFormulariosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Tab inicial desde query param (ej: ?tab=in-progress)
  const initialTab = searchParams?.get('tab') === 'in-progress' ? 1 : 0;
  
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [templates, setTemplates] = useState<FormTemplateHerraEquipos[]>([]);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Códigos de formularios especializados
  const SPECIAL_FORMS = ['ARN-001', 'ESC-001', 'EXT-001'];
  const SCAFFOLD_FORM = '1.02.P06.F30'; // Código de andamios

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Actualizar tab si cambia el query param
    if (searchParams?.get('tab') === 'in-progress') {
      setSelectedTab(1);
    }
  }, [searchParams]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar templates
      const templatesResult = await getTemplatesHerraEquipos();
      
      if (templatesResult.success) {
        const templatesWithDates = templatesResult.data.map((template) => ({
          ...template,
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt),
        }));
        setTemplates(templatesWithDates);
      } else {
        throw new Error(templatesResult.error);
      }

      // Cargar count de inspecciones en progreso (solo andamios)
      const inProgressResult = await getInProgressInspections({
        templateCode: SCAFFOLD_FORM,
      });

      if (inProgressResult.success) {
        setInProgressCount(inProgressResult.data?.length || 0);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: FormTemplateHerraEquipos) => {
    router.push(`/dashboard/form-herra-equipos/${template.code}`);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    
    // Actualizar URL
    const url = newValue === 1 
      ? '/dashboard/form-herra-equipos?tab=in-progress'
      : '/dashboard/form-herra-equipos';
    
    router.push(url, { scroll: false });
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
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Formularios de Inspección
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona tus inspecciones de herramientas y equipos
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          aria-label="inspections tabs"
        >
          <Tab 
            icon={<Add />}
            iconPosition="start"
            label="Nueva Inspección" 
          />
          <Tab 
            icon={
              <Badge badgeContent={inProgressCount} color="warning">
                <Construction />
              </Badge>
            }
            iconPosition="start"
            label="Andamios en Progreso"
          />
        </Tabs>
      </Box>

      {/* Tab 1: Templates (Nueva inspección) */}
      <TabPanel value={selectedTab} index={0}>
        {templates.length === 0 ? (
          <Alert severity="info">
            No hay templates disponibles. Primero debes crear templates en la gestión de templates.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {templates.map((template) => {
              const isScaffold = template.code === SCAFFOLD_FORM;
              
              return (
                <Grid size={{xs:12, md:4}} key={template._id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      border: SPECIAL_FORMS.includes(template.code)
                        ? '2px solid #1976d2' 
                        : isScaffold
                        ? '2px solid #ed6c02'
                        : 'none',
                      position: 'relative',
                    }}
                  >
                    {/* Badge de andamios en progreso */}
                    {isScaffold && inProgressCount > 0 && (
                      <Chip
                        label={`${inProgressCount} en uso`}
                        color="warning"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1,
                        }}
                      />
                    )}

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        {SPECIAL_FORMS.includes(template.code) ? (
                          <Science color="primary" />
                        ) : isScaffold ? (
                          <Construction color="warning" />
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
                        {isScaffold && (
                          <Chip 
                            label="Andamio"
                            size="small"
                            color="warning"
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
                    
                    <CardActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleSelectTemplate(template)}
                        color={isScaffold ? 'warning' : 'primary'}
                      >
                        Nueva Inspección
                      </Button>
                      
                      {/* Botón especial para andamios con inspecciones en progreso */}
                      {isScaffold && inProgressCount > 0 && (
                        <Button
                          variant="outlined"
                          fullWidth
                          size="small"
                          color="warning"
                          onClick={() => setSelectedTab(1)}
                        >
                          Ver {inProgressCount} en uso
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </TabPanel>

      {/* Tab 2: Inspecciones en progreso */}
      <TabPanel value={selectedTab} index={1}>
        <InProgressInspectionsList 
          filterByTemplateCode={SCAFFOLD_FORM}
        />
      </TabPanel>
    </Box>
  );
}

// Componente principal con Suspense
export default function LlenarFormulariosPage() {
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    }>
      <LlenarFormulariosContent />
    </Suspense>
  );
}