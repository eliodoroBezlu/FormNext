// // app/dashboard/form-herra-equipos/[code]/[inspectionId]/page.tsx
// "use client";

// import React, { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import {
//   Box, CircularProgress, Alert, Button, Snackbar
// } from '@mui/material';
// import { ArrowBack } from '@mui/icons-material';
// import { getTemplatesHerraEquipos } from '@/lib/actions/template-herra-equipos';
// import { FormFiller } from '@/components/herra_equipos/FormRenderer';
// import { FormTemplateHerraEquipos, FormDataHerraEquipos } from '@/components/herra_equipos/types/IProps';
// import { UnifiedFormRouter } from '@/components/herra_equipos/UnifiedFormRouter';
// import { 
//   saveDraftInspection, 
//   submitInspection,
//   saveProgressInspection,
//   finalizeInspection,
//   getInspectionById,
//   updateInspection, // ✅ 1. IMPORTAR ESTA FUNCIÓN
// } from '@/lib/actions/inspection-herra-equipos';
// import { TagVerificationModal } from '@/components/herra_equipos/common/TagVerificationModal';

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
// };

// const FORMS_REQUIRING_TAG_VERIFICATION = [
//   '3.04.P37.F24', 
//   '3.04.P37.F25', 
// ];

// export default function FormularioDinamicoPage() {
//   const params = useParams();
//   const router = useRouter();
  
//   const inspectionId = params.inspectionId as string | undefined;
//   const code = decodeURIComponent((params.code || params.templateCode) as string);
  
//   const [template, setTemplate] = useState<FormTemplateHerraEquipos | null>(null);
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const [existingInspection, setExistingInspection] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [saving, setSaving] = useState(false);
  
//   const [showTagVerification, setShowTagVerification] = useState(false);
//   const [verifiedEquipmentId, setVerifiedEquipmentId] = useState<string | null>(null);
//   const [verifiedTemplateCode, setVerifiedTemplateCode] = useState<string | null>(null);
  
//   const [duplicateData, setDuplicateData] = useState<FormDataHerraEquipos | null>(null);
  
//   const [snackbar, setSnackbar] = useState<{
//     open: boolean;
//     message: string;
//     severity: 'success' | 'error' | 'info' | 'warning';
//   }>({
//     open: false,
//     message: '',
//     severity: 'success'
//   });

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         //console.log(`🔍 [PAGE] Cargando - Code: ${code}, InspectionId: ${inspectionId || 'nuevo'}`);

//         // 1. CARGAR TEMPLATE
//         const templatesResult = await getTemplatesHerraEquipos();
//         if (!templatesResult.success) {
//           setError(templatesResult.error || 'Error al cargar templates');
//           return;
//         }

//         const foundTemplate = templatesResult.data.find((t) => t.code === code);
//         if (!foundTemplate) {
//           setError(`No se encontró el template con código: ${code}`);
//           return;
//         }

//         setTemplate({
//           ...foundTemplate,
//           createdAt: new Date(foundTemplate.createdAt),
//           updatedAt: new Date(foundTemplate.updatedAt),
//         });

//         // 2. CARGAR INSPECCIÓN EXISTENTE (SI HAY ID)
//         if (inspectionId) {
//           const inspectionResult = await getInspectionById(inspectionId);
//           if (!inspectionResult.success) throw new Error(inspectionResult.error);

//           setExistingInspection(inspectionResult.data);
          
//           if (inspectionResult.data?.verification?.TAG) {
//             setVerifiedEquipmentId(String(inspectionResult.data.verification.TAG));
//             setVerifiedTemplateCode(foundTemplate.code);
//           }
//           setShowTagVerification(false);

