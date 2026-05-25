"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, CircularProgress, Alert, Button, Snackbar
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { getTemplatesHerraEquipos } from '@/lib/actions/template-herra-equipos';
import { FormTemplateHerraEquipos, FormDataHerraEquipos, InspectionStatus } from '@/components/herra_equipos/types/IProps';
import { UnifiedFormRouter } from '@/components/herra_equipos/UnifiedFormRouter';
import { getInspectionById, InspectionResponse, updateInspection } from '@/lib/actions/inspection-herra-equipos';

// Mapeo de códigos a componentes especializados (mismo que en FormularioDinamicoPage)
const SPECIALIZED_FORMS: Record<string, React.ComponentType<{
  template: FormTemplateHerraEquipos;
  onSubmit: (data: FormDataHerraEquipos) => void;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;
  initialData?: FormDataHerraEquipos;
}>> = {
  '1.02.P06.F19': UnifiedFormRouter,
  '1.02.P06.F20': UnifiedFormRouter,
  '1.02.P06.F39': UnifiedFormRouter,
  '1.02.P06.F42': UnifiedFormRouter,
  '1.02.P06.F40': UnifiedFormRouter,
  '2.03.P10.F05': UnifiedFormRouter,
  '3.04.P04.F23': UnifiedFormRouter,
  '3.04.P37.F19': UnifiedFormRouter,
  '3.04.P37.F24': UnifiedFormRouter,
  '3.04.P37.F25': UnifiedFormRouter,
  '3.04.P48.F03': UnifiedFormRouter,
  '1.02.P06.F37': UnifiedFormRouter,
  '3.04.P04.F35': UnifiedFormRouter,
  '1.02.P06.F30': UnifiedFormRouter,
  '1.02.P06.F33': UnifiedFormRouter
};

export default function EditarInspeccionPage() {
  const params = useParams();
  const router = useRouter();
  const inspectionId = params.id as string;
  
  const [template, setTemplate] = useState<FormTemplateHerraEquipos | null>(null);
  const [inspectionData, setInspectionData] = useState<InspectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadInspectionAndTemplate();
  }, [inspectionId]);

  const loadInspectionAndTemplate = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Cargar la inspección existente
      const inspectionResult = await getInspectionById(inspectionId);
      
      if (!inspectionResult.success || !inspectionResult.data) {
        throw new Error(inspectionResult.error || 'Inspección no encontrada');
      }

      const inspection = inspectionResult.data;
      setInspectionData(inspection);

      // 2. Cargar el template correspondiente
      const templatesResult = await getTemplatesHerraEquipos();
      
      if (templatesResult.success) {
        const foundTemplate = templatesResult.data.find(
          (t) => t.code === inspection.templateCode
        );

        if (foundTemplate) {
          setTemplate({
            ...foundTemplate,
            createdAt: new Date(foundTemplate.createdAt),
            updatedAt: new Date(foundTemplate.updatedAt),
          });
        } else {
          throw new Error(`Template con código ${inspection.templateCode} no encontrado`);
        }
      } else {
        throw new Error(templatesResult.error || 'Error al cargar templates');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar la inspección');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handler para actualizar (similar a guardar borrador)
  const handleUpdate = async (data: FormDataHerraEquipos) => {
    if (!inspectionData) return;

    setSaving(true);

    try {
      const result = await updateInspection(
        inspectionId,
        data,
        InspectionStatus.DRAFT, // Mantener como borrador al actualizar
      );

      if (result.success && result.data) {
        setSnackbar({
          open: true,
          message: 'Inspección actualizada exitosamente',
          severity: 'success'
        });
        
        // Actualizar datos locales
        setInspectionData(result.data);
      } else {
        throw new Error(result.error || 'Error al actualizar inspección');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al actualizar',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Handler para submit final (cambiar a completado)
  const handleFinalSubmit = async (data: FormDataHerraEquipos) => {
    if (!inspectionData) return;

    setSaving(true);

    try {
      const result = await updateInspection(
        inspectionId,
        data,
        InspectionStatus.COMPLETED // Cambiar a completado
      );

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Inspección completada exitosamente',
          severity: 'success'
        });
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          router.push('/dashboard/config/inspecciones/gestion');
        }, 2000);
      } else {
        throw new Error(result.error || 'Error al completar inspección');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al finalizar',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Transformar datos de la inspección al formato del formulario
  const getInitialFormData = (): FormDataHerraEquipos | undefined => {
    if (!inspectionData) return undefined;

    return {
      verification: inspectionData.verification || {},
      responses: inspectionData.responses || {},
      generalObservations: inspectionData.generalObservations,
      inspectorSignature: inspectionData.inspectorSignature,
      supervisorSignature: inspectionData.supervisorSignature,
      outOfService: inspectionData.outOfService,
      accesoriosConfig: inspectionData.accesoriosConfig,
      vehicle: inspectionData.vehicle,
      scaffold: inspectionData.scaffold,
      selectedSubsections: inspectionData.selectedSubsections,
      selectedItems: inspectionData.selectedItems,
    };
  };

  // ============================================
  // RENDERIZADO CONDICIONAL
  // ============================================

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !template || !inspectionData) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Inspección o template no encontrado'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard/config/inspecciones/gestion')}
        >
          Volver a la gestión
        </Button>
      </Box>
    );
  }

  const SpecializedComponent = SPECIALIZED_FORMS[template.code];

  if (!SpecializedComponent) {
    return (
      <Box p={3}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No hay un formulario especializado para el código: {template.code}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard/config/inspecciones/gestion')}
        >
          Volver a la gestión
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Snackbar para mensajes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Loading overlay */}
      {saving && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Box textAlign="center" bgcolor="white" p={4} borderRadius={2}>
            <CircularProgress />
            <Box mt={2}>Guardando cambios...</Box>
          </Box>
        </Box>
      )}

      <Box sx={{ m: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard/config/inspecciones/gestion')}
          disabled={saving}
        >
          Volver a la gestión
        </Button>
        
        <Alert severity="info" sx={{ flex: 1, mx: 2 }}>
          Editando inspección: {template.code} - Estado: {inspectionData.status === 'draft' ? 'Borrador' : 'Completado'}
        </Alert>
      </Box>
      
      <SpecializedComponent
        template={template}
        onSubmit={handleFinalSubmit}
        onSaveDraft={handleUpdate}
        initialData={getInitialFormData()}
      />
    </Box>
  );
}