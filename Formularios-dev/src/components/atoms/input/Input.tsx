import type React from "react"
import { TextField, type TextFieldProps } from "@mui/material"

export interface InputProps extends Omit<TextFieldProps, "variant"> {
  variant?: "outlined" | "filled" | "standard"
  disabled?: boolean // ✅ Ya está incluido en TextFieldProps, pero explícito para claridad
}

export const Input: React.FC<InputProps> = ({ 
  variant = "outlined", 
  disabled = false,
  ...props 
}) => {
  return (
    <TextField 
      variant={variant} 
      fullWidth 
      disabled={disabled}
      {...props} 
    />
  )
}