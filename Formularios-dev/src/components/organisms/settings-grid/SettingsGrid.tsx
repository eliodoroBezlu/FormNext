import React from 'react';
import { Grid } from '@mui/material';
import SettingCard, { SettingCardData } from '@/components/molecules/seeting-card/SettingCard';

interface SettingsGridProps {
  settings: SettingCardData[];
  onSettingClick?: (settingId: string) => void;
}

const SettingsGrid: React.FC<SettingsGridProps> = ({ settings, onSettingClick }) => (
  <Grid container spacing={3} sx={{ mb: 6 }}>
    {settings.map((setting) => (
      <Grid size={{xs:12, sm:6, md:4, lg:3}}  key={setting.id}>
        <SettingCard setting={setting} onClick={onSettingClick} />
      </Grid>
    ))}
  </Grid>
);

export default SettingsGrid;