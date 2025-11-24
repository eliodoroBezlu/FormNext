"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import {
  Construction,
  Edit,
  PlaylistAddCheck,
  CalendarToday,
  Person,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { getInProgressInspections } from '@/lib/actions/inspection-herra-equipos';

// Tipos reales del backend
interface RoutineInspection {
  date: string;
  inspector: string;
  response: "si" | "no";
  observations?: string;
  signature?: string;
}

interface ScaffoldData {
  routineInspections?: RoutineInspection[];
  finalConclusion?: "liberado" | "no_liberado";
}

interface VerificationData {
  TAG?: string;
  [key: string]: string | number | undefined;
}

export interface InProgressInspection {
  _id: string;
  templateCode: string;
  templateName?: string;
  status: string;
  verification: VerificationData;
  scaffold?: ScaffoldData;
  submittedAt: string;
  submittedBy?: string;
  updatedAt?: string;
}

export interface InProgressListProps {
  onSelectInspection?: (inspection: InProgressInspection) => void;
  filterByTemplateCode?: string;
}

// ✅ Define un tipo para la respuesta tipada de la API
interface TypedApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  count?: number;
}

export function InProgressInspectionsList({ 
  onSelectInspection,
  filterByTemplateCode 
}: InProgressListProps) {
  const router = useRouter();
  const [inspections, setInspections] = useState<InProgressInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInProgressInspections();
  }, [filterByTemplateCode]);

  const loadInProgressInspections = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Cargando inspecciones en progreso...');
      
      // ✅ Llamada tipada: asumimos que getInProgressInspections devuelve InProgressInspection[]
      const result = (await getInProgressInspections({
        templateCode: filterByTemplateCode,
      })) as TypedApiResponse<InProgressInspection[]>; // ✅ Seguro y explícito

      if (result.success && Array.isArray(result.data)) {
        setInspections(result.data); // ✅ Sin "as any"
        console.log(`✅ ${result.data.length} inspecciones en progreso cargadas`);
      } else {
        throw new Error(result.error || 'No se pudieron cargar las inspecciones');
      }
    } catch (err) {
      console.error('Error al cargar inspecciones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueInspection = (inspection: InProgressInspection) => {
    console.log('Continuando inspección:', inspection._id);
    
    if (onSelectInspection) {
      onSelectInspection(inspection);
    } else {
      router.push(`/dashboard/form-herra-equipos/${inspection.templateCode}/${inspection._id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoutineCount = (inspection: InProgressInspection) => {
    return inspection.scaffold?.routineInspections?.length || 0;
  };

  const getDaysSinceStart = (dateString: string) => {
    const start = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" onClose={() => setError(null)}>
        {error}
      </Alert>
    );
  }

  if (inspections.length === 0) {
    return (
      <Alert severity="info" icon={<Construction />}>
        No hay inspecciones de andamios en progreso
        {filterByTemplateCode && ` para el formulario ${filterByTemplateCode}`}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Construction color="warning" fontSize="large" />
        <Typography variant="h5">
          Andamios en Progreso
        </Typography>
        <Chip 
          label={`${inspections.length} activo${inspections.length !== 1 ? 's' : ''}`}
          color="warning"
          size="small"
        />
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Estos andamios están en uso y requieren inspecciones rutinarias diarias. 
        Selecciona uno para continuar agregando rutinarias o para finalizar la inspección.
      </Alert>

      <Grid container spacing={3}>
        {inspections.map((inspection) => {
          const routineCount = getRoutineCount(inspection);
          const daysSinceStart = getDaysSinceStart(inspection.submittedAt);
          
          return (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={inspection._id}>
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderLeft: 4,
                  borderColor: 'warning.main',
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {inspection.verification.TAG || 'Sin TAG'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {inspection.templateCode}
                      </Typography>
                    </Box>
                    <Chip 
                      label="EN USO" 
                      color="warning" 
                      size="small"
                      icon={<PlaylistAddCheck />}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={1.5}>
                    {inspection.templateName && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Construction fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {inspection.templateName}
                        </Typography>
                      </Box>
                    )}

                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircle 
                        fontSize="small" 
                        color={routineCount > 0 ? "success" : "action"} 
                      />
                      <Typography variant="body2">
                        <strong>{routineCount}</strong> inspección{routineCount !== 1 ? 'es' : ''} rutinaria{routineCount !== 1 ? 's' : ''}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {daysSinceStart} día{daysSinceStart !== 1 ? 's' : ''} en uso
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Iniciado: {formatDate(inspection.submittedAt)}
                      </Typography>
                    </Box>

                    {inspection.submittedBy && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {inspection.submittedBy}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="warning"
                    startIcon={<Edit />}
                    onClick={() => handleContinueInspection(inspection)}
                    sx={{ 
                      fontWeight: 'bold',
                      boxShadow: 2,
                      '&:hover': { boxShadow: 4 }
                    }}
                  >
                    Continuar
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}