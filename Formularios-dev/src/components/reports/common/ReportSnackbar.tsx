"use client";

import { Snackbar, Alert } from "@mui/material";
import { useState } from "react";

export interface NotificationState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

interface ReportSnackbarProps {
  notification: NotificationState;
  onClose: () => void;
  autoHideDuration?: number;
}

export function ReportSnackbar({
  notification,
  onClose,
  autoHideDuration = 6000,
}: ReportSnackbarProps) {
  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity={notification.severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
}

// Hook helper para no repetir el estado en cada componente
export function useReportNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "info",
  });

  const mostrar = (
    message: string,
    severity: NotificationState["severity"] = "info"
  ) => setNotification({ open: true, message, severity });

  const cerrar = () =>
    setNotification((prev) => ({ ...prev, open: false }));

  return { notification, mostrar, cerrar };
}