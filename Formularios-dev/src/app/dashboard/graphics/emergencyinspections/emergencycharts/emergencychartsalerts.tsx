import React from "react";
import { Box, Alert } from "@mui/material";
import { Warning, Error as ErrorIcon } from "@mui/icons-material";
import { AreaStats } from "../types/IProps";

interface DashboardAlertsProps {
  alertasCriticas: AreaStats[];
  areasSinInspecciones: AreaStats[];
}

export const DashboardAlerts: React.FC<DashboardAlertsProps> = ({
  alertasCriticas,
  areasSinInspecciones,
}) => {
  return (
    <Box mb={3} display="flex" flexDirection="column" gap={2}>
      {alertasCriticas.length > 0 && (
        <Alert
          severity="warning"
          icon={<Warning />}
          sx={{ backgroundColor: "warning.light" }}
        >
          {alertasCriticas.length} área(s) en estado CRÍTICO requieren atención
          inmediata
        </Alert>
      )}
      {areasSinInspecciones.length > 0 && (
        <Alert
          severity="info"
          icon={<ErrorIcon />}
          sx={{ backgroundColor: "info.light" }}
        >
          {areasSinInspecciones.length} área(s) sin inspecciones registradas
        </Alert>
      )}
    </Box>
  );
};
