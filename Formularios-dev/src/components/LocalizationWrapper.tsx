"use client";

import { ReactNode } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/es";

interface LocalizationWrapperProps {
  children: ReactNode;
}

export function LocalizationWrapper({ children }: LocalizationWrapperProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      {children}
    </LocalizationProvider>
  );
}