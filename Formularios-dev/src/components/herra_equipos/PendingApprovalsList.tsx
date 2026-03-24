// "use client"
// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useUserRole } from "@/hooks/useUserRole";
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
// } from "@mui/material";
// import {
//   AccessTime,
//   CheckCircle,
//   Person,
//   LocationOn,
//   CalendarToday,
//   ArrowForward,
// } from "@mui/icons-material";
// import {
//   getPendingApprovals,
//   InspectionResponse,
//   // approveInspection // 🔥 Si tienes una acción rápida, impórtala aquí
// } from "@/lib/actions/inspection-herra-equipos";

// interface PendingApprovalsListProps {
//   onApprovalChange?: () => void;
// }

// export function PendingApprovalsList({ onApprovalChange }: PendingApprovalsListProps) {
//   const router = useRouter();
  
//   // ✅ Usar el hook actualizado
//   const { user, isLoading: authLoading } = useUserRole();

//   const [inspections, setInspections] = useState<InspectionResponse[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  
//   // Estado para loading de botones individuales
//   // const [processingId, setProcessingId] = useState<string | null>(null);

//   // ✅ Cargar solo cuando el usuario esté disponible
//   useEffect(() => {
//     if (!authLoading && user) {
//       loadPendingInspections();
//     }
//   }, [authLoading, user]);

//   const loadPendingInspections = async () => {
//     // ✅ Verificar que user existe
//     if (!user) return;

//     try {
//       setLoading(true);
//       setError(null);
      
//       // ✅ Usar user.username en lugar de session.user.name
//       const result = await getPendingApprovals(user.username);
      
//       if (!result.success) {
//         throw new Error(result.error || "Error al cargar inspecciones pendientes");
//       }

//       setInspections(result.data || []);
//       onApprovalChange?.();
      
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

//   /* 🔥 OPCIONAL: Función para aprobación rápida desde la lista.
//    * Si descomentas esto e importas la acción, podrás aprobar directo 
//    * y verás la SuccessScreen del padre.
//    */
//   /*
//   const handleQuickApprove = async (e: React.MouseEvent, inspection: InspectionResponse) => {
//     e.stopPropagation(); // Evitar click en la card
    
//     if (!user) return;
    
//     setProcessingId(inspection._id);
//     try {
//       const result = await approveInspection(inspection._id, user.username);
//       if (result.success) {
//         // 1. Recargar lista local
//         await loadPendingInspections();
//         // 2. Avisar al padre (Aquí sí se dispara SuccessScreen)
//         if (onApprovalChange) onApprovalChange();
//       }
//     } catch(err) {
//       console.error(err);
//     } finally {
//       setProcessingId(null);
//     }
//   }
//   */

//   // ✅ Loading de autenticación
//   if (authLoading) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
//         <CircularProgress />
//         <Typography ml={2}>Verificando permisos...</Typography>
//       </Box>
//     );
//   }

//   // ✅ Sin usuario
//   if (!user) {
//     return (
//       <Alert severity="error">
//         No se pudo obtener información del usuario. Por favor, inicia sesión nuevamente.
//       </Alert>
//     );
//   }

//   // Loading de datos
//   if (loading) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
//         <CircularProgress />
//         <Typography ml={2}>Cargando inspecciones...</Typography>
//       </Box>
//     );
//   }

//   if (error) {
//     return <Alert severity="error">{error}</Alert>;
//   }

//   if (inspections.length === 0) {
//     return (
//       <Card sx={{ bgcolor: 'background.default', border: '1px dashed #ccc' }}>
//         <CardContent>
//           <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 6 }}>
//             <CheckCircle sx={{ fontSize: 60, color: "text.disabled" }} />
//             <Typography variant="h6" color="text.secondary">¡Todo al día!</Typography>
//             <Typography variant="body2" color="text.secondary">
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
//         <Typography variant="h6" gutterBottom>
//           Inspecciones Pendientes ({inspections.length})
//         </Typography>
//         {/* Debug info (solo en desarrollo) */}
//         {process.env.NODE_ENV === 'development' && (
//           <Typography variant="caption" color="text.secondary">
//             Cargadas para: {user.username}
//           </Typography>
//         )}
//       </Box>

//       <Grid container spacing={3}>
//         {inspections.map((inspection) => (
//           <Grid size={{xs:12}} key={inspection._id}>
//             <Card 
//               sx={{ 
//                 borderLeft: '6px solid',
//                 borderLeftColor: 'warning.main',
//                 transition: 'transform 0.2s',
//                 '&:hover': { transform: 'translateX(4px)' }
//               }}
//             >
//               <CardContent>
//                 <Grid container spacing={2} alignItems="center">
//                   {/* Información Principal */}
//                   <Grid size={{ xs:12, md:8 }}>
//                     <Typography variant="h6" component="div" gutterBottom>
//                       {inspection.templateName || inspection.templateCode}
//                     </Typography>
                    
//                     <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
//                       <Chip label="Pendiente" color="warning" size="small" icon={<AccessTime />} />
//                       <Chip label={inspection.templateCode} size="small" variant="outlined" />
//                     </Stack>

