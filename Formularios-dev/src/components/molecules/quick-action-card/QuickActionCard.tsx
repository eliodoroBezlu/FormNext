import React from 'react';
import { Card, Box, Button } from '@mui/material';
import { Typography } from '@/components/atoms/Typography';

interface QuickActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
}) => (
  <Card sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="subtitle1" fontWeight="medium">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Button variant="outlined" size="small" onClick={onButtonClick}>
        {buttonText}
      </Button>
    </Box>
  </Card>
);

export default QuickActionCard;