//           if (inspectionResult.data?.status === 'in_progress') {
//             setSnackbar({
//               open: true,
//               message: `🔄 Continuando inspección en progreso`,
//               severity: 'info'
//             });
//           }
//         } 
//         // 3. NUEVA INSPECCIÓN
//         else {
//           const requiresVerification = FORMS_REQUIRING_TAG_VERIFICATION.includes(foundTemplate.code);
//           if (requiresVerification) {
//             const preverifiedEquipmentId = sessionStorage.getItem('preverified_equipment_id');
//             const verificationTimestamp = sessionStorage.getItem('verification_timestamp');
//             const isVerificationValid = verificationTimestamp 
//               ? (Date.now() - parseInt(verificationTimestamp)) < 5 * 60 * 1000 
//               : false;

//             if (preverifiedEquipmentId && isVerificationValid) {
//               setVerifiedEquipmentId(preverifiedEquipmentId);
//               setVerifiedTemplateCode(code);
//               setShowTagVerification(false);
//             } else {
//               setShowTagVerification(true);
//             }
//           } else {
//             setShowTagVerification(false);
//           }

//           // Verificar duplicados para nueva inspección
//           const duplicateKey = `draft_duplicate_${code}`;
//           const storedDuplicate = localStorage.getItem(duplicateKey);
//           if (storedDuplicate) {
//             setDuplicateData(JSON.parse(storedDuplicate));
//             localStorage.removeItem(duplicateKey);
//             setSnackbar({ open: true, message: '📋 Datos pre-llenados', severity: 'info' });
//           }
//         }
//       } catch (err) {
//         console.error('❌ [PAGE] Error:', err);
//         setError(err instanceof Error ? err.message : 'Error desconocido');
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, [code, inspectionId]);

//   const handleTagVerified = (result: {
//     equipmentId: string;
//     openForm: string;
//     shouldRedirect: boolean;
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     trackingData?: any;
//   }) => {
//     if (result.shouldRedirect) {
//       sessionStorage.setItem('preverified_equipment_id', result.equipmentId);
//       sessionStorage.setItem('preverified_from_form', code);
//       sessionStorage.setItem('verification_timestamp', Date.now().toString());
//       setShowTagVerification(false);
//       router.push(`/dashboard/form-herra-equipos/${result.openForm}`);
//       return;
//     }

//     setVerifiedEquipmentId(result.equipmentId);
//     setVerifiedTemplateCode(result.openForm);
//     setShowTagVerification(false);
//     sessionStorage.setItem('preverified_equipment_id', result.equipmentId);
//     sessionStorage.setItem('preverified_from_form', code);
//     sessionStorage.setItem('verification_timestamp', Date.now().toString());
//   };

//   const handleSaveDraft = async (data: FormDataHerraEquipos) => {
//     if (!template) return;
//     const formDataWithEquipment = {
//       ...data,
//       verification: { ...data.verification, ...(verifiedEquipmentId && { TAG: verifiedEquipmentId }) }
//     };
//     setSaving(true);
//     try {
//       localStorage.setItem(`draft_${code}`, JSON.stringify(formDataWithEquipment));
//       const result = await saveDraftInspection(formDataWithEquipment, template._id, template.code, { templateName: template.name });
//       if (result.success) setSnackbar({ open: true, message: 'Borrador guardado', severity: 'success' });
//     } catch (error) {
//       setSnackbar({ open: true, message: 'Error al guardar borrador', severity: 'error' });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSaveProgress = async (data: FormDataHerraEquipos) => {
//     if (!template) return;
//     const formDataWithEquipment = {
//       ...data,
//       verification: { ...data.verification, ...(verifiedEquipmentId && { TAG: verifiedEquipmentId }) }
//     };
//     setSaving(true);
//     try {
//       const result = await saveProgressInspection(formDataWithEquipment, template._id, template.code, { templateName: template.name });
//       if (result.success) {
//         setSnackbar({ open: true, message: 'Guardado en Progreso', severity: 'success' });
//         setTimeout(() => router.push('/dashboard/form-herra-equipos'), 2000);
//       }
//     } catch (error) {
//       setSnackbar({ open: true, message: 'Error al guardar', severity: 'error' });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleFinalize = async (data: FormDataHerraEquipos) => {
//     if (!template) return;
//     const formDataWithEquipment = {
//       ...data,
//       verification: { ...data.verification, ...(verifiedEquipmentId && { TAG: verifiedEquipmentId }) }
//     };
//     setSaving(true);
//     try {
//       let result;
//       if (inspectionId) {
//         result = await finalizeInspection(inspectionId, formDataWithEquipment);
//       } else {
//         result = await submitInspection(formDataWithEquipment, template._id, template.code, { templateName: template.name });
//       }
//       if (result.success) {
//         localStorage.removeItem(`draft_${code}`);
//         sessionStorage.removeItem('preverified_equipment_id');
//         setSnackbar({ open: true, message: 'Inspección finalizada', severity: 'success' });
//         setTimeout(() => router.push('/dashboard/form-herra-equipos'), 2000);
//       }
//     } catch (error) {
//       setSnackbar({ open: true, message: 'Error al finalizar', severity: 'error' });
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ✅ 2. CORREGIDO: Manejo de submit (Update vs Create)
//   const handleFinalSubmit = async (data: FormDataHerraEquipos) => {
//     if (!template) return;

