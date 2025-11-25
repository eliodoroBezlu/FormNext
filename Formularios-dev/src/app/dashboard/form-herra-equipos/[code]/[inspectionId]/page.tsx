// app/dashboard/form-herra-equipos/[code]/[inspectionId]/page.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useUserRole } from '@/hooks/useUserRole';
import {
  Box, CircularProgress, Alert, Button, Snackbar, Breadcrumbs, Link, Paper
} from '@mui/material';
import { ArrowBack, Home, Pending } from '@mui/icons-material';
import { getTemplatesHerraEquipos } from '@/lib/actions/template-herra-equipos';
import { FormTemplateHerraEquipos, FormDataHerraEquipos } from '@/components/herra_equipos/types/IProps';
import { UnifiedFormRouter } from '@/components/herra_equipos/UnifiedFormRouter';
import { 
  getInspectionById,
  approveInspection,
  rejectInspection,
  updateInProgressInspection,
  finalizeInspection,
} from '@/lib/actions/inspection-herra-equipos';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  '1.02.P06.F30': UnifiedFormRouter,
  '1.02.P06.F33': UnifiedFormRouter
};

export default function InspectionViewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { hasRole } = useUserRole();
  
  const code = decodeURIComponent(params.code as string);
  const inspectionId = params.inspectionId as string;
  
  const [template, setTemplate] = useState<FormTemplateHerraEquipos | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // ✅ Determinar si el usuario puede aprobar
  const canApproveInspection = () => {
    if (!existingInspection) return false;
    
    // Solo puede aprobar si tiene rol apropiado
    if (!hasRole('supervisor') && !hasRole('admin') && !hasRole('superintendente')) {
      return false;
    }
    
    // No puede aprobar su propia inspección
    if (existingInspection.submittedBy === session?.user?.email) {
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    loadData();
  }, [code, inspectionId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 [VIEW PAGE] Cargando inspección - Code: ${code}, ID: ${inspectionId}`);

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

      console.log('✅ [VIEW PAGE] Template cargado:', foundTemplate.code);

      // 3. CARGAR INSPECCIÓN EXISTENTE
      console.log('🔍 [VIEW PAGE] Cargando inspección:', inspectionId);
      
      const inspectionResult = await getInspectionById(inspectionId);
      
      if (!inspectionResult.success) {
        throw new Error(inspectionResult.error || 'Error al cargar inspección');
      }

      // Validar que el código del template coincida
      if (inspectionResult.data?.templateCode !== code) {
        throw new Error(`La inspección no corresponde al template ${code}`);
      }

      setExistingInspection(inspectionResult.data);
      
      console.log('✅ [VIEW PAGE] Inspección cargada:', {
        status: inspectionResult.data.status,
        submittedBy: inspectionResult.data.submittedBy,
      });

    } catch (err) {
      console.error('❌ [VIEW PAGE] Error al cargar datos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HANDLERS DE APROBACIÓN
  // ============================================

  const handleApprove = async (comments?: string) => {
    if (!session?.user?.email) {
      alert("Debe iniciar sesión para aprobar inspecciones");
      return;
    }

    if (!window.confirm("¿Está seguro de aprobar esta inspección?")) {
      return;
    }

    try {
      setSaving(true);
      
      const result = await approveInspection(
        inspectionId,
        session.user.email,
        comments
      );

      if (!result.success) {
        throw new Error(result.error || "Error al aprobar la inspección");
      }

      setSnackbar({
        open: true,
        message: '✅ Inspección aprobada exitosamente',
        severity: 'success'
      });
      
      console.log("✅ [VIEW PAGE] Inspección aprobada");
      
      // Recargar la inspección para mostrar el nuevo estado
      await loadData();
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard/form-herra-equipos?tab=pending-approval');
      }, 2000);
      
    } catch (err) {
      console.error("Error al aprobar:", err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Error al aprobar',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!session?.user?.email) {
      alert("Debe iniciar sesión para rechazar inspecciones");
      return;
    }

    try {
      setSaving(true);
      
      const result = await rejectInspection(
        inspectionId,
        session.user.email,
        reason
      );

      if (!result.success) {
        throw new Error(result.error || "Error al rechazar la inspección");
      }

      setSnackbar({
        open: true,
        message: 'Inspección rechazada. El inspector será notificado.',
        severity: 'warning'
      });
      
      console.log("✅ [VIEW PAGE] Inspección rechazada");
      
      // Recargar la inspección
      await loadData();
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard/form-herra-equipos?tab=pending-approval');
      }, 2000);
      
    } catch (err) {
      console.error("Error al rechazar:", err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Error al rechazar',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // HANDLERS PARA EDICIÓN (si está en progreso)
  // ============================================

  const handleSaveProgress = async (data: FormDataHerraEquipos) => {
    if (!template) return;

    console.log("🔄 [VIEW PAGE] Actualizando inspección en progreso:", inspectionId);

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

        await loadData();
      } else {
        throw new Error(result.error || 'Error al actualizar inspección');
      }
    } catch (error) {
      console.error("❌ [VIEW PAGE] Error al actualizar:", error);
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

    console.log("✅ [VIEW PAGE] Finalizando inspección:", inspectionId);

    setSaving(true);

    try {
      const result = await finalizeInspection(inspectionId, data);

      if (result.success) {
        setSnackbar({
          open: true,
          message: '✅ Inspección finalizada exitosamente',
          severity: 'success'
        });

        setTimeout(() => {
          router.push('/dashboard/form-herra-equipos?tab=in-progress');
        }, 2000);
      } else {
        throw new Error(result.error || 'Error al finalizar inspección');
      }
    } catch (error) {
      console.error("❌ [VIEW PAGE] Error al finalizar:", error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al finalizar',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
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
          onClick={() => router.push('/dashboard/form-herra-equipos')}
        >
          Volver
        </Button>
      </Box>
    );
  }

  const SpecializedComponent = SPECIALIZED_FORMS[template.code];

  // ✅ Determinar si es modo vista (readonly) o editable
  const isViewMode = existingInspection.status === 'pending_approval' || 
                     existingInspection.status === 'approved' || 
                     existingInspection.status === 'rejected' ||
                     existingInspection.status === 'completed';

  const isReadonly = existingInspection.status === 'approved' || 
                     existingInspection.status === 'rejected' ||
                     existingInspection.status === 'completed';

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
          href="/dashboard/form-herra-equipos"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          Formularios
        </Link>
        {existingInspection.status === 'pending_approval' && (
          <Link
            underline="hover"
            color="inherit"
            href="/dashboard/form-herra-equipos?tab=pending-approval"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Pending fontSize="small" />
            Pendientes
          </Link>
        )}
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
            <Box mt={2}>Procesando...</Box>
          </Box>
        </Box>
      )}

      {/* Botón volver */}
      <Paper elevation={0} sx={{ p: 2, m: 2, bgcolor: "background.default" }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => {
            if (existingInspection.status === 'pending_approval') {
              router.push('/dashboard/form-herra-equipos?tab=pending-approval');
            } else if (existingInspection.status === 'in_progress') {
              router.push('/dashboard/form-herra-equipos?tab=in-progress');
            } else {
              router.push('/dashboard/form-herra-equipos');
            }
          }}
          disabled={saving}
        >
          Volver
        </Button>
      </Paper>
      
      {/* Formulario */}
      {SpecializedComponent ? (
        <SpecializedComponent
          template={template}
          initialData={existingInspection}
          onSubmit={() => {}} // No permitir submit normal en vista
          onSaveProgress={!isReadonly ? handleSaveProgress : undefined}
          onFinalize={!isReadonly ? handleFinalize : undefined}
          onApprove={canApproveInspection() ? handleApprove : undefined}
          onReject={canApproveInspection() ? handleReject : undefined}
          readonly={isReadonly}
          isViewMode={isViewMode}
        />
      ) : (
        <Alert severity="error" sx={{ m: 2 }}>
          No se encontró el componente para el formulario {template.code}
        </Alert>
      )}
    </Box>
  );
}