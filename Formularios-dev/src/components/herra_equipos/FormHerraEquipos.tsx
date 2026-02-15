// "use client";

// import React, { useEffect, useState, Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import { useUserRole } from '@/hooks/useUserRole';
// import { 
//   Box, Typography, Card, CardContent, Button, 
//   CircularProgress, Alert, Grid, Chip, CardActions,
//   Tabs, Tab, Badge
// } from '@mui/material';
// import { getTemplatesHerraEquipos } from '@/lib/actions/template-herra-equipos';
// import { getInProgressInspections, getPendingApprovals } from '@/lib/actions/inspection-herra-equipos';
// import { Assignment, Science, Construction, Add, Pending } from '@mui/icons-material';
// import { FormTemplateHerraEquipos } from '@/components/herra_equipos/types/IProps';
// import { InProgressInspectionsList } from '@/components/herra_equipos/InProgressInspectionsList';
// import { PendingApprovalsList } from '@/components/herra_equipos/PendingApprovalsList';

// import { SuccessScreen } from '@/components/SucessScreen';

// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: number;
//   value: number;
// }

// function TabPanel({ children, value, index }: TabPanelProps) {
//   return (
//     <div hidden={value !== index}>
//       {value === index && <Box>{children}</Box>}
//     </div>
//   );
// }

// function LlenarFormulariosContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { data: session } = useSession();
//   const { hasRole } = useUserRole();
  
//   const canViewApprovals = hasRole('supervisor') || hasRole('admin') || hasRole('superintendente');

//   const [selectedTab, setSelectedTab] = useState(0);
//   const [templates, setTemplates] = useState<FormTemplateHerraEquipos[]>([]);
//   const [inProgressCount, setInProgressCount] = useState(0);
//   const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [showSuccess, setShowSuccess] = useState(false);
//   const [successData, setSuccessData] = useState({ title: '', message: '' });

//   const SPECIAL_FORMS = ['ARN-001', 'ESC-001', 'EXT-001'];
//   const SCAFFOLD_FORM = '1.02.P06.F30';

//   // ========================================
//   // CARGAR DATOS COMPLETOS (solo una vez)
//   // ========================================
//   const loadInitialData = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       const templatesResult = await getTemplatesHerraEquipos();
//       if (!templatesResult.success) throw new Error(templatesResult.error);

//       setTemplates(templatesResult.data.map(t => ({
//         ...t,
//         createdAt: new Date(t.createdAt),
//         updatedAt: new Date(t.updatedAt),
//       })));

//       await refreshCounts(); // ← Solo contadores
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Error al cargar datos');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ========================================
//   // REFRESCAR SOLO CONTADORES (rápido y sin recargar página)
//   // ========================================
//   const refreshCounts = async () => {
//     try {
//       const [inProgressResult, pendingResult] = await Promise.all([
//         getInProgressInspections({ templateCode: SCAFFOLD_FORM }),
//         canViewApprovals 
//           ? getPendingApprovals(session?.user?.name || "")
//           : Promise.resolve({ success: true, data: [] })
//       ]);

//       if (inProgressResult.success) {
//         setInProgressCount(inProgressResult.data?.length || 0);
//       }
//       if (pendingResult.success) {
//         setPendingApprovalCount(pendingResult.data?.length || 0);
//       }
//     } catch (err) {
//       console.error("Error refrescando contadores:", err);
//     }
//   };

//   // ========================================
//   // Carga inicial
//   // ========================================
//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   // ========================================
//   // Sincronizar tab con URL (SIN BUCLE)
//   // ========================================
//   useEffect(() => {
//     const tab = searchParams.get('tab');
//     let targetTab = 0;

//     if (tab === 'in-progress') {
//       targetTab = 1;
//     } else if (tab === 'pending-approval') {
//       if (canViewApprovals) {
//         targetTab = 2;
//       } else {
//         // Solo redirigir si estamos en URL prohibida
//         router.replace('/dashboard/form-herra-equipos', { scroll: false });
//         targetTab = 0;
//       }
//     }