//     console.log("📤 [PAGE] SUBMIT FINAL - Data Status:", data.status);
    
//     const formDataWithEquipment = {
//       ...data,
//       verification: {
//         ...data.verification,
//         ...(verifiedEquipmentId && { TAG: verifiedEquipmentId })
//       }
//     };

//     setSaving(true);

//     try {
//       let result;

//       // CASO A: SI EXISTE ID, ES UNA ACTUALIZACIÓN (PATCH)
//       if (inspectionId) {
//         console.log(`🔄 [PAGE] Actualizando inspección existente (Submit): ${inspectionId}`);
//         // Aquí pasamos el estado que viene del formulario (approved/rejected)
//         result = await updateInspection(inspectionId, formDataWithEquipment);
//       } 
//       // CASO B: SI NO EXISTE ID, ES NUEVA (POST)
//       else {
//         console.log("🆕 [PAGE] Creando nueva inspección (Submit)");
//         result = await submitInspection(
//           formDataWithEquipment,
//           template._id,
//           template.code,
//           { templateName: template.name }
//         );
//       }

//       if (result.success) {
//         localStorage.removeItem(`draft_${code}`);
//         sessionStorage.removeItem('preverified_equipment_id');
        
//         setSnackbar({
//           open: true,
//           message: 'Formulario enviado exitosamente',
//           severity: 'success'
//         });
        
//         setTimeout(() => {
//           router.push('/dashboard/form-herra-equipos');
//         }, 2000);
//       } else {
//         throw new Error(result.error || 'Error al enviar formulario');
//       }
//     } catch (error) {
//       console.error("❌ [PAGE] Error al enviar formulario:", error);
//       setSnackbar({
//         open: true,
//         message: error instanceof Error ? error.message : 'Error al enviar formulario',
//         severity: 'error'
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>;

//   if (error || !template) return <Box p={3}><Alert severity="error">{error || 'Template no encontrado'}</Alert><Button startIcon={<ArrowBack />} onClick={() => router.push('/dashboard/form-herra-equipos')}>Volver</Button></Box>;

//   const SpecializedComponent = SPECIALIZED_FORMS[template.code];
//   const initialFormData = existingInspection || duplicateData || undefined;

//   return (
//     <Box>
//       <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
//         <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
//       </Snackbar>

//       {saving && (
//         <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
//           <Box textAlign="center" bgcolor="white" p={4} borderRadius={2}><CircularProgress /><Box mt={2}>Procesando...</Box></Box>
//         </Box>
//       )}

