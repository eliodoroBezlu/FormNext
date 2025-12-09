// // components/herra_equipos/PendingApprovalsList.tsx
// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   Chip,
//   Stack,
//   CircularProgress,
//   Alert,
//   Grid,
//   Divider,
// } from "@mui/material";
// import {
//   Visibility,
//   AccessTime,
//   CheckCircle,
//   Person,
//   LocationOn,
//   CalendarToday,
// } from "@mui/icons-material";
// import {
//   getPendingApprovals,
//   InspectionResponse,
// } from "@/lib/actions/inspection-herra-equipos";

// interface PendingApprovalsListProps {
//   onApprovalChange?: () => void;
// }

// export function PendingApprovalsList({ onApprovalChange }: PendingApprovalsListProps) {
//   const router = useRouter();
//   const { data: session } = useSession();

//   const [inspections, setInspections] = useState<InspectionResponse[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     loadPendingInspections();
//   }, []);

//   const loadPendingInspections = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const result = await getPendingApprovals(session?.user?.name || "");
      
//       if (!result.success) {
//         throw new Error(result.error || "Error al cargar inspecciones pendientes");
//       }

//       setInspections(result.data || []);
      
//       if (onApprovalChange) {
//         onApprovalChange();
//       }
//     } catch (err) {
//       console.error("Error al cargar pendientes:", err);
//       setError(err instanceof Error ? err.message : "Error desconocido");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewInspection = (inspection: InspectionResponse) => {
//     // Navegar a la página de visualización con aprobación
//     router.push(`/dashboard/form-herra-equipos/${inspection.templateCode}/${inspection._id}`);
//   };

//   if (loading) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           minHeight: "400px",
//         }}
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box>
//         <Alert severity="error">{error}</Alert>
//       </Box>
//     );
//   }

//   if (inspections.length === 0) {
//     return (
//       <Card>
//         <CardContent>
//           <Box
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               gap: 2,
//               py: 6,
//             }}
//           >
//             <CheckCircle sx={{ fontSize: 80, color: "success.main" }} />
//             <Typography variant="h5" color="text.secondary">
//               ¡Todo al día!
//             </Typography>
//             <Typography variant="body1" color="text.secondary">
//               No hay inspecciones pendientes de aprobación
//             </Typography>
//           </Box>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Box>
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="h5" gutterBottom>
//           Inspecciones Pendientes de Aprobación
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           {inspections.length} {inspections.length === 1 ? 'inspección pendiente' : 'inspecciones pendientes'}
//         </Typography>
//       </Box>

//       <Grid container spacing={3}>
//         {inspections.map((inspection) => (
//           <Grid size={{xs:12}} key={inspection._id}>
//             <Card 
//               sx={{ 
//                 border: '2px solid',
//                 borderColor: 'warning.main',
//                 '&:hover': {
//                   boxShadow: 6,
//                   transform: 'translateY(-2px)',
//                   transition: 'all 0.3s ease',
//                 }
//               }}
//             >
//               <CardContent>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "start",
//                     mb: 2,
//                   }}
//                 >
//                   <Box sx={{ flexGrow: 1 }}>
//                     <Typography variant="h6" gutterBottom>
//                       {inspection.templateName || inspection.templateCode}
//                     </Typography>
                    
//                     <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
//                       <Chip
//                         label="Pendiente de Aprobación"
//                         color="warning"
//                         size="small"
//                         icon={<AccessTime />}
//                       />
//                       <Chip
//                         label={inspection.templateCode}
//                         size="small"
//                         variant="outlined"
//                       />
//                     </Stack>

//                     <Divider sx={{ my: 2 }} />

//                     {/* Información de la inspección */}
//                     <Stack spacing={1}>
//                       {inspection.submittedBy && (
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                           <Person fontSize="small" color="action" />
//                           <Typography variant="body2" color="text.secondary">
//                             <strong>Inspector:</strong> {inspection.submittedBy}
//                           </Typography>
//                         </Box>
//                       )}
                      
//                       {inspection.submittedAt && (
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                           <CalendarToday fontSize="small" color="action" />
//                           <Typography variant="body2" color="text.secondary">
//                             <strong>Fecha:</strong>{" "}
//                             {new Date(inspection.submittedAt).toLocaleString("es-ES", {
//                               year: 'numeric',
//                               month: 'long',
//                               day: 'numeric',
//                               hour: '2-digit',
//                               minute: '2-digit'
//                             })}
//                           </Typography>
//                         </Box>
//                       )}
                      
//                       {inspection.location && (
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                           <LocationOn fontSize="small" color="action" />
//                           <Typography variant="body2" color="text.secondary">
//                             <strong>Ubicación:</strong> {inspection.location}
//                           </Typography>
//                         </Box>
//                       )}
                      
//                       {inspection.project && (
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                           <Typography variant="body2" color="text.secondary">
//                             <strong>Proyecto:</strong> {inspection.project}
//                           </Typography>
//                         </Box>
//                       )}

