import React from 'react';
import { CardHeader, IconButton } from '@mui/material';
import { ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import SettingCardIcon from '../setting-card-icon/SettingCardIcon';
import { Typography } from '@/components/atoms/Typography';


interface SettingCardHeaderProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const SettingCardHeader: React.FC<SettingCardHeaderProps> = ({
  title,
  description,
  icon,
  color,
}) => (
  <CardHeader
    avatar={<SettingCardIcon iconComponent={icon} color={color} />}
    action={
      <IconButton>
        <ChevronRightIcon />
      </IconButton>
    }
    title={
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
    }
    subheader={
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
        {description}
      </Typography>
    }
    sx={{ pb: 1 }}
  />
);

export default SettingCardHeader;