//       {showTagVerification && template && (
//         <TagVerificationModal open={showTagVerification} onClose={() => router.push('/dashboard/form-herra-equipos')} onVerified={handleTagVerified} templateCode={template.code} formName={template.name} />
//       )}

//       {verifiedEquipmentId && !existingInspection && <Alert severity="success" sx={{ m: 2 }}>🔍 Equipo: <strong>{verifiedEquipmentId}</strong></Alert>}
//       {existingInspection?.status === 'in_progress' && <Alert severity="warning" sx={{ m: 2 }}>🔄 <strong>Continuando inspección en progreso</strong></Alert>}
//       {duplicateData && !existingInspection && <Alert severity="info" sx={{ m: 2 }}>📋 Formulario pre-llenado</Alert>}

//       <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => router.push('/dashboard/form-herra-equipos')} sx={{ m: 2 }} disabled={saving}>Volver a la lista</Button>
      
//       {SpecializedComponent ? (
//         <SpecializedComponent
//           template={template}
//           onSubmit={handleFinalSubmit}
//           onSaveDraft={handleSaveDraft}
//           onSaveProgress={handleSaveProgress}
//           onFinalize={handleFinalize}
//           initialData={initialFormData}
//         />
//       ) : (
//         <FormFiller
//           template={template}
//           onSubmit={handleFinalSubmit}
//           onSaveDraft={handleSaveDraft}
//           initialData={initialFormData}
//         />
//       )}
//     </Box>
//   );
// }


// app/dashboard/form-herra-equipos/[code]/[inspectionId]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, CircularProgress, Alert, Button, Snackbar
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { getTemplatesHerraEquipos } from '@/lib/actions/template-herra-equipos';
import { FormFiller } from '@/components/herra_equipos/FormRenderer';
import { FormTemplateHerraEquipos, FormDataHerraEquipos } from '@/components/herra_equipos/types/IProps';
import { UnifiedFormRouter } from '@/components/herra_equipos/UnifiedFormRouter';
import { 
  saveDraftInspection, 
  submitInspection,
  saveProgressInspection,
  finalizeInspection,
  getInspectionById,
  updateInspection,
} from '@/lib/actions/inspection-herra-equipos';
import { TagVerificationModal } from '@/components/herra_equipos/common/TagVerificationModal';

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

const FORMS_REQUIRING_TAG_VERIFICATION = [
  '3.04.P37.F24', 
  '3.04.P37.F25', 
];

