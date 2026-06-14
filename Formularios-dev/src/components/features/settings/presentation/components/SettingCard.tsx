import StyledCard from "@/components/ui/cards/StyledCard";
import React from "react";
import SettingCardHeader from "./SettingCardHeader";
import SettingCardContent from "./SettingCardContent";
import { Box } from "@mui/material";

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
  <StyledCard
    onClick={() => onClick?.(setting.id)}
    sx={{
      borderLeft: `5px solid ${setting.color}`,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        borderLeftColor: "primary.main",
      },
    }}
  >
    <Box>
      <SettingCardHeader
        title={setting.title}
        description={setting.description}
        icon={setting.icon}
        color={setting.color}
      />
      <SettingCardContent items={setting.items} color={setting.color} />
    </Box>
  </StyledCard>
);

export default SettingCard;
