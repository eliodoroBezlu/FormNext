'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
} from '@mui/material';
import {
  CheckCircle,
  ExpandMore,
  FolderSpecial,
  Business,
  FilterAlt,
} from '@mui/icons-material';
import { Card, CardContent } from '@mui/material';
import { InspectionResponse } from '@/lib/actions/inspection-herra-equipos';
import { useApprovals } from './application/hooks/useApprovals';
import { AreaSelectorPanel } from './presentation/components/approval/AreaSelectorPanel';
import { TemplateAccordion } from './presentation/components/approval/TemplateAccordion';
import { maxUrgencyOf } from './presentation/components/approval/urgencyUtils';

export function PendingApprovalsList() {
  const router = useRouter();
  const {
    user,
    authLoading,
    isAdmin,
    inspections,
    loading,
    error,
    loadedAreas,
    setLoadedAreas,
    loadInspections,
    refreshInspections,
    groupedByTemplate,
    groupedByArea,
  } = useApprovals();

  const [expandedArea, setExpandedArea] = useState<string | false>(false);
  const [expandedTemplate, setExpandedTemplate] = useState<string | false>(false);

  const handleView = (insp: InspectionResponse) =>
    router.push(`/dashboard/form-herra-equipos/${insp.templateCode}/${insp._id}`);

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
        <Typography ml={2}>Verificando permisos...</Typography>
      </Box>
    );
  }
  if (!user) return <Alert severity="error">No se pudo obtener información del usuario.</Alert>;

  if (!isAdmin && loadedAreas === null) {
    return (
      <AreaSelectorPanel
        userArea={user.area}
        onConfirm={(areas) => loadInspections(areas)}
      />
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
        <Typography ml={2}>Cargando inspecciones...</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button onClick={() => loadedAreas !== null && refreshInspections(loadedAreas)}>
            Reintentar
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  const header = (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Box>
        <Typography variant="h6">
          Pendientes de Aprobación
          <Chip label={inspections.length} color="warning" size="small" sx={{ ml: 1, fontWeight: 700 }} />
        </Typography>
        {!isAdmin && loadedAreas && (
          <Typography variant="caption" color="text.secondary">
            Áreas seleccionadas: {loadedAreas.map((a) => <strong key={a}>{a} </strong>)}
          </Typography>
        )}
        {isAdmin && (
          <Typography variant="caption" color="text.secondary">
            Vista de administrador — todas las áreas ({groupedByArea.length})
          </Typography>
        )}
      </Box>
      <Stack direction="row" spacing={1}>
        {!isAdmin && (
          <Button size="small" variant="outlined" startIcon={<FilterAlt />} onClick={() => setLoadedAreas(null)}>
            Cambiar áreas
          </Button>
        )}
        <Button size="small" variant="outlined" onClick={() => loadedAreas !== null && refreshInspections(loadedAreas)}>
          Actualizar
        </Button>
      </Stack>
    </Box>
  );

  if (inspections.length === 0) {
    return (
      <>
        {header}
        <Card sx={{ bgcolor: 'background.default', border: '1px dashed #ccc' }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 6 }}>
              <CheckCircle sx={{ fontSize: 60, color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary">¡Todo al día!</Typography>
              <Typography variant="body2" color="text.secondary">
                No hay inspecciones pendientes de aprobación
                {!isAdmin && loadedAreas?.length ? ` para ${loadedAreas.join(', ')}` : ''}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </>
    );
  }

  // Supervisor con 1 área → carpetas por tipo de inspección
  if (!isAdmin && (loadedAreas?.length ?? 0) <= 1) {
    return (
      <Box>
        {header}
        <Stack spacing={1.5}>
          {groupedByTemplate.map(([code, group]) => (
            <TemplateAccordion
              key={code}
              templateCode={code}
              templateName={group.templateName}
              items={group.items}
              expanded={expandedTemplate === code}
              onToggle={() => setExpandedTemplate(expandedTemplate === code ? false : code)}
              onView={handleView}
            />
          ))}
        </Stack>
      </Box>
    );
  }

  // Admin y supervisor multi-área → Área → Tipo → Cards
  return (
    <Box>
      {header}
      <Stack spacing={2}>
        {groupedByArea.map(({ area, byTemplate }) => {
          const allItems = [...byTemplate.values()].flatMap((g) => g.items);
          const areaUrgency = maxUrgencyOf(allItems);
          const isAreaOpen = expandedArea === area;

          return (
            <Accordion
              key={area}
              expanded={isAreaOpen}
              onChange={() => setExpandedArea(isAreaOpen ? false : area)}
              elevation={3}
              TransitionProps={{ unmountOnExit: true }}
              sx={{
                borderLeft: '6px solid',
                borderLeftColor:
                  areaUrgency === 'error' ? 'error.main' : areaUrgency === 'warning' ? 'warning.main' : 'primary.main',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                  {isAreaOpen ? (
                    <FolderSpecial color="primary" />
                  ) : (
                    <Business
                      color={
                        areaUrgency === 'error' ? 'error' : areaUrgency === 'warning' ? 'warning' : 'primary'
                      }
                      fontSize="small"
                    />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700} variant="subtitle1">{area}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {byTemplate.size} tipo{byTemplate.size !== 1 ? 's' : ''} de inspección
                    </Typography>
                  </Box>
                  <Badge
                    badgeContent={allItems.length}
                    color={areaUrgency === 'default' ? 'primary' : areaUrgency}
                    sx={{ mr: 2 }}
                  >
                    <Chip label="pendientes" size="small" variant="outlined" />
                  </Badge>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ pt: 0 }}>
                {isAreaOpen && (
                  <Stack spacing={1}>
                    {[...byTemplate.entries()]
                      .sort(([, a], [, b]) => b.items.length - a.items.length)
                      .map(([code, group]) => {
                        const tplKey = `${area}__${code}`;
                        return (
                          <TemplateAccordion
                            key={tplKey}
                            templateCode={code}
                            templateName={group.templateName}
                            items={group.items}
                            expanded={expandedTemplate === tplKey}
                            onToggle={() =>
                              setExpandedTemplate(expandedTemplate === tplKey ? false : tplKey)
                            }
                            onView={handleView}
                            indent
                          />
                        );
                      })}
                  </Stack>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Box>
  );
}