export default function FormularioDinamicoPage() {
  const params = useParams();
  const router = useRouter();
  
  const inspectionId = params.inspectionId as string | undefined;
  const code = decodeURIComponent((params.code || params.templateCode) as string);
  
  const [template, setTemplate] = useState<FormTemplateHerraEquipos | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [existingInspection, setExistingInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [showTagVerification, setShowTagVerification] = useState(false);
  const [verifiedEquipmentId, setVerifiedEquipmentId] = useState<string | null>(null);
  
  const [duplicateData, setDuplicateData] = useState<FormDataHerraEquipos | null>(null);
  
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
        //console.log(`🔍 [PAGE] Cargando - Code: ${code}, InspectionId: ${inspectionId || 'nuevo'}`);

        // 1. CARGAR TEMPLATE
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

        // 2. CARGAR INSPECCIÓN EXISTENTE (SI HAY ID)
        if (inspectionId) {
          const inspectionResult = await getInspectionById(inspectionId);
          if (!inspectionResult.success) throw new Error(inspectionResult.error);

          setExistingInspection(inspectionResult.data);
          
          if (inspectionResult.data?.verification?.TAG) {
            setVerifiedEquipmentId(String(inspectionResult.data.verification.TAG));
          }
          setShowTagVerification(false);

          if (inspectionResult.data?.status === 'in_progress') {
            setSnackbar({
              open: true,
              message: `🔄 Continuando inspección en progreso`,
              severity: 'info'
            });
          }
        } 
        // 3. NUEVA INSPECCIÓN
        else {
          const requiresVerification = FORMS_REQUIRING_TAG_VERIFICATION.includes(foundTemplate.code);
          if (requiresVerification) {
            const preverifiedEquipmentId = sessionStorage.getItem('preverified_equipment_id');
            const verificationTimestamp = sessionStorage.getItem('verification_timestamp');
            const isVerificationValid = verificationTimestamp 
              ? (Date.now() - parseInt(verificationTimestamp)) < 5 * 60 * 1000 
              : false;

            if (preverifiedEquipmentId && isVerificationValid) {
              setVerifiedEquipmentId(preverifiedEquipmentId);
              setShowTagVerification(false);
            } else {
              setShowTagVerification(true);
            }
          } else {
            setShowTagVerification(false);
          }

          // Verificar duplicados para nueva inspección
          const duplicateKey = `draft_duplicate_${code}`;
          const storedDuplicate = localStorage.getItem(duplicateKey);
          if (storedDuplicate) {
            setDuplicateData(JSON.parse(storedDuplicate));
            localStorage.removeItem(duplicateKey);
            setSnackbar({ open: true, message: '📋 Datos pre-llenados', severity: 'info' });
          }
        }
      } catch (err) {
        console.error('❌ [PAGE] Error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [code, inspectionId]);

  const handleTagVerified = (result: {
    equipmentId: string;
    openForm: string;
    shouldRedirect: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trackingData?: any;
  }) => {
    if (result.shouldRedirect) {
      sessionStorage.setItem('preverified_equipment_id', result.equipmentId);
      sessionStorage.setItem('preverified_from_form', code);
      sessionStorage.setItem('verification_timestamp', Date.now().toString());
      setShowTagVerification(false);
      router.push(`/dashboard/form-herra-equipos/${result.openForm}`);
      return;
    }

    setVerifiedEquipmentId(result.equipmentId);
    setShowTagVerification(false);
    sessionStorage.setItem('preverified_equipment_id', result.equipmentId);
    sessionStorage.setItem('preverified_from_form', code);
    sessionStorage.setItem('verification_timestamp', Date.now().toString());
  };

  const handleSaveDraft = async (data: FormDataHerraEquipos) => {
    if (!template) return;
    const formDataWithEquipment = {
      ...data,
      verification: { ...data.verification, ...(verifiedEquipmentId && { TAG: verifiedEquipmentId }) }
    };
    setSaving(true);
    try {
      localStorage.setItem(`draft_${code}`, JSON.stringify(formDataWithEquipment));
      const result = await saveDraftInspection(formDataWithEquipment, template._id, template.code, { templateName: template.name });
      if (result.success) setSnackbar({ open: true, message: 'Borrador guardado', severity: 'success' });
    } catch (err) {
      console.error('Error al guardar borrador:', err);
      setSnackbar({ open: true, message: 'Error al guardar borrador', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProgress = async (data: FormDataHerraEquipos) => {
    if (!template) return;
    const formDataWithEquipment = {
      ...data,
      verification: { ...data.verification, ...(verifiedEquipmentId && { TAG: verifiedEquipmentId }) }
    };
    setSaving(true);
    try {
      const result = await saveProgressInspection(formDataWithEquipment, template._id, template.code, { templateName: template.name });
      if (result.success) {
        setSnackbar({ open: true, message: 'Guardado en Progreso', severity: 'success' });
        setTimeout(() => router.push('/dashboard/form-herra-equipos'), 2000);
      }
    } catch (err) {
      console.error('Error al guardar progreso:', err);
      setSnackbar({ open: true, message: 'Error al guardar', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async (data: FormDataHerraEquipos) => {
    if (!template) return;
    const formDataWithEquipment = {
      ...data,
      verification: { ...data.verification, ...(verifiedEquipmentId && { TAG: verifiedEquipmentId }) }
    };
    setSaving(true);
    try {
      let result;
      if (inspectionId) {
        result = await finalizeInspection(inspectionId, formDataWithEquipment);
      } else {
        result = await submitInspection(formDataWithEquipment, template._id, template.code, { templateName: template.name });
      }
      if (result.success) {
        localStorage.removeItem(`draft_${code}`);
        sessionStorage.removeItem('preverified_equipment_id');
        setSnackbar({ open: true, message: 'Inspección finalizada', severity: 'success' });
        setTimeout(() => router.push('/dashboard/form-herra-equipos'), 2000);
      }
    } catch (err) {
      console.error('Error al finalizar:', err);
      setSnackbar({ open: true, message: 'Error al finalizar', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleFinalSubmit = async (data: FormDataHerraEquipos) => {
    if (!template) return;

    console.log("📤 [PAGE] SUBMIT FINAL - Data Status:", data.status);
    
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

      // CASO A: SI EXISTE ID, ES UNA ACTUALIZACIÓN (PATCH)
      if (inspectionId) {
        console.log(`🔄 [PAGE] Actualizando inspección existente (Submit): ${inspectionId}`);
        result = await updateInspection(inspectionId, formDataWithEquipment);
      } 
      // CASO B: SI NO EXISTE ID, ES NUEVA (POST)
      else {
        console.log("🆕 [PAGE] Creando nueva inspección (Submit)");
        result = await submitInspection(
          formDataWithEquipment,
          template._id,
          template.code,
          { templateName: template.name }
        );
      }

      if (result.success) {
        localStorage.removeItem(`draft_${code}`);
        sessionStorage.removeItem('preverified_equipment_id');
        
        setSnackbar({
          open: true,
          message: 'Formulario enviado exitosamente',
          severity: 'success'
        });
        
        setTimeout(() => {
          router.push('/dashboard/form-herra-equipos');
        }, 2000);
      } else {
        throw new Error(result.error || 'Error al enviar formulario');
      }
    } catch (err) {
      console.error("❌ [PAGE] Error al enviar formulario:", err);
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Error al enviar formulario',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>;

  if (error || !template) return <Box p={3}><Alert severity="error">{error || 'Template no encontrado'}</Alert><Button startIcon={<ArrowBack />} onClick={() => router.push('/dashboard/form-herra-equipos')}>Volver</Button></Box>;

  const SpecializedComponent = SPECIALIZED_FORMS[template.code];
  const initialFormData = existingInspection || duplicateData || undefined;

  return (
    <Box>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>

      {saving && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <Box textAlign="center" bgcolor="white" p={4} borderRadius={2}><CircularProgress /><Box mt={2}>Procesando...</Box></Box>
        </Box>
      )}

      {showTagVerification && template && (
        <TagVerificationModal open={showTagVerification} onClose={() => router.push('/dashboard/form-herra-equipos')} onVerified={handleTagVerified} templateCode={template.code} formName={template.name} />
      )}

      {verifiedEquipmentId && !existingInspection && <Alert severity="success" sx={{ m: 2 }}>🔍 Equipo: <strong>{verifiedEquipmentId}</strong></Alert>}
      {existingInspection?.status === 'in_progress' && <Alert severity="warning" sx={{ m: 2 }}>🔄 <strong>Continuando inspección en progreso</strong></Alert>}
      {duplicateData && !existingInspection && <Alert severity="info" sx={{ m: 2 }}>📋 Formulario pre-llenado</Alert>}

      <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => router.push('/dashboard/form-herra-equipos')} sx={{ m: 2 }} disabled={saving}>Volver a la lista</Button>
      
      {SpecializedComponent ? (
        <SpecializedComponent
          template={template}
          onSubmit={handleFinalSubmit}
          onSaveDraft={handleSaveDraft}
          onSaveProgress={handleSaveProgress}
          onFinalize={handleFinalize}
          initialData={initialFormData}
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