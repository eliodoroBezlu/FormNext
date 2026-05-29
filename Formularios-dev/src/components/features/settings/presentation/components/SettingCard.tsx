import StyledCard from '@/components/ui/cards/StyledCard';
import React from 'react';
import SettingCardHeader from './SettingCardHeader';
import SettingCardContent from './SettingCardContent';


export interface SettingCardData {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  items: string[];
}

interface SettingCardProps {
  setting: SettingCardData;
  onClick?: (settingId: string) => void;
}

const SettingCard: React.FC<SettingCardProps> = ({ setting, onClick }) => (
  <StyledCard onClick={() => onClick?.(setting.id)}>
    <SettingCardHeader
      title={setting.title}
      description={setting.description}
      icon={setting.icon}
      color={setting.color}
    />
    <SettingCardContent items={setting.items} />
  </StyledCard>
);

export default SettingCard;