//     if (selectedTab !== targetTab) {
//       setSelectedTab(targetTab);
//     }
//   }, [searchParams, canViewApprovals, selectedTab, router]);

//   // ========================================
//   // Refrescar contadores al cambiar a tab de aprobaciones
//   // ========================================
//   useEffect(() => {
//     if (selectedTab === 2 && canViewApprovals) {
//       refreshCounts();
//     }
//   }, [selectedTab, canViewApprovals]);

//   // ========================================
//   // Cambio de tab → actualizar URL
//   // ========================================
//   const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
//     setSelectedTab(newValue);

//     const base = '/dashboard/form-herra-equipos';
//     let url = base;

//     if (newValue === 1) {
//       url += '?tab=in-progress';
//     } else if (newValue === 2 && canViewApprovals) {
//       url += '?tab=pending-approval';
//     }

//     // Evitar bucle: solo navegar si la URL cambió
//     const currentUrl = `${window.location.pathname}${window.location.search}`;
//     if (currentUrl !== url) {
//       router.push(url, { scroll: false });
//     }
//   };

//   const handleSelectTemplate = (template: FormTemplateHerraEquipos) => {
//     router.push(`/dashboard/form-herra-equipos/${template.code}`);
//   };

//   const handleOperationSuccess = (message: string) => {
//     setSuccessData({
//         title: "¡Operación Exitosa!",
//         message: message
//     });
//     setShowSuccess(true);
//     refreshCounts(); // Actualizar contadores
//   };

//   if (showSuccess) {
//     return (
//         <SuccessScreen
//             title={successData.title}
//             message={successData.message}
//             subtitle="Los cambios se han guardado correctamente."
//             autoRedirect={false} // No redirigir, solo mostrar
//             onBackToList={() => setShowSuccess(false)} // Botón "Volver" cierra la pantalla
//             listLabel="Volver a la Lista"
//             onGoHome={() => router.push('/dashboard')}
//         />
//     );
//   }

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box p={3}>
//         <Alert severity="error" onClose={() => setError(null)}>
//           {error}
//         </Alert>
//       </Box>
//     );
//   }

//   return (
//     <Box p={3}>
//       {/* Tabs */}
//       <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
//         <Tabs value={selectedTab} onChange={handleTabChange} aria-label="inspections tabs">
//           <Tab icon={<Add />} iconPosition="start" label="Nueva Inspección" />
          
//           <Tab 
//             icon={
//               <Badge badgeContent={inProgressCount} color="warning">
//                 <Construction />
//               </Badge>
//             }
//             iconPosition="start"
//             label="Andamios en Progreso"
//           />
          
//           {canViewApprovals && (
//             <Tab 
//               icon={
//                 <Badge badgeContent={pendingApprovalCount} color="error">
//                   <Pending />
//                 </Badge>
//               }
//               iconPosition="start"
//               label="Pendientes de Aprobación"
//             />
//           )}
//         </Tabs>
//       </Box>

//       {/* Tab 0: Templates */}
//       <TabPanel value={selectedTab} index={0}>
//         {templates.length === 0 ? (
//           <Alert severity="info">
//             No hay templates disponibles. Primero debes crear templates en la gestión de templates.
//           </Alert>
//         ) : (
//           <Grid container spacing={3}>
//             {templates.map((template) => {
//               const isScaffold = template.code === SCAFFOLD_FORM;
              
//               return (
//                 <Grid size={{xs:12, md:4}} key={template._id}>
//                   <Card sx={{ 
//                     height: '100%', 
//                     display: 'flex', 
//                     flexDirection: 'column',
//                     border: SPECIAL_FORMS.includes(template.code)
//                       ? '2px solid #1976d2' 
//                       : isScaffold ? '2px solid #ed6c02' : 'none',
//                     position: 'relative',
//                   }}>
//                     {isScaffold && inProgressCount > 0 && (
//                       <Chip label={`${inProgressCount} en uso`} color="warning" size="small"
//                         sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
//                       />
//                     )}

