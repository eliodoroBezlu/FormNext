import React from 'react';
import { Box, Grid } from '@mui/material';
import { Typography } from '@/components/atoms/Typography';
import QuickActionCard from '@/components/molecules/quick-action-card/QuickActionCard';

export interface QuickActionData {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

interface QuickActionsSectionProps {
  actions: QuickActionData[];
}

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({ actions }) => (
  <Box>
    <Typography variant="h5" component="h2" gutterBottom fontWeight="semibold">
      Acciones Rápidas
    </Typography>
    <Grid container spacing={2}>
      {actions.map((action, index) => (
        <Grid size={{xs:12, sm:6, md:4}} key={index}>
          <QuickActionCard {...action} />
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default QuickActionsSection;