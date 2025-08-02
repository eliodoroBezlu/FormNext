import type React from "react"
import { Button as MuiButton, type ButtonProps as MuiButtonProps } from "@mui/material"

export interface ButtonProps extends MuiButtonProps {
  loading?: boolean
}

export const Button: React.FC<ButtonProps> = ({ children, loading = false, disabled, ...props }) => {
  return (
    <MuiButton {...props} disabled={disabled || loading}>
      {children}
    </MuiButton>
  )
}
