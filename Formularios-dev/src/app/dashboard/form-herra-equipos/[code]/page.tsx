// code
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, CircularProgress, Alert, Button, Snackbar, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Typography, Grid
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { getTemplatesHerraEquipos } from '@/lib/actions/template-herra-equipos';
import { FormFiller } from '@/components/features/herra-equipos/FormRenderer';
import {
  FormTemplateHerraEquipos,
  FormDataHerraEquipos,
  TEMPLATE_EQUIPMENT_MAP,
  isAreaField,
  isSuperintendenciaField,
  resolveAutofillValue,
} from '@/components/features/herra-equipos/types/IProps';
import { UnifiedFormRouter } from '@/components/features/herra-equipos/UnifiedFormRouter';
import { 
  saveDraftInspection, 
  submitInspection,
  saveProgressInspection,  // ✅ NUEVO
  finalizeInspection,       // ✅ NUEVO
  getInspectionById,        // ✅ NUEVO
} from '@/lib/actions/inspection-herra-equipos';
import { TagVerificationModal } from '@/components/features/herra-equipos/common/TagVerificationModal';
import { useUserRole } from '@/hooks/useUserRole';
import { obtenerTrabajadorPorUsername } from '@/lib/actions/trabajador-actions';
import { fetchDataBySource } from '@/lib/actions/dataSourceService';
import { obtenerEquipos, EquipoBackend } from '@/lib/actions/equipo-actions';
import { Trabajador } from '@/types/trabajador';

const SPECIALIZED_FORMS: Record<string, React.ComponentType<{
  template: FormTemplateHerraEquipos;
  onSubmit: (data: FormDataHerraEquipos) => void;
  onSaveDraft?: (data: FormDataHerraEquipos) => void;
  onSaveProgress?: (data: FormDataHerraEquipos) => void;  // ✅ NUEVO
  onFinalize?: (data: FormDataHerraEquipos) => void;      // ✅ NUEVO
  initialData?: FormDataHerraEquipos;
  startStep?: number;
  equipos?: EquipoBackend[];
  areas?: string[];
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
  '1.02.P06.F30': UnifiedFormRouter,  // ✅ Andamios
  '1.02.P06.F33': UnifiedFormRouter
};

const FORMS_REQUIRING_TAG_VERIFICATION = [
  '3.04.P37.F24', // Pre-uso tecles
  '3.04.P37.F25', // Frecuente tecles
];


