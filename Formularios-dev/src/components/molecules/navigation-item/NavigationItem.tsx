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
    <ListItemButton selected={selected} onClick={onClick}>
      <ListItemIcon>
        <Icon name={icon as any} />
      </ListItemIcon>
      <ListItemText primary={title} />
      {children}
    </ListItemButton>
  );
}
