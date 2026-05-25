"use client";

import { Alert, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { AlertConfig } from "../types/IProps";

interface AlertSectionProps {
  config: AlertConfig;
}

export function AlertSection({ config }: AlertSectionProps) {
  if (!config.show || !config.message) return null;

  const severityMap = {
    destructive: "error" as const,
    warning: "warning" as const,
    default: "info" as const,
  };
  const iconMap = {
    destructive: <ErrorOutlineIcon />,
    warning: <WarningAmberIcon />,
    default: <InfoOutlinedIcon />,
  };

  const variant = config.variant ?? "default";
  const severity = severityMap[variant] ?? "info";
  const icon = iconMap[variant] ?? <InfoOutlinedIcon />;

  return (
    <Alert severity={severity} icon={icon}>
      {config.message}
      {config.description && (
        <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
          {config.description}
        </Typography>
      )}
    </Alert>
  );
}
