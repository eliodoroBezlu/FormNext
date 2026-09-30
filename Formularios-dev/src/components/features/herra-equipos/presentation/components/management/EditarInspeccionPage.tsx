"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, CircularProgress, Alert, Button, Snackbar
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { plantillaDeInspeccion } from '../../../infrastructure/adapters/plantillaDeInspeccion';
import { FormTemplateHerraEquipos, FormDataHerraEquipos, InspectionStatus } from '@/components/features/herra-equipos/types/IProps';
import { UnifiedFormRouter } from '@/components/features/herra-equipos/presentation/components/forms/UnifiedFormRouter';
import { getFormConfig } from '@/components/features/herra-equipos/config/form-config.helpers';
import { getInspectionById, InspectionResponse, updateInspection } from '@/lib/actions/inspection-herra-equipos';

/**
 * Igual que en las páginas de creación y edición por inspección: la UI
 * especializada se decide por la existencia de config, no por una lista de
 * códigos hardcodeada. Con la lista, una plantilla nueva perdía en silencio
 * el stepper, las firmas y las observaciones.
 */
const tieneUiEspecializada = (code: string) => getFormConfig(code) !== null;

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

  /** Lo que necesita la página para pintarse: la inspección y su plantilla. */
  interface DatosDeLaInspeccion {
    inspection: InspectionResponse;
    template: FormTemplateHerraEquipos;
  }

  /**
   * Solo consulta y devuelve; **no toca el estado**. Al no haber setState
   * dentro, el efecto puede encadenar la promesa sin que el analizador lo vea
   * como una cascada de renders.
   */
  const consultar = useCallback(async (): Promise<DatosDeLaInspeccion> => {
    const inspectionResult = await getInspectionById(inspectionId);
    if (!inspectionResult.success || !inspectionResult.data) {
      throw new Error(inspectionResult.error || 'Inspección no encontrada');
    }
    const inspection = inspectionResult.data;

    // La revisión con la que se hizo la inspección, no la vigente de su código.
    const foundTemplate = await plantillaDeInspeccion(inspection);

    return {
      inspection,
      template: {
        ...foundTemplate,
        createdAt: new Date(foundTemplate.createdAt),
        updatedAt: new Date(foundTemplate.updatedAt),
      },
    };
  }, [inspectionId]);

  const aplicar = useCallback((datos: DatosDeLaInspeccion) => {
    setInspectionData(datos.inspection);
    setTemplate(datos.template);
    setError(null);
  }, []);

  const avisarFallo = useCallback((err: unknown) => {
    setError(err instanceof Error ? err.message : 'Error al cargar la inspección');
  }, []);

  useEffect(() => {
    // `loading` ya nace en `true` y solo se apaga al terminar, así que la carga
    // inicial no necesita encenderlo. La promesa se encadena aquí en vez de
    // llamar a una función `async`: el analizador rastrea dentro de ella.
    let vigente = true;

    consultar()
      .then((datos) => {
        if (vigente) aplicar(datos);
      })
      .catch((err: unknown) => {
        if (vigente) avisarFallo(err);
      })
      .finally(() => {
        if (vigente) setLoading(false);
      });

    return () => {
      vigente = false;
    };
  }, [consultar, aplicar, avisarFallo]);


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

  /**
   * Datos de la inspección en el formato del formulario.
   *
   * **Va memorizado, y no es una optimización.** El formulario se re-inicializa
   * con `reset()` cada vez que cambia la *identidad* de este objeto, no su
   * contenido:
   *
   * ```ts
   * // useStandardInspectionForm.ts
   * useEffect(() => { if (initialData) reset({ ...initialData, … }); },
   *           [initialData, reset, initialSelections]);
   * ```
   *
   * Antes esto era una función que se llamaba en el JSX (`getInitialFormData()`),
   * así que devolvía un objeto **nuevo en cada render**. Al escribir en un campo
   * el formulario se re-renderizaba, el efecto veía una `initialData` distinta y
   * hacía `reset` con los datos del servidor: lo tecleado desaparecía al
   * instante. Se notaba sobre todo en los campos de verificación, que es lo
   * primero que se toca al editar.
   *
   * La otra ruta de edición —`form-herra-equipos/[code]/[inspectionId]`— nunca
   * tuvo el fallo porque pasa un valor de estado, cuya identidad ya es estable.
   */
  const initialFormData = useMemo((): FormDataHerraEquipos | undefined => {
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
  }, [inspectionData]);

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

  if (!tieneUiEspecializada(template.code)) {
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

      <UnifiedFormRouter
        template={template}
        onSubmit={handleFinalSubmit}
        onSaveDraft={handleUpdate}
        initialData={initialFormData}
      />
    </Box>
  );
}