//                     <CardContent sx={{ flexGrow: 1 }}>
//                       <Box display="flex" alignItems="center" gap={1} mb={2}>
//                         {SPECIAL_FORMS.includes(template.code) ? <Science color="primary" /> :
//                          isScaffold ? <Construction color="warning" /> : <Assignment />}
//                         <Typography variant="h6">{template.name}</Typography>
//                       </Box>

//                       <Box mb={2}>
//                         <Typography variant="body2" color="text.secondary" gutterBottom>
//                           <strong>Código:</strong> {template.code}
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary" gutterBottom>
//                           <strong>Revisión:</strong> {template.revision}
//                         </Typography>
//                       </Box>

//                       <Box display="flex" gap={1} flexWrap="wrap">
//                         <Chip label={template.type === 'interna' ? 'Interna' : 'Externa'} size="small"
//                           color={template.type === 'interna' ? 'primary' : 'secondary'}
//                         />
//                         {SPECIAL_FORMS.includes(template.code) && (
//                           <Chip label="Especializado" size="small" color="info" variant="outlined" />
//                         )}
//                         {isScaffold && <Chip label="Andamio" size="small" color="warning" variant="outlined" />}
//                         <Chip label={`${template.sections.length} secciones`} size="small" variant="outlined" />
//                       </Box>
//                     </CardContent>
                    
//                     <CardActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1 }}>
//                       <Button variant="contained" fullWidth
//                         onClick={() => handleSelectTemplate(template)}
//                         color={isScaffold ? 'warning' : 'primary'}
//                       >
//                         Nueva Inspección
//                       </Button>
                      
//                       {isScaffold && inProgressCount > 0 && (
//                         <Button variant="outlined" fullWidth size="small" color="warning"
//                           onClick={() => setSelectedTab(1)}
//                         >
//                           Ver {inProgressCount} en uso
//                         </Button>
//                       )}
//                     </CardActions>
//                   </Card>
//                 </Grid>
//               );
//             })}
//           </Grid>
//         )}
//       </TabPanel>

//       {/* Tab 1: En progreso */}
//       <TabPanel value={selectedTab} index={1}>
//         <InProgressInspectionsList 
//             filterByTemplateCode={SCAFFOLD_FORM}
//             onActionSuccess={(msg) => handleOperationSuccess(msg)} 
//         />
//       </TabPanel>

//       {/* Tab 2: Pendientes de aprobación */}
//       {canViewApprovals && (
//         <TabPanel value={selectedTab} index={2}>
//           <PendingApprovalsList 
//             onApprovalChange={() => {
//                 refreshCounts();
//                 handleOperationSuccess("Estado de aprobación actualizado correctamente.");
//             }} 
//           />
//         </TabPanel>
//       )}
//     </Box>
//   );
// }

// export default function LlenarFormulariosPage() {
//   return (
//     <Suspense fallback={
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
//         <CircularProgress />
//       </Box>
//     }>
//       <LlenarFormulariosContent />
//     </Suspense>
//   );
// }
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  Box, Typography, Card, CardContent, Button, 
  CircularProgress, Alert, Grid, Chip, CardActions,
  Tabs, Tab, Badge
} from '@mui/material';
import { Assignment, Science, Construction, Add, Pending } from '@mui/icons-material';

// Acciones y Tipos
import { getTemplatesHerraEquipos } from '@/lib/actions/template-herra-equipos';
import { getInProgressInspections, getPendingApprovals } from '@/lib/actions/inspection-herra-equipos';
import { FormTemplateHerraEquipos } from '@/components/herra_equipos/types/IProps';

// Componentes Hijos
import { InProgressInspectionsList } from '@/components/herra_equipos/InProgressInspectionsList';
import { PendingApprovalsList } from '@/components/herra_equipos/PendingApprovalsList';
import { SuccessScreen } from '@/components/SucessScreen';

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

function LlenarFormulariosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ Usar el hook actualizado con datos reales
  const { user, hasRole, isLoading: authLoading } = useUserRole();
  
  // Roles permitidos para aprobar
  const canViewApprovals = hasRole('supervisor') || hasRole('admin') || hasRole('superintendente');

  // --- ESTADOS ---
  const [selectedTab, setSelectedTab] = useState(0);
  const [templates, setTemplates] = useState<FormTemplateHerraEquipos[]>([]);
  
  // Contadores para badges
  const [inProgressCount, setInProgressCount] = useState(0);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para Pantalla de Éxito
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState({ title: '', message: '' });

  const SPECIAL_FORMS = ['ARN-001', 'ESC-001', 'EXT-001'];
  const SCAFFOLD_FORM = '1.02.P06.F30';

  // ========================================
  // CARGAR DATOS COMPLETOS (solo una vez)
  // ========================================
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const templatesResult = await getTemplatesHerraEquipos();
      if (!templatesResult.success) throw new Error(templatesResult.error);

      setTemplates(templatesResult.data.map(t => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      })));

      await refreshCounts(); // Cargar contadores iniciales
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // REFRESCAR SOLO CONTADORES
  // ========================================
  const refreshCounts = async () => {
    // ✅ Esperar a que el usuario esté disponible
    if (!user) return;

    try {
      const [inProgressResult, pendingResult] = await Promise.all([
        getInProgressInspections({ templateCode: SCAFFOLD_FORM }),
        canViewApprovals 
          ? getPendingApprovals(user.username) // ✅ Usar username del usuario real
          : Promise.resolve({ success: true, data: [] })
      ]);

      if (inProgressResult.success) {
        setInProgressCount(inProgressResult.data?.length || 0);
      }
      if (pendingResult.success) {
        setPendingApprovalCount(pendingResult.data?.length || 0);
      }
    } catch (err) {
      console.error("Error refrescando contadores:", err);
    }
  };

  // ========================================
  // HANDLER DE ÉXITO (El puente con los hijos)
  // ========================================
  const handleOperationSuccess = (message: string, title: string = "¡Operación Exitosa!") => {
    setSuccessData({ title, message });
    setShowSuccess(true);
    refreshCounts(); // Actualizar badges al tener éxito
  };

  // ========================================
  // Carga inicial (esperar a que el usuario esté disponible)
  // ========================================
  useEffect(() => {
    // ✅ Solo cargar datos cuando el usuario esté disponible
    if (!authLoading && user) {
      loadInitialData();
    }
  }, [authLoading, user]);

  // ========================================
  // Sincronizar tab con URL
  // ========================================
  useEffect(() => {
    const tab = searchParams.get('tab');
    let targetTab = 0;

    if (tab === 'in-progress') {
      targetTab = 1;
    } else if (tab === 'pending-approval') {
      if (canViewApprovals) {
        targetTab = 2;
      } else {
        router.replace('/dashboard/form-herra-equipos', { scroll: false });
        targetTab = 0;
      }
    }

    if (selectedTab !== targetTab) {
      setSelectedTab(targetTab);
    }
  }, [searchParams, canViewApprovals, selectedTab, router]);

  // Refrescar al cambiar a tab de aprobaciones
  useEffect(() => {
    if (selectedTab === 2 && canViewApprovals && user) {
      refreshCounts();
    }
  }, [selectedTab, canViewApprovals, user]);

  // ========================================
  // Cambio de tab
  // ========================================
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);

    const base = '/dashboard/form-herra-equipos';
    let url = base;

    if (newValue === 1) {
      url += '?tab=in-progress';
    } else if (newValue === 2 && canViewApprovals) {
      url += '?tab=pending-approval';
    }

    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (currentUrl !== url) {
      router.push(url, { scroll: false });
    }
  };

  const handleSelectTemplate = (template: FormTemplateHerraEquipos) => {
    router.push(`/dashboard/form-herra-equipos/${template.code}`);
  };

  // ========================================
  // RENDERIZADO CONDICIONAL
  // ========================================

  // 1. Loading de autenticación
  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography ml={2}>Verificando autenticación...</Typography>
      </Box>
    );
  }

  // 2. Sin usuario (no debería pasar por el Middleware, pero por seguridad)
  if (!user) {
    return (
      <Box p={3}>
        <Alert severity="error">
          No se pudo obtener información del usuario. Por favor, inicia sesión nuevamente.
        </Alert>
      </Box>
    );
  }

  // 3. Pantalla de Éxito
  if (showSuccess) {
    return (
      <SuccessScreen
        title={successData.title}
        message={successData.message}
        subtitle="Los cambios se han guardado correctamente en el sistema."
        autoRedirect={false} 
        onBackToList={() => setShowSuccess(false)}
        listLabel="Volver a la Lista"
        onGoHome={() => router.push('/dashboard')}
      />
    );
  }

  // 4. Loading de datos
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography ml={2}>Cargando formularios...</Typography>
      </Box>
    );
  }

  // 5. Error
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Box>
    );
  }

  // 6. Contenido Principal
  return (
    <Box p={3}>
      {/* Info del Usuario (opcional, para debug) */}
      {process.env.NODE_ENV === 'development' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Usuario: {user.username} | Roles: {user.roles.join(', ')}
        </Alert>
      )}

      {/* Tabs Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="inspections tabs">
          <Tab icon={<Add />} iconPosition="start" label="Nueva Inspección" />
          
          <Tab 
            icon={
              <Badge badgeContent={inProgressCount} color="warning">
                <Construction />
              </Badge>
            }
            iconPosition="start"
            label="Andamios en Progreso"
          />
          
          {canViewApprovals && (
            <Tab 
              icon={
                <Badge badgeContent={pendingApprovalCount} color="error">
                  <Pending />
                </Badge>
              }
              iconPosition="start"
              label="Pendientes de Aprobación"
            />
          )}
        </Tabs>
      </Box>

      {/* Tab 0: Templates Disponibles */}
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
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    border: SPECIAL_FORMS.includes(template.code)
                      ? '2px solid #1976d2' 
                      : isScaffold ? '2px solid #ed6c02' : 'none',
                    position: 'relative',
                  }}>
                    {isScaffold && inProgressCount > 0 && (
                      <Chip label={`${inProgressCount} en uso`} color="warning" size="small"
                        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                      />
                    )}

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        {SPECIAL_FORMS.includes(template.code) ? <Science color="primary" /> :
                         isScaffold ? <Construction color="warning" /> : <Assignment />}
                        <Typography variant="h6">{template.name}</Typography>
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
                        <Chip label={template.type === 'interna' ? 'Interna' : 'Externa'} size="small"
                          color={template.type === 'interna' ? 'primary' : 'secondary'}
                        />
                        {SPECIAL_FORMS.includes(template.code) && (
                          <Chip label="Especializado" size="small" color="info" variant="outlined" />
                        )}
                        {isScaffold && <Chip label="Andamio" size="small" color="warning" variant="outlined" />}
                        <Chip label={`${template.sections.length} secciones`} size="small" variant="outlined" />
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1 }}>
                      <Button variant="contained" fullWidth
                        onClick={() => handleSelectTemplate(template)}
                        color={isScaffold ? 'warning' : 'primary'}
                      >
                        Nueva Inspección
                      </Button>
                      
                      {isScaffold && inProgressCount > 0 && (
                        <Button variant="outlined" fullWidth size="small" color="warning"
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

      {/* Tab 1: En progreso */}
      <TabPanel value={selectedTab} index={1}>
        <InProgressInspectionsList 
          filterByTemplateCode={SCAFFOLD_FORM} 
          onActionSuccess={(msg) => handleOperationSuccess(msg, "¡Inspección Actualizada!")}
        />
      </TabPanel>

      {/* Tab 2: Pendientes de aprobación */}
      {canViewApprovals && (
        <TabPanel value={selectedTab} index={2}>
          <PendingApprovalsList 
            onApprovalChange={() => {
              handleOperationSuccess("La inspección ha sido aprobada correctamente.", "¡Aprobación Exitosa!");
            }} 
          />
        </TabPanel>
      )}
    </Box>
  );
}

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