//                     <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} color="text.secondary">
//                       {inspection.submittedBy && (
//                         <Box display="flex" alignItems="center" gap={0.5}>
//                           <Person fontSize="small" />
//                           <Typography variant="body2">{inspection.submittedBy}</Typography>
//                         </Box>
//                       )}
//                       {inspection.submittedAt && (
//                         <Box display="flex" alignItems="center" gap={0.5}>
//                           <CalendarToday fontSize="small" />
//                           <Typography variant="body2">
//                             {new Date(inspection.submittedAt).toLocaleDateString("es-ES")}
//                           </Typography>
//                         </Box>
//                       )}
//                       {inspection.location && (
//                         <Box display="flex" alignItems="center" gap={0.5}>
//                           <LocationOn fontSize="small" />
//                           <Typography variant="body2">{inspection.location}</Typography>
//                         </Box>
//                       )}
//                     </Stack>
//                   </Grid>

//                   {/* Botones de Acción */}
//                   <Grid size={{ xs:12, md:4 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
//                     {/* Botón Revisar (Navegación) */}
//                     <Button
//                       variant="contained"
//                       color="primary"
//                       endIcon={<ArrowForward />}
//                       onClick={() => handleViewInspection(inspection)}
//                     >
//                       Revisar Detalle
//                     </Button>

//                     {/* Botón Aprobación Rápida (Opcional - Descomentar lógica arriba para activar)
//                     <Tooltip title="Aprobación Rápida">
//                       <Button 
//                         variant="outlined" 
//                         color="success"
//                         onClick={(e) => handleQuickApprove(e, inspection)}
//                         disabled={!!processingId}
//                       >
//                         {processingId === inspection._id ? <CircularProgress size={24} /> : <ThumbUpAlt />}
//                       </Button>
//                     </Tooltip> 
//                     */}
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Box>
//   );
// }

"use client"
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Box, Card, CardContent, Typography, Button, Chip, Stack,
  CircularProgress, Alert, Grid, TextField, MenuItem, Select,
  FormControl, InputLabel, InputAdornment, Divider, Badge,
} from "@mui/material";
import {
  AccessTime, CheckCircle, Person, LocationOn, CalendarToday,
  ArrowForward, Search, FilterList, Clear,
} from "@mui/icons-material";
import {
  getPendingApprovals,
  InspectionResponse,
} from "@/lib/actions/inspection-herra-equipos";

interface PendingApprovalsListProps {
  onApprovalChange?: () => void;
}

interface Filters {
  search: string;
  templateCode: string;
  submittedBy: string;
  dateFrom: string;
  dateTo: string;
}

const EMPTY_FILTERS: Filters = {
  search: "",
  templateCode: "",
  submittedBy: "",
  dateFrom: "",
  dateTo: "",
};

