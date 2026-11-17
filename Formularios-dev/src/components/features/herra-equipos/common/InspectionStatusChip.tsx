"use client";

import type { ReactElement } from "react";
import { EstadoChip } from "@/components/ui/feedback/EstadoChip";
import {
  EditNote,
  HourglassTop,
  CheckCircle,
  Cancel,
  Pending,
  TaskAlt,
} from "@mui/icons-material";
import { InspectionStatus } from "../types/IProps";
import { estadoDeInspeccion } from "../domain/models/estadosVisuales";

interface InspectionStatusChipProps {
  status: InspectionStatus | string;
  size?: "small" | "medium";
}

/** El ícono de cada estado; la etiqueta y el color salen de `estadosVisuales`. */
export const ICONO_DE_ESTADO: Record<string, ReactElement> = {
  [InspectionStatus.DRAFT]: <EditNote fontSize="small" />,
  [InspectionStatus.IN_PROGRESS]: <HourglassTop fontSize="small" />,
  [InspectionStatus.PENDING_APPROVAL]: <Pending fontSize="small" />,
  [InspectionStatus.APPROVED]: <CheckCircle fontSize="small" />,
  [InspectionStatus.REJECTED]: <Cancel fontSize="small" />,
  [InspectionStatus.COMPLETED]: <TaskAlt fontSize="small" />,
};

export function InspectionStatusChip({ status, size = "small" }: InspectionStatusChipProps) {
  const estado = estadoDeInspeccion(status);
  return (
    <EstadoChip
      etiqueta={estado.etiqueta}
      color={estado.color}
      size={size}
      icono={ICONO_DE_ESTADO[status] ?? <EditNote fontSize="small" />}
    />
  );
}
