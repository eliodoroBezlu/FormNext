'use client';

import { Card, CardContent } from '@mui/material';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { TaskSummary as TaskSummaryType } from './types/IProps';

interface TaskSummaryProps {
  summary: TaskSummaryType;
}

export function TaskSummary({ summary }: TaskSummaryProps) {
  return (
    <Card sx={{ mb: 3, boxShadow: 1 }}>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            ESTADO DE TAREAS, % DE CIERRE
          </Typography>
        </Box>

        <Grid container spacing={0} sx={{ border: '2px solid #003d7a' }}>
          {/* Tareas Abiertas */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <Paper
              elevation={0}
              sx={{
                background: '#dc143c',
                p: 2,
                textAlign: 'center',
                borderRadius: 0,
                borderRight: '2px solid white',
              }}
            >
              <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                Tareas Abiertas
              </Typography>
              <Typography sx={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', mt: 1 }}>
                {summary.tareasAbiertas}
              </Typography>
            </Paper>
          </Grid>

          {/* Tareas Cerradas */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <Paper
              elevation={0}
              sx={{
                background: '#228b22',
                p: 2,
                textAlign: 'center',
                borderRadius: 0,
                borderRight: '2px solid white',
              }}
            >
              <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                Tareas Cerradas
              </Typography>
              <Typography sx={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', mt: 1 }}>
                {summary.tareasCerradas}
              </Typography>
            </Paper>
          </Grid>

          {/* Total Tareas */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <Paper
              elevation={0}
              sx={{
                background: '#1e3a8a',
                p: 2,
                textAlign: 'center',
                borderRadius: 0,
                borderRight: '2px solid white',
              }}
            >
              <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>
                TOTAL TAREAS
              </Typography>
              <Typography sx={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', mt: 1 }}>
                {summary.totalTareas}
              </Typography>
            </Paper>
          </Grid>

          {/* Porcentaje */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <Paper
              elevation={0}
              sx={{
                background: '#ffff00',
                p: 2,
                textAlign: 'center',
                borderRadius: 0,
              }}
            >
              <Typography sx={{ color: 'black', fontWeight: 600, fontSize: '0.85rem' }}>
                %
              </Typography>
              <Typography sx={{ color: 'black', fontSize: '1.5rem', fontWeight: 'bold', mt: 1 }}>
                {summary.porcentajeCierre}%
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
