import type React from "react";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import DescriptionIcon from "@mui/icons-material/Description";
import BarChartIcon from "@mui/icons-material/BarChart";

export type IconName = "dashboard" | "shoppingCart" | "barChart" | "description" | "layers" | "settings";

const iconMap: Record<IconName, React.ElementType> = {
  dashboard: DashboardIcon,
  shoppingCart: DescriptionIcon,
  barChart: BarChartIcon,
  description: DescriptionIcon,
  layers: DescriptionIcon,
  settings: SettingsIcon,
};

export interface NavigationItemProps {
  title: string;
  icon: IconName;
  selected: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

export function NavigationItem({
  title,
  icon,
  selected,
  onClick,
  children,
}: NavigationItemProps) {
  const IconComponent = iconMap[icon] || DescriptionIcon;

  return (
    <ListItemButton selected={selected} onClick={onClick} className="custom-nav-item">
      <ListItemIcon>
        <IconComponent />
      </ListItemIcon>
      <ListItemText primary={title} />
      {children}
    </ListItemButton>
  );
}
