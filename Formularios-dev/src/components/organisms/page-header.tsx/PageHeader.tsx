import React from 'react';
import { Box } from '@mui/material';
import { Typography } from '@/components/atoms/Typography';

interface PageHeaderProps {
  title: string;
  description: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
      {title}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      {description}
    </Typography>
  </Box>
);

export default PageHeader;