export function PendingApprovalsList({ onApprovalChange }: PendingApprovalsListProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useUserRole();

  const [inspections, setInspections] = useState<InspectionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      loadPendingInspections();
    }
  }, [authLoading, user]);

  const loadPendingInspections = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const result = await getPendingApprovals(user.username);
      if (!result.success) throw new Error(result.error || "Error al cargar");
      setInspections(result.data || []);
      onApprovalChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const uniqueTemplateCodes = useMemo(() =>
    [...new Set(inspections.map(i => i.templateCode))].sort(),
    [inspections]
  );

  const uniqueSubmittedBy = useMemo(() =>
    [...new Set(inspections.map(i => i.submittedBy).filter(Boolean))].sort() as string[],
    [inspections]
  );

  const filtered = useMemo(() => {
    return inspections.filter(insp => {

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const haystack = [
          insp.templateName,
          insp.templateCode,
          insp.submittedBy,
          insp.location,
          // ✅ Busca dinámicamente en TODOS los campos de verification
          ...Object.keys(insp.verification || {}),
          ...Object.values(insp.verification || {}).map(v => String(v)),
        ].join(" ").toLowerCase();
        if (!haystack.includes(searchLower)) return false;
      }

      if (filters.templateCode && insp.templateCode !== filters.templateCode) return false;
      if (filters.submittedBy && insp.submittedBy !== filters.submittedBy) return false;

      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        if (new Date(insp.submittedAt) < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59);
        if (new Date(insp.submittedAt) > to) return false;
      }

      return true;
    });
  }, [inspections, filters]);

  const activeFilterCount = Object.values(filters).filter(v => v !== "").length;
  const hasActiveFilters = activeFilterCount > 0;

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const handleViewInspection = (inspection: InspectionResponse) => {
    router.push(`/dashboard/form-herra-equipos/${inspection.templateCode}/${inspection._id}`);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-ES", {
      day: "2-digit", month: "short", year: "numeric",
    });

  const getDaysAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days === 0) return "Hoy";
    if (days === 1) return "Ayer";
    return `Hace ${days} días`;
  };

  const getUrgencyColor = (iso: string): "error" | "warning" | "default" => {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
    if (days >= 3) return "error";
    if (days >= 1) return "warning";
    return "default";
  };

  if (authLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <CircularProgress /><Typography ml={2}>Verificando permisos...</Typography>
      </Box>
    );
  }
  if (!user) return <Alert severity="error">No se pudo obtener información del usuario.</Alert>;
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <CircularProgress /><Typography ml={2}>Cargando inspecciones...</Typography>
      </Box>
    );
  }
  if (error) return (
    <Alert severity="error" action={<Button onClick={loadPendingInspections}>Reintentar</Button>}>
      {error}
    </Alert>
  );

  return (
    <Box>
      {/* ── Encabezado ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h6">
          Pendientes de Aprobación
          <Chip
            label={inspections.length}
            color="warning"
            size="small"
            sx={{ ml: 1, fontWeight: 700 }}
          />
          {hasActiveFilters && (
            <Chip
              label={`${filtered.length} mostrados`}
              size="small"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>

        <Stack direction="row" spacing={1}>
          <Badge badgeContent={activeFilterCount} color="primary">
            <Button
              variant={showFilters ? "contained" : "outlined"}
              size="small"
              startIcon={<FilterList />}
              onClick={() => setShowFilters(p => !p)}
            >
              Filtros
            </Button>
          </Badge>
          {hasActiveFilters && (
            <Button size="small" startIcon={<Clear />} color="error" onClick={clearFilters}>
              Limpiar
            </Button>
          )}
        </Stack>
      </Box>

      {/* ── Panel de filtros ── */}
      {showFilters && (
        <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Buscar"
                placeholder="Formulario, inspector, área, equipo…"
                value={filters.search}
                onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Formulario</InputLabel>
                <Select
                  value={filters.templateCode}
                  label="Formulario"
                  onChange={e => setFilters(p => ({ ...p, templateCode: e.target.value }))}
                >
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {uniqueTemplateCodes.map(code => (
                    <MenuItem key={code} value={code}>{code}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Inspector</InputLabel>
                <Select
                  value={filters.submittedBy}
                  label="Inspector"
                  onChange={e => setFilters(p => ({ ...p, submittedBy: e.target.value }))}
                >
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {uniqueSubmittedBy.map(name => (
                    <MenuItem key={name} value={name}>{name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                fullWidth size="small" type="date" label="Desde"
                value={filters.dateFrom}
                onChange={e => setFilters(p => ({ ...p, dateFrom: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                fullWidth size="small" type="date" label="Hasta"
                value={filters.dateTo}
                onChange={e => setFilters(p => ({ ...p, dateTo: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Card>
      )}

      {/* ── Sin datos ── */}
      {inspections.length === 0 ? (
        <Card sx={{ bgcolor: "background.default", border: "1px dashed #ccc" }}>
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
      ) : filtered.length === 0 ? (
        <Alert
          severity="info"
          action={<Button size="small" onClick={clearFilters}>Ver todos</Button>}
        >
          Ninguna inspección coincide con los filtros aplicados.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filtered.map(inspection => {
            const urgency = getUrgencyColor(inspection.submittedAt);
            const borderColor =
              urgency === "error" ? "error.main"
              : urgency === "warning" ? "warning.main"
              : "primary.light";

            return (
              <Grid size={{ xs: 12 }} key={inspection._id}>
                <Card
                  sx={{
                    borderLeft: "6px solid",
                    borderLeftColor: borderColor,
                    transition: "transform 0.15s, box-shadow 0.15s",
                    "&:hover": { transform: "translateX(4px)", boxShadow: 4 },
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">

                      {/* ── Info principal ── */}
                      <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="h6" gutterBottom>
                          {inspection.templateName || inspection.templateCode}
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
                          <Chip label="Pendiente" color="warning" size="small" icon={<AccessTime />} />
                          <Chip label={inspection.templateCode} size="small" variant="outlined" />
                          {urgency !== "default" && (
                            <Chip
                              label={getDaysAgo(inspection.submittedAt)}
                              color={urgency}
                              size="small"
                            />
                          )}
                        </Stack>

                        <Divider sx={{ my: 1 }} />

                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2}
                          color="text.secondary"
                          flexWrap="wrap"
                        >
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
                                {formatDate(inspection.submittedAt)} · {getDaysAgo(inspection.submittedAt)}
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

                        {/* ── Datos dinámicos del equipo ── */}
                        {inspection.verification && Object.keys(inspection.verification).length > 0 && (
                          <Box sx={{ mt: 1.5, p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              DATOS DEL EQUIPO
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1} mt={0.5}>
                              {Object.entries(inspection.verification)
                                .filter(([, v]) => v !== "" && v != null)
                                .slice(0, 4)
                                .map(([key, value]) => (
                                  <Chip
                                    key={key}
                                    label={`${key}: ${value}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: "0.7rem" }}
                                  />
                                ))}
                            </Stack>
                          </Box>
                        )}
                      </Grid>

                      {/* ── Botón acción ── */}
                      <Grid
                        size={{ xs: 12, md: 4 }}
                        sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          endIcon={<ArrowForward />}
                          onClick={() => handleViewInspection(inspection)}
                        >
                          Revisar y Aprobar
                        </Button>
                      </Grid>

                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}