export default function FormularioDinamicoPage() {
  const params = useParams();
  const router = useRouter();
  
  // ✅ DETECTAR SI ES EDICIÓN DE INSPECCIÓN EXISTENTE
  const inspectionId = params.inspectionId as string | undefined;
  const code = decodeURIComponent((params.code || params.templateCode) as string).toUpperCase();
  
  const [template, setTemplate] = useState<FormTemplateHerraEquipos | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [existingInspection, setExistingInspection] = useState<any>(null); // ✅ NUEVO
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Estados para verificación de TAG
  const [showTagVerification, setShowTagVerification] = useState(false);
  const [verifiedEquipmentId, setVerifiedEquipmentId] = useState<string | null>(null);
  const [verifiedTemplateCode, setVerifiedTemplateCode] = useState<string | null>(null);
  
  const [duplicateData, setDuplicateData] = useState<FormDataHerraEquipos | null>(null);

  // Estados para pantalla de selección inicial
  const { user } = useUserRole();
  const [trabajador, setTrabajador] = useState<Trabajador | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [equipos, setEquipos] = useState<EquipoBackend[]>([]);
  const [showSelectionScreen, setShowSelectionScreen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [prefilledData, setPrefilledData] = useState<FormDataHerraEquipos | null>(null);
  const [startStep, setStartStep] = useState<number | undefined>(undefined);
  
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
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`🔍 [PAGE] Cargando - Code: ${code}, InspectionId: ${inspectionId || 'nuevo'}`);

        // ============================================
        // 1. CARGAR TEMPLATE
        // ============================================
        const templatesResult = await getTemplatesHerraEquipos();
        
        if (!templatesResult.success) {
          setError(templatesResult.error || 'Error al cargar templates');
          return;
        }

        const foundTemplate = templatesResult.data.find((t) => t.code === code);

        if (!foundTemplate) {
          setError(`No se encontró el template con código: ${code}`);
          return;
        }

        setTemplate({
          ...foundTemplate,
          createdAt: new Date(foundTemplate.createdAt),
          updatedAt: new Date(foundTemplate.updatedAt),
        });

        console.log('✅ [PAGE] Template cargado:', foundTemplate.code);

        // ============================================
        // 2. SI HAY INSPECTION ID, CARGAR INSPECCIÓN EXISTENTE
        // ============================================
        if (inspectionId) {
          console.log('🔍 [PAGE] Cargando inspección existente:', inspectionId);
          
          const inspectionResult = await getInspectionById(inspectionId);
          
          if (!inspectionResult.success) {
            throw new Error(inspectionResult.error || 'Error al cargar inspección');
          }

          setExistingInspection(inspectionResult.data);
          
          

          // ✅ Si la inspección tiene un TAG, pre-llenarlo
          if (inspectionResult.data?.verification?.TAG) {
            const tag = String(inspectionResult.data.verification.TAG);
            setVerifiedEquipmentId(tag);
            setVerifiedTemplateCode(foundTemplate.code);
          }

          // ✅ NO mostrar modal de TAG si ya existe la inspección
          setShowTagVerification(false);

          // ✅ Mostrar mensaje informativo según el estado
          if (inspectionResult.data?.status === 'in_progress') {
            setSnackbar({
              open: true,
              message: `🔄 Continuando inspección en progreso - ${inspectionResult.data.scaffold?.routineInspections?.length || 0} rutinarias registradas`,
              severity: 'info'
            });
          }
        }
        // ============================================
        // 3. NUEVA INSPECCIÓN - VERIFICAR TAG SI ES NECESARIO O CARGAR PANTALLA DE SELECCIÓN
        // ============================================
        else {
          const requiresVerification = FORMS_REQUIRING_TAG_VERIFICATION.includes(foundTemplate.code);

          // Cargar trabajador completo
          let userTrabajador: Trabajador | null = null;
          if (user?.username) {
            try {
              const res = await obtenerTrabajadorPorUsername(user.username);
              if (res) {
                setTrabajador(res);
                userTrabajador = res;
                setSelectedArea(res.area || '');
              }
            } catch (err) {
              console.error("Error al cargar trabajador:", err);
            }
          }

          // Cargar áreas del sistema
          try {
            const areaData = await fetchDataBySource("area");
            if (Array.isArray(areaData)) {
              const mapped = (areaData as (string | { nombre?: string; name?: string })[]).map(a => typeof a === 'string' ? a : (a.nombre || a.name || '')).filter(Boolean);
              setAreas(Array.from(new Set(mapped)));
            }
          } catch (err) {
            console.error("Error al cargar áreas:", err);
          }

          // Cargar equipos del tipo correspondiente a la de la plantilla
          let relatedEquipos: EquipoBackend[] = [];
          if (TEMPLATE_EQUIPMENT_MAP[code]) {
            try {
              const allEquipos = await obtenerEquipos();
              const allowedTypes = TEMPLATE_EQUIPMENT_MAP[code];
              relatedEquipos = allEquipos.filter(e => allowedTypes.includes(e.tipo_equipo));
              setEquipos(relatedEquipos);
            } catch (err) {
              console.error("Error al cargar equipos:", err);
            }
          }

          if (requiresVerification) {
            // Verificar pre-verificación en sessionStorage
            const preverifiedEquipmentId = sessionStorage.getItem('preverified_equipment_id');
            const preverifiedFromForm = sessionStorage.getItem('preverified_from_form');
            const verificationTimestamp = sessionStorage.getItem('verification_timestamp');

            // Validar que la verificación sea reciente (máximo 5 minutos)
            const isVerificationValid = verificationTimestamp 
              ? (Date.now() - parseInt(verificationTimestamp)) < 5 * 60 * 1000 
              : false;

            console.log(`📋 [PAGE] Pre-verificación:`, {
              equipmentId: preverifiedEquipmentId,
              fromForm: preverifiedFromForm,
              currentForm: code,
              isValid: isVerificationValid,
            });

            if (preverifiedEquipmentId && isVerificationValid) {
              console.log(`✅ [PAGE] TAG pre-verificado: ${preverifiedEquipmentId}`);
              
              setVerifiedEquipmentId(preverifiedEquipmentId);
              setVerifiedTemplateCode(code);
              
              setSnackbar({
                open: true,
                message: `🔍 Equipo ${preverifiedEquipmentId} ya verificado`,
                severity: 'info'
              });

              setShowTagVerification(false);
            } else {
              console.log(`⚠️ [PAGE] Requiere verificación de TAG`);
              
              // Limpiar datos antiguos
              sessionStorage.removeItem('preverified_equipment_id');
              sessionStorage.removeItem('preverified_from_form');
              sessionStorage.removeItem('verification_timestamp');
              
              setShowTagVerification(true);
            }
          } else if (TEMPLATE_EQUIPMENT_MAP[code]) {
            // Formulario mapeado a tipo de equipo
            if (relatedEquipos.length === 0) {
              // No hay equipos registrados de este tipo → ir directo a Step 2 con datos del usuario
              console.log("⚠️ No hay equipos de este tipo en base de datos. Saltando selección...");
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const prefilledVerification: Record<string, any> = {};
              foundTemplate.verificationFields.forEach(f => {
                if (isAreaField(f.label) && userTrabajador?.area) {
                  prefilledVerification[f.label] = userTrabajador.area;
                } else if (isSuperintendenciaField(f.label) && userTrabajador?.superintendencia) {
                  prefilledVerification[f.label] = userTrabajador.superintendencia;
                }
              });
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              setPrefilledData({ verification: prefilledVerification } as any);
              setStartStep(2);
              setShowSelectionScreen(false);
            } else {
              // Hay equipos → la selección es inline en Step 1, no prefilledData
              setShowSelectionScreen(false);
            }
          } else {
            // Formulario SIN registro de equipos → ir directo a Step 2 (Datos Generales)
            // con los datos del usuario pre-rellenados
            console.log(`✅ [PAGE] Form ${code} sin registro de equipos. Pre-llenando con datos del usuario y saltando a Step 2.`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const prefilledVerification: Record<string, any> = {};
            foundTemplate.verificationFields.forEach(f => {
              if (isAreaField(f.label) && userTrabajador?.area) {
                prefilledVerification[f.label] = userTrabajador.area;
              } else if (isSuperintendenciaField(f.label) && userTrabajador?.superintendencia) {
                prefilledVerification[f.label] = userTrabajador.superintendencia;
              }
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setPrefilledData({ verification: prefilledVerification } as any);
            setStartStep(2);
            setShowTagVerification(false);
            setShowSelectionScreen(false);
          }
        }

        // ============================================
        // 4. VERIFICAR DATOS DUPLICADOS (solo para nuevas)
        // ============================================
        if (!inspectionId) {
          const duplicateKey = `draft_duplicate_${code}`;
          const storedDuplicate = localStorage.getItem(duplicateKey);
          
          if (storedDuplicate) {
            try {
              const parsedData = JSON.parse(storedDuplicate);
              console.log("📋 [PAGE] Datos duplicados encontrados");
              
              setDuplicateData(parsedData);
              localStorage.removeItem(duplicateKey);
              
              setSnackbar({
                open: true,
                message: '📋 Formulario pre-llenado con datos de inspección duplicada',
                severity: 'info'
              });
            } catch (error) {
              console.error("❌ Error al parsear datos duplicados:", error);
            }
          }
        }

      } catch (err) {
        console.error('❌ [PAGE] Error al cargar datos:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [code, inspectionId, user?.username]);

  // ============================================
  // HANDLERS DE LA PANTALLA DE SELECCIÓN INICIAL
  // ============================================

  const handleSkipSelection = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prefilledVerification: Record<string, any> = {};
    if (template) {
      template.verificationFields.forEach(f => {
        if (isAreaField(f.label) && trabajador?.area) {
          prefilledVerification[f.label] = trabajador.area;
        } else if (isSuperintendenciaField(f.label) && trabajador?.superintendencia) {
          prefilledVerification[f.label] = trabajador.superintendencia;
        }
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPrefilledData({ verification: prefilledVerification } as any);
    setStartStep(1);
    setShowSelectionScreen(false);
  };

  const handleSelectionContinue = () => {
    if (!selectedCode) return;
    
    const selectedEquip = equipos.find(e => e.codigo === selectedCode);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prefilledVerification: Record<string, any> = {};
    
    if (template) {
      template.verificationFields.forEach((field) => {
        const value = resolveAutofillValue(field.label, selectedArea, selectedCode, selectedEquip);
        if (value !== undefined) {
          prefilledVerification[field.label] = value;
        }
      });
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPrefilledData({ verification: prefilledVerification } as any);
    setStartStep(2);

    // Actualizar parámetro de URL para iniciar directamente en el Paso 2 (Datos Generales)
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("step", "2");
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState(null, "", newUrl);

    setShowSelectionScreen(false);
  };

  // Filtrar equipos por área seleccionada
  const getFilteredEquipos = () => {
    if (!selectedArea) return equipos;
    const normSelected = selectedArea.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return equipos.filter(e => {
      const areaNombre = e.area_id?.nombre || "";
      const normArea = areaNombre.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return normArea === normSelected || normArea.includes(normSelected) || normSelected.includes(normArea);
    });
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleTagVerified = (result: {
    equipmentId: string;
    openForm: string;
    shouldRedirect: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trackingData?: any;
  }) => {
    console.log('✅ [PAGE] TAG verificado:', result);

    // CASO 1: REDIRECCIÓN A OTRO FORMULARIO
    if (result.shouldRedirect) {
      console.log(`🔄 [PAGE] REDIRECCIÓN: ${code} → ${result.openForm}`);
      
      // Guardar en sessionStorage
      sessionStorage.setItem('preverified_equipment_id', result.equipmentId);
      sessionStorage.setItem('preverified_from_form', code);
      sessionStorage.setItem('verification_timestamp', Date.now().toString());
      
      setShowTagVerification(false);
      
      const newUrl = `/dashboard/form-herra-equipos/${result.openForm}`;
      
      setSnackbar({
        open: true,
        message: `🔄 Redirigiendo a ${result.openForm === '3.04.P37.F25' ? 'Inspección Frecuente' : 'Pre-uso'}...`,
        severity: 'warning'
      });

      setTimeout(() => {
        router.push(newUrl);
      }, 500);
      
      return;
    }

    // CASO 2: SIN REDIRECCIÓN
    console.log('✅ [PAGE] Sin redirección - continuar con formulario actual');
    
    setVerifiedEquipmentId(result.equipmentId);
    setVerifiedTemplateCode(result.openForm);
    setShowTagVerification(false);

    sessionStorage.setItem('preverified_equipment_id', result.equipmentId);
    sessionStorage.setItem('preverified_from_form', code);
    sessionStorage.setItem('verification_timestamp', Date.now().toString());

    if (result.trackingData) {
      const { preUsoCount, usageInterval, remainingUses } = result.trackingData;
      
      setSnackbar({
        open: true,
        message: `📊 Equipo ${result.equipmentId}: ${preUsoCount || 0}/${usageInterval || 6} pre-usos${remainingUses ? ` (faltan ${remainingUses})` : ''}`,
        severity: 'info'
      });
    }
  };

  const handleSaveDraft = async (data: FormDataHerraEquipos) => {
    if (!template) return;

    console.log("💾 [PAGE] GUARDAR BORRADOR");
    
    const formDataWithEquipment = {
      ...data,
      verification: {
        ...data.verification,
        ...(verifiedEquipmentId && { TAG: verifiedEquipmentId })
      }
    };

    setSaving(true);

    try {
      localStorage.setItem(`draft_${code}`, JSON.stringify(formDataWithEquipment));
      
      const result = await saveDraftInspection(
        formDataWithEquipment,
        template._id,
        template.code,
        { templateName: template.name }
      );

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Borrador guardado exitosamente',
          severity: 'success'
        });
        console.log("✅ Borrador guardado:", result.data);
        
        if (result.data?._id) {
          router.push(`/dashboard/form-herra-equipos/${code}/${result.data._id}?step=5`);
        }
        return result.data;
      } else {
        throw new Error(result.error || 'Error al guardar borrador');
      }
    } catch (error) {
      console.error("❌ Error al guardar borrador:", error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al guardar borrador',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ NUEVO: GUARDAR EN PROGRESO (Para andamios)
  const handleSaveProgress = async (data: FormDataHerraEquipos) => {
    if (!template) return;

    console.log("🔄 [PAGE] GUARDAR EN PROGRESO");
    console.log("🏗️ [PAGE] Scaffold data:", {
      routinesCount: data.scaffold?.routineInspections?.length || 0,
      hasFinalConclusion: !!data.scaffold?.finalConclusion,
    });

    const formDataWithEquipment = {
      ...data,
      verification: {
        ...data.verification,
        ...(verifiedEquipmentId && { TAG: verifiedEquipmentId })
      }
    };

    setSaving(true);

    try {
      const result = await saveProgressInspection(
        formDataWithEquipment,
        template._id,
        template.code,
        { templateName: template.name }
      );

      if (result.success) {
        setSnackbar({
          open: true,
          message: '🔄 Andamio guardado como "En Progreso"',
          severity: 'success'
        });


        // Redirigir a lista de andamios en progreso después de 2 segundos
        setTimeout(() => {
          router.push('/dashboard/form-herra-equipos');
        }, 2000);
      } else {
        throw new Error(result.error || 'Error al guardar en progreso');
      }
    } catch (error) {
      console.error("❌ [PAGE] Error al guardar en progreso:", error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al guardar en progreso',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ NUEVO: FINALIZAR INSPECCIÓN (Para andamios en progreso)
  const handleFinalize = async (data: FormDataHerraEquipos) => {
    if (!template) return;


    const formDataWithEquipment = {
      ...data,
      verification: {
        ...data.verification,
        ...(verifiedEquipmentId && { TAG: verifiedEquipmentId })
      }
    };

    setSaving(true);

    try {
      let result;

      // Si está editando una inspección existente
      if (inspectionId) {
        console.log(`🔄 [PAGE] Finalizando inspección existente: ${inspectionId}`);
        result = await finalizeInspection(inspectionId, formDataWithEquipment);
      } else {
        // Si es nueva, enviar directo como completed
        console.log('📤 [PAGE] Enviando como completed');
        result = await submitInspection(
          formDataWithEquipment,
          template._id,
          template.code,
          { templateName: template.name }
        );
      }

      if (result.success) {
        localStorage.removeItem(`draft_${code}`);
        
        // Limpiar sessionStorage
        sessionStorage.removeItem('preverified_equipment_id');
        sessionStorage.removeItem('preverified_from_form');
        sessionStorage.removeItem('verification_timestamp');
        
        console.log('🧹 [PAGE] SessionStorage limpiado');
        
        setSnackbar({
          open: true,
          message: '✅ Inspección finalizada exitosamente',
          severity: 'success'
        });

        console.log("✅ [PAGE] Inspección finalizada:", {
          id: result.data?._id,
          status: result.data?.status,
        });

        setTimeout(() => {
          router.push('/dashboard/form-herra-equipos');
        }, 2000);
      } else {
        throw new Error(result.error || 'Error al finalizar inspección');
      }
    } catch (error) {
      console.error("❌ [PAGE] Error al finalizar:", error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al finalizar inspección',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFinalSubmit = async (data: FormDataHerraEquipos) => {
    if (!template) return;

    console.log("📤 [PAGE] SUBMIT FINAL");
    
    const formDataWithEquipment = {
      ...data,
      verification: {
        ...data.verification,
        ...(verifiedEquipmentId && { TAG: verifiedEquipmentId })
      }
    };

    setSaving(true);

    try {
      const result = await submitInspection(
        formDataWithEquipment,
        template._id,
        template.code,
        { templateName: template.name }
      );

      if (result.success) {
        localStorage.removeItem(`draft_${code}`);
        
        sessionStorage.removeItem('preverified_equipment_id');
        sessionStorage.removeItem('preverified_from_form');
        sessionStorage.removeItem('verification_timestamp');
        
        console.log('🧹 [PAGE] SessionStorage limpiado después de submit');
        
        setSnackbar({
          open: true,
          message: 'Formulario enviado exitosamente',
          severity: 'success'
        });
        
        console.log("✅ [PAGE] Inspección enviada:", result.data);
        
        setTimeout(() => {
          router.push('/dashboard/form-herra-equipos');
        }, 2000);
      } else {
        throw new Error(result.error || 'Error al enviar formulario');
      }
    } catch (error) {
      console.error("❌ [PAGE] Error al enviar formulario:", error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al enviar formulario',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTagVerificationClose = () => {
    console.log('❌ [PAGE] Usuario canceló verificación');
    
    setShowTagVerification(false);
    
    sessionStorage.removeItem('preverified_equipment_id');
    sessionStorage.removeItem('preverified_from_form');
    sessionStorage.removeItem('verification_timestamp');
    
    router.push('/dashboard/form-herra-equipos');
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

  if (error || !template) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Template no encontrado'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard/form-herra-equipos')}
        >
          Volver a la lista
        </Button>
      </Box>
    );
  }

  if (showSelectionScreen && template) {
    const filteredOptions = getFilteredEquipos();
    
    return (
      <Box sx={{ py: 4, px: 2, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <Card sx={{ p: 4, width: "100%", maxWidth: 650, borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
          <CardContent>
            <Typography variant="h5" align="center" fontWeight={700} sx={{ mb: 1, color: "primary.main" }}>
              Formulario de Inspección de Seguridad
            </Typography>
            <Typography variant="subtitle2" align="center" sx={{ mb: 4, opacity: 0.7 }}>
              Código: {template.code} — {template.name}
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }} align="center">
              Seleccione primero el área y el TAG para continuar
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="select-area-label">Área</InputLabel>
                  <Select
                    labelId="select-area-label"
                    value={selectedArea}
                    label="Área"
                    onChange={(e) => {
                      setSelectedArea(e.target.value);
                      setSelectedCode(''); // Reset code when area changes
                    }}
                  >
                    <MenuItem value="">
                      <em>Seleccione un área</em>
                    </MenuItem>
                    {areas.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth disabled={!selectedArea || filteredOptions.length === 0}>
                  <InputLabel id="select-code-label">TAG / Código de Herramienta</InputLabel>
                  <Select
                    labelId="select-code-label"
                    value={selectedCode}
                    label="TAG / Código de Herramienta"
                    onChange={(e) => setSelectedCode(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Seleccione un código</em>
                    </MenuItem>
                    {filteredOptions.map((opt) => (
                      <MenuItem key={opt._id} value={opt.codigo}>
                        {opt.codigo} {opt.descripcion ? `(${opt.descripcion})` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box display="flex" flexDirection="column" gap={2} alignItems="center">
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSelectionContinue}
                disabled={!selectedCode}
                sx={{ py: 1.5, fontWeight: "bold" }}
              >
                Continuar
              </Button>

              <Button
                variant="text"
                color="secondary"
                onClick={handleSkipSelection}
                sx={{ textTransform: "none", fontWeight: 500 }}
              >
                Omitir selección (Inspeccionar equipo nuevo o no registrado)
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                startIcon={<ArrowBack />}
                onClick={() => router.push('/dashboard/form-herra-equipos')}
                sx={{ mt: 1 }}
              >
                Volver a la lista
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const SpecializedComponent = SPECIALIZED_FORMS[template.code];

  // ✅ Determinar initialData: inspección existente o datos duplicados o datos pre-rellenados de selección
  const initialFormData = existingInspection || duplicateData || prefilledData || undefined;

  return (
    <Box>
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
            <Box mt={2}>Guardando...</Box>
          </Box>
        </Box>
      )}

      {/* Modal de verificación TAG */}
      {showTagVerification && template && (
        <TagVerificationModal
          open={showTagVerification}
          onClose={handleTagVerificationClose}
          onVerified={handleTagVerified}
          templateCode={template.code}
          formName={template.name}
        />
      )}

      {/* Indicador de equipo verificado */}
      {verifiedEquipmentId && !existingInspection && (
        <Alert severity="success" sx={{ m: 2 }}>
          🔍 Equipo: <strong>{verifiedEquipmentId}</strong>
          {verifiedTemplateCode === '3.04.P37.F25' && ' - Inspección Frecuente'}
          {verifiedTemplateCode === '3.04.P37.F24' && ' - Inspección Pre-uso'}
        </Alert>
      )}

      {/* Indicador de inspección en progreso */}
      {existingInspection?.status === 'in_progress' && (
        <Alert severity="warning" sx={{ m: 2 }}>
          🔄 <strong>Continuando inspección en progreso</strong>
          {existingInspection.verification?.TAG && ` - Equipo: ${existingInspection.verification.TAG}`}
          {existingInspection.scaffold?.routineInspections && 
            ` - ${existingInspection.scaffold.routineInspections.length} rutinarias registradas`}
        </Alert>
      )}

      {/* Indicador de datos duplicados */}
      {duplicateData && !existingInspection && (
        <Alert severity="info" sx={{ m: 2 }}>
          📋 Formulario pre-llenado con datos de una inspección anterior
        </Alert>
      )}

      {/* Botón volver */}
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => {
          sessionStorage.removeItem('preverified_equipment_id');
          sessionStorage.removeItem('preverified_from_form');
          sessionStorage.removeItem('verification_timestamp');
          router.push('/dashboard/form-herra-equipos');
        }}
        sx={{ m: 2 }}
        disabled={saving}
      >
        Volver a la lista
      </Button>
      
      {/* Formulario */}
      {SpecializedComponent ? (
        <SpecializedComponent
          template={template}
          onSubmit={handleFinalSubmit}
          onSaveDraft={handleSaveDraft}
          onSaveProgress={handleSaveProgress}  // ✅ NUEVO
          onFinalize={handleFinalize}          // ✅ NUEVO
          initialData={initialFormData}        // ✅ Inspección existente o duplicados
          startStep={startStep}
          equipos={equipos}
          areas={areas}
        />
      ) : (
        <FormFiller
          template={template}
          onSubmit={handleFinalSubmit}
          onSaveDraft={handleSaveDraft}
          initialData={initialFormData}
        />
      )}
    </Box>
  );
}
// "use client";

// import React, { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import {
//   Box, CircularProgress, Alert, Button
// } from '@mui/material';
// import { ArrowBack } from '@mui/icons-material';
// import { getTemplatesHerraEquipos } from '@/lib/actions/template-herra-equipos';

// import { FormFiller } from '@/components/features/herra-equipos/FormRenderer';
// import {  FormTemplateHerraEquipos } from '@/components/features/herra-equipos/types/IProps';
// import { UnifiedFormRouter } from '@/components/features/herra-equipos/UnifiedFormRouter';


// // Mapeo de códigos a componentes especializados
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const SPECIALIZED_FORMS: Record<string, React.ComponentType<any>> = {
//   '1.02.P06.F19': UnifiedFormRouter,
//   '1.02.P06.F20': UnifiedFormRouter,
//   '1.02.P06.F39': UnifiedFormRouter,
//   '1.02.P06.F42': UnifiedFormRouter,
//   '1.02.P06.F40': UnifiedFormRouter,
//   '2.03.P10.F05': UnifiedFormRouter,
//   '3.04.P04.F23': UnifiedFormRouter,
//   '3.04.P37.F19': UnifiedFormRouter,
//   '3.04.P37.F24': UnifiedFormRouter,
//   '3.04.P37.F25': UnifiedFormRouter,
//   '3.04.P48.F03': UnifiedFormRouter,
//   '1.02.P06.F37': UnifiedFormRouter,
//   '3.04.P04.F35': UnifiedFormRouter,
//   '1.02.P06.F30': UnifiedFormRouter,
//   '1.02.P06.F33': UnifiedFormRouter
//   // 'ESC-001': EscalerasInspeccionForm,  // Futuro
//   // 'EXT-001': ExtintoresInspeccionForm, // Futuro
// };

// export default function FormularioDinamicoPage() {
//   const params = useParams();
//   const router = useRouter();
//   const code = decodeURIComponent(params.code as string);
  
//   const [template, setTemplate] = useState<FormTemplateHerraEquipos | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [saveMessage, setSaveMessage] = useState<string | null>(null);

//   useEffect(() => {
//   const loadTemplate = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const result = await getTemplatesHerraEquipos();
      
//       if (result.success) {
//         const found = result.data.find((t) => t.code === code);

//         if (found) {
//           setTemplate({
//             ...found,
//             createdAt: new Date(found.createdAt),
//             updatedAt: new Date(found.updatedAt),
//           });
//         } else {
//           setError(`No se encontró el template con codigo: ${code}`);
//         }
//       } else {
//         setError(result.error);
//       }
//     } catch {
//       setError('Error al cargar el template');
//     } finally {
//       setLoading(false);
//     }
//   };

//   loadTemplate();
// }, [code]);

  

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const handleSaveDraft = (data: any) => {
//     console.log('Guardando borrador:', data);
//     setSaveMessage('Borrador guardado exitosamente');
//     setTimeout(() => setSaveMessage(null), 3000);
//     // TODO: Implementar guardado en backend
//   };

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const handleFinalSubmit = (data: any) => {
//     console.log('Enviando formulario:', data);
//     setSaveMessage('Formulario enviado exitosamente');
//     // TODO: Implementar envío a backend
//     setTimeout(() => {
//       router.push('/inspecciones/llenar');
//     }, 2000);
//   };

//   // ============================================
//   // RENDERIZADO CONDICIONAL
//   // ============================================

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error || !template) {
//     return (
//       <Box p={3}>
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error || 'Template no encontrado'}
//         </Alert>
//         <Button
//           variant="outlined"
//           startIcon={<ArrowBack />}
//           onClick={() => router.push('/dashboard/form-med-amb')}
//         >
//           Volver a la lista
//         </Button>
//       </Box>
//     );
//   }

//   // Verificar si el template tiene un componente especializado
//   const SpecializedComponent = SPECIALIZED_FORMS[template.code];

//   if (SpecializedComponent) {
//     // RENDERIZAR FORMULARIO ESPECIALIZADO
//     return (
      
//       <Box>
//         {saveMessage && (
//       <Alert severity="success" sx={{ m: 2 }}>
//         {saveMessage}
//       </Alert>
//     )}
//         <Button
//           variant="outlined"
//           startIcon={<ArrowBack />}
//           onClick={() => router.push('/dashboard/form-med-amb')}
//           sx={{ m: 2 }}
//         >
//           Volver a la lista
//         </Button>
        
//         <SpecializedComponent
//           template={template}
//           onSave={handleSaveDraft}
//           onSubmit={handleFinalSubmit}
//         />
//       </Box>
//     );
//   }

//   // RENDERIZAR FORMULARIO GENÉRICO (FormFiller estándar)
//   return (
//     <Box>
//       <Button
//         variant="outlined"
//         startIcon={<ArrowBack />}
//         onClick={() => router.push('/dashboard/form-med-amb')}
//         sx={{ m: 2 }}
//       >
//         Volver a la lista
//       </Button>
      
//       <FormFiller
//         template={template}
//         onSave={handleSaveDraft}
//         onSubmit={handleFinalSubmit}
//       />
//     </Box>
//   );
// }