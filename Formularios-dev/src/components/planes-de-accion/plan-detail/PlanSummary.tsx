'use client';

import { Card, CardContent } from '@mui/material';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { PlanSummary as PlanSummaryType } from '../types/IProps';

interface PlanSummaryProps {
  summary: PlanSummaryType;
}

export function PlanSummary({ summary }: PlanSummaryProps) {
  return (
    <Card sx={{ mb: 3, boxShadow: 1 }}>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            ESTADO DE PLANES, % DE CIERRE PROMEDIO
          </Typography>
        </Box>

        <Grid container spacing={0} sx={{ border: '2px solid #003d7a' }}>
          {/* Planes Abiertos */}
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
                Planes Abiertos
              </Typography>
              <Typography sx={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', mt: 1 }}>
                {summary.planesAbiertos}
              </Typography>
            </Paper>
          </Grid>

          {/* Planes Cerrados */}
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
                Planes Cerrados
              </Typography>
              <Typography sx={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', mt: 1 }}>
                {summary.planesCerrados}
              </Typography>
            </Paper>
          </Grid>

          {/* Total Planes */}
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
                TOTAL PLANES
              </Typography>
              <Typography sx={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', mt: 1 }}>
                {summary.totalPlanes}
              </Typography>
            </Paper>
          </Grid>

          {/* Porcentaje Promedio */}
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
                % PROMEDIO
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