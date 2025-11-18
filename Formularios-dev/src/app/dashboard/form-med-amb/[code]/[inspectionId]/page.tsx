// app/dashboard/form-med-amb/[code]/[inspectionId]/page.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, CircularProgress, Alert, Button, Snackbar, Breadcrumbs, Link
} from '@mui/material';
import { ArrowBack, Home, Construction } from '@mui/icons-material';
import { getTemplatesHerraEquipos } from '@/lib/actions/template-herra-equipos';
import { FormTemplateHerraEquipos, FormDataHerraEquipos } from '@/components/herra_equipos/types/IProps';
import { UnifiedFormRouter } from '@/components/herra_equipos/UnifiedFormRouter';
import { 
  saveDraftInspection, 
  submitInspection,
  saveProgressInspection,
  finalizeInspection,
  getInspectionById,
  updateInProgressInspection,
} from '@/lib/actions/inspection-herra-equipos';

const SPECIALIZED_FORMS: Record<string, React.ComponentType<any>> = {
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
  '1.02.P06.F30': UnifiedFormRouter, // Andamios
  '1.02.P06.F33': UnifiedFormRouter
};

export default function EditInspectionPage() {
  const params = useParams();
  const router = useRouter();
  
  const code = decodeURIComponent(params.code as string);
  const inspectionId = params.inspectionId as string;
  
  const [template, setTemplate] = useState<FormTemplateHerraEquipos | null>(null);
  const [existingInspection, setExistingInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadData();
  }, [code, inspectionId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 [EDIT PAGE] Cargando inspección - Code: ${code}, ID: ${inspectionId}`);

      // 1. Validar que el ID sea válido
      if (!inspectionId || inspectionId.length !== 24) {
        throw new Error(`ID de inspección inválido: ${inspectionId}`);
      }

      // 2. CARGAR TEMPLATE
      const templatesResult = await getTemplatesHerraEquipos();
      
      if (!templatesResult.success) {
        throw new Error(templatesResult.error || 'Error al cargar templates');
      }

      const foundTemplate = templatesResult.data.find((t) => t.code === code);

      if (!foundTemplate) {
        throw new Error(`No se encontró el template con código: ${code}`);
      }

      setTemplate({
        ...foundTemplate,
        createdAt: new Date(foundTemplate.createdAt),
        updatedAt: new Date(foundTemplate.updatedAt),
      });

      console.log('✅ [EDIT PAGE] Template cargado:', foundTemplate.code);

      // 3. CARGAR INSPECCIÓN EXISTENTE
      console.log('🔍 [EDIT PAGE] Cargando inspección:', inspectionId);
      
      const inspectionResult = await getInspectionById(inspectionId);
      
      if (!inspectionResult.success) {
        throw new Error(inspectionResult.error || 'Error al cargar inspección');
      }

      // Validar que el código del template coincida
      if (inspectionResult.data.templateCode !== code) {
        throw new Error(`La inspección no corresponde al template ${code}`);
      }

      setExistingInspection(inspectionResult.data);
      
      console.log('✅ [EDIT PAGE] Inspección cargada:', {
        id: inspectionResult.data._id,
        status: inspectionResult.data.status,
        templateCode: inspectionResult.data.templateCode,
        isScaffold: !!inspectionResult.data.scaffold,
        routinesCount: inspectionResult.data.scaffold?.routineInspections?.length || 0,
      });

      // Mensaje según estado
      if (inspectionResult.data.status === 'in_progress') {
        setSnackbar({
          open: true,
          message: `🔄 Continuando inspección - ${inspectionResult.data.scaffold?.routineInspections?.length || 0} rutinarias registradas`,
          severity: 'info'
        });
      }

    } catch (err) {
      console.error('❌ [EDIT PAGE] Error al cargar datos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleSaveProgress = async (data: FormDataHerraEquipos) => {
    if (!template) return;

    console.log("🔄 [EDIT PAGE] Actualizando inspección en progreso:", inspectionId);

    setSaving(true);

    try {
      const result = await updateInProgressInspection(
        inspectionId,
        data,
        'in_progress'
      );

      if (result.success) {
        setSnackbar({
          open: true,
          message: '🔄 Inspección actualizada correctamente',
          severity: 'success'
        });

        console.log("✅ [EDIT PAGE] Inspección actualizada");

        // Recargar datos
        await loadData();
      } else {
        throw new Error(result.error || 'Error al actualizar inspección');
      }
    } catch (error) {
      console.error("❌ [EDIT PAGE] Error al actualizar:", error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al actualizar',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async (data: FormDataHerraEquipos) => {
    if (!template) return;

    console.log("✅ [EDIT PAGE] Finalizando inspección:", inspectionId);

    setSaving(true);

    try {
      const result = await finalizeInspection(inspectionId, data);

      if (result.success) {
        setSnackbar({
          open: true,
          message: '✅ Inspección finalizada exitosamente',
          severity: 'success'
        });

        console.log("✅ [EDIT PAGE] Inspección finalizada");

        setTimeout(() => {
          router.push('/dashboard/form-med-amb?tab=in-progress');
        }, 2000);
      } else {
        throw new Error(result.error || 'Error al finalizar inspección');
      }
    } catch (error) {
      console.error("❌ [EDIT PAGE] Error al finalizar:", error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al finalizar',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFinalSubmit = async (data: FormDataHerraEquipos) => {
    // Para inspecciones en progreso, usar finalizar
    if (existingInspection?.status === 'in_progress') {
      return handleFinalize(data);
    }

    // Si no está en progreso, es un caso edge - no debería pasar
    console.warn('⚠️ [EDIT PAGE] Submit llamado en inspección no en progreso');
    return handleFinalize(data);
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !template || !existingInspection) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'No se pudo cargar la inspección'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard/form-med-amb?tab=in-progress')}
        >
          Volver a En Progreso
        </Button>
      </Box>
    );
  }

  const SpecializedComponent = SPECIALIZED_FORMS[template.code];

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2, mx: 2, mt: 2 }}>
        <Link 
          underline="hover" 
          color="inherit" 
          href="/dashboard"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Home fontSize="small" />
          Dashboard
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard/form-med-amb"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          Formularios
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard/form-med-amb?tab=in-progress"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Construction fontSize="small" />
          En Progreso
        </Link>
        <span>{existingInspection.verification?.TAG || 'Inspección'}</span>
      </Breadcrumbs>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
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
            <Box mt={2}>Guardando...</Box>
          </Box>
        </Box>
      )}

      {/* Alerta de inspección en progreso */}
      {existingInspection.status === 'in_progress' && (
        <Alert severity="warning" sx={{ m: 2 }}>
          🔄 <strong>Continuando inspección en progreso</strong>
          {existingInspection.verification?.TAG && ` - Equipo: ${existingInspection.verification.TAG}`}
          {existingInspection.scaffold?.routineInspections && 
            ` - ${existingInspection.scaffold.routineInspections.length} rutinarias registradas`}
        </Alert>
      )}

      {/* Botón volver */}
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => router.push('/dashboard/form-med-amb?tab=in-progress')}
        sx={{ m: 2 }}
        disabled={saving}
      >
        Volver a En Progreso
      </Button>
      
      {/* Formulario */}
      {SpecializedComponent ? (
        <SpecializedComponent
          template={template}
          onSubmit={handleFinalSubmit}
          onSaveProgress={handleSaveProgress}
          onFinalize={handleFinalize}
          initialData={existingInspection}
        />
      ) : (
        <Alert severity="error" sx={{ m: 2 }}>
          No se encontró el componente para el formulario {template.code}
        </Alert>
      )}
    </Box>
  );
}