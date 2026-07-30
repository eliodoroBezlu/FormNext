'use client';

import { Card, CardContent, Grid, Typography, Box } from '@mui/material';
import { OrganizationalInfo } from '../../domain/models/IProps';

interface HeaderInfoProps {
  info: OrganizationalInfo;
}

export function HeaderInfo({ info }: HeaderInfoProps) {
  const fields: { label: string; value: string }[] = [
    { label: 'Vicepresidencia / Gerencia:', value: info.vicepresidencia },
    { label: 'Superintendencia Sénior:', value: info.superintendenciaSenior },
    { label: 'Superintendencia:', value: info.superintendencia },
    { label: 'Área Física:', value: info.areaFisica },
  ];

  return (
    <Card sx={{ mb: 3, boxShadow: 1 }}>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Planilla de Seguimiento
        </Typography>

        <Grid container spacing={2}>
          {fields.map(({ label, value }) => (
            <Grid size={{ xs: 12, sm: 6 }} key={label}>
              <Box sx={{ border: '1px solid #e0e0e0', p: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  {label}
                </Typography>
                <Typography variant="body2">{value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
