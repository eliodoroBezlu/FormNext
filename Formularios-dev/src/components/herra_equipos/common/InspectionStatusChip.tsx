"use client";

import { Chip } from "@mui/material";
import {
  EditNote,
  HourglassTop,
  CheckCircle,
  Cancel,
  Pending,
  TaskAlt,
} from "@mui/icons-material";
import { InspectionStatus } from "../types/IProps";

interface InspectionStatusChipProps {
  status: InspectionStatus | string;
  size?: "small" | "medium";
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: "default" | "warning" | "success" | "error" | "info" | "primary";
    icon: React.ReactElement;
  }
> = {
  [InspectionStatus.DRAFT]: {
    label: "Borrador",
    color: "default",
    icon: <EditNote fontSize="small" />,
  },
  [InspectionStatus.IN_PROGRESS]: {
    label: "En Progreso",
    color: "warning",
    icon: <HourglassTop fontSize="small" />,
  },
  [InspectionStatus.PENDING_APPROVAL]: {
    label: "Pendiente Aprobación",
    color: "info",
    icon: <Pending fontSize="small" />,
  },
  [InspectionStatus.APPROVED]: {
    label: "Aprobado",
    color: "success",
    icon: <CheckCircle fontSize="small" />,
  },
  [InspectionStatus.REJECTED]: {
    label: "Rechazado",
    color: "error",
    icon: <Cancel fontSize="small" />,
  },
  [InspectionStatus.COMPLETED]: {
    label: "Completado",
    color: "success",
    icon: <TaskAlt fontSize="small" />,
  },
};

export function InspectionStatusChip({
  status,
  size = "small",
}: InspectionStatusChipProps) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    color: "default" as const,
    icon: <EditNote fontSize="small" />,
  };

  return (
    <Chip
      label={cfg.label}
      color={cfg.color}
      size={size}
      icon={cfg.icon}
      variant="filled"
    />
  );
}
