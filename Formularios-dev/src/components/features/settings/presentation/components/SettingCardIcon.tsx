import React from "react";
import { Avatar } from "@mui/material";

interface SettingCardIconProps {
  iconComponent: React.ElementType;
  color: string;
}

const SettingCardIcon: React.FC<SettingCardIconProps> = ({
  iconComponent: IconComponent,
  color,
}) => (
  <Avatar
    sx={{
      bgcolor: `${color}1A`, // ~10% de opacidad
      color: color,
      width: 44,
      height: 44,
      borderRadius: 3, // Cuadrado ligeramente redondeado
    }}
  >
    <IconComponent sx={{ fontSize: 22 }} />
  </Avatar>
);

export default SettingCardIcon;