//                       {/* Información específica según el tipo */}
//                       {inspection.verification?.TAG && (
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                           <Typography variant="body2" color="text.secondary">
//                             <strong>TAG:</strong> {inspection.verification.TAG}
//                           </Typography>
//                         </Box>
//                       )}
//                     </Stack>
//                   </Box>

//                   <Button
//                     variant="contained"
//                     color="warning"
//                     startIcon={<Visibility />}
//                     onClick={() => handleViewInspection(inspection)}
//                     sx={{ ml: 2 }}
//                   >
//                     Revisar y Aprobar
//                   </Button>
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Box>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import {
  AccessTime,
  CheckCircle,
  Person,
  LocationOn,
  CalendarToday,
  ArrowForward,
} from "@mui/icons-material";
import {
  getPendingApprovals,
  InspectionResponse,
  // approveInspection // 🔥 Si tienes una acción rápida, impórtala aquí
} from "@/lib/actions/inspection-herra-equipos";

interface PendingApprovalsListProps {
  onApprovalChange?: () => void;
}

export function PendingApprovalsList({}: PendingApprovalsListProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para loading de botones individuales
  //const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingInspections();
  }, []);

  const loadPendingInspections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getPendingApprovals(session?.user?.name || "");
      
      if (!result.success) {
        throw new Error(result.error || "Error al cargar inspecciones pendientes");
      }

      setInspections(result.data || []);
      
      // 🔥 CORRECCIÓN: No llamamos a onApprovalChange() aquí.
      // Solo queremos refrescar datos, no disparar el mensaje de éxito.
      
    } catch (err) {
      console.error("Error al cargar pendientes:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleViewInspection = (inspection: InspectionResponse) => {
    // Navegar a la página de visualización con aprobación
    router.push(`/dashboard/form-herra-equipos/${inspection.templateCode}/${inspection._id}`);
  };

  /* * 🔥 OPCIONAL: Función para aprobación rápida desde la lista.
   * Si descomentas esto e importas la acción, podrás aprobar directo 
   * y verás la SuccessScreen del padre.
   */
  /*
  const handleQuickApprove = async (e: React.MouseEvent, inspection: InspectionResponse) => {
    e.stopPropagation(); // Evitar click en la card
    setProcessingId(inspection._id);
    try {
        const result = await approveInspection(inspection._id, session?.user?.name || "Admin");
        if (result.success) {
            // 1. Recargar lista local
            await loadPendingInspections();
            // 2. Avisar al padre (Aquí sí se dispara SuccessScreen)
            if (onApprovalChange) onApprovalChange();
        }
    } catch(err) {
        console.error(err);
    } finally {
        setProcessingId(null);
    }
  }
  */

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  if (inspections.length === 0) {
    return (
      <Card sx={{ bgcolor: 'background.default', border: '1px dashed #ccc' }}>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 6 }}>
            <CheckCircle sx={{ fontSize: 60, color: "text.disabled" }} />
            <Typography variant="h6" color="text.secondary">¡Todo al día!</Typography>
            <Typography variant="body2" color="text.secondary">
              No hay inspecciones pendientes de aprobación
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Inspecciones Pendientes ({inspections.length})
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {inspections.map((inspection) => (
          <Grid size={{xs:12}} key={inspection._id}>
            <Card 
              sx={{ 
                borderLeft: '6px solid',
                borderLeftColor: 'warning.main',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateX(4px)' }
              }}
            >
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                    {/* Información Principal */}
                    <Grid size={{ xs:12, md:8 }} >
                        <Typography variant="h6" component="div" gutterBottom>
                            {inspection.templateName || inspection.templateCode}
                        </Typography>
                        
                        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                            <Chip label="Pendiente" color="warning" size="small" icon={<AccessTime />} />
                            <Chip label={inspection.templateCode} size="small" variant="outlined" />
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} color="text.secondary">
                            {inspection.submittedBy && (
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <Person fontSize="small" />
                                    <Typography variant="body2">{inspection.submittedBy}</Typography>
                                </Box>
                            )}
                            {inspection.submittedAt && (
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <CalendarToday fontSize="small" />
                                    <Typography variant="body2">
                                        {new Date(inspection.submittedAt).toLocaleDateString("es-ES")}
                                    </Typography>
                                </Box>
                            )}
                            {inspection.location && (
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <LocationOn fontSize="small" />
                                    <Typography variant="body2">{inspection.location}</Typography>
                                </Box>
                            )}
                        </Stack>
                    </Grid>

                    {/* Botones de Acción */}
                    <Grid size={{ xs:12, md:4 }}sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
                        
                        {/* Botón Revisar (Navegación) */}
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<ArrowForward />}
                            onClick={() => handleViewInspection(inspection)}
                        >
                            Revisar Detalle
                        </Button>

                        {/* Botón Aprobación Rápida (Opcional - Descomentar lógica arriba para activar)
                        <Tooltip title="Aprobación Rápida">
                            <Button 
                                variant="outlined" 
                                color="success"
                                onClick={(e) => handleQuickApprove(e, inspection)}
                                disabled={!!processingId}
                            >
                                {processingId === inspection._id ? <CircularProgress size={24} /> : <ThumbUpAlt />}
                            </Button>
                        </Tooltip> 
                        */}
                    </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}