import React from 'react';
import ColoredAvatar from '@/components/atoms/colored-avatar/ColoredAvatar';

interface SettingCardIconProps {
  iconComponent: React.ElementType;
  color: string;
}

const SettingCardIcon: React.FC<SettingCardIconProps> = ({ iconComponent: IconComponent, color }) => (
  <ColoredAvatar bgcolor={color}>
    <IconComponent sx={{ color: 'white' }} />
  </ColoredAvatar>
);

export default SettingCardIcon;