"use client"

import { Alert } from "@mui/material"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { AlertConfig } from "../types/IProps"

interface AlertSectionProps {
  config: AlertConfig
}

export function AlertSection({ config }: AlertSectionProps) {
  if (!config.show || !config.message) {
    return null
  }

  const getSeverity = () => {
    switch (config.variant) {
      case "destructive":
        return "error"
      case "warning":
        return "warning"
      default:
        return "info"
    }
  }

  const getIcon = () => {
    switch (config.variant) {
      case "destructive":
        return <ErrorOutlineIcon />
      case "warning":
        return <WarningAmberIcon />
      default:
        return <InfoOutlinedIcon />
    }
  }

  return (
    <Alert severity={getSeverity()} icon={getIcon()}>
      {config.message}
    </Alert>
  )
}
