import type React from "react";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Icon } from "../../atoms/Icon";
import type { IProps } from "./types/IProps.ts";

export function NavigationItem({
  title,
  icon,
  selected,
  onClick,
  children,
}: IProps) {
  return (
    <ListItemButton selected={selected} onClick={onClick} className="custom-nav-item">
      <ListItemIcon>
        <Icon name={icon} />
      </ListItemIcon>
      <ListItemText primary={title} />
      {children}
    </ListItemButton>
  );
}
