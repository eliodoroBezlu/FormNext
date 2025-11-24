'use client';

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Grid,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  TrendingUp,
  TrendingFlat,
  CheckCircle,
} from '@mui/icons-material';
import { PlanDeAccion } from '../types/IProps';

interface PlanCardProps {
  plan: PlanDeAccion;
  onView: (plan: PlanDeAccion) => void;
  onEdit: (plan: PlanDeAccion) => void;
  onDelete: (id: string) => void;
}

export function PlanCard({ plan, onView, onEdit, onDelete }: PlanCardProps) {
  const getEstadoColor = (estado: PlanDeAccion['estado']) => {
    switch (estado) {
      case 'abierto':
        return 'error';
      case 'en-progreso':
        return 'warning';
      case 'cerrado':
        return 'success';
      default:
        return 'default';
    }
  };

  const getEstadoLabel = (estado: PlanDeAccion['estado']) => {
    switch (estado) {
      case 'abierto':
        return 'Abierto';
      case 'en-progreso':
        return 'En Progreso';
      case 'cerrado':
        return 'Cerrado';
      default:
        return estado;
    }
  };

  

  const getEstadoIcon = () => {
    if (plan.porcentajeCierre === 100) return <CheckCircle />;
    if (plan.porcentajeCierre > 0) return <TrendingUp />;
    return <TrendingFlat />;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-4px)',
        },
        borderTop: `4px solid`,
        borderTopColor: `${getEstadoColor(plan.estado)}.main`,
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header con estado */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Chip
            label={getEstadoLabel(plan.estado)}
            color={getEstadoColor(plan.estado)}
            size="small"
            icon={getEstadoIcon()}
          />
          <Typography variant="caption" color="text.secondary">
            {formatDate(plan.fechaCreacion)}
          </Typography>
        </Box>

        {/* Información organizacional */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '1rem' }}>
          {plan.areaFisica}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            <strong>VP:</strong> {plan.vicepresidencia}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            <strong>Sup. Senior:</strong> {plan.superintendenciaSenior}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            <strong>Sup.:</strong> {plan.superintendencia}
          </Typography>
        </Box>

        {/* Estadísticas de tareas */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid size={{ xs: 4 }}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#fef2f2', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ color: '#dc2626', fontWeight: 700 }}>
                {plan.tareasAbiertas}
              </Typography>
              <Typography variant="caption" sx={{ color: '#7f1d1d' }}>
                Abiertas
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#fef3c7', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ color: '#d97706', fontWeight: 700 }}>
                {plan.tareasEnProgreso}
              </Typography>
              <Typography variant="caption" sx={{ color: '#78350f' }}>
                En Progreso
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f0fdf4', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ color: '#16a34a', fontWeight: 700 }}>
                {plan.tareasCerradas}
              </Typography>
              <Typography variant="caption" sx={{ color: '#14532d' }}>
                Cerradas
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Progreso */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Progreso
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {plan.porcentajeCierre}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={plan.porcentajeCierre}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#e5e7eb',
              '& .MuiLinearProgress-bar': {
                bgcolor:
                  plan.porcentajeCierre === 100
                    ? '#16a34a'
                    : plan.porcentajeCierre >= 50
                    ? '#d97706'
                    : '#dc2626',
              },
            }}
          />
        </Box>

        <Typography variant="caption" color="text.secondary">
          Total de tareas: {plan.totalTareas}
        </Typography>
      </CardContent>

      {/* Acciones */}
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <IconButton
          size="small"
          color="primary"
          onClick={() => onView(plan)}
          title="Ver detalles"
        >
          <Visibility />
        </IconButton>
        <Box>
          <IconButton size="small" onClick={() => onEdit(plan)} title="Editar plan">
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(plan._id)}
            title="Eliminar plan"
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
}