// "use client";

// import React, { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import {
//   Box, CircularProgress, Alert, Button
// } from '@mui/material';
// import { ArrowBack } from '@mui/icons-material';
// import { getTemplatesHerraEquipos } from '@/lib/actions/template-herra-equipos';
// import { FormFiller } from '@/components/herra_equipos/FormRenderer';
// import { FormTemplateHerraEquipos, FormDataHerraEquipos } from '@/components/herra_equipos/types/IProps';
// import { UnifiedFormRouter } from '@/components/herra_equipos/UnifiedFormRouter';

// // Mapeo de códigos a componentes especializados
// const SPECIALIZED_FORMS: Record<string, React.ComponentType<{
//   template: FormTemplateHerraEquipos;
//   onSubmit: (data: FormDataHerraEquipos) => void;
//   onSaveDraft?: (data: FormDataHerraEquipos) => void;
// }>> = {
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

// export default function FormularioDinamicoPage() {
//   const params = useParams();
//   const router = useRouter();
//   const code = decodeURIComponent(params.code as string);
  
//   const [template, setTemplate] = useState<FormTemplateHerraEquipos | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [saveMessage, setSaveMessage] = useState<string | null>(null);

//   useEffect(() => {
//     const loadTemplate = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const result = await getTemplatesHerraEquipos();
        
//         if (result.success) {
//           const found = result.data.find((t) => t.code === code);

//           if (found) {
//             setTemplate({
//               ...found,
//               createdAt: new Date(found.createdAt),
//               updatedAt: new Date(found.updatedAt),
//             });
//           } else {
//             setError(`No se encontró el template con codigo: ${code}`);
//           }
//         } else {
//           setError(result.error);
//         }
//       } catch {
//         setError('Error al cargar el template');
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadTemplate();
//   }, [code]);

//   // ✅ Handler para guardar borrador con logs detallados
//   const handleSaveDraft = (data: FormDataHerraEquipos) => {
//     console.log("=".repeat(60));
//     console.log("💾 [PÁGINA] GUARDAR BORRADOR");
//     console.log("=".repeat(60));
//     console.log("Template Code:", code);
//     console.log("\n📋 1. Datos de Verificación:");
//     console.log(JSON.stringify(data.verification, null, 2));
    
//     console.log("\n✅ 2. Subsecciones Seleccionadas:");
//     if (data.selectedItems) {
//       console.table(data.selectedItems);
//       console.log("JSON:", JSON.stringify(data.selectedItems, null, 2));
//     } else {
//       console.log("No hay subsecciones seleccionadas");
//     }
    
//     console.log("\n📝 3. Respuestas:");
//     console.log(JSON.stringify(data.responses, null, 2));
    
//     console.log("\n💬 4. Observaciones:");
//     console.log(data.generalObservations || "Sin observaciones");
    
//     console.log("\n✍️ 5. Firmas:");
//     console.log("Inspector:", data.inspectorSignature ? "✓ Firmado" : "✗ Sin firmar");
//     console.log("Supervisor:", data.supervisorSignature ? "✓ Firmado" : "✗ Sin firmar");
    
//     console.log("\n📦 6. Objeto completo:");
//     console.log(data);
//     console.log("=".repeat(60));

//     // Guardar en localStorage para no perder datos
//     try {
//       localStorage.setItem(`draft_${code}`, JSON.stringify(data));
//       console.log("✅ Borrador guardado en localStorage");
//     } catch (e) {
//       console.error("❌ Error al guardar en localStorage:", e);
//     }

//     setSaveMessage('Borrador guardado exitosamente');
//     setTimeout(() => setSaveMessage(null), 3000);
    
//     // TODO: Implementar guardado en backend
//     // await saveDraftToAPI(code, data);
//   };

//   // ✅ Handler para submit final con logs detallados
//   const handleFinalSubmit = (data: FormDataHerraEquipos) => {
//     console.log("=".repeat(60));
//     console.log("📤 [PÁGINA] SUBMIT FINAL");
//     console.log("=".repeat(60));
//     console.log("Template Code:", code);
    
//     console.log("\n✅ Subsecciones Seleccionadas:");
//     if (data.selectedItems) {
//       console.table(data.selectedItems);
      
//       // Mostrar cuántas subsecciones por sección
//       Object.entries(data.selectedItems).forEach(([section, items]) => {
//         console.log(`📂 ${section}: ${items.length} subsección(es) seleccionada(s)`);
//         items.forEach(item => console.log(`   ✓ ${item}`));
//       });
//     }
    
//     console.log("\n📦 Payload completo para API:");
//     const payload = {
//       templateId: template?._id,
//       templateCode: code,
//       verification: data.verification,
//       selectedItems: data.selectedItems,
//       responses: data.responses,
//       generalObservations: data.generalObservations,
//       outOfService: data.outOfService,
//       inspectorSignature: data.inspectorSignature,
//       supervisorSignature: data.supervisorSignature,
//       submittedAt: new Date().toISOString(),
//       status: "completed"
//     };
//     console.log(JSON.stringify(payload, null, 2));
//     console.log("=".repeat(60));

//     setSaveMessage('Formulario enviado exitosamente');
    
//     // TODO: Implementar envío a backend
//     // await submitInspectionToAPI(payload);
    
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
//           <Alert severity="success" sx={{ m: 2 }}>
//             {saveMessage}
//           </Alert>
//         )}
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
//           onSubmit={handleFinalSubmit}
//           onSaveDraft={handleSaveDraft}
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
//         onSubmit={handleFinalSubmit}
//         onSaveDraft={handleSaveDraft}
//       />
//     </Box>
//   );
// }


"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, CircularProgress, Alert, Button
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { getTemplatesHerraEquipos } from '@/lib/actions/template-herra-equipos';

import { FormFiller } from '@/components/herra_equipos/FormRenderer';
import {  FormTemplateHerraEquipos } from '@/components/herra_equipos/types/IProps';
import { UnifiedFormRouter } from '@/components/herra_equipos/UnifiedFormRouter';


// Mapeo de códigos a componentes especializados
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SPECIALIZED_FORMS: Record<string, React.ComponentType<any>> = {
  '1.02.P06.F19': UnifiedFormRouter, // arenes
  '1.02.P06.F20': UnifiedFormRouter,
  '1.02.P06.F39':UnifiedFormRouter,
  '1.02.P06.F42':UnifiedFormRouter,
  '1.02.P06.F40':UnifiedFormRouter,
  '2.03.P10.F05':UnifiedFormRouter,
  '3.04.P04.F23':UnifiedFormRouter,
  '3.04.P37.F19':UnifiedFormRouter,
  '3.04.P37.F24':UnifiedFormRouter,
  '3.04.P37.F25':UnifiedFormRouter,
  '3.04.P48.F03':UnifiedFormRouter,
  '1.02.P06.F37':UnifiedFormRouter,
  '3.04.P04.F35':UnifiedFormRouter,
  // 'ESC-001': EscalerasInspeccionForm,  // Futuro
  // 'EXT-001': ExtintoresInspeccionForm, // Futuro
};

export default function FormularioDinamicoPage() {
  const params = useParams();
  const router = useRouter();
  const code = decodeURIComponent(params.code as string);
  
  const [template, setTemplate] = useState<FormTemplateHerraEquipos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
  const loadTemplate = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getTemplatesHerraEquipos();
      
      if (result.success) {
        const found = result.data.find((t) => t.code === code);

        if (found) {
          setTemplate({
            ...found,
            createdAt: new Date(found.createdAt),
            updatedAt: new Date(found.updatedAt),
          });
        } else {
          setError(`No se encontró el template con codigo: ${code}`);
        }
      } else {
        setError(result.error);
      }
    } catch {
      setError('Error al cargar el template');
    } finally {
      setLoading(false);
    }
  };

  loadTemplate();
}, [code]);

  

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveDraft = (data: any) => {
    console.log('Guardando borrador:', data);
    setSaveMessage('Borrador guardado exitosamente');
    setTimeout(() => setSaveMessage(null), 3000);
    // TODO: Implementar guardado en backend
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFinalSubmit = (data: any) => {
    console.log('Enviando formulario:', data);
    setSaveMessage('Formulario enviado exitosamente');
    // TODO: Implementar envío a backend
    setTimeout(() => {
      router.push('/inspecciones/llenar');
    }, 2000);
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

  if (error || !template) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Template no encontrado'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard/form-med-amb')}
        >
          Volver a la lista
        </Button>
      </Box>
    );
  }

  // Verificar si el template tiene un componente especializado
  const SpecializedComponent = SPECIALIZED_FORMS[template.code];

  if (SpecializedComponent) {
    // RENDERIZAR FORMULARIO ESPECIALIZADO
    return (
      
      <Box>
        {saveMessage && (
      <Alert severity="success" sx={{ m: 2 }}>
        {saveMessage}
      </Alert>
    )}
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard/form-med-amb')}
          sx={{ m: 2 }}
        >
          Volver a la lista
        </Button>
        
        <SpecializedComponent
          template={template}
          onSave={handleSaveDraft}
          onSubmit={handleFinalSubmit}
        />
      </Box>
    );
  }

  // RENDERIZAR FORMULARIO GENÉRICO (FormFiller estándar)
  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => router.push('/dashboard/form-med-amb')}
        sx={{ m: 2 }}
      >
        Volver a la lista
      </Button>
      
      <FormFiller
        template={template}
        onSave={handleSaveDraft}
        onSubmit={handleFinalSubmit}
      />
    </Box>
  );
}